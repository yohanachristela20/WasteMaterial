import Beranda from "views/Beranda.js";
import ScreeningKaryawan from "views/ScreeningKaryawan.js";
import Angsuran from "views/Angsuran.js";
import DataPengajuan from "views/DataPengajuan.js";
import MasterKaryawan from "views/MasterKaryawan.js";
import PengajuanJual from "views/PengajuanJual";
import BerandaFinance from "views/BerandaFinance.js";
import BerandaKaryawan from "views/BerandaKaryawan.js";
import ScreeningPinjamanKaryawan from "views/ScreeningPinjamanKaryawan.js";
import ScreeningPinjamanKaryawan2 from "views/ScreeningPinjamanKaryawan2.js";
import RiwayatPengajuanKaryawan from "views/RiwayatPengajuanKaryawan.js";
import AngsuranKaryawan from "views/AngsuranKaryawan.js";
import MasterUser from "views/MasterUser.js";
import DashboardKaryawan from "views/DashboardKaryawan.js";
import RiwayatPinjamanKaryawan from "views/RiwayatPinjamanKaryawan";
import AngsuranFinance from "views/AngsuranFinance";
import SuratPernyataan from "views/SuratPernyataan";
import DataBarang from "views/DataBarang.js";

import KategoriBarang from "views/KategoriBarang";
import MasterVendor from "views/MasterVendor";
import PengajuanScrapping from "views/PengajuanScrapping.js";
import DetailPengajuan from "views/DetailPengajuan.js";
import Transaksi from "views/Transaksi.js";

import Login from "views/Login.js";
import DataPengajuanUser from "views/DataPengajuanUser.js";
import DetailPengajuanUser from "views/DetailPengajuanUser";
import DokumenPengajuan from "views/DokumenPengajuan";
import DokumenTransaksi from "views/DokumenTransaksi";
import DokumenBPBB from "views/DokumenBPBB";
import DokumenSuratJalan from "views/DokumenSuratJalan";


const dashboardRoutes = [
  {
    path: "/beranda",
    name: "Beranda",
    icon: "nc-icon nc-chart-pie-35",
    component: Beranda,
    layout: "/admin"
  },
  {
    path: "/kategori-barang",
    name: "Kategori Barang",
    icon: "nc-icon nc-tag-content",
    component: KategoriBarang,
    layout: "/admin"
  },
  {
    path: "/data-barang",
    name: "Data Barang",
    icon: "nc-icon nc-app",
    component: DataBarang,
    layout: "/admin"
  },
  {
    path: "/master-vendor",
    name: "Master Vendor",
    icon: "nc-icon nc-single-02",
    component: MasterVendor,
    layout: "/admin"
  },
 


  {
    path: "/pengajuan-jual",
    name: "Pengajuan Jual",
    icon: "nc-icon nc-money-coins",
    component: PengajuanJual,
    layout: "/admin"
  },
  {
    path: "/pengajuan-scrapping",
    name: "Pengajuan Scrapping",
    icon: "nc-icon nc-delivery-fast",
    component: PengajuanScrapping,
    layout: "/admin"
  },
  {
    path: "/data-pengajuan",
    name: "Data Pengajuan",
    icon: "nc-icon nc-notes",
    component: DataPengajuan,
    layout: "/admin"
  },



  // Tidak Ditampilkan di Sidebar
  {
    path: "/detail-pengajuan",
    name: "Detail Pengajuan",
    icon: "nc-icon nc-paper-2",
    component: DetailPengajuan,
    layout: "/admin"
  },
  {
    path: "/transaksi",
    name: "Transaksi",
    icon: "nc-icon nc-paper-2",
    component: Transaksi,
    layout: "/admin"
  },
  {
    path: "/dok-pengajuan",
    name: "Dokumen Pengajuan",
    icon: "nc-icon nc-paper-2",
    component: DokumenPengajuan,
    layout: "/admin"
  },
  {
    path: "/dok-transaksi",
    name: "Dokumen Transaksi",
    icon: "nc-icon nc-paper-2",
    component: DokumenTransaksi,
    layout: "/admin"
  },
  {
    path: "/dok-bpbb",
    name: "Dokumen BPBB",
    icon: "nc-icon nc-paper-2",
    component: DokumenBPBB,
    layout: "/admin"
  },
  {
    path: "/dok-surat-jalan",
    name: "Dokumen Surat Jalan",
    icon: "nc-icon nc-paper-2",
    component: DokumenSuratJalan,
    layout: "/admin"
  },


  //LOGIN PAGE
  {
    path: "/login",
    name: "Login",
    icon: "nc-icon nc-single-02",
    component: Login,
    layout: "/"
  },


  
  //USER
  {
    path: "/dashboard-user",
    name: "Beranda",
    icon: "nc-icon nc-chart-pie-35",
    component: DashboardKaryawan,
    layout: "/user"
  },
    {
    path: "/pengajuan-jual",
    name: "Pengajuan Jual",
    icon: "nc-icon nc-money-coins",
    component: PengajuanJual,
    layout: "/user"
  },
  {
    path: "/pengajuan-scrapping",
    name: "Pengajuan Scrapping",
    icon: "nc-icon nc-delivery-fast",
    component: PengajuanScrapping,
    layout: "/user"
  },
    {
    path: "/detail-pengajuan-user",
    name: "Detail Pengajuan",
    icon: "nc-icon nc-paper-2",
    component: DetailPengajuanUser,
    layout: "/user"
  },
  {
    path: "/data-pengajuan-user",
    name: "Data Pengajuan",
    icon: "nc-icon nc-notes",
    component: DataPengajuanUser,
    layout: "/user"
  },

  // {
  //   path: "/beranda-user",
  //   name: "Beranda",
  //   icon: "nc-icon nc-chart-pie-35",
  //   component: BerandaKaryawan,
  //   layout: "/user"
  // },
  
  // {
  //   path: "/screening-pinjaman",
  //   name: "Screening Pinjaman",
  //   icon: "nc-icon nc-circle-09",
  //   component: ScreeningPinjamanKaryawan,
  //   layout: "/user"
  // },
  // {
  //   path: "/screening2",
  //   name: "Screening Pinjaman 2",
  //   icon: "nc-icon nc-circle-09",
  //   component: ScreeningPinjamanKaryawan2,
  //   layout: "/user"
  // },


  // SUPER ADMIN
  {
    path: "/master-karyawan",
    name: "Master Karyawan",
    icon: "nc-icon nc-single-02",
    component: MasterKaryawan,
    layout: "/super-admin"
  },
  {
    path: "/master-user",
    name: "Master User",
    icon: "nc-icon nc-single-02",
    component: MasterUser,
    layout: "/super-admin"
  },



  // {
  //   path: "/screening-user",
  //   name: "Screening Karyawan",
  //   icon: "nc-icon nc-circle-09",
  //   component: ScreeningKaryawan,
  //   layout: "/admin"
  // },

  // {
  //   path: "/surat-pernyataan",
  //   name: "Surat Pernyataan",
  //   icon: "nc-icon nc-circle-09",
  //   component: SuratPernyataan,
  //   layout: "/admin"
  // },
  
];

export default dashboardRoutes;
