import { Sequelize } from "sequelize";
import db from "../config/database.js";

const {DataTypes} = Sequelize;

const Karyawan = db.define('karyawan', {
    id_karyawan: {
        type: DataTypes.STRING, 
        primaryKey: true,
    },
    nama: DataTypes.STRING,
    divisi: DataTypes.STRING,
}, {
    freezeTableName: true,
    timestamps: true,
    hooks: {
        beforeCreate: async (karyawan, options) => {
            const lastRecord = await Karyawan.findOne({
                order: [['id_karyawan', 'DESC']]
            }); 
            let newId = "KRY0001"; //default id

            if (lastRecord && lastRecord.id_karyawan) {
                const lastIdNumber = parseInt(lastRecord.id_karyawan.substring(3), 10); 
                const incrementedIdNumber = (lastIdNumber + 1).toString().padStart(4, '0');
                newId = `KRY${incrementedIdNumber}`;
            }
            karyawan.id_karyawan = newId;
        },
    },  
}); 

export default Karyawan; 

(async()=> {
    await db.sync();
})(); 