import express from "express";
import multer from 'multer'; // Import multer for file upload handling
import path from 'path';
import fs from 'fs';
import csvParser from "csv-parser";
import db from "../config/database.js";
import Barang from "../models/BarangModel.js";
import Pengajuan from "../models/PengajuanModel.js";
import GenPengajuan from "../models/GenPengajuan.js";
import Karyawan from "../models/KaryawanModel.js";
import Kategori from "../models/KategoriModel.js";

const router = express.Router(); 


export const getLastPengajuanID = async (req, res) => {
    try {
        const latestPengajuan = await GenPengajuan.findOne({
            order: [['id_pengajuan', 'DESC']]
        });

        const date = new Date();
        const twoDigitYear = String(date.getFullYear()).slice(-2);
        const year = twoDigitYear.padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');

        console.log("now DATE:", date, "MONTH:", month, "YEAR:", year);

        let newId = `${year}${month}0001PG`;

        if (latestPengajuan && latestPengajuan.id_pengajuan) {
            const lastNumeric = parseInt(latestPengajuan.id_pengajuan.substring(4), 10);
            const incremented = (lastNumeric + 2).toString().padStart(4, '0');
            newId = `${year}${month}${incremented}PG`;
        }
        console.log("getLastPengajuanID: ", newId);
        return res.status(200).json({newId});


    } catch (error) {
        console.error(error);
        return res.status(500).json({message: 'error retrieving last id barang'});
    }
};

export const createPengajuan = async (req, res) => {
  let transaction;
  try {
    const dataPengajuan = Array.isArray(req.body.items) ? req.body.items : [req.body];
    const defaultKaryawan = req.body.id_karyawan || (req.user && req.user.id_karyawan) || null;

    if (!dataPengajuan.length) {
      return res.status(400).json({ message: "No items provided" });
    }

    for (const it of dataPengajuan) {
      if (!it.id_barang) {
        return res.status(400).json({ message: "id_barang is required for each item" });
      }
      it.id_karyawan = it.id_karyawan || defaultKaryawan;
      if (!it.id_karyawan) {
        return res.status(400).json({ message: "id_karyawan is required for each item" });
      }
      if (it.jumlah_barang !== undefined) it.jumlah_barang = Number(it.jumlah_barang) || 0;
      if (it.total !== undefined) it.total = Number(it.total) || 0;
    }

    transaction = await db.transaction();
    await Pengajuan.bulkCreate(dataPengajuan, { transaction, individualHooks: true });
    await transaction.commit();

    return res.status(201).json({ success: true, message: "Pengajuan berhasil dibuat", imported: dataPengajuan.length });
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error("Failed to create new Pengajuan:", error);
    return res.status(500).json({ message: error.message || "Server error" });
  }
};

export const detailPengajuan = async(req, res) => {
    // const {id_pengajuan} = req.params;

    try {
        const pengajuan = await Pengajuan.findAll({
            // where: {id_pengajuan: id_pengajuan},
            include: [
                {
                  model: Barang,
                  as: 'BarangDiajukan', 
                  attributes: ['id_barang', 'nama', 'id_kategori'],
                  include: [
                    {
                      model: Kategori,
                      as: "KategoriBarang", 
                      attributes: ["nama", "satuan", "harga_barang"],
                      required: false,
                    }
                  ]
                },
                {
                  model: Karyawan,
                  as: 'Pemohon',
                  attributes: ['id_karyawan', 'nama', 'divisi'],
                }, 
                {
                  model: GenPengajuan,
                  as: 'GeneratePengajuan', 
                  attributes: ['id_pengajuan', 'status'],
                }
            ],
        }); 
        return res.status(200).json(pengajuan);

    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: "Failed to fetch Detail Barang" });
    }
}

export const getPengajuan = async(req, res) => {
    try {
        const pengajuan = await Pengajuan.findAll({
            group: ['id_pengajuan'],
            include: [
                {
                    model: GenPengajuan,
                    as: 'GeneratePengajuan', 
                    attributes: ['id_pengajuan', 'status'],
                },
                {
                    model: Karyawan,
                    as: 'Pemohon',
                    attributes: ['id_karyawan', 'nama', 'divisi'],
                },
        
            ],
            
        }); 
        return res.status(200).json(pengajuan);

    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: "Failed to fetch Detail Barang" });
    }
}

export const getPengajuanById = async(req, res) => {
  // const {id_karyawan} = req.params;
  // console.log("idKaryawan:", id_karyawan);

    try {
        const pengajuanById = await Pengajuan.findOne({
            where: {id_karyawan: req.params.id_karyawan},
            // group: ['id_pengajuan'],
            include: [
                {
                    model: GenPengajuan,
                    as: 'GeneratePengajuan', 
                    attributes: ['id_pengajuan', 'status'],
                },
                {
                    model: Karyawan,
                    as: 'Pemohon',
                    attributes: ['id_karyawan', 'nama', 'divisi'],
                },
        
            ],
            
        }); 
        return res.status(200).json(pengajuanById);

    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: "Failed to fetch Detail Barang" });
    }
}

export const deletePengajuan = async(req, res) => {
  try {
    const {id_pengajuan} = req.params;

    const genPengajuan = await GenPengajuan.findOne({where: {id_pengajuan}});
    if (!genPengajuan) {
      return res.status(404).json({msg: "Generate ID Pengajuan tidak ditemukan"});
    }

    const pengajuan = await Pengajuan.findAll({where: {id_pengajuan}});
    const pengajuanId = pengajuan.map(p => p.id_pengajuan);

    if (pengajuanId.length > 0) {
      await Pengajuan.destroy({where: {id_pengajuan: pengajuanId}});
    }

    await GenPengajuan.destroy({where: {id_pengajuan}});
    res.status(200).json({msg: "Data Pengajuan berhasil dihapus."});
  } catch (error) {
    console.error("Gagal menghapus Data Pengajuan:", error.message);
    res.status(500).json({ message: "Gagal menghapus Data Pengajuan." });
  }
}

export default router;