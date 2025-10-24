import { Sequelize } from "sequelize";
import db from "../config/database.js";
import Barang from "./BarangModel.js";
import Karyawan from "./KaryawanModel.js";

const {DataTypes} = Sequelize;

const GenPengajuan = db.define('gen_pengajuan', {
    // id_parent_pengajuan: {
    //     type: DataTypes.INTEGER,
    //     primaryKey: true,
    // },
    id_pengajuan: {
        type: DataTypes.STRING, 
        primaryKey: true,
    },
    status: DataTypes.STRING, 
}, {
    freezeTableName: true,
    timestamps: true,
    hooks: {
            beforeCreate: async (gen_pengajuan, options) => {
                const lastRecord = await GenPengajuan.findOne({
                    order: [['id_pengajuan', 'DESC']]
                }); 

                const date = new Date();
                const twoDigitYear = String(date.getFullYear()).slice(-2);
                const year = twoDigitYear.padStart(2, '0');
                const month = String(date.getMonth()).padStart(2, '0');

                let newId = `${year}${month}0001PG`;

                // let newId = "USR0001";

                //format date: 25100001PG
    
                if (lastRecord && lastRecord.id_pengajuan) {
                    const lastIdNumber = parseInt(lastRecord.id_pengajuan.substring(4), 10); 
                    const incrementedIdNumber = (lastIdNumber + 2).toString().padStart(4, '0');
                    newId = `${year}${month}${incrementedIdNumber}PG`;
                }
                gen_pengajuan.id_pengajuan = newId;
            },
    },  
}); 

export default GenPengajuan; 

(async()=> {
    await db.sync();
})(); 