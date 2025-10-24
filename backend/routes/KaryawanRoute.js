import express from "express";
import multer from 'multer'; // Import multer for file upload handling
import path from 'path';
import fs from 'fs';
import csvParser from "csv-parser";
import db from "../config/database.js";
import Karyawan from "../models/KaryawanModel.js";


import {getKaryawan,
        getKaryawanById, 
        createKaryawan, 
        updateKaryawan, 
        deleteKaryawan,
        getLastKaryawanId
} from "../controllers/KaryawanController.js"; 

const router = express.Router(); 

const uploadDirectory = './uploads/karyawan';

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

router.get('/karyawan', getKaryawan); 
router.get('/karyawan/:id_karyawan', getKaryawanById);
router.post('/karyawan', createKaryawan);  
router.patch('/karyawan/:id_karyawan', updateKaryawan);
router.delete('/karyawan/:id_karyawan', deleteKaryawan);
router.get('/getLastKaryawanId', getLastKaryawanId);

router.post('/karyawan/import-csv', upload.single("csvfile"), async(req,res) => {
  const latestKaryawan = await Karyawan.findOne({
    order: [['id_karyawan', 'DESC']]
  });

  // let nextId = 'KRY0001';
  // if (latestKaryawan && latestKaryawan.id_karyawan) {
  //     const lastNumeric = parseInt(latestKaryawan.id_karyawan.substring(3), 10); 
  //     const incrementedIdNumber = (lastNumeric + 1).toString().padStart(4, '0');
  //     nextId = `KRY${incrementedIdNumber}`;
  // }

  const lastNumeric = latestKaryawan && latestKaryawan.id_karyawan 
  ? parseInt(latestKaryawan.id_karyawan.substring(3), 10)
  : 0;

  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  
  const filePath = req.file.path;
  const karyawan = [];
  
  if (!fs.existsSync('./uploads/karyawan')) {
    fs.mkdirSync('./uploads/karyawan', { recursive: true });
  }    
  
  fs.createReadStream(filePath)
  .pipe(csvParser())
  .on("data", (row) => {
    karyawan.push({
      // id_karyawan: nextId,
      nama: row.nama,
      divisi: row.divisi,
    });
  })
  .on("end", async () => {
    let transaction = await db.transaction();
    try {
      if (karyawan.length === 0) {
        throw new Error("Tidak ada data untuk diimpor");
      }
  
      const payload = karyawan.map((r, idx) => {
        const numeric = lastNumeric + idx + 1;
        return{
          id_karyawan: `KRY${numeric.toString().padStart(4, '0')}`,
          nama: r.nama,
          divisi: r.divisi,
        }
      });

      transaction = await db.transaction();
      await Karyawan.bulkCreate(payload, { transaction });
      await transaction.commit();
  
      res.status(200).json({
        success: true,
        message: "Data berhasil diimpor ke database",
        imported: payload.length
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