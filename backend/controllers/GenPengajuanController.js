import express from "express";
import multer from 'multer'; // Import multer for file upload handling
import path from 'path';
import fs from 'fs';
import GenPengajuan from "../models/GenPengajuan.js";
import Karyawan from "../models/KaryawanModel.js";
import Pengajuan from "../models/PengajuanModel.js";

const router = express.Router(); 

export const createGenPengajuan = async(req, res) => {
    try {
        console.log(req.body);
        await GenPengajuan.create(req.body);
        res.status(201).json({msg: "ID Pengajuan telah dibuat"}); 
    } catch (error) {
        res.status(500).json({message: error.message}); 
    }
};

export const updateGenPengajuan = async(req, res) => {
    try {
        await GenPengajuan.update(req.body, {
            where: {
                id_pengajuan: req.params.id_pengajuan
            }
        });
        res.status(200).json({msg: "Generate Pengajuan berhasil diperbarui."});
    } catch (error) {
        res.status(500).json({message: error.message});
    }
};



export default router;