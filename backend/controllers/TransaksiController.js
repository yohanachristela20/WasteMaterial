import express from "express";
import multer from 'multer'; // Import multer for file upload handling
import path from 'path';
import fs from 'fs';
import csvParser from "csv-parser";
import db from "../config/database.js";
import Barang from "../models/BarangModel.js";
import Pengajuan from "../models/PengajuanModel.js";
import GenPengajuan from "../models/GenPengajuan.js";
import Karyawan from "../models/KaryawanModel.js";
import Kategori from "../models/KategoriModel.js";
import Transaksi from "../models/TransaksiModel.js";
import Vendor from "../models/VendorModel.js";

const router = express.Router(); 

export const getLastTransaksiID = async (req, res) => {
    try {
        const latestTransaksi = await Transaksi.findOne({
            order: [['id_transaksi', 'DESC']]
        });

        const date = new Date();
        const twoDigitYear = String(date.getFullYear()).slice(-2);
        const year = twoDigitYear.padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');

        console.log("now DATE:", date, "MONTH:", month, "YEAR:", year);

        let newId = `${year}${month}0002PJ`;

        if (latestTransaksi && latestTransaksi.id_transaksi) {
            const lastNumeric = parseInt(latestTransaksi.id_transaksi.substring(4), 10);
            const incremented = (lastNumeric + 2).toString().padStart(4, '0');
            newId = `${year}${month}${incremented}PJ`;
        }
        console.log("getLastTransaksiID: ", newId);
        return res.status(200).json({newId});


    } catch (error) {
        console.error(error);
        return res.status(500).json({message: 'error retrieving last id barang'});
    }
};


export const namaVendor = async(req, res) => {
    try {
        const response = await Vendor.findAll({
            attributes: ['id_vendor', 'nama'], 
            order: [['id_vendor', 'ASC']]
        }); 
        return res.status(200).json(response);

    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: "Failed to fetch Nama Barang" });
    }
};

export const createTransaksi = async(req, res) => {
    try {
        console.log(req.body);
        await Transaksi.create(req.body);
        res.status(201).json({msg: "Transaksi berhasil."}); 
    } catch (error) {
        res.status(500).json({message: error.message}); 
    }
};