import express from "express"; 
import { getAntrean,
         getAntreanById, 
         createAntrean
} from "../controllers/AntreanController.js";
import Antrean from "../models/AntreanModel.js";
import GenPengajuan from "../models/GenPengajuan.js";

const router = express.Router();

router.get('/antrean', getAntrean);
router.get('/antrean/:id_antrean', getAntreanById);
router.post('/antrean', createAntrean); 


router.post("/update-antrean", async (req, res) => {
    const { id_antrean, nomor_antrean_baru } = req.body;
    
    try {
        const antrean = await Antrean.findOne({ where: { id_antrean } });
        
        if (!antrean) {
          return res.status(404).json({ error: 'Antrean tidak ditemukan.' });
        }
        
        antrean.nomor_antrean = nomor_antrean_baru;
        await antrean.save();
        
        res.status(200).json({ message: 'Antrean berhasil diperbarui.' });
    } catch (error) {
        console.error('Error updating antrean:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.delete("/delete-antrean/:nomor_antrean", async (req, res) => {
    const { nomor_antrean } = req.params;

    try {
        const antrean = await Antrean.findOne({ where: { nomor_antrean } });

        if (!antrean) {
            return res.status(404).json({ error: 'Antrean tidak ditemukan.' });
        }

        await antrean.destroy();

        res.status(200).json({ message: 'Antrean berhasil dihapus.' });
    } catch (error) {
        console.error('Error deleting antrean:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


router.put('/update-status-antrean/:id', async (req, res) => {
  const { id } = req.params;
  try {
      const antrean = await Antrean.findByPk(id);

      if (antrean.status === "Selesai") {
          await Antrean.destroy({
              where: { id_pinjaman: id }
          });

          const antreanSisa = await Antrean.findAll({
              order: [['nomor_antrean', 'ASC']],
          });

          for (let i = 0; i < antreanSisa.length; i++) {
              antreanSisa[i].nomor_antrean = i + 1;
              await antreanSisa[i].save();
          }

          res.status(200).json({ message: 'Antrean berhasil diperbarui.' });
      } else {
          res.status(400).json({ error: 'Pengajuan belum diproses.' });
      }
  } catch (error) {
      console.error('Error updating antrean:', error.message);
      res.status(500).json({ error: 'Gagal memperbarui antrean.' });
  }
});

router.post('/add-antrean', async (req, res) => {
  try {
      const lastAntrean = await Antrean.findOne({
          order: [['nomor_antrean', 'DESC']],
      });

      const newNomorAntrean = lastAntrean ? lastAntrean.nomor_antrean + 1 : 1;

      const newAntrean = await Antrean.create({
          ...req.body,
          nomor_antrean: newNomorAntrean,
      });

      res.status(201).json({ message: 'Antrean baru berhasil ditambahkan', data: newAntrean });
  } catch (error) {
      console.error('Error adding antrean:', error.message);
      res.status(500).json({ error: 'Gagal menambahkan antrean' });
  }
});

router.get("/antrean", async (req, res) => {
    try {
        const antrean = await Antrean.findAll({
            include: [
                {
                    model: GenPengajuan,
                    as: 'Antrean',
                    attributes: [
                        "status_pengajuan",
                        "createdAt"
                    ],
                    
                },
            ],
            order: [["nomor_antrean", "ASC"]], 
        }); 

        res.json(antrean);
    } catch (error) {
        res.status(500).json({ error: "Terjadi kesalahan pada server" });
    }
});

router.post("/antrean-pengajuan/proses", async (req, res) => {
    try {
        console.log("Menghapus antrean yang telah diproses...");
        await processAntreanAutomatically();
        res.json({ message: "Antrean diproses dan nomor antrean diperbarui." });

    } catch (error) {
        console.error("Error processing antrean:", error);
        res.status(500).json({ error: "Terjadi kesalahan saat memproses antrean" });
    }
});

router.get("/antrean/:id_pinjaman", async (req,res) => {
    try {

        const id_pinjaman = req.params.id_pinjaman;
        const antrean = await Antrean.findAll({
            where: { id_pinjaman},
            attributes: ["nomor_antrean"],
            order: [["nomor_antrean", "ASC"]], 
        });

        if (!antrean.length) {
            return res.status(404).json({ message: "Nomor antrean tidak ditemukan" });
        }
        const nomorAntreanList = antrean.map(a => a.nomor_antrean);
        res.json({ nomor_antrean: nomorAntreanList });
    } catch (error) {
        console.error("Error fetching antrean by id_pinjaman:", error.message);
        res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
});



export default router; 