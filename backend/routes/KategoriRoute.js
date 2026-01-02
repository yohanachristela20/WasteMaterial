import express from "express";
import multer from 'multer'; // Import multer for file upload handling
import path from 'path';
import fs from 'fs';
import csvParser from "csv-parser";
import db from "../config/database.js";
import Kategori from "../models/KategoriModel.js";


import {getDetailBarang,
        getDetailBarangById, 
        createDetailBarang, 
        getLastBarangId,
        updateKategori, 
        deleteDetailBarang,
        namaKategori,
        detailKategori,
} from "../controllers/KategoriController.js"; 
import { create } from "domain";

const router = express.Router(); 

const uploadDirectory = './uploads/detailbarang';

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

router.get('/kategori-barang', getDetailBarang); 
router.get('/kategori-barang/:id_kategori', getDetailBarangById);
router.post('/kategori-barang', createDetailBarang);  
router.get('/getLastBarangId', getLastBarangId);
router.patch('/kategori-barang/:id_kategori', updateKategori);
router.delete('/kategori-barang/:id_kategori', deleteDetailBarang);
router.get('/namaKategori', namaKategori);
router.get('/detail-kategori/:id_barang', detailKategori);

router.post('/kategori-barang/import-csv', upload.single("csvfile"), async(req,res) => {
  const latestBarang = await Kategori.findOne({
    order: [['id_kategori', 'DESC']]
  });

  // let nextId = 'K00001';
  // if (latestBarang && latestBarang.id_kategori) {
  //   const lastNumeric = parseInt(latestBarang.id_kategori.split('-')[0], 10);
  //   const incremented = lastNumeric + 1;
  //   nextId = `${incremented}-K`;
  // }

  const lastNumeric = latestBarang && latestBarang.id_kategori 
  ? parseInt(latestBarang.id_kategori.substring(1), 10)
  : 0;

  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  
  const filePath = req.file.path;
  const data_masterbarang = [];
  
  if (!fs.existsSync('./uploads/kategori-barang')) {
    fs.mkdirSync('./uploads/kategori-barang', {recursive: true});
  }    
  
  fs.createReadStream(filePath)
  .pipe(csvParser())
  .on("data", (row) => {
    data_masterbarang.push({
      // id_kategori: nextId,
      nama: row.nama,
      satuan: row.satuan,
      harga_barang: row.harga_barang,
      jenis_barang: row.jenis_barang,
      tanggal_penetapan: new Date(row.tanggal_penetapan),
    });
  })
  .on("end", async () => {
    let transaction = await db.transaction();
    try {
      if (data_masterbarang.length === 0) {
        throw new Error("Tidak ada data untuk diimpor");
      }
  
      const payload = data_masterbarang.map((r, idx) => {
        const numeric = lastNumeric + idx + 1;
        return{
          id_kategori: `K${numeric.toString().padStart(5, '0')}`,
          nama: r.nama,
          satuan: r.satuan,
          harga_barang: r.harga_barang,
          jenis_barang: r.jenis_barang,
          tanggal_penetapan: r.tanggal_penetapan ? new Date(r.tanggal_penetapan) : null,
        }
       
      });

      transaction = await db.transaction();
      await Kategori.bulkCreate(payload, { transaction });
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