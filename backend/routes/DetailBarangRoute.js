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
router.get('/detail-barang/getNextBarangId', getLastBarangId);
// router.patch('/karyawan/:id_karyawan', updateKaryawan);
// router.delete('/karyawan/:id_karyawan', deleteKaryawan);



export default router;