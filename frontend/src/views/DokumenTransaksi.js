import React, { useState, useEffect, useMemo, useRef } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import {FaFilePdf, FaPlusCircle, FaTrashAlt} from 'react-icons/fa'; 
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

function DokumenTransaksi() {
  const location = useLocation();
  const history = useHistory();
  const contentRef = useRef(null);

  const [selectedPengajuan, setSelectedPengajuan] = useState(location?.state?.selectedPengajuan || null);
  const [detailPengajuan, setDetailPengajuan] = useState([]);
  const [detailTransaksi, setDetailTransaksi] = useState([]);

  const [sortBy, setSortBy] = useState("id_pengajuan");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
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

  const uniqueJenisBarang = [
    ...new Map(
      detailPengajuan.map((d) => [d?.BarangDiajukan?.KategoriBarang?.jenis_barang, d?.BarangDiajukan?.KategoriBarang])
    ).values(),
  ];
  
  const uniqueID = [
    ...new Map(
      detailTransaksi.map((d) => [d?.id_transaksi, d])
    ).values(),
  ];

  const uniquePengajuan = [
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

        pdf.save('Dokumen Transaksi.pdf'); 
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
                                  <p className="mb-1" style={{fontSize: 20}}>
                                    {uniquePengajuan.map((p) => (
                                        <div key={p?.id_pengajuan} >
                                        {p?.jenis_pengajuan === "PENJUALAN" || p?.jenis_pengajuan === "Penjualan" ? ": F.CMPI.LOG.02.00.13" : ": F.CMPI.LOG.02.00.06"}
                                        </div>
                                    ))}
                                  </p>
                                  <p className="mb-1" style={{fontSize: 20}}>
                                    {uniquePengajuan.map((p) => (
                                        <div key={p?.id_pengajuan} >
                                        {p?.jenis_pengajuan === "PENJUALAN" || p?.jenis_pengajuan === "Penjualan" ? ": 10 JANUARI 2014" : ":  30 MARET 2015"}
                                        </div>
                                    ))}
                                  </p>
                                  <p className="mb-1" style={{fontSize: 20}}>
                                     {uniquePengajuan.map((p) => (
                                        <div key={p?.id_pengajuan} >
                                        {p?.jenis_pengajuan === "PENJUALAN" || p?.jenis_pengajuan === "Penjualan" ? ": 0 - 0" : ":  2 - 0"}
                                        </div>
                                    ))}
                                  </p>
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
                                            {uniquePengajuan.map((p) => (
                                                <div key={p?.id_pengajuan} className="ml-3">
                                                {p?.jenis_pengajuan === "PENJUALAN" || p?.jenis_pengajuan === "Penjualan" ? "PENJUALAN WASTE MATERIAL" : "FORMULIR APPROVAL SCRAPPING WASTE MATERIAL"}
                                                </div>
                                            ))}
                                        </h3>
                                        <p className="d-flex justify-content-center align-items-center" style={{fontSize: 20}}>NO. :
                                            {uniqueID.map((p) => (
                                                <div key={p?.id_transaksi} className="ml-3">
                                                {p?.id_transaksi}
                                                </div>
                                            ))}
                                        </p>
                                        <p className="d-flex justify-content-center align-items-center" style={{fontSize: 20}}>TANGGAL : 
                                            {uniqueID.map((p) => (
                                                <div key={p?.id_transaksi} className="ml-3">
                                                    {new Date(p?.createdAt).toLocaleString("en-GB", { timeZone: "Asia/Jakarta" }).replace(/\//g, '/').replace(',', '')}
                                                </div>
                                            ))}
                                        </p>
                                      </th>
                                    </tr>
                                  </thead>

                                  {uniqueJenisBarang.length > 1 ? (
                                    uniqueJenisBarang.map((j) => (
                                      <React.Fragment>
                                        <tr>
                                          <th className="text-center align-middle p-0" scope="col" colSpan="6" style={{ border: '1px solid grey' }}>
                                            <h4 className="d-flex justify-content-center align-items-center mt-3" style={{fontWeight: 800, marginTop: "50px"}}>
                                              {j?.jenis_barang === "ASSET" ? "ASSET" : "NON-ASSET"}
                                            </h4>
                                          </th>
                                        </tr>

                                        <tr>
                                            <th className="text-center align-middle w-25" scope="row" rowSpan="2" style={{ border: '1px solid grey', fontSize: 20 }}>NAMA BARANG</th>
                                            <th className="text-center align-middle" scope="row" rowSpan="2" style={{ border: '1px solid grey', fontSize: 20 }}>ID KATEGORI</th>
                                            <th className="text-center align-middle" scope="row" rowSpan="2" style={{ border: '1px solid grey', fontSize: 20 }}>DIVISI</th>
                                            <th className="text-center align-middle" scope="row" rowSpan="2" style={{ border: '1px solid grey', fontSize: 20 }}>QTY</th>
                                            <th className="text-center align-middle" scope="row" rowSpan="2" style={{ border: '1px solid grey', fontSize: 20 }}>SATUAN</th>
                                            <th className="text-center align-middle w-25" scope="row" rowSpan="2" style={{ border: '1px solid grey', fontSize: 20 }}>KETERANGAN</th>
                                        </tr>
                                       

                                        <tbody style={{ border: '1px solid grey' }}>
                                          {detailPengajuan.length === 0 ? (
                                            <tr><td colSpan={6} className="text-center" style={{ border: '1px solid grey', fontSize: 20 }}>Tidak ada data pengajuan</td></tr>
                                          ) : (
                                            detailPengajuan
                                            .filter((d) => d?.BarangDiajukan?.KategoriBarang?.jenis_barang === j?.jenis_barang)
                                            .map((d, index) => (
                                              <tr key={d.id_parent_pengajuan || d.id_pengajuan || Math.random()}>
                                                <td className="border-bottom-0 border-top-0 " style={{ border: '1px solid grey', fontSize: 20 }}>{d?.BarangDiajukan?.KategoriBarang?.nama}</td>
                                                <td className="text-center border-bottom-0 border-top-0 " style={{ border: '1px solid grey', fontSize: 20 }}>{d?.BarangDiajukan?.id_kategori}</td>
                                                <td className="text-center border-bottom-0 border-top-0 " style={{ border: '1px solid grey', fontSize: 20 }}>{d?.Pemohon?.divisi}</td>
                                                <td className="text-center border-bottom-0 border-top-0" style={{ border: '1px solid grey', fontSize: 20 }}>{d?.jumlah_barang}</td>
                                                <td className="text-center border-bottom-0 border-top-0" style={{ border: '1px solid grey', fontSize: 20 }}>{d?.BarangDiajukan?.KategoriBarang?.satuan}</td>
                                                <td className="text-center border-bottom-0 border-top-0" style={{ border: '1px solid grey', fontSize: 20 }}>
                                                    {uniqueID.map((p) => (
                                                        <div key={p?.id_transaksi} className="ml-3">
                                                        {p?.keterangan}
                                                        </div>
                                                    ))}
                                                </td>
                                              </tr>
                                            ))
                                          )}
                                        </tbody>
                                        
                                      </React.Fragment>
                                    ))
                                  ) : (
                                    <>
                                      <tr>
                                          <th className="text-center align-middle p-0" scope="col" colSpan="6" style={{ border: '1px solid grey' }}>
                                            <h4 className="d-flex justify-content-center align-items-center mt-3" style={{fontWeight: 800, marginTop: "50px"}}>
                                              {uniqueJenisBarang[0]?.jenis_barang}
                                            </h4>
                                          </th>
                                      </tr>
                                     <tr>
                                        <th className="text-center align-middle w-25" scope="row" rowSpan="2" style={{ border: '1px solid grey', fontSize: 20 }}>NAMA BARANG</th>
                                        <th className="text-center align-middle" scope="row" rowSpan="2" style={{ border: '1px solid grey', fontSize: 20 }}>ID KATEGORI</th>
                                        <th className="text-center align-middle" scope="row" rowSpan="2" style={{ border: '1px solid grey', fontSize: 20 }}>DIVISI</th>
                                        <th className="text-center align-middle" scope="row" rowSpan="2" style={{ border: '1px solid grey', fontSize: 20 }}>QTY</th>
                                        <th className="text-center align-middle" scope="row" rowSpan="2" style={{ border: '1px solid grey', fontSize: 20 }}>SATUAN</th>
                                        <th className="text-center align-middle w-25" scope="row" rowSpan="2" style={{ border: '1px solid grey', fontSize: 20 }}>KETERANGAN</th>
                                    </tr>

                                      <tbody style={{ border: '1px solid grey' }}>
                                          {detailPengajuan.length === 0 ? (
                                            <tr><td colSpan={8} className="text-center" style={{ border: '1px solid grey', fontSize: 20 }}>Tidak ada data pengajuan</td></tr>
                                          ) : (
                                            detailPengajuan
                                            .map((d, index) => (
                                              <tr key={d.id_parent_pengajuan || d.id_pengajuan || Math.random()}>
                                                <td className="border-bottom-0 border-top-0 " style={{ border: '1px solid grey', fontSize: 20 }}>{d?.BarangDiajukan?.KategoriBarang?.nama}</td>
                                                <td className="text-center border-bottom-0 border-top-0 " style={{ border: '1px solid grey', fontSize: 20 }}>{d?.BarangDiajukan?.id_kategori}</td>
                                                <td className="text-center border-bottom-0 border-top-0 " style={{ border: '1px solid grey', fontSize: 20 }}>{d?.Pemohon?.divisi}</td>
                                                <td className="text-center border-bottom-0 border-top-0" style={{ border: '1px solid grey', fontSize: 20 }}>{d?.jumlah_barang}</td>
                                                <td className="text-center border-bottom-0 border-top-0" style={{ border: '1px solid grey', fontSize: 20 }}>{d?.BarangDiajukan?.KategoriBarang?.satuan}</td>
                                                <td className="text-center border-bottom-0 border-top-0" style={{ border: '1px solid grey', fontSize: 20 }}>
                                                    {uniqueID.map((p) => (
                                                        <div key={p?.id_transaksi} className="ml-3">
                                                        {p?.keterangan}
                                                        </div>
                                                    ))}
                                                </td>

                                              </tr>
                                            ))
                                          )}
                                        </tbody>

                                    </>
                                  )}

                                  <tr>
                                    <th className="text-center align-middle p-0" scope="col" colSpan="6" style={{ border: '1px solid grey' }}>
                                      <p className="mt-3 text-left ml-3" style={{fontSize: 20}}>
                                        {uniqueID.map((t) => (
                                            <div key={t?.id_transaksi}>
                                                 {uniquePengajuan.map((p) => (
                                                    <div key={p?.id_pengajuan} >
                                                     <strong>{p?.jenis_pengajuan === "PENJUALAN" || p?.jenis_pengajuan === "Penjualan" ? "DIJUAL KE :" : "DITITIPKAN KE :"}</strong> {t?.VendorPenjualan?.nama}
                                                    </div>
                                                ))}
                                            </div>
                                        ))}
                                      </p>
                                    </th>
                                  </tr>

                                  <tr>
                                    <th className="text-center align-middle p-0" scope="col" colSpan="6" style={{ border: '1px solid grey' }}>
                                      <Row>
                                        <Col md="4">
                                          <p style={{fontSize: 20, marginTop: 20}}>PEMOHON</p>
                                          <p style={{fontSize: 20, marginTop: 70}}>
                                            {uniqueID.map((p) => (
                                              <div key={p?.id_transaksi}>
                                                ({p?.Petugas?.nama})
                                              </div>
                                            ))}
                                          </p>
                                        </Col>
                                        <Col md="4">
                                          <p style={{fontSize: 20, marginTop: 20}}>PENERIMA</p>
                                          <p style={{fontSize: 20, marginTop: 70}}>(MUJIONO)</p>
                                        </Col>
                                        <Col md="4">
                                          <p style={{fontSize: 20, marginTop: 20}}>MENYETUJUI</p>
                                          <p style={{fontSize: 20, marginTop: 70}}>(R. WIJIANTI)</p>
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

export default DokumenTransaksi;