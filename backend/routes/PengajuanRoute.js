import express from "express";
import multer from 'multer'; // Import multer for file upload handling
import path from 'path';
import fs from 'fs';
import csvParser from "csv-parser";
import db from "../config/database.js";
import Pengajuan from "../models/PengajuanModel.js";


import { createPengajuan, deletePengajuan, detailPengajuan, getLastPengajuanID, getPengajuan, getPengajuanById } from "../controllers/PengajuanController.js";
import Barang from "../models/BarangModel.js";
import Kategori from "../models/KategoriModel.js";
import Karyawan from "../models/KaryawanModel.js";
import GenPengajuan from "../models/GenPengajuan.js";

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

router.get('/getLastPengajuanID', getLastPengajuanID);
router.post('/pengajuan', createPengajuan);
router.get('/detail-pengajuan', detailPengajuan);
router.get('/pengajuan', getPengajuan);
router.delete('/delete-pengajuan/:id_pengajuan', deletePengajuan);
router.get('/pengajuanById/:id_karyawan', getPengajuanById);

router.get("/detail-pengajuan/:id_pengajuan", async(req, res) => {
    try {
        const pengajuan = await Pengajuan.findAll({
            where: {id_pengajuan: req.params.id_pengajuan},
            include: [
                {
                  model: Barang,
                  as: 'BarangDiajukan', 
                  attributes: ['id_barang', 'nama', 'id_kategori'],
                  include: [
                    {
                      model: Kategori,
                      as: "KategoriBarang", 
                      attributes: ["nama", "satuan", "harga_barang", "jenis_barang"],
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
                }, 
            ],
        }); 
        return res.status(200).json(pengajuan);

    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: "Failed to fetch Detail Barang" });
    }
});

export default router;