import { Sequelize } from "sequelize";
import db from "../config/database.js";
import Vendor from "./VendorModel.js";
import GenPengajuan from "./GenPengajuan.js";
import Karyawan from "./KaryawanModel.js";

const {DataTypes} = Sequelize;

const Transaksi = db.define('transaksi', {
    id_transaksi: {
        type: DataTypes.STRING, 
        primaryKey: true,
    },
    cara_bayar: DataTypes.STRING, 
    keterangan: DataTypes.STRING, 
    id_vendor: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: Vendor, 
            key: 'id_vendor' 
        }
    }, 
    id_pengajuan: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: GenPengajuan, 
            key: 'id_pengajuan' 
        }
    }, 
    id_petugas: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: Karyawan, 
            key: 'id_karyawan' 
        }
    }
}, {
    freezeTableName: true,
    timestamps: true,
    hooks: {
            beforeCreate: async (transaksi, options) => {
                const lastRecord = await Transaksi.findOne({
                    order: [['id_transaksi', 'DESC']]
                }); 

                const date = new Date();
                const twoDigitYear = String(date.getFullYear()).slice(-2);
                const year = twoDigitYear.padStart(2, '0');
                const month = String(date.getMonth()).padStart(2, '0');

                let newId = `${year}${month}0002PJ`;

                // let newId = "USR0001";

                //format date: 25100001PJ
    
                if (lastRecord && lastRecord.id_transaksi) {
                    const lastIdNumber = parseInt(lastRecord.id_transaksi.substring(4), 10); 
                    const incrementedIdNumber = (lastIdNumber + 2).toString().padStart(4, '0');
                    newId = `${year}${month}${incrementedIdNumber}PJ`;
                }
                transaksi.id_transaksi = newId;
            },
        },  
}); 

export default Transaksi; 

(async()=> {
    await db.sync();
})(); 