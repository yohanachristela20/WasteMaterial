import React, { useState, useEffect, useMemo, useRef } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import {FaFilePdf} from 'react-icons/fa'; 
import { useHistory } from "react-router-dom";
import "../assets/scss/lbd/_text.scss";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

import {
  Button,
  Card,
  Container,
  Row,
  Col, 
  Table,
} from "react-bootstrap";

function DokumenPengajuan() {
  const location = useLocation();
  const contentRef = useRef(null);

  const [selectedPengajuan, setSelectedPengajuan] = useState(location?.state?.selectedPengajuan || null);
  const [detailPengajuan, setDetailPengajuan] = useState([]);
  const [detailTransaksi, setDetailTransaksi] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const getDetailPengajuan = async() => {
        if (!token) {
            console.error("Token tidak tersedia");
            return;
        }
        try {
            const resp = await axios.get(`http://localhost:5001/detail-pengajuan/${selectedPengajuan?.id_pengajuan}`, {
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
            const resp = await axios.get(`http://localhost:5001/detail-transaksi/${selectedPengajuan?.id_pengajuan}`, {
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

  const uniqueJenisBarang = [
    ...new Map(
      detailPengajuan.map((d) => [d?.BarangDiajukan?.KategoriBarang?.jenis_barang, d?.BarangDiajukan?.KategoriBarang])
    ).values(),
  ];

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

        pdf.save('Dokumen Pengajuan.pdf'); 
      };
   
  return (
    <>
      <Container fluid>
        <Row>
          <Col className="card-screening">
            <Card className="card-screening p-4">
              <div ref={contentRef} style={{padding: '50px'}}>
                <Card.Body className="table-responsive px-3">
                    <Row style={{ border: '1px solid grey' }}>
                        <Col md="2" className="py-0">
                            <div className="left-column ml-4 mt-4">
                                <img src={require("assets/img/campina-logo.png")} alt="company-logo" style={{width: 170, height:170, marginTop: -30}}/>
                            </div>
                        </Col>
                        <Col md="6" className="py-0">
                            <h3 style={{fontWeight: 800, marginTop: "60px"}}>PT. CAMPINA ICE CREAM INDUSTRY</h3>
                        </Col>
                        <Col md="4" style={{ borderLeft: '1px solid grey'}}>
                            <Row>
                                <Col md="6" className="mt-4">
                                    <p className="mb-1" style={{fontSize: 20}}>NO. DOKUMEN</p>
                                    <p className="mb-1" style={{fontSize: 20}}>TGL. DIKELUARKAN</p>
                                    <p className="mb-1" style={{fontSize: 20}}>NO. REVISI</p>
                                </Col>
                                <Col className="mt-4">
                                  <p className="mb-1" style={{fontSize: 20}}>: F.CMPI.LOG.02.00.04</p>
                                  <p className="mb-1" style={{fontSize: 20}}>: 10 JANUARI 2014</p>
                                  <p className="mb-1" style={{fontSize: 20}}>: 2 - 0</p>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                    
                    <div className="table-responsive">
                      <Row>
                          <Col md="12" className="mx-auto px-0 card-screening">
                                <Table > 
                                  <table className="w-100">
                                    <thead>
                                      <tr>
                                        <th className="text-center align-middle p-0" scope="col" colSpan="7" style={{ border: '1px solid grey' }}>
                                          <h3 className="d-flex justify-content-center align-items-center mt-3" style={{fontWeight: 800, marginTop: "50px"}}>
                                          {uniqueID.map((p) => (
                                            <div key={p?.id_pengajuan} className="ml-3">
                                            {p?.jenis_pengajuan === "PENJUALAN" || p?.jenis_pengajuan === "Penjualan" ? "PENGAJUAN WASTE MATERIAL" : " PENGAJUAN SCRAPPING WASTE MATERIAL"}
                                            </div>
                                            ))}
                                          </h3>
                                          <p className="d-flex justify-content-center align-items-center" style={{fontSize: 20}}>NO. :{uniqueID.map((p) => (
                                            <div key={p?.id_pengajuan} className="ml-3">
                                            {p?.id_pengajuan}
                                            </div>
                                            ))}/CMPI-RKT/{uniquePemohon.map((p) => (
                                            <div key={p?.id_karyawan}>
                                              {p?.divisi}
                                            </div>
                                          ))}
                                          </p>
                                          <p className="d-flex justify-content-center align-items-center" style={{fontSize: 20}}>TANGGAL : {uniqueID.map((p) => (
                                            <div key={p?.id_pengajuan} className="ml-3">
                                              {new Date(p?.createdAt).toLocaleString("en-GB", { timeZone: "Asia/Jakarta" }).replace(/\//g, '/').replace(',', '')}
                                            </div>
                                          ))}</p>
                                        </th>
                                      </tr>
                                    </thead>

                                    {uniqueJenisBarang.length > 1 ? (
                                      uniqueJenisBarang.map((j) => (
                                        <React.Fragment>
                                          <tr>
                                            <th className="text-center align-middle p-0" scope="col" colSpan="7" style={{ border: '1px solid grey' }}>
                                              <h4 className="d-flex justify-content-center align-items-center mt-3" style={{fontWeight: 800, marginTop: "50px"}}>
                                                {j?.jenis_barang === "ASSET" ? "ASSET" : "NON-ASSET"}
                                              </h4>
                                            </th>
                                          </tr>

                                          <tr>
                                            <th className="text-center align-middle w-50" scope="row" rowSpan="2" style={{ border: '1px solid grey', fontSize: 20 }}>DESKRIPSI</th>
                                            <th className="text-center align-middle" scope="row" rowSpan="2" style={{ border: '1px solid grey', fontSize: 20 }}>QTY</th>
                                            <th className="text-center align-middle" scope="row" rowSpan="2" style={{ border: '1px solid grey', fontSize: 20 }}>SATUAN</th>
                                            <th className="text-center align-middle" scope="col" colSpan="4" style={{ border: '1px solid grey', fontSize: 20 }}>KETERANGAN</th>
                                          </tr>
                                          <tr>
                                            <th className="text-center align-middle" scope="col" style={{ border: '1px solid grey', fontSize: 20 }}>RUSAK</th>
                                            <th className="text-center align-middle" scope="col" style={{ border: '1px solid grey', fontSize: 20 }}>TIDAK DIGUNAKAN</th>
                                            <th className="text-center align-middle" scope="col" style={{ border: '1px solid grey', fontSize: 20 }}>SISA PRODUKSI</th>
                                            <th className="text-center align-middle" scope="col" style={{ border: '1px solid grey', fontSize: 20 }}>LAINNYA</th>
                                          </tr>

                                          <tbody style={{ border: '1px solid grey' }}>
                                            {detailPengajuan.length === 0 ? (
                                              <tr><td colSpan={8} className="text-center" style={{ border: '1px solid grey', fontSize: 20 }}>Tidak ada data pengajuan</td></tr>
                                            ) : (
                                              detailPengajuan
                                              .filter((d) => d?.BarangDiajukan?.KategoriBarang?.jenis_barang === j?.jenis_barang)
                                              .map((d, index) => (
                                                <tr key={d.id_parent_pengajuan || d.id_pengajuan || Math.random()}>
                                                  <td className="border-bottom-0 border-top-0 " style={{ border: '1px solid grey', fontSize: 20 }}>{d?.BarangDiajukan?.KategoriBarang?.nama}</td>
                                                  <td className="text-center border-bottom-0 border-top-0" style={{ border: '1px solid grey', fontSize: 20 }}>{d?.jumlah_barang}</td>
                                                  <td className="text-center border-bottom-0 border-top-0" style={{ border: '1px solid grey', fontSize: 20 }}>{d?.BarangDiajukan?.KategoriBarang?.satuan}</td>

                                                  <td className="text-center border-bottom-0 border-top-0" style={{ border: '1px solid grey', fontSize: 20 }}>{(d?.kondisi).toUpperCase() === "RUSAK" ? '\u2713' : ""}</td>
                                                  <td className="text-center border-bottom-0 border-top-0" style={{ border: '1px solid grey', fontSize: 20 }}>{(d?.kondisi).toUpperCase() === "TIDAK DIGUNAKAN" ? '\u2713' : ""}</td>
                                                  <td className="text-center border-bottom-0 border-top-0" style={{ border: '1px solid grey', fontSize: 20 }}>{(d?.kondisi).toUpperCase() === "SISA PRODUKSI" ? '\u2713' : ""}</td>
                                                  <td className="text-center border-bottom-0 border-top-0" style={{ border: '1px solid grey', fontSize: 20 }}>{(d?.kondisi).toUpperCase() === "LAINNYA" || (d?.kondisi).toUpperCase() !== "RUSAK" && (d?.kondisi).toUpperCase() !== "TIDAK DIGUNAKAN" && (d?.kondisi).toUpperCase() !== "SISA PRODUKSI" ? (d?.kondisi).toUpperCase() : ""}</td>
                                                </tr>
                                              ))
                                            )}
                                          </tbody>
                                          
                                        </React.Fragment>
                                      ))
                                    ) : (
                                      <>
                                        <tr>
                                            <th className="text-center align-middle p-0" scope="col" colSpan="7" style={{ border: '1px solid grey' }}>
                                              <h4 className="d-flex justify-content-center align-items-center mt-3" style={{fontWeight: 800, marginTop: "50px"}}>
                                                {uniqueJenisBarang[0]?.jenis_barang}
                                              </h4>
                                            </th>
                                        </tr>
                                        <tr>
                                          <th className="text-center align-middle w-50" scope="row" rowSpan="2" style={{ border: '1px solid grey', fontSize: 20 }}>DESKRIPSI</th>
                                          <th className="text-center align-middle" scope="row" rowSpan="2" style={{ border: '1px solid grey', fontSize: 20 }}>QTY</th>
                                          <th className="text-center align-middle" scope="row" rowSpan="2" style={{ border: '1px solid grey', fontSize: 20 }}>SATUAN</th>
                                          <th className="text-center align-middle" scope="col" colSpan="4" style={{ border: '1px solid grey', fontSize: 20 }}>KETERANGAN</th>
                                        </tr>
                                        <tr>
                                          <th className="text-center align-middle" scope="col" style={{ border: '1px solid grey', fontSize: 20 }}>RUSAK</th>
                                          <th className="text-center align-middle" scope="col" style={{ border: '1px solid grey', fontSize: 20 }}>TIDAK DIGUNAKAN</th>
                                          <th className="text-center align-middle" scope="col" style={{ border: '1px solid grey', fontSize: 20 }}>SISA PRODUKSI</th>
                                          <th className="text-center align-middle" scope="col" style={{ border: '1px solid grey', fontSize: 20 }}>LAINNYA</th>
                                        </tr>

                                        <tbody style={{ border: '1px solid grey' }}>
                                            {detailPengajuan.length === 0 ? (
                                              <tr><td colSpan={8} className="text-center" style={{ border: '1px solid grey', fontSize: 20 }}>Tidak ada data pengajuan</td></tr>
                                            ) : (
                                              detailPengajuan.map((d, index) => (
                                                <tr key={d.id_parent_pengajuan || d.id_pengajuan || Math.random()}>
                                                  <td className="border-bottom-0 border-top-0 " style={{ border: '1px solid grey', fontSize: 20 }}>{d?.BarangDiajukan?.KategoriBarang?.nama}</td>
                                                  <td className="text-center border-bottom-0 border-top-0" style={{ border: '1px solid grey', fontSize: 20 }}>{d?.jumlah_barang}</td>
                                                  <td className="text-center border-bottom-0 border-top-0" style={{ border: '1px solid grey', fontSize: 20 }}>{d?.BarangDiajukan?.KategoriBarang?.satuan}</td>

                                                  <td className="text-center border-bottom-0 border-top-0" style={{ border: '1px solid grey', fontSize: 20 }}>{(d?.kondisi).toUpperCase() === "RUSAK" ? '\u2713' : ""}</td>
                                                  <td className="text-center border-bottom-0 border-top-0" style={{ border: '1px solid grey', fontSize: 20 }}>{(d?.kondisi).toUpperCase() === "TIDAK DIGUNAKAN" ? '\u2713' : ""}</td>
                                                  <td className="text-center border-bottom-0 border-top-0" style={{ border: '1px solid grey', fontSize: 20 }}>{(d?.kondisi).toUpperCase() === "SISA PRODUKSI" ? '\u2713' : ""}</td>
                                                  <td className="text-center border-bottom-0 border-top-0" style={{ border: '1px solid grey', fontSize: 20 }}>{(d?.kondisi).toUpperCase() === "LAINNYA" || (d?.kondisi).toUpperCase() !== "RUSAK" && (d?.kondisi).toUpperCase() !== "TIDAK DIGUNAKAN" && (d?.kondisi).toUpperCase() !== "SISA PRODUKSI" ? (d?.kondisi).toUpperCase() : ""}</td>
                                                </tr>
                                              ))
                                            )}
                                          </tbody>

                                      </>
                                    )}

                                    <tr>
                                      <th className="text-center align-middle p-0" scope="col" colSpan="7" style={{ border: '1px solid grey' }}>
                                        <h4 className="d-flex justify-content-center align-items-center mt-3" style={{fontWeight: 800, marginTop: "50px"}}></h4>
                                      </th>
                                    </tr>
                                    <tr>
                                      <th className="text-center align-middle p-0" scope="col" colSpan="7" style={{ border: '1px solid grey' }}>
                                        <Row>
                                          <Col md="6">
                                            <p style={{fontSize: 20, marginTop: 20}}>PEMOHON</p>
                                            <p style={{fontSize: 20, marginTop: 70}}>
                                              {uniquePemohon.map((p) => (
                                                <div key={p?.id_karyawan}>
                                                  ({p?.nama})
                                                </div>))}
                                            </p>
                                          </Col>
                                          <Col md="6">
                                            <p style={{fontSize: 20, marginTop: 20}}>MENYETUJUI</p>
                                            <p style={{fontSize: 20, marginTop: 70}}>
                                              {uniquePemohon.map((p) => 
                                                (<div key={p?.id_karyawan}>
                                                  {p?.divisi === "PRODUCTION" ? "(IMELDA)" : p?.divisi === "LOGISTIC" ? "(R.WIJIANTI)" :  p?.divisi === "TEKNIK & ADM. MEKANIK" ? "(ABDUL GOFUR)" : "(SRI LESTARI)" }
                                                </div>))}</p>
                                          </Col>
                                        </Row>
                                      </th>
                                    </tr>
                                  </table>
                                </Table>
                          </Col>
                      </Row>
                    </div>
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
              Unduh PDF</Button>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default DokumenPengajuan;