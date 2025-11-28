import express from "express";
import multer from 'multer'; // Import multer for file upload handling
import path from 'path';
import fs from 'fs';
import csvParser from "csv-parser";
import db from "../config/database.js";
import Pengajuan from "../models/PengajuanModel.js";
import { createTransaksi, getLastTransaksiID, namaVendor } from "../controllers/TransaksiController.js";
import Transaksi from "../models/TransaksiModel.js";
import Vendor from "../models/VendorModel.js";
import Karyawan from "../models/KaryawanModel.js";
import GenPengajuan from "../models/GenPengajuan.js";
import Barang from "../models/BarangModel.js";
import Kategori from "../models/KategoriModel.js";

const router = express.Router(); 
const uploadDirectory = './uploads/Pengajuan';

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, {recursive: true});
}  

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
          cb(null, uploadDirectory);
  },
  filename: (req, file, cb) => {
          cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

router.get('/getLastTransaksiID', getLastTransaksiID);
router.get('/namaVendor', namaVendor);
router.post('/transaksi', createTransaksi);

router.get('/detail-transaksi/:id_pengajuan', async(req, res) => {
  try {
    const transaksi = await Transaksi.findAll({
      where: {id_pengajuan: req.params.id_pengajuan}, 
      include: [
        {
          model: Vendor, 
          as: 'VendorPenjualan', 
          attributes: ['id_vendor', 'nama', 'no_kendaraan', 'sopir'],
        }, 
        {
          model: Karyawan,
          as: 'Petugas', 
          attributes: ['id_karyawan', 'nama'],
        }
      ]
    });
    // console.log("NAMA VENDOR:", transaksi.map(t => t.VendorPenjualan?.nama));

    return res.status(200).json(transaksi);
  } catch (error) {
      console.log(error.message);
      res.status(500).json({ message: "Failed to fetch Detail Transaksi" }); 
  }
});

router.get('/detail-transaksi', async(req, res) => {
  try {
    const transaksi = await Transaksi.findAll({
      // where: {id_pengajuan: req.params.id_pengajuan}, 
      group: ['id_transaksi'],
      include: [
        {
          model: Vendor, 
          as: 'VendorPenjualan', 
          attributes: ['id_vendor', 'nama', 'no_kendaraan', 'sopir'],
        }, 
        {
          model: Karyawan,
          as: 'Petugas', 
          attributes: ['id_karyawan', 'nama'],
        }, 
        {
          model: GenPengajuan, 
          as: 'PengajuanPenjualan',
          group: ['id_pengajuan'],
          attributes: ['id_pengajuan', 'status'],
          include: [
            {
              model: Pengajuan,
              as: 'GeneratePengajuan',
              group: ['id_pengajuan'],
              attributes: ['id_pengajuan', 'jumlah_barang', 'kondisi', 'jenis_pengajuan', 'total', 'id_barang'],
              include: [
                {
                  model: Barang, 
                  as: 'BarangDiajukan',
                  group: ['id_barang'],
                  attributes: ['id_barang', 'nama', 'id_sap', 'id_kategori'],
                  include: [
                    {
                      model: Kategori,
                      as: 'KategoriBarang',
                      group: ['id_kategori'],
                      attributes: ['id_kategori', 'nama', 'satuan', 'harga_barang', 'jenis_barang']
                    }
                  ]
                }, 
                {
                  model: Karyawan,
                  as: 'Pemohon',
                  attributes: ['id_karyawan', 'nama', 'divisi'],
                }
              ]
            }
          ]
        }
      ]
    });

    console.log("TRANSAKSI DETAIL:", transaksi);
    // console.log("NAMA VENDOR:", transaksi.map(t => t.VendorPenjualan?.nama));

    return res.status(200).json(transaksi);
  } catch (error) {
      console.log(error.message);
      res.status(500).json({ message: "Failed to fetch Detail Transaksi" }); 
  }
});


router.get("/total-penjualan-per-day", async (req, res) => {
    try {
      const totalPenjualan = (await Pengajuan.sum("total", {
        where: {
          jenis_pengajuan: "PENJUALAN",
        },
        include: [
          {
            model: GenPengajuan,
            as: "GeneratePengajuan",
            where: {
              status: "Selesai",
            },
          }
        ]
      })) || 0;

      // console.log("Total Penjualan:", totalPenjualan);

      res.status(200).json({ totalPenjualan });
    } catch (error) {
      console.error("Error fetching total pinjaman:", error.message);
      res.status(500).json({ message: "Internal server error" });
    }
});



export default router;