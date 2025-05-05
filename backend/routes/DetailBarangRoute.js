import express from "express";
import multer from 'multer'; // Import multer for file upload handling
import path from 'path';
import fs from 'fs';
import csvParser from "csv-parser";
import db from "../config/database.js";
import DetailBarang from "../models/DetailBarang.js";


import {getDetailBarang,
        getDetailBarangById, 
        createDetailBarang, 
        getLastBarangId,
        updateDetailBarang, 
        deleteDetailBarang
} from "../controllers/DetailBarangController.js"; 
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

router.get('/detail-barang', getDetailBarang); 
router.get('/detail-barang/:id_detailbarang', getDetailBarangById);
router.post('/detail-barang', createDetailBarang);  
router.get('/getLastBarangId', getLastBarangId);
router.patch('/detail-barang/:id_detailbarang', updateDetailBarang);
router.delete('/detail-barang/:id_detailbarang', deleteDetailBarang);

router.post('/detail-barang/import-csv', upload.single("csvfile"), (req,res) => {
        if (!req.file) {
                return res.status(400).json({ success: false, message: 'No file uploaded' });
        }
        
        const filePath = req.file.path;
        const data_masterbarang = [];
        
        if (!fs.existsSync('./uploads/detail-barang')) {
                fs.mkdirSync('./uploads/detail-barang');
        }    
        
        fs.createReadStream(filePath)
        .pipe(csvParser())
        .on("data", (row) => {
          data_masterbarang.push({
            id_detailbarang: row.id_detailbarang,
            nama_detailbarang: row.nama_detailbarang,
            satuan: row.satuan,
            harga_barang: row.harga_barang,
            jenis_barang: row.jenis_barang,
            tanggal_penetapan: new Date(row.tanggal_penetapan),
            
          });
        })
        .on("end", async () => {
          try {
            if (data_masterbarang.length === 0) {
              throw new Error("Tidak ada data untuk diimpor");
            }
        
            await DetailBarang.bulkCreate(data_masterbarang);
        
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