import { Op } from "sequelize";
import Antrean from "../models/AntreanModel.js";
import GenPengajuan from "../models/GenPengajuan.js";
import db from "../config/database.js";

export const getAntrean = async(req, res) => {
    try {
        const response = await Antrean.findAll();
        res.status(200).json(response); 
    } catch (error) {
        console.log(error.message); 
    }
}

export const getAntreanById = async(req, res) => {
    try {
        const response = await Antrean.findOne({
            where:{
                id_antrean: req.params.id_antrean 
            }
        });
        res.status(200).json(response); 
    } catch (error) {
        console.log(error.message); 
    }
}

export const createAntrean = async(req, res) => {
    try {
        console.log(req.body);
        await Antrean.create(req.body);
        res.status(201).json({msg: "Antrean baru telah dibuat"}); 
    } catch (error) {
        res.status(500).json({message: error.message}); 
    }
}

export const processAntreanAutomatically = async () => {
    const transaction = await db.transaction(); 
    try {
        const antrean = await Antrean.findOne({
            include: [
							{
								model: GenPengajuan,
								as: "Antrean",
								where: {
										status: "Selesai",
								},
							},
            ],
            order: [["nomor_antrean", "ASC"]],
            transaction, 
        });

        if (antrean) {
            const nomorAntreanToDelete = antrean.nomor_antrean;
            console.log(`Menghapus antrean dengan nomor ${nomorAntreanToDelete}...`);

            await antrean.destroy({ transaction });

            const remainingAntrean = await Antrean.findAll({
                where: {
                    nomor_antrean: {
                        [Op.gt]: nomorAntreanToDelete, // Antrean dengan nomor > nomor yang dihapus
                    },
                },
                order: [["nomor_antrean", "ASC"]],
                transaction,
            });

            // Update nomor antrean untuk antrean yang tersisa
            let newNomorAntrean = nomorAntreanToDelete;
            for (const antreanItem of remainingAntrean) {
                await antreanItem.update(
                    { nomor_antrean: newNomorAntrean },
                    { transaction }
                );
                newNomorAntrean++;
            }

            console.log("Antrean telah diperbarui.");
        } else {
            // console.log("Session sedang berjalan.");
        }

        await transaction.commit();
    } catch (error) {
        console.error("Error processing antrean:", error.message);
        await transaction.rollback();
    }
};

// Set interval to process antrean every 1 second
setInterval(processAntreanAutomatically, 1000);
