import express from "express";
import multer from 'multer'; // Import multer for file upload handling
import path from 'path';
import fs from 'fs';
import csvParser from "csv-parser";
import db from "../config/database.js";
import Pengajuan from "../models/PengajuanModel.js";
import Barang from "../models/BarangModel.js";
import Kategori from "../models/KategoriModel.js";
import Karyawan from "../models/KaryawanModel.js";
import GenPengajuan from "../models/GenPengajuan.js";
import Transaksi from "../models/TransaksiModel.js";


import { createPengajuan, deletePengajuan, detailPengajuan, filterPenjualanTahunan, getDataPerDivisi, getLastPengajuanID, getPengajuan, getPengajuanById, getPenjualan, getScrappingPerDivisi, updatePengajuan } from "../controllers/PengajuanController.js";


const router = express.Router(); 
const uploadDirectory = './uploads/Pengajuan';

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

router.get('/getLastPengajuanID', getLastPengajuanID);
router.post('/pengajuan', createPengajuan);
router.get('/detail-pengajuan', detailPengajuan);
router.get('/pengajuan', getPengajuan);
router.delete('/delete-pengajuan/:id_pengajuan', deletePengajuan);
router.get('/pengajuanById/:id_karyawan', getPengajuanById);
router.get('/data-penjualan', getPenjualan);
router.get('/filter-penjualan-tahunan', filterPenjualanTahunan);
router.get('/data-divisi', getDataPerDivisi); 
router.get('/data-scrapping-divisi', getScrappingPerDivisi);
router.patch('/ubah-pengajuan/:id_pengajuan', updatePengajuan);

//import bulk create all -- hanya bisa untuk mengimpor 1 pengajuan, 1 item per transaksi
// router.post('/pengajuan/import-csv', upload.single("csvfile"), async(req,res) => {
//   const latestGenPengajuan = await GenPengajuan.findOne({
//       order: [['id_pengajuan', 'DESC']]
//   });

//   const date = new Date();
//   const twoDigitYear = String(date.getFullYear()).slice(-2);
//   const year = twoDigitYear.padStart(2, '0');
//   const month = String(date.getMonth() + 1).padStart(2, '0');

//   let nextIdPengajuan = `${year}${month}0001PG`;

//   if (latestGenPengajuan && latestGenPengajuan.id_pengajuan) {
//       const lastIdNumber = parseInt(latestGenPengajuan.id_pengajuan.substring(4), 10); 
//       const incrementedIdNumber = (lastIdNumber + 2).toString().padStart(4, '0');
//       nextIdPengajuan = `${year}${month}${incrementedIdNumber}PG`;
//   }

//   const lastNumeric = latestGenPengajuan && latestGenPengajuan.id_pengajuan 
//   ? parseInt(latestGenPengajuan.id_pengajuan.substring(4), 10)
//   : 0;
//   const startNumeric = lastNumeric + 2;


//   const latestTransaksi = await Transaksi.findOne({
//       order: [['id_transaksi', 'DESC']]
//   });

//   const transaksiDate = new Date();
//   const twoDigitTransaksiYear = String(transaksiDate.getFullYear()).slice(-2);
//   const transaksiYear = twoDigitTransaksiYear.padStart(2, '0');
//   const transaksiMonth = String(transaksiDate.getMonth() + 1).padStart(2, '0');

//   let nextIdTransaksi = `${transaksiYear}${transaksiMonth}0002PJ`;

//   if (latestTransaksi && latestTransaksi.id_transaksi) {
//       const lastIdNumber = parseInt(latestTransaksi.id_transaksi.substring(4), 10); 
//       const incrementedIdNumber = (lastIdNumber + 2).toString().padStart(4, '0');
//       nextIdTransaksi = `${transaksiYear}${transaksiMonth}${incrementedIdNumber}PJ`;
//   }

//   const lastTransaksiNumeric = latestTransaksi && latestTransaksi.id_transaksi 
//   ? parseInt(latestTransaksi.id_transaksi.substring(4), 10)
//   : 0;
//   const startTransaksiNumeric = lastTransaksiNumeric + 2;

//   if (!req.file) {
//     return res.status(400).json({ success: false, message: 'No file uploaded' });
//   }

//   const filePath = req.file.path;
//   const pengajuan = [];
  
//   if (!fs.existsSync('./uploads/pengajuan')) {
//     fs.mkdirSync('./uploads/pengajuan');
//   }
  
//   fs.createReadStream(filePath)
//   .pipe(csvParser())
//   .on("data", (row) => {
//     pengajuan.push({
//       status: row.status, 
//       jumlah_barang: row.jumlah_barang,
//       kondisi: row.kondisi,
//       jenis_pengajuan: row.jenis_pengajuan,
//       total: row.total,
//       id_barang: row.id_barang,
//       id_karyawan: row.id_karyawan,
//       id_pengajuan: nextIdPengajuan,
//       cara_bayar: row.cara_bayar,
//       keterangan: row.keterangan,
//       id_vendor: row.id_vendor,
//       id_petugas: row.id_petugas,
//     });
//   }).on("end", async () => {
//     let transaction = await db.transaction();
//     try {
//       if (pengajuan.length === 0) {
//         return res.status(400).json({ success: false, message: 'Tidak ada data untuk diimpor' });
//       }

//       const payload = pengajuan.map((r, idx) => ({
//         status: r.status, 
//         jumlah_barang: r.jumlah_barang, 
//         kondisi: r.kondisi,
//         jenis_pengajuan: r.jenis_pengajuan,
//         total: r.total,
//         id_barang: r.id_barang,
//         id_karyawan: r.id_karyawan,
//         id_pengajuan: `${year}${month}${(startNumeric + idx).toString().padStart(4, '0')}PG`,
//         cara_bayar: r.cara_bayar,
//         keterangan: r.keterangan,
//         id_vendor: r.id_vendor,
//         id_petugas: r.id_petugas,
//         id_transaksi : `${transaksiYear}${transaksiMonth}${(startTransaksiNumeric + idx).toString().padStart(4, '0')}PJ`,
//       }));

//       transaction = await db.transaction();

//       await GenPengajuan.post(
//         payload.map(item => ({
//           id_pengajuan: item.id_pengajuan,
//           status: item.status || 'Selesai',
//         })), 
//         { transaction }
//       );

//       await Pengajuan.bulkCreate(
//         payload.map(item => ({
//           jumlah_barang: item.jumlah_barang, 
//           kondisi: item.kondisi,
//           jenis_pengajuan: item.jenis_pengajuan,
//           total: item.total,
//           id_barang: item.id_barang,
//           id_karyawan: item.id_karyawan,
//           id_pengajuan: item.id_pengajuan,
//         })), 
//         { transaction }
//       );

//       await Transaksi.post(
//         payload.map(item => ({
//           id_transaksi: item.id_transaksi,
//           cara_bayar: item.cara_bayar,  
//           keterangan: item.keterangan,
//           id_vendor: item.id_vendor,
//           id_petugas: item.id_petugas,
//           id_pengajuan: item.id_pengajuan,
//         })), 
//         { transaction }
//       )
//       await transaction.commit();

//       res.status(200).json({
//         success: true,
//         message: "Data berhasil diimpor ke database",
//         imported: payload.length
//       });
//     } catch (error) {
//       console.error("Error importing data:", error);
//       res.status(500).json({
//         success: false,
//         message: "Gagal mengimpor data ke database",
//         error: error.message,
//       });
//     } finally{
//       fs.unlinkSync(filePath);
//     }
//   })
//   .on("error", (error) => {
//       console.error("Error parsing file:", error);
//       res.status(500).json({ success: false, message: "Error parsing file" });
//   });
//   });

router.post('/pengajuan/import-csv', upload.single("csvfile"), async(req,res) => {
  try {
    const latestGenPengajuan = await GenPengajuan.findOne({
      order: [['id_pengajuan', 'DESC']]
    });

    const date = new Date();
    const twoDigitYear = String(date.getFullYear()).slice(-2);
    const year = twoDigitYear.padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');

    let nextIdPengajuan = `${year}${month}0001PG`;
    if (latestGenPengajuan && latestGenPengajuan.id_pengajuan) {
      const lastIdNumber = parseInt(latestGenPengajuan.id_pengajuan.substring(4), 10);
      const incrementedIdNumber = (lastIdNumber + 2).toString().padStart(4, '0');
      nextIdPengajuan = `${year}${month}${incrementedIdNumber}PG`;
    }

    const latestTransaksi = await Transaksi.findOne({
      order: [['id_transaksi', 'DESC']]
    });

    const transaksiDate = new Date();
    const twoDigitTransaksiYear = String(transaksiDate.getFullYear()).slice(-2);
    const transaksiYear = twoDigitTransaksiYear.padStart(2, '0');
    const transaksiMonth = String(transaksiDate.getMonth() + 1).padStart(2, '0');

    let nextIdTransaksi = `${transaksiYear}${transaksiMonth}0002PJ`;
    if (latestTransaksi && latestTransaksi.id_transaksi) {
      const lastIdNumber = parseInt(latestTransaksi.id_transaksi.substring(4), 10);
      const incrementedIdNumber = (lastIdNumber + 2).toString().padStart(4, '0');
      nextIdTransaksi = `${transaksiYear}${transaksiMonth}${incrementedIdNumber}PJ`;
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const pengajuanRows = [];

    if (!fs.existsSync('./uploads/pengajuan')) {
      fs.mkdirSync('./uploads/pengajuan');
    }

    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on("data", (row) => {
        pengajuanRows.push({
          status: row.status,
          jumlah_barang: row.jumlah_barang,
          kondisi: row.kondisi,
          jenis_pengajuan: row.jenis_pengajuan,
          total: row.total,
          id_barang: row.id_barang,
          id_karyawan: row.id_karyawan,
          cara_bayar: row.cara_bayar,
          keterangan: row.keterangan,
          id_vendor: row.id_vendor,
          id_petugas: row.id_petugas,
        });
      })
      .on("end", async () => {
        let transaction;
        try {
          if (pengajuanRows.length === 0) {
            return res.status(400).json({ success: false, message: 'Tidak ada data untuk diimpor' });
          }

          const batchIdPengajuan = nextIdPengajuan;
          const batchIdTransaksi = nextIdTransaksi;

          const totalTransaksi = pengajuanRows.reduce((acc, r) => acc + (parseFloat(r.total) || 0), 0);

          const firstRow = pengajuanRows[0] || {};

          transaction = await db.transaction();

          await GenPengajuan.bulkCreate(
            [{
              id_pengajuan: batchIdPengajuan,
              status: firstRow.status || 'Selesai',
            }],
            { transaction }
          );

          await Pengajuan.bulkCreate(
            pengajuanRows.map(r => ({
              jumlah_barang: r.jumlah_barang,
              kondisi: r.kondisi,
              jenis_pengajuan: r.jenis_pengajuan,
              total: r.total,
              id_barang: r.id_barang,
              id_karyawan: r.id_karyawan,
              id_pengajuan: batchIdPengajuan,
            })),
            { transaction }
          );

          await Transaksi.bulkCreate(
            [{
              id_transaksi: batchIdTransaksi,
              cara_bayar: firstRow.cara_bayar || null,
              keterangan: firstRow.keterangan || null,
              id_vendor: firstRow.id_vendor || null,
              id_petugas: firstRow.id_petugas || null,
              id_pengajuan: batchIdPengajuan,
              total: totalTransaksi,
            }],
            { transaction }
          );

          await transaction.commit();

          res.status(200).json({
            success: true,
            message: "Data berhasil diimpor ke database",
            imported: pengajuanRows.length,
            id_pengajuan: batchIdPengajuan,
            id_transaksi: batchIdTransaksi
          });
        } catch (error) {
          if (transaction) await transaction.rollback();
          console.error("Error importing data:", error);
          res.status(500).json({
            success: false,
            message: "Gagal mengimpor data ke database",
            error: error.message,
          });
        } finally {
          try { fs.unlinkSync(filePath); } catch (e) { }
        }
      })
      .on("error", (error) => {
        console.error("Error parsing file:", error);
        res.status(500).json({ success: false, message: "Error parsing file" });
      });
  } catch (err) {
    console.error("Unexpected error:", err);
    res.status(500).json({ success: false, message: "Internal server error", error: err.message });
  }
});



router.get("/detail-pengajuan/:id_pengajuan", async(req, res) => {
    try {
        const pengajuan = await Pengajuan.findAll({
            where: {id_pengajuan: req.params.id_pengajuan},
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
                }, 
            ],
        }); 
        return res.status(200).json(pengajuan);

    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: "Failed to fetch Detail Barang" });
    }
});


router.get("/total-penjualan", async (req, res) => {
    try {
      const totalPenjualan = (await Pengajuan.sum("total", {
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
      })) || 0;

      // console.log("Total Penjualan:", totalPenjualan);

      res.status(200).json({ totalPenjualan });
    } catch (error) {
      console.error("Error fetching total pinjaman:", error.message);
      res.status(500).json({ message: "Internal server error" });
    }
});

router.get("/total-scrapping", async (req, res) => {
    try {
      const totalScrapping = (await Pengajuan.sum("total", {
        where: {
          jenis_pengajuan: "SCRAPPING",
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
      })) || 0;

      // console.log("Total Penjualan:", totalScrapping);

      res.status(200).json({ totalScrapping });
    } catch (error) {
      console.error("Error fetching total pinjaman:", error.message);
      res.status(500).json({ message: "Internal server error" });
    }
});


router.get("/total-penjualan/:id_karyawan", async (req, res) => {
    try {
      const totalPenjualan = (await Pengajuan.sum("total", {
        //  where: {id_pengajuan: req.params.id_pengajuan},
        where: {
          id_karyawan: req.params.id_karyawan,
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
      })) || 0;

      // console.log("Total Penjualan:", totalPenjualan);

      res.status(200).json({ totalPenjualan });
    } catch (error) {
      console.error("Error fetching total pinjaman:", error.message);
      res.status(500).json({ message: "Internal server error" });
    }
});

router.get("/total-scrapping/:id_karyawan", async (req, res) => {
    try {
      const totalScrapping = (await Pengajuan.sum("total", {
        where: {
          id_karyawan: req.params.id_karyawan,
          jenis_pengajuan: "SCRAPPING",
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
      })) || 0;
      res.status(200).json({ totalScrapping });
    } catch (error) {
      console.error("Error fetching total pinjaman:", error.message);
      res.status(500).json({ message: "Internal server error" });
    }
});


router.get("/jumlah-belum-diproses/:id_karyawan", async (req, res) => {
	try {
		const {id_karyawan} = req.params;

		const jumlahBelumDiproses = await Pengajuan.count({
			where: {
        id_karyawan,
        // status: "Selesai"
      },
      include: [
        {
          model: GenPengajuan,
          as: "GeneratePengajuan",
          where: {
            status: "Belum Diproses",
          },
        }
      ],
			distinct: true,
			col: 'id_pengajuan',
		}); 
		
		if (jumlahBelumDiproses === null || jumlahBelumDiproses === undefined) {
			return res.status(404).json({ message: "Tidak ada pengajuan belum diproses." });
		} 

		res.status(200).json({ jumlahBelumDiproses});
	} catch (error) {
    console.error("Error fetching jumlah belum diproses:", error.message);
    res.status(500).json({ message: "Internal server error" });
	}
});


router.get("/jumlah-pengajuan-selesai/:id_karyawan", async (req, res) => {
	try {
		const {id_karyawan} = req.params;

		const jumlahPengajuanSelesai = await Pengajuan.count({
			where: {
        id_karyawan,
        // status: "Selesai"
      },
      include: [
        {
          model: GenPengajuan,
          as: "GeneratePengajuan",
          where: {
            status: "Selesai",
          },
        }
      ],
			distinct: true,
			col: 'id_pengajuan',
		}); 
		
		if (jumlahPengajuanSelesai === null || jumlahPengajuanSelesai === undefined) {
			return res.status(404).json({ message: "Belum ada pengajuan selesai" });
		} 

		res.status(200).json({ jumlahPengajuanSelesai});
	} catch (error) {
					console.error("Error fetching jumlah belum diproses:", error.message);
					res.status(500).json({ message: "Internal server error" });
	}
});




export default router;