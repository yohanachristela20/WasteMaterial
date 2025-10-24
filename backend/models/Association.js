import Karyawan from "./KaryawanModel.js";
import User from "./UserModel.js";
import Barang from "./BarangModel.js";
import Kategori from "./KategoriModel.js";
import GenPengajuan from "./GenPengajuan.js";
import Transaksi from "./TransaksiModel.js";
import Vendor from "./VendorModel.js";
import Pengajuan from "./PengajuanModel.js";

User.belongsTo(Karyawan, { foreignKey: 'id_karyawan', as: 'KaryawanPengguna' });
Barang.belongsTo(Kategori, {foreignKey: 'id_kategori', as: 'KategoriBarang'});
Transaksi.belongsTo(Vendor, {foreignKey: 'id_vendor', as:'VendorPenjualan'});
Transaksi.belongsTo(GenPengajuan, {foreignKey: 'id_pengajuan', as:'PengajuanPenjualan'});
Pengajuan.belongsTo(Barang, {foreignKey: 'id_barang', as: 'BarangDiajukan'});
Pengajuan.belongsTo(Karyawan, {foreignKey: 'id_karyawan', as:'Pemohon'});
Pengajuan.belongsTo(GenPengajuan, {foreignKey: 'id_pengajuan', as:'GeneratePengajuan'});
Transaksi.belongsTo(Karyawan, {foreignKey: 'id_petugas', as:'Petugas'});

Karyawan.hasMany(User, { foreignKey: 'id_karyawan', as:'KaryawanPengguna'});
Kategori.hasMany(Barang, {foreignKey: 'id_kategori', as: 'KategoriBarang'});
Vendor.hasMany(Transaksi, {foreignKey: 'id_vendor', as:'VendorPenjualan'});
GenPengajuan.hasMany(Transaksi, {foreignKey: 'id_pengajuan', as: 'PengajuanPenjualan'});
Barang.hasMany(Pengajuan, {foreignKey: 'id_barang', as: 'BarangDiajukan'});
Karyawan.hasMany(Pengajuan, {foreignKey: 'id_karyawan', as:'Pemohon'});
GenPengajuan.hasMany(Pengajuan, {foreignKey: 'id_pengajuan', as:'GeneratePengajuan'});
Karyawan.hasMany(Transaksi, {foreignKey: 'id_petugas', as:'Petugas'});
