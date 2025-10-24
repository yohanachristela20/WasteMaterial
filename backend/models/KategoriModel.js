import { Sequelize } from "sequelize";
import db from "../config/database.js";

const {DataTypes} = Sequelize;

const Kategori = db.define('kategori', {
    id_kategori: {
        type: DataTypes.STRING, 
        primaryKey: true,
    },
    nama: DataTypes.STRING,
    satuan: DataTypes.STRING,
    harga_barang: DataTypes.DECIMAL(19,2),
    jenis_barang: DataTypes.STRING,
    tanggal_penetapan: DataTypes.DATEONLY, 
}, {
    freezeTableName: true,
    timestamps: true,
    hooks: {
        beforeCreate: async (kategori, options) => {
            const lastRecord = await Kategori.findOne({
                order: [['id_kategori', 'DESC']]
            }); 
            let newId = "1-K"; //default id

            if (lastRecord && lastRecord.id_kategori) {
                const lastIdNumber = parseInt(lastRecord.id_kategori); 
                const incrementedIdNumber = (lastIdNumber + 1).toString();
                newId = `${incrementedIdNumber}-K`;
            }
            kategori.id_kategori = newId;
        },
    },  
}); 

export default Kategori; 

(async()=> {
    await db.sync();
})(); 