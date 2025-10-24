import express from "express";
import multer from 'multer'; // Import multer for file upload handling
import path from 'path';
import fs from 'fs';
import csvParser from "csv-parser";
import db from "../config/database.js";
import { createGenPengajuan, updateGenPengajuan } from "../controllers/GenPengajuanController.js";

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

router.post('/generate-pengajuan', createGenPengajuan);
router.patch('/gen-pengajuan/:id_pengajuan', updateGenPengajuan);

export default router;