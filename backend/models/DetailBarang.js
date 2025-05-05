import { Sequelize } from "sequelize";
import db from "../config/database.js";

const {DataTypes} = Sequelize;

const DetailBarang = db.define('detail_barang', {
    id_detailbarang: {
        type: DataTypes.STRING, 
        primaryKey: true,
    },
    nama_detailbarang: DataTypes.STRING,
    satuan: DataTypes.STRING,
    harga_barang: DataTypes.DECIMAL(19,2),
    jenis_barang: DataTypes.STRING,
    tanggal_penetapan: DataTypes.DATEONLY,
}, {
    freezeTableName: true,
    timestamps: true,
    hooks: {
        beforeCreate: async (detail_barang, options) => {
            const lastRecord = await DetailBarang.findOne({
                order: [['id_detailbarang', 'DESC']]
            }); 
            let newId = "1-K"; //default id

            if (lastRecord && lastRecord.id_detailbarang) {
                const lastIdNumber = parseInt(lastRecord.id_detailbarang); 
                const incrementedIdNumber = (lastIdNumber + 1).toString();
                newId = `${incrementedIdNumber}-K`;
            }
            detail_barang.id_detailbarang = newId;
        },
    },  
}); 

export default DetailBarang; 

(async()=> {
    await db.sync();
})(); 