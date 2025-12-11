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
import { Sequelize, Op } from "sequelize";
import Transaksi from "../models/TransaksiModel.js";
import AntreanPengajuan from "../models/AntreanModel.js";

const router = express.Router(); 


export const getLastPengajuanID = async (req, res) => {
    try {
        const latestPengajuan = await GenPengajuan.findOne({
            order: [['id_pengajuan', 'DESC']]
        });

        const date = new Date();
        const twoDigitYear = String(date.getFullYear()).slice(-2);
        const year = twoDigitYear.padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');

        // console.log("now DATE:", date, "MONTH:", month, "YEAR:", year);

        let newId = `${year}${month}0001PG`;

        if (latestPengajuan && latestPengajuan.id_pengajuan) {
            const lastNumeric = parseInt(latestPengajuan.id_pengajuan.substring(4), 10);
            const incremented = (lastNumeric + 2).toString().padStart(4, '0');
            newId = `${year}${month}${incremented}PG`;
        }
        // console.log("getLastPengajuanID: ", newId);
        return res.status(200).json({newId});


    } catch (error) {
        console.error(error);
        return res.status(500).json({message: 'error retrieving last id barang'});
    }
};

export const createPengajuan = async (req, res) => {
  let transaction;
  transaction = await db.transaction();

  try {
    const dataPengajuan = Array.isArray(req.body.items) ? req.body.items : [req.body];
    const defaultKaryawan = req.body.id_karyawan || (req.user && req.user.id_karyawan) || null;


    if (!dataPengajuan.length) {
      return res.status(400).json({ message: "No items provided" });
    }

    for (const it of dataPengajuan) {
      if (!it.id_barang) {
        return res.status(400).json({ message: "id_barang is required for each item" });
      }
      it.id_karyawan = it.id_karyawan || defaultKaryawan;
      if (!it.id_karyawan) {
        return res.status(400).json({ message: "id_karyawan is required for each item" });
      }
      if (it.jumlah_barang !== undefined) it.jumlah_barang = Number(it.jumlah_barang) || 0;
      if (it.total !== undefined) it.total = Number(it.total) || 0;
    }

    await Pengajuan.bulkCreate(dataPengajuan, { transaction, individualHooks: true });

    const lastAntrean = await AntreanPengajuan.findOne({
      order: [["nomor_antrean", "DESC"]], 
      transaction,
    });

    // console.log("idPengajuan:", dataPengajuan.id_pengajuan);

    let newNomorAntrean = 1;
    let newIDAntrean;
    if (lastAntrean) {
      newNomorAntrean = lastAntrean.nomor_antrean + 1;
    };

    // console.log("newNomorAntrean:", newNomorAntrean);

    const today = new Date().toISOString().split("T")[0].replace(/-/g, "");
    newIDAntrean = `${today}_${newNomorAntrean}`;

    // console.log("newIDAntrean:", newIDAntrean);

    // let idPengajuan = dataPengajuan.map(item => item.id_pengajuan);
    // console.log("ID PENGAJUAN:", idPengajuan);
    // idPengajuan = JSON.stringify(idPengajuan);

    let antreanBaru = lastAntrean?.nomor_antrean || newNomorAntrean;


    let existingAntrean;
    do{
      existingAntrean = await AntreanPengajuan.findOne({
        where: {id_antrean: newIDAntrean},
        transaction,
      });

      // console.log("existingAntrean:", existingAntrean);

      if (existingAntrean){
        antreanBaru++;
        newIDAntrean = `${today}_${antreanBaru}`;
      }
    } while(existingAntrean);

    
    let dataAntrean = dataPengajuan.map(item => ({
      id_antrean: newIDAntrean,
      nomor_antrean: newNomorAntrean,
      id_pengajuan: item.id_pengajuan,
    }));
    // console.log("ID PENGAJUAN:", idPengajuan);

    const newAntrean = await AntreanPengajuan.bulkCreate(
      dataAntrean,
      {transaction, ignoreDuplicates: true}
    );

    await transaction.commit();

    return res.status(201).json({ 
      success: true,
      message: "Pengajuan berhasil dibuat",
      imported: dataPengajuan.length,
      data: newAntrean,
    });
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error("Failed to create new Pengajuan:", error);
    return res.status(500).json({ message: error.message || "Server error" });
  }
};

export const detailPengajuan = async(req, res) => {
    // const {id_pengajuan} = req.params;

    try {
        const pengajuan = await Pengajuan.findAll({
            // where: {id_pengajuan: id_pengajuan},
            include: [
                {
                  model: Barang,
                  as: 'BarangDiajukan', 
                  attributes: ['id_barang', 'nama', 'id_kategori'],
                  include: [
                    {
                      model: Kategori,
                      as: "KategoriBarang", 
                      attributes: ["nama", "satuan", "harga_barang", "jenis_barang"],
                      required: false,
                    }
                  ]
                },
                {
                  model: Karyawan,
                  as: 'Pemohon',
                  attributes: ['id_karyawan', 'nama', 'divisi'],
                }, 
                {
                  model: GenPengajuan,
                  as: 'GeneratePengajuan', 
                  attributes: ['id_pengajuan', 'status'],
                }
            ],
        }); 
        return res.status(200).json(pengajuan);

    } catch (error) {
        // console.log(error.message);
        res.status(500).json({ message: "Failed to fetch Detail Barang" });
    }
}

export const getPengajuan = async(req, res) => {
    try {
        const pengajuan = await Pengajuan.findAll({
            group: ['id_pengajuan'],
            include: [
                {
                    model: GenPengajuan,
                    as: 'GeneratePengajuan', 
                    attributes: ['id_pengajuan', 'status'],
                    include: [
                      {
                        model: AntreanPengajuan,
                        as: 'Antrean', 
                        attributes: ['id_antrean', 'nomor_antrean']
                      }
                    ]
                },
                {
                    model: Karyawan,
                    as: 'Pemohon',
                    attributes: ['id_karyawan', 'nama', 'divisi'],
                },
        
            ],
            
        }); 
        return res.status(200).json(pengajuan);

    } catch (error) {
        // console.log(error.message);
        res.status(500).json({ message: "Failed to fetch Detail Barang" });
    }
}

export const getPengajuanById = async(req, res) => {
  // const {id_karyawan} = req.params;
  // console.log("idKaryawan:", id_karyawan);

    try {
        const pengajuanById = await Pengajuan.findOne({
            where: {id_karyawan: req.params.id_karyawan},
            // group: ['id_pengajuan'],
            include: [
                {
                    model: GenPengajuan,
                    as: 'GeneratePengajuan', 
                    attributes: ['id_pengajuan', 'status'],
                },
                {
                    model: Karyawan,
                    as: 'Pemohon',
                    attributes: ['id_karyawan', 'nama', 'divisi'],
                },
        
            ],
            
        }); 
        return res.status(200).json(pengajuanById);

    } catch (error) {
        // console.log(error.message);
        res.status(500).json({ message: "Failed to fetch Detail Barang" });
    }
}

export const deletePengajuan = async(req, res) => {
  try {
    const {id_pengajuan} = req.params;

    const genPengajuan = await GenPengajuan.findOne({where: {id_pengajuan}});
    if (!genPengajuan) {
      return res.status(404).json({msg: "Generate ID Pengajuan tidak ditemukan"});
    }

    const pengajuan = await Pengajuan.findAll({where: {id_pengajuan}});
    const pengajuanId = pengajuan.map(p => p.id_pengajuan);

    if (pengajuanId.length > 0) {
      await Pengajuan.destroy({where: {id_pengajuan: pengajuanId}});
    }


    await AntreanPengajuan.destroy({where: {id_pengajuan: pengajuanId}});
    await Transaksi.destroy({where: {id_pengajuan: pengajuanId}});
    await GenPengajuan.destroy({where: {id_pengajuan: pengajuanId}});
    res.status(200).json({msg: "Data Pengajuan berhasil dihapus."});
  } catch (error) {
    console.error("Gagal menghapus Data Pengajuan:", error.message);
    res.status(500).json({ message: "Gagal menghapus Data Pengajuan." });
  }
}


export const getPenjualan = async (req, res) => {
  try {
    const { year } = req.query; 

    const whereCondition = {
      jenis_pengajuan: {[Op.like]: "PENJUALAN"},
    }

   if (year) {
      whereCondition["createdAt"] = {
        [Op.between] : [`${year}-01-01`, `${year}-12-31`],
      }
   }

    const dataPenjualan = await Pengajuan.findAll({
      where: whereCondition,
      include: [
        {
          model: GenPengajuan,
          as: "GeneratePengajuan",
          where: { status: { [Op.like]: "Selesai" } },
        },
        {
          model: Karyawan,
          as: "Pemohon",
          attributes: ["divisi"],
        },
      ],
      attributes: [
        [Sequelize.col("Pemohon.divisi"), "divisi"],
        [Sequelize.fn("SUM", Sequelize.col("total")), "total"],
      ],
      group: ["Pemohon.divisi"],
      raw: true,
    });
    

    const formattedData = dataPenjualan.map((item) => ({
      ...item,
      total: parseFloat(item.total),
    }));

    // console.log("Formatted Data:", formattedData);

    // if (formattedData.length > 0) {
    //   res.status(200).json(formattedData);
    // } else {
    //   res.status(404).json({ message: "Data tidak ditemukan" });
    // }
    res.status(200).json(formattedData.length ? formattedData : []);
  } catch (error) {
    console.error("Error fetching data:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


export const filterPenjualanTahunan = async (req, res) => {
  try {
    const dataPenjualan = await Pengajuan.findAll({
      where: {
        jenis_pengajuan: "PENJUALAN",
      },
      include: [
        {
          model: Karyawan,
          as: "Pemohon",
          attributes: ["divisi"],
        },
      ],

      attributes: ["createdAt",],
      raw: true,
    });

    // console.log("Raw Data: ", dataPenjualan); 

    if (dataPenjualan.length > 0) {
      res.status(200).json(dataPenjualan); 
    } else {
      res.status(404).json({ message: "Data tidak ditemukan" });
    }
    
  } catch (error) {
    console.error("Error fetching data:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


export const getDataPerDivisi = async (req, res) => {
  try {
      const { divisi, bulan, tahun } = req.query;

      // console.log("Received Query Params:", { divisi, bulan, tahun });

      const whereCondition = {
        jenis_pengajuan: {[Op.like]: "PENJUALAN"},
      }

      if (divisi && divisi !== "") {
        whereCondition["$Pemohon.divisi$"] = divisi;
      }

      if ((!bulan || bulan === "") && (!divisi || divisi === "")) {
        whereCondition["createdAt"] = {
          [Op.between] : [`${tahun}-01-01`, `${tahun}-12-31`],
        }; 
      } else if (tahun && (!bulan || bulan === "")) {
        whereCondition["createdAt"] = {
          [Op.between] : [`${tahun}-01-01`, `${tahun}-12-31`],
        }; 
      } else if (bulan && tahun) {
        const startDate = `${tahun}-${bulan.padStart(2, '0')}-01`;
        const endDate = new Date(tahun, bulan, 0); 
        const endDateString = endDate.toISOString().split('T')[0];

        whereCondition["createdAt"] = {
            [Op.gte]: startDate,
            [Op.lte]: endDateString,
        };
      }

      const dataPemohon = await Pengajuan.findAll({
          where: whereCondition,
          include: [
              {
                model: GenPengajuan,
                as: "GeneratePengajuan",
                where: { status: { [Op.like]: "Selesai" } },
              },
              {
                model: Karyawan,
                as: "Pemohon",
                attributes: ["divisi"],
              },
          ],
          attributes: [
              [Sequelize.col("Pemohon.divisi"), "divisi"],
              [Sequelize.fn("SUM", Sequelize.col("total")), "total"],
          ],
          group: ["Pemohon.divisi"],
          raw: true,
      });

      const formattedData = dataPemohon.map((item) => ({
          ...item,
          total: parseFloat(item.total),
      }));

      // console.log("Formatted Data:", formattedData);

      res.status(200).json(formattedData.length ? formattedData : []);
  } catch (error) {
      console.error("Error fetching data:", error.message);
      res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getScrappingPerDivisi = async (req, res) => {
  try {
      const { divisi, bulan, tahun } = req.query;

      // console.log("Received Query Params:", { divisi, bulan, tahun });

      const whereCondition = {
        jenis_pengajuan: {[Op.like]: "SCRAPPING"},
      }

      if (divisi && divisi !== "") {
        whereCondition["$Pemohon.divisi$"] = divisi;
      }

      if ((!bulan || bulan === "") && (!divisi || divisi === "")) {
        whereCondition["createdAt"] = {
          [Op.between] : [`${tahun}-01-01`, `${tahun}-12-31`],
        }; 
      } else if (tahun && (!bulan || bulan === "")) {
        whereCondition["createdAt"] = {
          [Op.between] : [`${tahun}-01-01`, `${tahun}-12-31`],
        }; 
      } else if (bulan && tahun) {
        const startDate = `${tahun}-${bulan.padStart(2, '0')}-01`;
        const endDate = new Date(tahun, bulan, 0); 
        const endDateString = endDate.toISOString().split('T')[0];

        whereCondition["createdAt"] = {
            [Op.gte]: startDate,
            [Op.lte]: endDateString,
        };
      }

      const dataPemohon = await Pengajuan.findAll({
          where: whereCondition,
          include: [
              {
                model: GenPengajuan,
                as: "GeneratePengajuan",
                where: { status: { [Op.like]: "Selesai" } },
              },
              {
                model: Karyawan,
                as: "Pemohon",
                attributes: ["divisi"],
              },
              {
                model: Barang,
                as: "BarangDiajukan",
                attributes: ["id_barang", "id_kategori"], 
                include: [
                  {
                    model: Kategori, 
                    as: "KategoriBarang", 
                    attributes: ["jenis_barang"]
                  }
                ]
              }
          ],
          attributes: [
              [Sequelize.col("Pemohon.divisi"), "divisi"],
              [Sequelize.col("BarangDiajukan.KategoriBarang.jenis_barang"), "jenis_barang"],
              [Sequelize.fn("SUM", Sequelize.col("jumlah_barang")), "jumlah_barang"],
          ],
          group: ["Pemohon.divisi"],
          raw: true,
      });

      const formattedData = dataPemohon.map((item) => ({
          ...item,
          jumlah_barang: parseFloat(item.jumlah_barang),
      }));

      // console.log("Formatted Data:", formattedData);

      res.status(200).json(formattedData.length ? formattedData : []);
  } catch (error) {
      console.error("Error fetching data:", error.message);
      res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getDataPemohonPerDivisi = async (req, res) => {
  try {
    const { divisi, bulan, tahun } = req.query;

    // console.log("Received Query Params:", { divisi, bulan, tahun });

    const whereCondition = (
      await Pengajuan.findAll({
      where: {
        jenis_pengajuan: "PENJUALAN", 
      },
      include: [
        { 
          model: GenPengajuan,
          as: "GeneratePengajuan",
          where: {  
            status: "Selesai",
          },
        }
      ]
    }));

    if (divisi) {
        whereCondition["$Pemohon.divisi$"] = divisi;
    }

    if (bulan && tahun) {
      const startDate = `${tahun}-${bulan.padStart(2, '0')}-01`;
      const endDate = new Date(tahun, bulan, 0); // Mendapatkan tanggal terakhir di bulan tersebut
      const endDateString = endDate.toISOString().split('T')[0]; // Format 'YYYY-MM-DD'
  
      whereCondition["createdAt"] = {
          [Sequelize.Op.gte]: startDate,
          [Sequelize.Op.lte]: endDateString,
      };
    } 
    else if (tahun) {
      // console.log(`Filtering data for entire year: ${tahun}`);
      whereCondition["createdAt"] = {
          [Sequelize.Op.gte]: `${tahun}-01-01`,
          [Sequelize.Op.lte]: `${tahun}-12-31`,
      };
    }

    const dataPemohon = await Pengajuan.findAll({
        where: whereCondition,
        include: [
            {
                model: Karyawan,
                as: "Pemohon",
                attributes: ["divisi", "id_karyawan"],
            },
        ],
        attributes: [
            [Sequelize.col("Pemohon.divisi"), "divisi"],
            [Sequelize.fn("COUNT", Sequelize.fn("DISTINCT", Sequelize.col("Pemohon.id_karyawan"))), "jumlah_pemohon"],
        ],
        group: ["Pemohon.divisi"],
        raw: true,
    });

    const dataPemohonPerDivisi = dataPemohon.map((item) => ({
        ...item,
        jumlah_pemohon: parseInt(item.jumlah_pemohon, 10),
    }));

    // console.log("dataPemohonPerDivisi:", dataPemohonPerDivisi);

    if (dataPemohonPerDivisi.length > 0) {
        res.status(200).json(dataPemohonPerDivisi);
    } else {
        res.status(200).json({ message: "Data tidak ditemukan", data: [] });
    }
} catch (error) {
    console.error("Error fetching data:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
}
};

export const updatePengajuan = async(req, res) => {
  let transaction;
  try {
    const { items } = req.body;

    if (Array.isArray(items)) {
      transaction = await db.transaction();

      await Pengajuan.destroy({
        where: { id_pengajuan: req.params.id_pengajuan },
        transaction,
      });

      const payload = items.map((it) => ({
        id_pengajuan: req.params.id_pengajuan,
        id_karyawan: it.id_karyawan || it.id_karyawan || null,
        id_barang: it.id_barang || null,
        jumlah_barang: it.jumlah_barang !== undefined ? Number(it.jumlah_barang) : 0,
        kondisi: it.kondisi || null,
        jenis_pengajuan: it.jenis_pengajuan || null,
        harga: it.harga !== undefined ? Number(it.harga) : null,
        total: it.total !== undefined ? Number(it.total) : (it.jumlah_barang ? Number(it.jumlah_barang) * (it.harga || 0) : 0),
      }));

      if (payload.length > 0) {
        await Pengajuan.bulkCreate(payload, { transaction, individualHooks: true });
      }

      await transaction.commit();
      return res.status(200).json({ msg: "Data pengajuan berhasil diperbarui." });
    }

    await Pengajuan.update(req.body, {
      where: {
        id_pengajuan: req.params.id_pengajuan,
      },
    });

    res.status(200).json({ msg: "Data pengajuan berhasil diperbarui." });
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error("Error updating pengajuan:", error.message);
    res.status(500).json({ message: error.message });
  }
};


export default router;