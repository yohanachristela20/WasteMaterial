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
            let newId = "1-B"; //default id

            if (lastRecord && lastRecord.id_barang) {
                const lastIdNumber = parseInt(lastRecord.id_barang); 
                const incrementedIdNumber = (lastIdNumber + 1).toString();
                newId = `${incrementedIdNumber}-B`;
            }
            barang.id_barang = newId;
        },
    },  
}); 

export default Barang; 

(async()=> {
    await db.sync();
})(); 