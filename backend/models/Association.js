import Karyawan from "./KaryawanModel.js";
import User from "./UserModel.js";

User.belongsTo(Karyawan, { foreignKey: 'id_karyawan', as: 'KaryawanPengguna' });
// Pinjaman.belongsTo(Karyawan, { foreignKey: 'id_peminjam', as: 'Peminjam' });
// Pinjaman.belongsTo(Karyawan, { foreignKey: 'id_asesor', as: 'Asesor' });
// AntreanPengajuan.belongsTo(Pinjaman, {foreignKey: 'id_pinjaman', as: 'AntreanPinjaman'});
// Angsuran.belongsTo(Pinjaman, {foreignKey: 'id_pinjaman', as: 'AngsuranPinjaman'});
// Angsuran.belongsTo(Pinjaman, {foreignKey: 'id_pinjaman', as: 'SudahDibayar'});
// Angsuran.belongsTo(Pinjaman, {foreignKey: 'id_pinjaman', as: 'BelumDibayar'});
// Angsuran.belongsTo(Karyawan, {foreignKey: 'id_peminjam', as: 'KaryawanPeminjam'}); 
// PlafondUpdate.belongsTo(Pinjaman, {foreignKey: 'id_pinjaman', as: 'UpdatePinjamanPlafond'});


// Karyawan.hasMany(Pinjaman, { foreignKey: 'id_peminjam', as: 'Peminjam' });
// Karyawan.hasMany(Pinjaman, { foreignKey: 'id_asesor', as: 'Asesor' });
// Pinjaman.hasOne(AntreanPengajuan, {foreignKey: 'id_pinjaman', as: 'AntreanPinjaman'});
// Pinjaman.hasMany(Angsuran, {foreignKey: 'id_pinjaman', as:'AngsuranPinjaman'});
// Pinjaman.hasMany(Angsuran, {foreignKey: 'id_pinjaman', as:'SudahDibayar'});
// Pinjaman.hasMany(Angsuran, {foreignKey: 'id_pinjaman', as:'BelumDibayar'});
// Karyawan.hasMany(Angsuran, {foreignKey: 'id_peminjam', as: 'KaryawanPeminjam'}); 
// Pinjaman.hasMany(Angsuran, {foreignKey:'id_peminjam', as:'KaryawanPeminjam'});
// Pinjaman.hasOne(PlafondUpdate, {foreignKey: 'id_pinjaman', as: 'UpdatePinjamanPlafond'});  


Karyawan.hasMany(User, { foreignKey: 'id_karyawan', as:'KaryawanPengguna'});