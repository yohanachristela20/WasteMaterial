import React, { useState, useEffect, useMemo, useRef } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import {FaFilePdf, FaPlusCircle, FaRegEdit, FaTrashAlt} from 'react-icons/fa'; 
import "../assets/scss/lbd/_text.scss";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useHistory } from "react-router-dom";
import Pengajuan from "./Pengajuan.js";

import {
  Badge,
  Button,
  Card,
  Container,
  Row,
  Col, 
  Table,
} from "react-bootstrap";

function DetailPengajuan() {
  const location = useLocation();
  // console.log("location:", location.pathname);
  const contentRef = useRef(null);
  const history = useHistory();
  // console.log("history:", history);

  const [selectedPengajuan, setSelectedPengajuan] = useState(location?.state?.selectedPengajuan || null);
  const [detailPengajuan, setDetailPengajuan] = useState([]);
  const [detailTransaksi, setDetailTransaksi] = useState([]);
  const [isUpdateClicked, setIsUpdateClicked] = useState(false);
  const [showUbahPengajuan, setShowUbahPengajuan] = useState(false);


  const token = localStorage.getItem("token");

  useEffect(() => {
    const getDetailPengajuan = async() => {
        if (!token) {
            console.error("Token tidak tersedia");
            return;
        }

        try {
            const resp = await axios.get(`http://localhost:5000/detail-pengajuan/${selectedPengajuan?.id_pengajuan}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            setDetailPengajuan(Array.isArray(resp.data) ? resp.data : []);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    const getDetailTransaksi = async() => {
        if (!token) {
            console.error("Token tidak tersedia");
            return;
        }

        try {
            const resp = await axios.get(`http://localhost:5000/detail-transaksi/${selectedPengajuan?.id_pengajuan}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            setDetailTransaksi(resp.data || []);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

     if (selectedPengajuan?.id_pengajuan) {
        getDetailPengajuan();
        getDetailTransaksi();
    } 
  }, [selectedPengajuan, token]);

  const uniquePemohon = [
    ...new Map(
      detailPengajuan.map((d) => [d?.Pemohon?.id_karyawan, d?.Pemohon])
    ).values(),
  ];

  
  const uniqueID = [
    ...new Map(
      detailPengajuan.map((d) => [d?.id_pengajuan, d])
    ).values(),
  ];


  const uniqueStatus = [
    ...new Map(
      detailPengajuan.map((d) => [d?.GeneratePengajuan?.id_pengajuan, d?.GeneratePengajuan])
    ).values(),
  ];

  const jumlahTotal = detailPengajuan.reduce((acc, item) => {
    const total = Number(item?.total);
    return acc + total;
  }, 0);

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

  const downloadPdf = async () => {
    const element = contentRef.current;
    if (!element) return;

    const canvas = await html2canvas(element, { scale: 2 }); // Scale for better quality
    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF('p', 'mm', 'a4'); // Portrait, millimeters, A4 size
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save('Detail Pengajuan.pdf'); 
  };

  const ubahPengajuan = (selectedPengajuan) => {
    console.log("selected Pengajuan:", selectedPengajuan, "status:", selectedPengajuan?.GeneratePengajuan?.status);
    if (selectedPengajuan?.GeneratePengajuan?.status !== "Selesai" && isUpdateClicked === true) {
      history.push({
        pathname: "/admin/pengajuan",
        state: {selectedPengajuan}
      });
    } 

    // <div>
    //   <Pengajuan 
    //     showUbahPengajuan = {showUbahPengajuan}
    //     setShowUbahPengajuan = {setShowUbahPengajuan}
    //     ubahPengajuan = {selectedPengajuan}
    //   />
    // </div>
  };

  // console.log("selected Pengajuan:", selectedPengajuan.id_pengajuan);

  return (
    <>
      <Container fluid>
        <Row>
          {/* <div>
            <Pengajuan 
              showUbahPengajuan = {showUbahPengajuan}
              setShowUbahPengajuan = {setShowUbahPengajuan}
              ubahPengajuan = {selectedPengajuan}
            />
          </div> */}
          <Col className="card-screening">
            <Card className="card-screening p-4">
              <div ref={contentRef} style={{padding: '40px'}}>
                <Card.Header>
                  <Card.Title as="h4"><strong>Detail Pengajuan</strong></Card.Title>
                  <hr />
                </Card.Header>
                <Card.Body className="table-responsive px-0" style={{overflowX: 'auto'}}>
                  <Row>
                    <Col md="6">
                        <p className="font-id mt-2 mb-1">
                        {uniqueID.map((p) => (
                          <div key={p?.id_pengajuan}>
                            {p?.id_pengajuan}
                          </div>
                        ))}
                      </p>
                      <p className="font-divisi">
                        {uniquePemohon.map((p) => (
                          <div key={p?.id_karyawan}>
                            {p?.nama} - {p?.divisi}
                          </div>
                        ))}
                      </p>
                      <p className="font-tanggal-pengajuan mt-3 mb-1">
                        {uniqueID.map((p) => (
                          <div key={p?.id_pengajuan}>
                            <strong>Diajukan</strong> {new Date(p?.createdAt).toLocaleString("en-GB", { timeZone: "Asia/Jakarta" }).replace(/\//g, '-').replace(',', '')}
                          </div>
                        ))}
                      </p>
                    </Col>
                    <Col md="6">
                      <p className="text-right font-judul-total mt-2">
                        {uniqueStatus.map((p) => (
                          <div key={p?.id_pengajuan}>
                            {p?.status === "Belum Diproses" ? (
                              <Badge bg="danger" text="light" className="p-2">Belum Diproses</Badge>
                            ) : (
                              <Badge bg="success" text="light" className="p-2">Selesai</Badge>
                            )}
                          </div>
                        ))}
                      </p>
                      <p className="text-right font-proses mt-5 mb-1">
                        {detailTransaksi.map((d) => (
                          <div key={d?.createdAt}>
                            <strong>Diproses</strong> {new Date(d?.createdAt).toLocaleString("en-GB", { timeZone: "Asia/Jakarta" }).replace(/\//g, '-').replace(',', '')}
                          </div>
                        ))}
                      </p>
                      <p className="text-right font-proses">
                        {detailTransaksi.map((d) => (
                          <div key={d?.id_transaksi}>
                            <strong>Oleh</strong> {d.Petugas?.nama || '-'}
                          </div>
                        ))}
                      </p>
                      <p className="text-right font-proses mb-1 mt-4">
                        {detailTransaksi.map((d) => (
                          <div key={d?.id_transaksi}>
                            <strong>Vendor</strong> {d.VendorPenjualan?.nama || 'Tidak ada vendor'}
                          </div>
                        ))}
                      </p>
                      <p className="text-right font-proses mb-1">
                        {detailTransaksi.map((d) => (
                          <div key={d?.id_transaksi}>
                            <strong>No. Kendaraan</strong> {d.VendorPenjualan?.no_kendaraan || '-'}
                          </div>
                        ))}
                      </p>
                      <p className="text-right font-proses">
                        {detailTransaksi.map((d) => (
                          <div key={d?.id_transaksi}>
                            <strong>Cara Bayar</strong> {d.cara_bayar || 'Tidak ada transaksi'}
                          </div>
                        ))}
                      </p>
                    </Col>
                  </Row>
                  <Row>
                      <Col md="12">
                          <Table className="table-hover table-striped">
                              <div className="table-scroll" style={{ height:'auto' }}>
                              <table className="flex-table table table-striped table-hover">
                                  <thead>
                                  <tr>
                                      <th className="border-0">No.</th>
                                      <th className="border-0">Nama Barang</th>
                                      <th className="border-0">Kategori</th>
                                      <th className="border-0">Satuan</th>
                                      <th className="border-0">Harga Barang (Rp)</th>
                                      <th className="border-0">Jumlah Barang</th>
                                      <th className="border-0">Kondisi</th>
                                      <th className="border-0">Jenis Pengajuan</th>
                                      <th className="border-0">Total (Rp)</th>
                                  </tr>
                                  </thead>
                                  <tbody className="scroll scroller-tbody">
                                    {detailPengajuan.length === 0 ? (
                                      <tr><td colSpan={8} className="text-center">Tidak ada data pengajuan</td></tr>
                                    ) : (
                                      detailPengajuan.map((d, index) => (
                                        <tr key={d.id_parent_pengajuan || d.id_pengajuan || Math.random()}>
                                          <td className="text-center p-0 pt-2">{index + 1}</td>
                                          <td className="text-center">{d?.BarangDiajukan?.nama}</td>
                                          <td className="text-center">{d?.BarangDiajukan?.KategoriBarang?.nama}</td>
                                          <td className="text-center">{d?.BarangDiajukan?.KategoriBarang?.satuan}</td>
                                          <td className="text-right">{formatRupiah(d?.BarangDiajukan?.KategoriBarang?.harga_barang)}</td>
                                          <td className="text-center">{d?.jumlah_barang}</td>
                                          <td className="text-center">{d?.kondisi}</td>
                                          <td className="text-center">{d?.jenis_pengajuan}</td>
                                          <td className="text-right">{formatRupiah(d?.total)}</td>

                                      </tr>
                                      ))
                                    )}
                                  </tbody>
                              </table>
                              </div>
                          </Table>
                      </Col>
                      <Col md="12">
                        <p className="text-right font-judul-total mb-0">Jumlah Total</p>
                        <p className="text-right font-total">Rp {formatRupiah(jumlahTotal)}</p>
                      </Col>
                  </Row>
                </Card.Body>
              </div>
            </Card>
          </Col>
          <Col md="6">
            <Button 
              onClick={downloadPdf}
              className="btn-fill pull-right ml-lg-3 ml-md-4 ml-sm-3 mb-4"
              type="button"
              variant="primary"
            >
              <FaFilePdf style={{ marginRight: '8px' }} />
              Unduh PDF
            </Button>
             <Button 
              onClick={(e) => {
                ubahPengajuan(selectedPengajuan); 
                setIsUpdateClicked(true);
                // setShowUbahPengajuan(true);
              }}
              // setIsUpdateClicked={true}
              className="btn-fill pull-right ml-lg-3 ml-md-4 ml-sm-3 mb-4"
              type="button"
              variant="warning"
              hidden={selectedPengajuan?.GeneratePengajuan?.status === "Selesai"}
            >
              <FaRegEdit style={{ marginRight: '8px' }} />
              Ubah Data
            </Button>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default DetailPengajuan;