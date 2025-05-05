import express from "express";
import multer from 'multer'; // Import multer for file upload handling
import path from 'path';
import fs from 'fs';
import csvParser from "csv-parser";
import db from "../config/database.js";
import Vendor from "../models/VendorModel.js";


import {getVendor,
        getVendorById, 
        createVendor, 
        updateVendor, 
        deleteVendor,
        getLastVendorId
} from "../controllers/VendorController.js"; 

const router = express.Router(); 

const uploadDirectory = './uploads/vendor';

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

router.get('/vendor', getVendor); 
router.get('/vendor/:id_vendor', getVendorById);
router.post('/vendor', createVendor);  
router.patch('/vendor/:id_vendor', updateVendor);
router.delete('/vendor/:id_vendor', deleteVendor);
router.get('/getLastVendorId', getLastVendorId);

// router.post('/karyawan/import-csv', upload.single("csvfile"), (req,res) => {
//         if (!req.file) {
//                 return res.status(400).json({ success: false, message: 'No file uploaded' });
//         }
        
//         const filePath = req.file.path;
//         const data_karyawan = [];
        
//         if (!fs.existsSync('./uploads/karyawan')) {
//                 fs.mkdirSync('./uploads/karywan');
//         }    
        
//         fs.createReadStream(filePath)
//         .pipe(csvParser())
//         .on("data", (row) => {
//           data_karyawan.push({
//             id_karyawan: row.id_karyawan,
//             nama: row.nama,
//             jenis_kelamin: row.jenis_kelamin,
//             departemen: row.departemen,
//             divisi: row.divisi,
//             tanggal_lahir: new Date(row.tanggal_lahir),
//             tanggal_masuk: new Date(row.tanggal_masuk),
//             gaji_pokok: parseInt(row.gaji_pokok, 10)
            
//           });
//         })
//         .on("end", async () => {
//           try {
//             if (data_karyawan.length === 0) {
//               throw new Error("Tidak ada data untuk diimpor");
//             }
        
//             await Karyawan.bulkCreate(data_karyawan);
        
//             res.status(200).json({
//               success: true,
//               message: "Data berhasil diimpor ke database",
//             });
//           } catch (error) {
//             console.error("Error importing data:", error);
//             res.status(500).json({
//               success: false,
//               message: "Gagal mengimpor data ke database",
//               error: error.message,
//             });
//           } finally {
//             fs.unlinkSync(filePath);
//           }
//         })
//         .on("error", (error) => {
//           console.error("Error parsing file:", error);
//           res.status(500).json({ success: false, message: "Error parsing file" });
//         });
        
//         });

export default router;