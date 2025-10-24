import { Sequelize } from "sequelize";
import db from "../config/database.js";
import Barang from "./BarangModel.js";
import Karyawan from "./KaryawanModel.js";
import GenPengajuan from "./GenPengajuan.js";

const {DataTypes} = Sequelize;

const Pengajuan = db.define('pengajuan', {
    id_parent_pengajuan: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    jumlah_barang: DataTypes.DECIMAL(10,2),
    kondisi: DataTypes.STRING, 
    jenis_pengajuan: DataTypes.STRING,
    total: DataTypes.DECIMAL(19,2),
    // sub_total: DataTypes.DECIMAL(19,2),
    id_barang: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: Barang, 
            key: 'id_barang' 
        }
    }, 
    id_karyawan: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: Karyawan, 
            key: 'id_karyawan' 
        }
    }, 
    id_pengajuan: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: GenPengajuan, 
            key: 'id_pengajuan' 
        }
    }
}, {
    freezeTableName: true,
    timestamps: true,
    // hooks: {
    //         beforeCreate: async (pengajuan, options) => {
    //             const lastRecord = await Pengajuan.findOne({
    //                 order: [['id_pengajuan', 'DESC']]
    //             }); 

    //             const date = new Date();
    //             const twoDigitYear = String(date.getFullYear()).slice(-2);
    //             const year = twoDigitYear.padStart(2, '0');
    //             const month = String(date.getMonth()).padStart(2, '0');

    //             let newId = `${year}${month}0001PG`;

    //             // let newId = "USR0001";

    //             //format date: 25100001PG
    
    //             if (lastRecord && lastRecord.id_pengajuan) {
    //                 const lastIdNumber = parseInt(lastRecord.id_pengajuan.substring(4), 10); 
    //                 const incrementedIdNumber = (lastIdNumber + 2).toString().padStart(4, '0');
    //                 newId = `${year}${month}${incrementedIdNumber}PG`;
    //             }
    //             pengajuan.id_pengajuan = newId;
    //         },
    // },  
}); 

export default Pengajuan; 

(async()=> {
    await db.sync();
})(); 