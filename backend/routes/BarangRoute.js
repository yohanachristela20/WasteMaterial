import express from "express";
import multer from 'multer'; // Import multer for file upload handling
import path from 'path';
import fs from 'fs';
import csvParser from "csv-parser";
import db from "../config/database.js";
import Barang from "../models/BarangModel.js";


import {getDataBarang,
        getDataBarangById, 
        createDataBarang, 
        getLastDataBarangId,
        deleteDataBarang,
        detailBarang,
        updateBarang,
        namaBarang,
        getDetailBarangById
} from "../controllers/BarangController.js"; 
import { create } from "domain";

const router = express.Router(); 

const uploadDirectory = './uploads/Barang';

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

router.get('/data-barang', getDataBarang); 
router.get('/data-barang/:id_barang', getDataBarangById);
router.post('/data-barang', createDataBarang);  
router.get('/getLastDataBarangId', getLastDataBarangId);
router.patch('/data-barang/:id_barang', updateBarang);
router.delete('/data-barang/:id_barang', deleteDataBarang);
router.get('/detail-barang', detailBarang);
router.get('/namaBarang', namaBarang);
router.get('/detail-kategori/:id_barang', getDetailBarangById);


router.post('/data-barang/import-csv', upload.single("csvfile"), async(req,res) => {
  const latestBarang = await Barang.findOne({
      order: [['id_barang', 'DESC']]
  });

  let nextId = '1-B';
  if (latestBarang && latestBarang.id_barang) {
      const lastNumeric = parseInt(latestBarang.id_barang.split('-')[0], 10);
      const incremented = lastNumeric + 1;
      nextId = `${incremented}-B`;
  }

  const lastNumeric = latestBarang && latestBarang.id_barang 
  ? parseInt(String(latestBarang.id_barang).split('-')[0], 10) || 0
  : 0;
  const startNumeric = lastNumeric + 1;

  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  
  const filePath = req.file.path;
  const data_barang = [];
  
  if (!fs.existsSync('./uploads/data-barang')) {
          fs.mkdirSync('./uploads/data-barang');
  }    
  
  fs.createReadStream(filePath)
  .pipe(csvParser())
  .on("data", (row) => {
    data_barang.push({
      id_barang: nextId,
      nama: row.nama,
      id_sap: row.id_sap,
      id_kategori: row.id_kategori,
    });
  })
  .on("end", async () => {
    let transaction = await db.transaction();
    try {
      if (data_barang.length === 0) {
        throw new Error("Tidak ada data untuk diimpor");
      }
  
      const payload = data_barang.map((r, idx) => ({
        id_barang: `${startNumeric + idx}-B`,
        nama: r.nama,
        id_sap: r.id_sap,
        id_kategori: r.id_kategori,
      }));

      transaction = await db.transaction();
      await Barang.bulkCreate(payload, { transaction });
      await transaction.commit();
  
      res.status(200).json({
        success: true,
        message: "Data berhasil diimpor ke database",
      });
    } catch (error) {
      console.error("Error importing data:", error);
      res.status(500).json({
        success: false,
        message: "Gagal mengimpor data ke database",
        error: error.message,
      });
    } finally {
      fs.unlinkSync(filePath);
    }
  })
  .on("error", (error) => {
    console.error("Error parsing file:", error);
    res.status(500).json({ success: false, message: "Error parsing file" });
  });
});

export default router;