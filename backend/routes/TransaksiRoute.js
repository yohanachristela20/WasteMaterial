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
    console.log("NAMA VENDOR:", transaksi.map(t => t.VendorPenjualan?.nama));

    return res.status(200).json(transaksi);
  } catch (error) {
      console.log(error.message);
      res.status(500).json({ message: "Failed to fetch Detail Transaksi" }); 
  }
});


export default router;