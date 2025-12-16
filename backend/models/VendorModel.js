import { Sequelize } from "sequelize";
import db from "../config/database.js";

const {DataTypes} = Sequelize;

const Vendor = db.define('vendor', {
    id_vendor: {
        type: DataTypes.STRING, 
        primaryKey: true,
    },
    nama: DataTypes.STRING,
    alamat: DataTypes.STRING,
    no_telepon: DataTypes.STRING, 
    no_kendaraan: DataTypes.STRING,
    sopir: DataTypes.STRING,
}, {
    freezeTableName: true,
    timestamps: true,
    hooks: {
        beforeCreate: async (vendor, options) => {
            const lastRecord = await Vendor.findOne({
            	order: [['id_vendor', 'DESC']]
            }); 
            let newId = "V00001"; //default id -- format diubah dari 1-V ke V00001 karena format id sebelumnya tidak support di mysql & tidak sesuai dengan arsitektur sistem

            if (lastRecord && lastRecord.id_vendor) {
                const lastIdNumber = parseInt(lastRecord.id_vendor.substring(1), 10); 
                const incrementedIdNumber = (lastIdNumber + 1).toString().padStart(5, '0');
                newId = `V${incrementedIdNumber}`;
            }
            vendor.id_vendor = newId;
        },
    },  
}); 

export default Vendor; 

(async()=> {
    await db.sync();
})(); 