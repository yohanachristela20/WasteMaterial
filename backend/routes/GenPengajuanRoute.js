import express from "express";
import multer from 'multer'; // Import multer for file upload handling
import path from 'path';
import fs from 'fs';
import csvParser from "csv-parser";
import db from "../config/database.js";
import { createGenPengajuan, updateGenPengajuan } from "../controllers/GenPengajuanController.js";
import GenPengajuan from "../models/GenPengajuan.js";
import Pengajuan from "../models/PengajuanModel.js";

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

router.get('/prev-status/:id_pengajuan', async(req, res) => {
	try {
		const genPengajuan = await GenPengajuan.findAll({
			where: {id_pengajuan: req.params.id_pengajuan}, 
		});

		return res.status(200).json(genPengajuan);
	} catch (error) {
		console.error("Error fetching data:", error);
		console.log("Error fetching prev status:", error.message);
	}
});

router.get("/jumlah-belum-diproses", async (req, res) => {
	try {
			const jumlahBelumDiproses = await GenPengajuan.count({
				distinct: true,
				col: 'id_pengajuan',
				where: {
					status: 'Belum Diproses'
				}
			}); 
			
			if (jumlahBelumDiproses === null || jumlahBelumDiproses === undefined) {
				return res.status(404).json({ message: "Tidak ada pengajuan belum diproses" });
			} 

			const jumlah_belum_diproses = jumlahBelumDiproses || 0; 

			res.status(200).json({ jumlahBelumDiproses: jumlah_belum_diproses});
	} catch (error) {
					console.error("Error fetching jumlah belum diproses:", error.message);
					res.status(500).json({ message: "Internal server error" });
	}
});

router.get("/jumlah-pengajuan-selesai", async (req, res) => {
	try {
			const jumlahPengajuanSelesai = await GenPengajuan.count({
				distinct: true,
				col: 'id_pengajuan',
				where: {
					status: 'Selesai'
				}
			}); 
			
			if (jumlahPengajuanSelesai === null || jumlahPengajuanSelesai === undefined) {
				return res.status(404).json({ message: "Belum ada pengajuan selesai." });
			} 

			const jumlah_pengajuan_selesai = jumlahPengajuanSelesai || 0; 

			res.status(200).json({ jumlahPengajuanSelesai: jumlah_pengajuan_selesai});
	} catch (error) {
		console.error("Error fetching pengajuan selesai:", error.message);
		res.status(500).json({ message: "Internal server error" });
	}
});



export default router;