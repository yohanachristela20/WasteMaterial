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
        getLastVendorId,
        detailVendor
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
router.get('/detail-vendor/:id_vendor', detailVendor);

router.post('/vendor/import-csv', upload.single("csvfile"), async(req,res) => {
  const latestVendor = await Vendor.findOne({
    order: [['id_vendor', 'DESC']]
  });

  // let nextId = 'V00001';
  // if (latestVendor && latestVendor.id_vendor) {
  //     const lastNumeric = parseInt(latestVendor.id_vendor.split('-')[0], 10);
  //     const incremented = lastNumeric + 1;
  //     nextId = `${incremented}-V`;
  // }

  const lastNumeric = latestVendor && latestVendor.id_vendor 
  ? parseInt(latestVendor.id_vendor.substring(1), 10)
  : 0;

  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  
  const filePath = req.file.path;
  const data_vendor = [];
  
  if (!fs.existsSync('./uploads/vendor')) {
    fs.mkdirSync('./uploads/vendor', {recursive: true});
  }    
  
  fs.createReadStream(filePath)
  .pipe(csvParser())
  .on("data", (row) => {
    data_vendor.push({
      // id_vendor: nextId,
      nama: row.nama,
      alamat: row.alamat,
      no_telepon: row.no_telepon,
      no_kendaraan: row.no_kendaraan,
      sopir: row.sopir
    });
  })
  .on("end", async () => {
    let transaction = await db.transaction();
    try {
      if (data_vendor.length === 0) {
        throw new Error("Tidak ada data untuk diimpor");
      }
  
      const payload = data_vendor.map((r, idx) => {
        const numeric = lastNumeric + idx + 1;
        return{
          id_vendor: `V${numeric.toString().padStart(5, '0')}`,
          nama: r.nama,
          alamat: r.alamat,
          no_telepon: r.no_telepon,
          no_kendaraan: r.no_kendaraan,
          sopir: r.sopir,
        }        
      });

      transaction = await db.transaction();
      await Vendor.bulkCreate(payload, { transaction });
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