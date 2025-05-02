import React, { useEffect, useState, useMemo, useRef } from "react";
import {FaRegArrowAltCircleLeft, FaRegArrowAltCircleRight, FaRegSave, FaHistory, FaCheckCircle, FaTimesCircle, FaCoins, FaFileContract, FaCalculator} from 'react-icons/fa'; 
import axios from "axios";
import { useHistory, useLocation } from "react-router-dom"; 
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "jspdf-autotable";
import Heartbeat from "./Heartbeat.js";
import "../assets/scss/lbd/_pagination.scss";
import cardBeranda from "../assets/img/beranda3.png";
import "../assets/scss/lbd/_stepper.scss";
import AcceptedAlert from "components/Alert/AcceptedAlert.js";
import DeclineAlert from "components/Alert/DeclineAlert.js";
import PendingAlert from "components/Alert/PendingAlert.js";
import AcceptedNextStepAlert from "components/Alert/AcceptedNextStepAlert.js";
import ConditionallyAcceptedAlert from "components/Alert/ConditionallyAcceptedAlert.js";
import ReactLoading from "react-loading";
import "../assets/scss/lbd/_loading.scss";

const BASE_URL = 'http://localhost:5000';
import {
  Card,
  Table,
  Container,
  Row,
  Col,
  Form,
  Spinner, 
  Button,
  Modal
} from "react-bootstrap";
import { error } from "jquery";

function DashboardKaryawan() {

  const location = useLocation();
  const history = useHistory();

  const [keperluan, setKeperluan] = useState(''); 
  const [id_peminjam, setIdPeminjam] = useState("");
  const [id_karyawan, setIdKaryawan] = useState(""); 
  const [nama, setNama] = useState("");
  const [tanggal_masuk, setTanggalMasuk] = useState("");
  const [tanggal_lahir, setTanggalLahir] = useState(""); 
  const [masaKerja, setMasaKerja] = useState("");
  const [jarakPensiun, setJarakPensiun] = useState(""); 
  const [jenis_kelamin, setJenisKelamin] = useState(""); 
  const [gajiPokok, setGajiPokok] = useState(''); 
  const [jumlah_pinjaman, setJumlahPinjaman] = useState(null);
  const [jumlah_angsuran, setJumlahAngsuran] = useState("");
  const [pinjaman_setelah_pembulatan, setJumlahPinjamanSetelahPembulatan] = useState("");
  const [rasio_angsuran, setrasio_angsuran] = useState(null);
  const [id_pinjaman, setIdPinjaman] = useState("");
  const [tanggal_pengajuan, setTanggalPengajuan] = useState("");
  const [departemen, setDepartemen] = useState(""); 
  const [plafond, setPlafond] = useState(0); 
  const [totalPinjaman, setTotalPinjaman] = useState(0); 

  const [filepath_pernyataan, setFilePathPernyataan] = useState('');

  const [plafond_saat_ini, setPlafondBaru] = useState(""); 
  const [tanggal_plafond_tersedia, setTanggalPlafondTersedia] = useState(""); 
  const [sudah_dihitung, setSudahDihitung] = useState(0);

  const [totalSudahDibayar, setTotalSudahDibayar] = useState("");
  const [totalDibayar, setTotalDibayar] = useState(0);
  const [plafondAngsuran, setPlafondAngsuran] = useState(0);
  const [plafondAwal, setPlafondAwal] = useState(""); 

  const [pinjaman, setPinjaman] = useState([]); 
  const [antrean, setAntrean] = useState([]); 
  const [selectedPinjaman, setSelectedPinjaman] = useState(null);

  const [statusPinjaman, setStatusPinjaman] = useState(null);
  const [pinjamanInfo, setPinjamanInfo] = useState(null);

  const plafondFloat = parseFloat(plafond);
  
  let [kekuranganRasio] = useState(0);
  let [kekuranganAngsuran] = useState(0);

  const [plafondSaatIni, setPlafondSaatIni] = useState(0); 
  const plafondSaatIniFloat = parseFloat(plafondSaatIni);
  const jumlahPinjamanFloat = parseFloat(jumlah_pinjaman);
  const [status_pengajuan, setStatusPengajuan] = useState("Ditunda"); 
  const [status_transfer, setStatusTransfer] = useState("Belum Ditransfer");
  const [status_pelunasan, setStatusPelunasan] = useState("");
  const [userData, setUserData] = useState({id_karyawan: "", nama: "", divisi: ""}); 

  const [loading, setLoading] = useState(true);
  const [loadingPlafond, setLoadingPlafond] = useState(false);
  const [bulanLagi, setBulanLagi] = useState(0);
  const [nomorAntrean, setNomorAntrean] = useState("-");
  const [isButtonClicked, setIsButtonClicked] = useState(false);
  const [totalAngsuranBulanDepan] = useState(0);

  const storedJumlahPinjaman = localStorage.getItem("jumlah_pinjaman");

  const token = localStorage.getItem("token");
  const [showAddModal, setShowAddModal] = React.useState(false);

  const [id_plafond, setIdPlafond] = useState("");
  const [tanggal_penetapan, setTanggalPenetapan] = useState("");
  const [jumlah_plafond, setJumlahPlafond] = useState("");
  const [keterangan, setKeterangan] = useState("");

  const [jumlah_topup, setJumlahTopupAngsuran] = useState("");
  const [file, setFile] = useState(null);
  const [jumlah_angsuranbaru, setJumlahAngsuranBaru] = useState("");

  const [hidden, setHidden] = useState(false); 

  const elementRef = useRef(null);

  const formatTanggal = (tanggal) => {
    if (!tanggal) return "";
    const parts = tanggal.split("/");
    if (parts.length === 3) {
      const [day, month, year] = parts;
      return `${year}-${month}-${day}`;
    }
    return tanggal;
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");
      const role = localStorage.getItem("role");
      const username = localStorage.getItem("username");
      const user_active = localStorage.getItem("user_active");

      console.log("User token: ", token, "User role:", role, "Username: ", username, "User active: ", user_active);


      if (!token || !username) return;
        console.log("User token: ", token, "User role:", role);

        // if (user_active !== true) {
        //   window.location.replace("/login");
        // }

        try {
          const response = await axios.get(`http://localhost:5000/user-details/${username}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
    
          if (response.data) {
            setUserData({
              id_karyawan: response.data.id_karyawan,
              nama: response.data.nama,
              divisi: response.data.divisi,
              role: response.data.role, 
            });
            setIdPeminjam(response.data.id_karyawan); 
            // console.log("User data fetched:", response.data);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
    };

    fetchUserData();

    const today = new Date().toISOString().split("T")[0];
    setTanggalPengajuan(today); 
  }, []);

// useEffect(() => {
//   const storedJumlah = localStorage.getItem("jumlah_pinjaman");
//   if(storedJumlah) setJumlahPinjaman(storedJumlah); 
// }, []);


const getNomorAntrean = async() => {
    try {
      const antreanResponse = await axios.get(`http://localhost:5000/antrean/${id_pinjaman}`, {
        headers: { Authorization: `Bearer ${token}` },
    });

    // console.log("Fetched antreaannnn:", antreanResponse.data);

    const antreanData = antreanResponse.data;
    console.log("antreanData: ", antreanData);
    // .sort((a, b) => a.nomor_antrean - b.nomor_antrean)

    if (Array.isArray(antreanData) && antreanData.length > 0) {
      const sortedAntrean = antreanData.sort((a,b) => Number(a.nomor_antrean) - Number(b.nomor_antrean));
      console.log("sortedAntrean: ", sortedAntrean);
      
      const latestAntrean = sortedAntrean[sortedAntrean.length - 1].nomor_antrean;
      console.log("latestAntrean: ", latestAntrean);
      // const fetchedNomorAntrean = latestAntrean.nomor_antrean;
      // console.log("fetchedNomorAntrean: ", fetchedNomorAntrean);

      setNomorAntrean(latestAntrean !== null && latestAntrean !== undefined ? latestAntrean : 1);
    } else {
      setNomorAntrean(1);
      console.warn("Data antrean kosong, nomor antrean diset menjadi 1.");
    }
    } catch (error) {
      console.error("Error fetching antrean:", error.message);
      setNomorAntrean(1);
    }
};


// Fix 1
useEffect(() => {
  const calculateNextPlafond = async () => {
    try {
      setLoadingPlafond(true);

      const response = await axios.get("http://localhost:5000/angsuran-berikutnya", {
        headers: { Authorization: `Bearer ${token}` },
      });

        let totalAngsuranBulanDepan = response.data.total_jumlah_angsuran_bulan_depan || 0;
        let bulanLagiTemp = 0;

        if (plafondFloat >= jumlahPinjamanFloat) {
          setPinjamanInfo(null);
          setBulanLagi(0);
        } else {
          let total = plafondFloat;
          while (total < jumlahPinjamanFloat && totalAngsuranBulanDepan > 0) {
            total += totalAngsuranBulanDepan;
            bulanLagiTemp++;
          }

          setBulanLagi(bulanLagiTemp);

          const waktuFormatted = bulanLagiTemp < 12
            ? `${bulanLagiTemp} bulan`
            : `${Math.floor(bulanLagiTemp / 12)} tahun ${bulanLagiTemp % 12} bulan`;

            setPinjamanInfo(
              bulanLagiTemp > 0
                ? `Pinjaman dapat diajukan setelah ${waktuFormatted}.`
                : "Tidak dapat diajukan meskipun setelah beberapa bulan."
            );

        }
    } catch (error) {
      console.error("Gagal menghitung plafond yang akan datang: ", error.message);
    } finally {
      setLoadingPlafond(false);
    }
  };

  calculateNextPlafond();
}, [token, plafondFloat, jumlahPinjamanFloat, nomorAntrean, isButtonClicked]);



  const calculateAngsuranBulananMemoized = useMemo(() => {
    if (!jumlah_pinjaman || !gajiPokok) return null; 
  
    const angsuranBulanan = jumlah_pinjaman / 60;
  
    return parseFloat(angsuranBulanan.toFixed(2)); 
  
  }, [jumlah_pinjaman, gajiPokok]);

  useEffect(() => {
    if (id_karyawan && calculateAngsuranBulananMemoized !== null) {      
      getNomorAntrean();
    }
  }, [id_karyawan, calculateAngsuranBulananMemoized]);
  
  const resetPengajuan = async() => {
   
    try {
      
      setJumlahPinjaman("");
      setJumlahAngsuran("");
      setJumlahPinjamanSetelahPembulatan("");
      setStatusPinjaman("");
      setPinjamanInfo("");
      setKeperluan(""); 
      if ('caches' in window) {
        const cacheKeys = await caches.keys();
        await Promise.all(cacheKeys.map(key => caches.delete(key)));
      }

    } catch (error) {
      console.error("Gagal mereset pengajuan: ", error.message);
    }
  };

  const hitungPengajuan = async() => {
      if (jumlah_pinjaman) {
        let angsuranBulanan = parseFloat(jumlah_pinjaman) / 60;
        let angsuranBulananNew = Math.ceil(angsuranBulanan / 1000) * 1000;
        let pinjamanSetelahPembulatan = parseFloat(angsuranBulananNew) * 60;
        let pinjamanSetelahPembulatanNew = Math.ceil(pinjamanSetelahPembulatan / 1000) * 1000;
  
        setJumlahAngsuran(angsuranBulananNew);
        setJumlahPinjamanSetelahPembulatan(pinjamanSetelahPembulatanNew);
  
      } else {
        setJumlahAngsuran("");
        setJumlahPinjamanSetelahPembulatan(""); 
      }
  };

  const fetchData = async () => {
    try {
      const responsePlafond = await axios.get(
        `http://localhost:5000/plafond-saat-ini?jumlah_pinjaman=${jumlah_pinjaman || 0}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );


      const fetchedPlafondAwal = responsePlafond.data?.plafondAwal || 0; 
      setPlafondAwal(fetchedPlafondAwal); 

      const fetchedPlafondSaatIni = responsePlafond.data?.plafondSaatIni;
      setPlafondSaatIni(fetchedPlafondSaatIni);
      // console.log("Fetched plafond saat ini: ", fetchedPlafondSaatIni);

      const fetchedPlafond = responsePlafond.data?.plafond || 0; 
      setPlafond(fetchedPlafond);

      const fetchedSudahDihitung = response.data?.sudah_dihitung || "";
      setSudahDihitung(fetchedSudahDihitung); 
    } catch (error) {
      console.error("Error fetching plafond saat ini:", error.message);
    }
  };
  
  useEffect(() => {
    const fetchRiwayatPinjaman = async() => {
      try {
        const [
          responseTotalDibayar, 
          responseTotalPinjaman,
        ] = await Promise.all([
            axios.get(`http://localhost:5000/angsuran/total-sudah-dibayar/${selectedPinjaman?.id_peminjam}`, {
                headers: {
                  Authorization: `Bearer ${token}`,
              },
            }),
            axios.get(`http://localhost:5000/pinjaman/total-pinjaman/${selectedPinjaman?.id_peminjam}`, {
                headers: {
                  Authorization: `Bearer ${token}`,
              },
            }),
        ]);

        const totalDibayar = responseTotalDibayar.data.total_sudah_dibayar || 0;
        setTotalDibayar(totalDibayar);

        const totalPinjaman = responseTotalPinjaman.data.total_pinjaman || 0;
        setTotalPinjaman(totalPinjaman);
      } catch (error) {
        console.error("Error fetching summary data:", error);
      }
    };

    fetchRiwayatPinjaman();
  });

   useEffect(() => {
      const fetchDataKaryawan = async () => {
        if (!userData.id_karyawan) return;
    
        try {
          const responseKaryawan = await axios.get(`${BASE_URL}/karyawan/${userData.id_karyawan}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
    
          const karyawanData = responseKaryawan.data;
          const pinjamanResponse = await axios.get(`http://localhost:5000/pinjaman/total-pinjaman/${karyawanData.id_karyawan}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
    
          const pinjamanData = pinjamanResponse.data || {};
    
          if (pinjamanData && karyawanData.id_karyawan === pinjamanData.id_peminjam) {
            setSelectedPinjaman(pinjamanData);
          }
    
          const formatTanggal = (tanggal) => {
            if (!tanggal) return "";
            const parts = tanggal.split("/");
            if (parts.length === 3) {
              const [day, month, year] = parts;
              return `${year}-${month}-${day}`;
            }
            return tanggal;
          };
    
          const formattedTanggalMasuk = formatTanggal(karyawanData.tanggal_masuk);
    
          setIdKaryawan(karyawanData.id_karyawan);
          setNama(karyawanData.nama);
          setTanggalMasuk(formattedTanggalMasuk || "");
          setDepartemen(karyawanData.departemen);
          setGajiPokok(karyawanData.gaji_pokok);
          setJenisKelamin(karyawanData.jenis_kelamin);
          setTanggalLahir(karyawanData.tanggal_lahir);
    
          const masaKerja = calculateYearsAndMonth(formattedTanggalMasuk);
          const jarakPensiun = calculatePensiun(karyawanData.tanggal_lahir, karyawanData.jenis_kelamin);
    
          setMasaKerja(masaKerja);
          setJarakPensiun(jarakPensiun);

        } catch (error) {
          console.error("Error fetching karyawan data:", error);
        }
      };
    
      if (userData.id_karyawan) {
        fetchDataKaryawan();
      }
        
    }, [userData.id_karyawan, token, selectedPinjaman?.id_peminjam]);


  const getPinjaman = async () =>{
    try {
      const response = await axios.get("http://localhost:5000/pinjaman", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
      });
      setPinjaman(response.data);
    } catch (error) {
      console.error("Error fetching data:", error.message); 
    } finally {
      setLoading(false);
    }
  };

  
  const getAntrean = async () => {
    try {
      const response = await axios.get("http://localhost:5000/antrean-pengajuan", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
      });
      setAntrean(response.data); 
    } catch (error) {
      console.error("Error fetching antrean:", error.message);
    }
  };

 
  const formatRupiah = (angka) => {
    let pinjamanString = angka.toString().replace(".00");
    let sisa = pinjamanString.length % 3;
    let rupiah = pinjamanString.substr(0, sisa);
    let ribuan = pinjamanString.substr(sisa).match(/\d{3}/g);

    if (ribuan) {
        let separator = sisa ? "." : "";
        rupiah += separator + ribuan.join(".");
    }
    
    return rupiah;
  };

  const [steps, setSteps] = useState(1);
  const [formData, setFormData] = useState({
    keperluan: "",
    jumlah_pinjaman: "",
  });

  const handleNext = () => {
    if (steps < 3) setSteps(steps + 1);
  };

  const handlePrevious = () => {
    if (steps > 1) setSteps(steps - 1);
  };


  const handleJumlahPinjamanChange = (value) => {
    const numericValue = value.replace(/\D/g, "");
    setJumlahPinjaman(numericValue);
  };

  const handleJumlahTopUp = (value) => {
    const numericValue = value.replace(/\D/g, "");
    setJumlahTopupAngsuran(numericValue);
  };

  const handleAngsuranBaru = (value) => {
    const numericValue = value.replace(/\D/g, "");
    setJumlahAngsuran(numericValue);
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleFileUpload = async() => {
    if (!file) {
      toast.error("Silakan pilih file PDF terlebih dahulu.");
      return;
    }
    if (file.type !== "application/pdf") {
      toast.error("File harus berformat PDF.");
      return;
    }
    

    const formData = new FormData();
    formData.append("pdf-file", file);
    formData.append("id_pinjaman", id_pinjaman);

    console.log('Id pinjaman: ', id_pinjaman);
    console.log('Form data: ', formData);

    fetch("http://localhost:5000/upload-pernyataan", {
      method: "PUT",
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then(async (response) => {
      const data = await response.json();
      console.log('File path saved: ', data.filePath);
      if (!response.ok) {
        throw new Error(data.message || "Gagal mengunggah.");
      }

      setFilePathPernyataan(data.filePath);
      toast.success("File berhasil diunggah.");
      // setShowImportModal(false);
      setShowAddModal(false);
      // onSuccess();
    })
    .catch((error) => {
      toast.error(`Gagal: ${error.message}`);
    });
  
    // try {
    //   const response = await fetch("http://localhost:5000/upload-pernyataan", {
    //     method: "POST",
    //     body: formData,
    //     headers: {
    //       Authorization: `Bearer ${token}`,
    //     },
    //   });

    //   const data = await response.json();
    //   if (!response.ok) {
    //     throw new Error(data.message || "Gagal mengunggah.");
    //   }

    //   toast.success("File berhasil diunggah.");
    //   onSuccess();

    //   await savePengajuan();
    // } catch (error) {
    //   toast.error(`Gagal: ${error.message}`);
    // }
  };


  const calculateYearsAndMonth = (tanggalMasuk) => {
    const currentDate = new Date();
    const startDate = new Date(tanggalMasuk); 
  
    let years = currentDate.getFullYear() - startDate.getFullYear();
    let months = currentDate.getMonth() - startDate.getMonth(); 
  
    if (months < 0) {
      years -= 1;
      months += 12;
    }
    return `${years} Tahun ${months} Bulan`; 
  }; 
  
  const calculateYears = (tanggalMasuk) => {
    const currentDate = new Date(); 
    const startDate = new Date(tanggalMasuk); 
  
    let years = currentDate.getFullYear() - startDate.getFullYear();
    return `${years}`; 
  }
  
  const calculatePensiun = (tanggal_lahir, jenisKelamin) => {
    const currentYear = new Date().getFullYear(); 
    const startYear = new Date(tanggal_lahir).getFullYear(); 
  
    let tahunPensiun;
  
    if (jenisKelamin === "L") {
      tahunPensiun = 60;
    } else if (jenisKelamin === "P") {
      tahunPensiun = 55; 
    }
  
    const tahunPensiunSeharusnya = startYear + tahunPensiun; 
    const jarakPensiun = tahunPensiunSeharusnya - currentYear;
  
    return `${jarakPensiun}`; 
  }

  const calculaterasio_angsuran = () => {
    const keperluan = selectedPinjaman?.keperluan;
    const pinjamanValid = jumlah_pinjaman > 0;
    const keperluanValid = keperluan !== null && keperluan !== "";
  
    if (pinjamanValid && keperluanValid) {
      const angsuranBulanan = jumlah_pinjaman / 60; 
      // const rasio_angsuran = (angsuranBulanan / gajiPokok) * 10; 
      const rasio_angsuran = (angsuranBulanan/(gajiPokok*1) * 100)
      setrasio_angsuran(rasio_angsuran.toFixed(2));
    } else {
      setrasio_angsuran(null);
    }
  };

  

  const stepTitle = [
    {title: "Jenis Keperluan & Jumlah Pinjaman"},
    {title: "Data Diri"},
  ];

const isDataDiriComplete = () => {
  return (
    tanggal_masuk &&
    gajiPokok !== undefined &&
    tanggal_lahir &&
    jenis_kelamin  
    
  );
};

const isAjukanDisabled = pinjaman.some(
  (item) => 
    item.id_peminjam === userData?.id_karyawan &&
    item.status_pelunasan !== "Lunas" &&
    item.status_transfer !== "Dibatalkan" && 
    item.status_pengajuan !== "Dibatalkan"
);

useEffect(() => {
  if (plafond >= jumlahPinjamanFloat) {
    setStatusPinjaman("Plafond mencukupi");
    setTanggalPlafondTersedia(tanggal_pengajuan);
    setIdPinjaman(id_pinjaman);
    setPlafondBaru(plafondSaatIni);
  } else {
    setStatusPinjaman("Plafond tidak mencukupi");
    
    const today = new Date();

    const tanggalBaru = new Date(today);
    tanggalBaru.setMonth(today.getMonth() + bulanLagi); 
    tanggalBaru.setDate(1);
    const formattedDate = tanggalBaru.toISOString().split("T")[0];

    if (totalAngsuranBulanDepan !== null || totalAngsuranBulanDepan !== undefined) {
      setTanggalPlafondTersedia(formattedDate);
    } else {
      setTanggalPlafondTersedia(today);
    }
    setIdPinjaman(id_pinjaman);
    setPlafondBaru(plafondSaatIni); 

  }

  if (calculaterasio_angsuran(jumlah_pinjaman, gajiPokok) > 20 ||
  rasio_angsuran > 20) {
  console.log("Hasil calculate rasio angsuran: ", calculaterasio_angsuran(jumlah_pinjaman, gajiPokok));
  console.log("Rasio angsuran: ", rasio_angsuran);

  const persen20 = gajiPokok * 20/100;
  const kekuranganRasio = (rasio_angsuran - 20).toFixed(2);
  const kekuranganAngsuran = jumlah_angsuran - persen20;

  console.log("20% gaji: ", persen20);
  console.log("Kekurangan rasio angsuran: ", kekuranganRasio);
  console.log("Kekurangan angsuran: ", kekuranganAngsuran);
  }
}, [
  plafondSaatIni,
  plafond,
  plafondFloat,
  plafondSaatIniFloat,
  jumlahPinjamanFloat,
  totalDibayar,
  tanggal_pengajuan,
  bulanLagi, 
  rasio_angsuran
]);

  const hasilScreening = React.useMemo(() => {
    if (!isDataDiriComplete()) return null;

    // console.log("Plafond tersisa: ", plafondSaatIni); 
    // console.log("Plafond awal: ", plafond);
    // console.log("Jumlah pinjaman: ", jumlahPinjamanFloat); 
    // console.log("Status pinjaman: ", statusPinjaman);

    const isDeclined =
      calculateYears(tanggal_masuk) < 5 ||

      // calculaterasio_angsuran(jumlah_pinjaman, gajiPokok) > 20 ||
      // rasio_angsuran > 20 ||
      calculatePensiun(tanggal_lahir, jenis_kelamin) < 6 

      console.log("Rasiooo angsuran: ", rasio_angsuran);

      if(isDeclined) return "Decline";
      if(isAjukanDisabled || totalPinjaman - totalDibayar !== 0) return "Pending";
      if(rasio_angsuran > 20) return "ConditionallyAccepted";
      if(plafondFloat < jumlahPinjamanFloat) return "AcceptedNext";
      
    return "Accepted";
  }, [
    tanggal_masuk,
    totalPinjaman,
    totalDibayar,
    plafondSaatIni,
    jumlah_pinjaman,
    gajiPokok,
    tanggal_lahir,
    jenis_kelamin,
    keperluan,
    rasio_angsuran, 
    statusPinjaman,
  ]);

  const calculaterasio_angsuranMemoized = useMemo(() => {
    if (!jumlah_pinjaman || !gajiPokok) return null; 
    
    const angsuranBulanan = jumlah_pinjaman / 60;
    // const rasio_angsuran = (angsuranBulanan / gajiPokok) * 10;
    const rasio_angsuran = (angsuranBulanan/(gajiPokok*1) * 100)
    return parseFloat(rasio_angsuran.toFixed(2)); 

  }, [jumlah_pinjaman, gajiPokok]);

  const savePengajuan = async (e) => {
    e.preventDefault();

    setLoading(true);
    elementRef.current?.scrollIntoView();
    try {
      // console.log("Saving pengajuan with id_pinjaman: ", id_pinjaman);
      setLoadingPlafond(true);
        await axios.post("http://localhost:5000/pinjaman", {
            id_pinjaman,
            tanggal_pengajuan,
            jumlah_pinjaman,
            jumlah_angsuran,
            pinjaman_setelah_pembulatan,
            rasio_angsuran,
            keperluan,
            status_pengajuan,
            status_transfer,
            status_pelunasan: "Belum Lunas",
            id_peminjam,
            tanggal_plafond_tersedia,
            plafond_saat_ini,
            sudah_dihitung,
            filepath_pernyataan: filepath_pernyataan,
        }, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        getNomorAntrean();
        handlePengajuanSuccess();
        setIsButtonClicked(true);
        // setShowImportModal(true);

    } catch (error) {
        console.error("Error saat menyimpan pengajuan:", error.response?.data || error.message);
    } finally {
      setLoadingPlafond(false);
    }
  };

  // console.log("Tanggal plafond tersedia: ", tanggal_plafond_tersedia);


  const handlePengajuanSuccess = () => {
    getPinjaman();
    getAntrean();
    toast.success("Pinjaman berhasil diajukan!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
    });
  };

  useEffect(() => {
    const fetchData = async() => {
      await getAntrean();
      // console.log("Antrean fetched: ", antrean);
      await getPinjaman();
    };
    fetchData();
    setTimeout(() => setLoading(false), 1000)
  }, []);

  // console.log("Total pinjaman: ", totalPinjaman); 
  // console.log("Total sudah dibayar: ", totalDibayar); 

  const handleAddSuccess = () => {
    // getPlafond();
    toast.success("Data plafond berhasil ditambahkan!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
    });
};

const savePlafond = async (e) => {
  e.preventDefault();
  try {
      await axios.post('http://localhost:5000/plafond', {
          id_plafond,
          tanggal_penetapan,
          jumlah_plafond,
          keterangan,
      }, {
          headers: {
              Authorization: `Bearer ${token}`,
          },
      });
      setShowAddModal(false); 
      onSuccess(); 
      
  } catch (error) {
      // console.log(error.message);
      toast.error('Gagal menyimpan data plafond baru.', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: true,
        });
  }
};


useEffect(() => {
  if(jumlah_pinjaman) {
    fetchData();
  }
}, [jumlah_pinjaman]);

  return (
    <>
      {loading === false ? 
        (<div className="App">
        <div className="home-card">
        <div className="card-content">
          <h2 className="card-title">Hai, {userData.nama}!</h2>
          <h4 className="card-subtitle">Ajukan pinjaman dengan mudah disini.</h4><hr/>
          <p className="text-danger">*Sistem akan logout secara otomatis dalam 5 menit jika tidak terdapat aktifitas dalam sistem.</p>
        </div>
        <div className="card-opening">
          <img 
            src={cardBeranda}
            alt="Beranda Illustration"
          /> 
        </div>
        </div>
        <Container fluid>
          <Heartbeat/>
          <div>         
             {/* <Permohonan showAddModal={showAddModal} setShowAddModal={setShowAddModal} onSuccess={handleAddSuccess} /> */}
          </div>
          <Row>
            <Col md="12">
              <Card className="p-4">
                <Card.Body>
                <Card.Header className="px-0">
                    <Card.Title>
                      Form Pengajuan
                    </Card.Title>
                  </Card.Header>
                  <hr/>

                  <div className="stepper-wrapper mt-5">
                  <div className="stepper">
                    {[1, 2].map((step) => (
                      <div
                        key={step}
                        className={`step ${steps === step ? "active" : steps > step ? "completed" : ""}`}
                      >
                        <div className="circle">{step}</div>
                        <div className="label">{stepTitle[step - 1].title}</div>
                      </div>
                    ))}
                  </div>
                  </div>

                  <div>
                  <Form>
                  <span className="text-danger required-select">(*) Wajib diisi.</span>
                  {/* {loading ? (
                    <div className="text-center">
                      <Spinner animation="border" variant="primary" />
                      <p>Loading...</p>
                    </div>
                  ) : ( */}
                  <>

                    {steps === 1 && (
                      <>
                        <br/><span className="text-danger required-select">Enter untuk menampilkan angsuran per bulan dan hasil pembulatan</span>
                        <Row>
                          <Col md="12" className="mt-2">
                            <Form.Group>
                            <span className="text-danger">*</span>
                                <label>Keperluan</label>
                                <Form.Select 
                                className="form-control"
                                required
                                value={keperluan || ""} 
                                onChange={(e) => setKeperluan(e.target.value)}
                                >
                                <option className="placeholder-form" key="blankChoice" hidden value="">
                                    Pilih Jenis Keperluan
                                </option>
                                <option value="Pendidikan">Pendidikan</option>
                                <option value="Pengobatan">Pengobatan</option>
                                <option value="Renovasi">Renovasi</option>
                                </Form.Select>
                            </Form.Group>
                          </Col>
                        </Row>

                        <Row>
                        <Col md="12" className="mt-2">
                          <Form.Group>
                          <span className="text-danger">*</span>
                              <label>Jumlah Pinjaman</label>
                              <Form.Control
                                  placeholder="Rp"
                                  type="text"
                                  required
                                  value={formatRupiah(jumlah_pinjaman || "")}
                                  onChange={(e) => handleJumlahPinjamanChange(e.target.value)}
                              />
                          </Form.Group>
                        </Col>
                        </Row>
                        <Row>
                            <Col md="12">
                                <Form.Group>
                                    <label>Angsuran per Bulan</label>
                                    <Form.Control
                                        placeholder="Rp"
                                        type="text"
                                        required
                                        readOnly
                                        value={formatRupiah(jumlah_angsuran || "")}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md="12">
                                <Form.Group>
                                    <label>Jumlah Pinjaman Setelah Pembulatan</label>
                                    <Form.Control
                                        placeholder="Rp"
                                        type="text"
                                        required
                                        readOnly
                                        value={formatRupiah(pinjaman_setelah_pembulatan || "")}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md="12">
                                <Form.Group>
                                    <label>Tanggal Pengajuan</label>
                                    <Form.Control
                                        type="text"
                                        required
                                        readOnly
                                        value={formatTanggal(tanggal_pengajuan)}
                                        onChange={(e) => setTanggalPengajuan(e.target.value)}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                      </>
                    )}


                    {steps === 2 && (
                    <>
                      <Row>
                      <Col md="12" className="mt-2">
                      <Form.Group>
                        <label>ID Karyawan</label>
                        <Form.Control
                          type="text"
                          // name="id_karyawan"
                          value={id_karyawan}
                          readOnly
                          placeholder="ID Karyawan"
                        />
                      </Form.Group>
                      </Col>
                      </Row>
                      <Row>
                        <Col md="12">
                        <Form.Group>
                            <label>Nama Lengkap</label>
                            <Form.Control
                              placeholder="Nama Lengkap"
                              type="text"
                              readOnly
                              value={nama || ""}
                            ></Form.Control>
                          </Form.Group>
                        </Col>
                      </Row>
                      <Row>
                        <Col className="pr-md--0" md="6">
                        <Form.Group>
                            <label>Tanggal Lahir</label>
                            <Form.Control
                              placeholder="Tanggal Lahir"
                              type="text"
                              readOnly
                              value={tanggal_lahir || ""}
                            ></Form.Control>
                        </Form.Group>
                        </Col>
                        <Col className="pl-md-1" md="6">
                        <Form.Group>
                            <label>Tanggal Masuk</label>
                            <Form.Control
                              placeholder="Tanggal Masuk"
                              type="text"
                              readOnly
                              value={tanggal_masuk || ""}
                            ></Form.Control>
                        </Form.Group>
                        </Col>
                        {/* <Col md="12">
                          <Form.Group>
                              <label>Nomor Antrean</label>
                              <Form.Control
                                  type="text"
                                  value={nomorAntrean || "-"}
                                  readOnly
                              />
                          </Form.Group>
                      </Col> */}
                      </Row>
                    </> 
                    )}
                    </>
                    {/* )} */}
                  
                  <div className="row gy-2 mt-3 mb-3 d-flex justify-content-center">
                  {steps === 1 ? (
                    <>
                      <div className="col-12 col-md-auto my-2">
                        <Button
                          className="btn-fill w-100"
                          type="button"
                          variant="success"
                          onClick={hitungPengajuan}
                          >
                          <FaCalculator style={{ marginRight: '8px' }} />
                          Kalkulasi
                        </Button>
                      </div>
                      <div className="col-12 col-md-auto my-2">
                        <Button
                          className="btn-fill w-100"
                          type="button"
                          variant="warning"
                          onClick={resetPengajuan}
                          >
                          <FaHistory style={{ marginRight: '8px' }} />
                          Reset
                        </Button>
                      </div>
                      <div className="col-12 col-md-auto my-2">
                        <Button variant="primary" className="btn-fill w-100" onClick={handleNext} disabled={steps === 1 && keperluan === "" || jumlah_pinjaman === "0" || jumlah_angsuran === ""}>
                          Selanjutnya
                          <FaRegArrowAltCircleRight style={{ marginLeft: '8px' }}/>
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                    <div className="col-12 col-md-auto my-2" id="ajukan">
                      <Button
                        className="btn-fill w-100"
                        variant="primary"
                        onClick={handlePrevious}
                        disabled={steps === 1}
                      >
                      <FaRegArrowAltCircleLeft style={{ marginRight: '8px' }} />
                        Sebelumnya
                      </Button>
                    </div>
                    <div className="col-12 col-md-auto my-2">
                        <Button id="simpan" variant="success" className="btn-fill w-100" onClick={savePengajuan}  disabled={ isAjukanDisabled || hasilScreening === "Decline" || jumlah_pinjaman === "" || jumlah_angsuran === "" || hasilScreening === "ConditionallyAccepted" && filepath_pernyataan === ""}>
                        <FaRegSave style={{ marginRight: '8px' }} />
                          Simpan
                        </Button>
                    </div>
                    </>
                  )}
                  </div>
                  <div className="clearfix"></div>
                  </Form>
                  </div>
                </Card.Body>
              </Card>

              <Card hidden={steps === 1}>
              <Card.Body className="table-responsive" style={{ overflowX: 'auto' }} >
                  {loading ? (
                    <div className="text-center">
                      <Spinner animation="border" variant="primary" />
                      <p>Loading...</p>
                    </div>
                  ) : (
                    <>
                  <Row className="pt-3">
                    <Col md="12">
                    <Form.Group>
                    <label>Persyaratan Pinjaman Karyawan</label>
                      <br />
                      {isDataDiriComplete() ? ( 
                        hasilScreening === "Decline" && steps === 2 ? (
                          <>
                            <DeclineAlert 
                              hidden={jumlah_angsuran === "" || keperluan === ""}
                              selectedPinjaman={selectedPinjaman}
                              totalPinjaman={totalPinjaman}
                              totalDibayar={totalDibayar}
                              
                            />
                          </>
                        ) : steps === 2 && hasilScreening === "Accepted" ? (
                          <AcceptedAlert
                            hidden={steps !== 2 ||jumlah_angsuran === "" || keperluan === ""}
                            selectedPinjaman={selectedPinjaman}
                            totalPinjaman={totalPinjaman}
                            totalDibayar={totalDibayar}
                          />
                        ) 
                          : steps === 2 && isAjukanDisabled  && hasilScreening === "Pending" ? (
                            <PendingAlert
                              hidden={jumlah_angsuran === "" || jumlah_pinjaman === "" || keperluan === ""}
                            /> 
                        )
                          : steps === 2 && plafondFloat < jumlahPinjamanFloat && rasio_angsuran > 20 && hasilScreening === "ConditionallyAccepted" ? (
                            <ConditionallyAcceptedAlert 
                              hidden={jumlah_angsuran === "" || jumlah_pinjaman === "" || keperluan === ""}
                            />
                        ) 
                          : steps === 2 && plafondFloat < jumlahPinjamanFloat  && hasilScreening === "AcceptedNext" ? (
                            <AcceptedNextStepAlert
                              hidden={jumlah_angsuran === "" || jumlah_pinjaman === "" || keperluan === ""}
                            /> 
                        ) : (
                          <p className="text-danger">*Mohon lengkapi semua data terlebih dahulu.</p>
                        )
                      ) : (
                        <p className="text-danger">*Mohon lengkapi semua data terlebih dahulu.</p>
                      )}
                    </Form.Group>
                    </Col>
                  </Row>

                  <Row className="pt-2">
                    <Col md="12">
                      <Table className="table-hover table-striped table-bordered" hidden={steps === 1 && keperluan === "" || steps === 1 && jumlah_angsuran === ""}>
                        <thead className="table-primary text-nowwrap">
                          <tr>
                            <th style={{fontSize: 16}}>Syarat</th>
                            <th style={{fontSize: 16}}>Deskripsi</th>
                            <th style={{fontSize: 16}}>Kondisi saat ini</th>
                            <th style={{fontSize: 16}}>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="text-center">Masa kerja</td>
                            <td className="text-center">Masa kerja >= 5 tahun</td>
                            <td className="text-center">{masaKerja}</td>
                            <td className="text-center">
                            {
                                tanggal_masuk
                                ? calculateYears(tanggal_masuk) >=5 
                                ? <FaCheckCircle style={{ color: 'green' }} />
                                : <FaTimesCircle style={{ color: 'red' }} />
                                : null
                              }
                            </td>
                          </tr>
                          <tr>
                            <td className="text-center">Riwayat Pinjaman</td>
                            <td className="text-center">Tidak memiliki pinjaman aktif</td>
                            <td className="text-center">
                              { totalPinjaman - totalDibayar > 0 
                              ? "Memiliki pinjaman aktif"
                              : "Tidak memiliki pinjaman aktif"
                              }
                            </td>
                            <td className="text-center">
                            {
                              id_karyawan ? ( 
                                totalPinjaman - totalDibayar !== 0 
                                ? <FaTimesCircle style={{ color: 'red' }} /> 
                                : <FaCheckCircle style={{ color: 'green' }} />
                              ) : null}
                            </td>
                          </tr>
                          <tr>
                            <td className="text-center">Plafond</td>
                            <td className="text-center" ref={elementRef}>Sisa plafond mencukupi</td>
                            <td className="text-center">
                              {id_karyawan ? (
                                loadingPlafond ? (
                                  <div className="text-center">
                                    <Spinner animation="border" variant="primary" />
                                    <p>Loading...</p>
                                  </div>
                              ) : (
                              <>
                                {statusPinjaman}
                                {pinjamanInfo && <p className="text-warning">{pinjamanInfo}</p>}
                                    {isButtonClicked && (
                                      <p className="text-center text-warning">Nomor antrean anda: {nomorAntrean !== null && nomorAntrean !== undefined ? nomorAntrean : 1}</p>
                                    )}
                              </>
                              )
                              ) : null}
                            </td>

                            <td className="text-center">
                              {id_karyawan ? (
                                loadingPlafond ? (
                                  <div className="text-center">
                                    <Spinner animation="border" variant="primary" />
                                    <p>Loading...</p>
                                  </div>
                                ) : plafond >= jumlah_pinjaman ? (
                                  <FaCheckCircle style={{ color: "green" }} />
                                ) : (
                                  <FaTimesCircle style={{ color: "red" }} />
                                )
                              ) : null}
                            </td>
                          </tr>

                          <tr>
                            <td className="text-center">Angsuran</td>
                            <td className="text-center">Persentase angsuran max 20% dari gaji pokok</td>
                            <td className="text-center">
                              {"Rasio Angsuran Saat Ini: " + rasio_angsuran + " %"}  <br/>

                              {rasio_angsuran <= 20? hidden : "Angsuran Saat Ini: Rp " + formatRupiah(jumlah_angsuran)} <br/><br/>
                              {rasio_angsuran <= 20? hidden : "Max Angsuran Seharusnya: Rp " + formatRupiah(gajiPokok*20 / 100)} <br/>

                              {rasio_angsuran <= 20? hidden : "Kelebihan Rasio Angsuran: " + (rasio_angsuran - 20).toFixed(2) + "%"} <br/>
                              {rasio_angsuran <= 20? hidden : "Kekurangan Angsuran: Rp " + formatRupiah(jumlah_angsuran - (gajiPokok * 20/100))} <br/><br/>

                              <Button
                                className="btn-fill pull-right warning"
                                variant="warning"
                                hidden={rasio_angsuran <= 20}
                                id="permohonan"
                                disabled={hasilScreening === "ConditionallyAccepted" && filepath_pernyataan !== "" || hasilScreening==="Pending"}
                                onClick={() => {
                                  setShowAddModal(true);
                                }}
                                >
                                <FaFileContract style={{ marginRight: '8px' }}/>
                                Ajukan Permohonan
                              </Button>
                            </td>
                            <td className="text-center">
                            {
                              id_karyawan ? (
                                calculaterasio_angsuranMemoized !== null ? (
                                  calculaterasio_angsuranMemoized <= 20 || filepath_pernyataan !== "" ?  (
                                    <FaCheckCircle style={{ color: "green" }} />
                                  ) : (
                                    <FaTimesCircle style={{ color: "red" }} />
                                  )
                                ) : (
                                  <p>Loading...</p>
                                )
                              ) : null
                            }
                            </td>
                          </tr>
                          <tr>
                            <td className="text-center">Jarak Pensiun</td>
                            <td className="text-center">Sisa Masa Kerja >= 6 tahun</td>
                            <td className="text-center">{jarakPensiun + " Tahun"}</td>
                            <td className="text-center">
                              {
                                tanggal_lahir && jenis_kelamin
                                ? calculatePensiun(tanggal_lahir, jenis_kelamin) >= 6
                                  ? <FaCheckCircle style={{ color: 'green' }} />
                                  : <FaTimesCircle style={{ color: 'red' }} />  
                                : null 
                              } 
                            </td>
                          </tr>
                        </tbody>
                      </Table>
                    </Col>
    
                  </Row>
                    </>
                  )}
                  </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
        </div>
        ):
        ( <>
            <div className="App-loading">
              <ReactLoading type="spinningBubbles" color="#fb8379" height={150} width={150}/>
              <span style={{paddingTop:'100px'}}>Loading...</span>
            </div>
          </>
        )}

        <Modal
              className="modal-primary"
              show={showAddModal}
              onHide={() => setShowAddModal(false)}
          >
              <Modal.Header className="text-center pb-1">
                  <h3 className="mt-3 mb-0">Form Permohonan Top-up Angsuran</h3>
              </Modal.Header>
              <Modal.Body className="text-left pt-0">
                  <hr />
                  <Form onSubmit={savePlafond}>
                  <Card> 
                      <Card.Header as="h4" className="mt-1"><strong>Top-up Angsuran</strong></Card.Header><hr/>
                      <Card.Body>
                          <Card.Text>
                              <p>Merupakan kondisi dimana keluarga calon peminjam <strong>SETUJU</strong> untuk<strong> meningkatkan jumlah angsuran per-bulan yang dipotong dari Gaji Karyawan Peminjam</strong> untuk mencapai jumlah pinjaman yang diperlukan.</p>
                              <p>Silakan mengunggah Surat Pernyataan yang telah ditandatangani oleh:
                              </p>
                              <ol>
                                  <li>Karyawan Peminjam</li>
                                  <li>Perwakilan Keluarga Karyawan (suami/istri)</li>
                                  <li>Manager/Supervisor/Kabag</li>
                                  <li>Direktur Keuangan</li>
                                  <li>Presiden Direktur</li>
                                </ol>
                          </Card.Text>
                      </Card.Body>
                  </Card>
                  <span className="text-danger required-select">(*) Wajib diisi.</span>
                      <Row>
                          <Col md="12">
                              <Form.Group>
                              {/* <span className="text-danger">*</span> */}
                                  <label>Kelebihan Persentase Angsuran (per-bulan)</label>
                                  <Form.Control
                                      type="text"
                                      value={(rasio_angsuran - 20).toFixed(2) + " %"}
                                      readOnly
                                  />
                              </Form.Group>
                          </Col>
                      </Row>
                      <Row>
                          <Col md="12">
                              <Form.Group>
                              {/* <span className="text-danger">*</span> */}
                                  <label>Kekurangan Angsuran</label>
                                  <Form.Control
                                      type="text"
                                      value={"Rp " + formatRupiah(jumlah_angsuran - (gajiPokok * 20/100))}
                                      readOnly
                                  />
                              </Form.Group>
                          </Col>
                      </Row>
                      {/* <Row>
                          <Col md="12">
                              <Form.Group>
                              <span className="text-danger">*</span>
                                  <label>Jumlah Top-up Angsuran</label>
                                  <Form.Control
                                      placeholder="Rp"
                                      type="text"
                                      required
                                      value={"Rp " + formatRupiah(jumlah_topup)}
                                      onChange={(e) => handleJumlahTopUp(e.target.value)}
                                  />
                              </Form.Group>
                          </Col>
                      </Row> */}
                      <Row>
                          <Col md="12">
                              <Form.Group>
                              {/* <span className="text-danger">*</span> */}
                                  <label>Jumlah Angsuran (per-bulan)</label>
                                  <Form.Control
                                      type="text"
                                      disabled
                                      value={"Rp " + formatRupiah(parseInt(gajiPokok*20 / 100) + parseInt(jumlah_angsuran - (gajiPokok * 20/100)))}
                                      // value={"Rp " + formatRupiah(parseInt(gajiPokok*20 / 100) + parseInt(jumlah_topup) || jumlah_angsuran)}
                                      // onChange={(e) => (parseInt(e.target.value) + parseInt(jumlah_topup))}
                                    
                                  />
                                   {/* <div>{(parseInt(jumlah_angsuran) + parseInt(jumlah_topup))}</div> */}
                              </Form.Group>
                          </Col>
                      </Row>
                      <Row>
                          <Col md="12">
                              <Form.Group>
                              <span className="text-danger">*</span>
                                  <label>Unggah Surat Pernyataan</label>
                                  <input type="file" accept=".pdf" onChange={handleFileChange} />
                              </Form.Group>
                          </Col>
                      </Row>
                      <Row>
                          <Col md="12">
                              <div className="modal-footer d-flex flex-column">
                                  <a href="#ajukan">
                                    <Button className="btn-fill w-100 mt-3" variant="primary" onClick={handleFileUpload}>
                                        Simpan
                                    </Button>
                                  </a>
                              </div>
                          </Col>
                      </Row>
                  </Form>
              </Modal.Body>
        </Modal>
    </>

  );
}

export default DashboardKaryawan;
