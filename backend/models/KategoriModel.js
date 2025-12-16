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

						//spare data up to 100.000 data 
            let newId = "K00001"; //default id -- format diubah dari 1-K ke K0001 karena format id sebelumnya tidak support di mysql & tidak sesuai dengan arsitektur sistem 

            if (lastRecord && lastRecord.id_kategori) {
							const lastIdNumber = parseInt(lastRecord.id_kategori.substring(1), 10); 
							const incrementedIdNumber = (lastIdNumber + 1).toString().padStart(5, '0');
							newId = `K${incrementedIdNumber}`;
            }
            kategori.id_kategori = newId;
        },
    },  
}); 

export default Kategori; 

(async()=> {
    await db.sync();
})(); 