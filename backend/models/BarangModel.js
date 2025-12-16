import { Sequelize } from "sequelize";
import db from "../config/database.js";
import Kategori from "./KategoriModel.js";

const {DataTypes} = Sequelize;

const Barang = db.define('barang', {
    id_barang: {
        type: DataTypes.STRING, 
        primaryKey: true,
    },
    nama: DataTypes.STRING,
    id_sap: DataTypes.STRING,
    id_kategori: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: Kategori, 
            key: 'id_kategori' 
        }
    }
}, {
    freezeTableName: true,
    timestamps: true,
    hooks: {
        beforeCreate: async (barang, options) => {
            const lastRecord = await Barang.findOne({
                order: [['id_barang', 'DESC']]
            }); 

            //spare data up to 100.000 data 
            let newId = "B00001"; //default id -- format diubah dari 1-B ke B00001 karena format id sebelumnya tidak support di mysql & tidak sesuai dengan arsitektur sistem 

            if (lastRecord && lastRecord.id_barang) {
                const lastIdNumber = parseInt(lastRecord.id_barang.substring(1), 10); 
                const incrementedIdNumber = (lastIdNumber + 1).toString().padStart(5, '0');
                newId = `B${incrementedIdNumber}`;
            }
            barang.id_barang = newId;
        },
    },  
}); 

export default Barang; 

(async()=> {
    await db.sync();
})(); 