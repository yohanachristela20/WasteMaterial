import React, { useState, useEffect, useMemo, useRef } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import {FaFilePdf} from 'react-icons/fa'; 
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

function DokumenBPBB() {
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

        pdf.save('Dokumen BPBB.pdf'); 
      };

  const jumlahTotal = detailPengajuan.reduce((acc, item) => {
    const total = Number(item?.total);
    return acc + total;
  }, 0);
   
  return (
    <>
      <Container fluid >
        <Row>
          <Col className="card-screening">
            <Card className="card-screening p-4">
              <div ref={contentRef} className="card-padding">
                <Card.Body className="table-responsive px-3">
                    <Row style={{ border: '1px solid grey' }}>
                        <Col md="2" className="py-0">
                            <div className="left-column ml-4 mt-4">
                                <img src={require("assets/img/campina-logo.png")} alt="company-logo" className="dok-logo"/>
                            </div>
                        </Col>
                        <Col md="5" className="py-0">
                            <h3 className="font-title-header">PT. CAMPINA ICE CREAM INDUSTRY</h3>
                        </Col>
                        <Col md="5" style={{ borderLeft: '1px solid grey'}}>
                            <Row>
                                <Col md="6" className="mt-4">
                                    <p className="mb-1 font-desc-header">NO. DOKUMEN</p>
                                    <p className="mb-1 font-desc-header">TGL. DIKELUARKAN</p>
                                    <p className="mb-1 font-desc-header">NO. REVISI</p>
                                </Col>
                                <Col md="6" className="mt-4">
                                  <p className="mb-1 font-desc-header">
                                    : F.CMPI.LOG.02.00.07
                                  </p>
                                  <p className="mb-1 font-desc-header">
                                    : 04 OKTOBER 2013
                                  </p>
                                  <p className="mb-1 font-desc-header">
                                    : 1 - 0
                                  </p>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                    
                    <div className="table-responsive">
                      <Row >
                        <Col md="12" className="mx-auto px-0 card-screening" >
                          <Table> 
                            <table className="w-100">
                              <thead>
                                <tr>
                                  <th className="text-center align-middle p-0" scope="col" colSpan="6" style={{ border: '1px solid grey' }}>
                                    <h3 className="d-flex justify-content-center align-items-center mt-3" style={{fontWeight: 800, marginTop: "50px"}}>
                                      <div className="ml-3 font-sub-title">
                                        BUKTI PENERIMAAN BARANG BEKAS
                                      </div>
                                    </h3>
                                  </th>
                                </tr>

                                <tr>
                                  <th className="align-middle font-sub-desc" scope="row" rowSpan="2" colSpan="2" style={{ border: '1px solid grey' }}>
                                    {uniquePengajuan.map((p) => (
                                        <div key={p?.id_pengajuan} style={{fontWeight: 500}} className="ml-3 font-sub-desc">
                                          <strong>DITERIMA DARI BAGIAN</strong> : {p?.Pemohon?.divisi}
                                        </div>
                                    ))}
                                  </th>
                                  <th className="align-middle font-sub-desc" colSpan="2" style={{ border: '1px solid grey'}}>
                                    {uniqueID.map((p) => (
                                        <div key={p?.id_transaksi} style={{fontWeight: 500}} className="ml-3 font-sub-desc">
                                          <strong>NO. :</strong>  {p?.id_transaksi}
                                        </div>
                                    ))}
                                  </th>
                                  <th className="align-middle font-sub-desc" scope="col" colSpan="2" rowSpan="2" style={{ border: '1px solid grey'}}>
                                    {uniqueID.map((p) => (
                                        <div key={p?.id_transaksi} style={{fontWeight: 500}} className="ml-3 font-sub-desc">
                                          <strong>SYARAT PEMBAYARAN :</strong>  {p?.cara_bayar}
                                        </div>
                                    ))}
                                  </th>
                                </tr>
                                <tr>
                                  <th className="align-middle" colSpan="2" style={{ border: '1px solid grey'}}>
                                    {uniqueID.map((p) => (
                                        <div key={p?.id_transaksi} style={{fontWeight: 500}} className="ml-3 font-sub-desc">
                                          <strong style={{marginLeft: -2}}>TANGGAL :</strong> {new Date(p?.createdAt).toLocaleString("en-GB", { timeZone: "Asia/Jakarta" }).replace(/\//g, '/').replace(',', '')}
                                        </div>
                                    ))}
                                  </th>
                                </tr>
                              </thead>

                              <tr>
                                <th className="text-center align-middle font-table-header" scope="row" rowSpan="2" colSpan="2">NAMA KATEGORI</th>
                                <th className="text-center align-middle font-table-header" scope="row" rowSpan="2">SATUAN</th>
                                <th className="text-center align-middle font-table-header" scope="row" rowSpan="2">QTY</th>
                                <th className="text-center align-middle font-table-header" scope="col" colSpan="2">DIISI BAGIAN PENJUALAN</th>
                              </tr>
                              <tr>
                                <th className="text-center align-middle font-table-header" scope="col">HARGA JUAL</th>
                                <th className="text-center align-middle font-table-header" scope="col">JUMLAH</th>
                              </tr>

                              <tbody style={{ border: '1px solid grey' }}>
                                {detailPengajuan.length === 0 ? (
                                  <tr><td colSpan={5} className="text-center" style={{ border: '1px solid grey', fontSize: 17 }}>Tidak ada data pengajuan</td></tr>
                                ) : (
                                  detailPengajuan
                                  .map((d, index) => (
                                    <tr key={d.id_parent_pengajuan || d.id_pengajuan || Math.random()}>
                                      <td className="border-bottom-0 border-top-0 font-table-body" colSpan="2">{d?.BarangDiajukan?.KategoriBarang?.nama}</td>
                                      <td className="text-center border-bottom-0 border-top-0 font-table-body">{d?.BarangDiajukan?.KategoriBarang?.satuan}</td>
                                      <td className="text-center border-bottom-0 border-top-0 font-table-body">{d?.jumlah_barang}</td>

                                      <td className="text-center border-bottom-0 border-top-0 font-table-body">
                                        <div className="d-flex justify-content-between">
                                          <span>Rp.</span>
                                          <span>{formatRupiah(d?.BarangDiajukan?.KategoriBarang?.harga_barang)}</span>
                                        </div>
                                      </td>

                                      <td className="text-center border-bottom-0 border-top-0 font-table-body">
                                        <div className="d-flex justify-content-between">
                                          <span>Rp.</span>
                                          <span>{formatRupiah(d?.total)}</span>
                                        </div>
                                      </td>
                                    </tr>
                                  ))
                                )}
                              </tbody>

                              <tr>
                                <th scope="col" colSpan="5" className="font-table-body" style={{ border: '1px solid grey', fontWeight: 500 }}>
                                    {uniqueID.map((t) => (
                                      <div key={t?.id_transaksi}>
                                          {uniquePengajuan.map((p) => (
                                              <div key={p?.id_pengajuan} >
                                              <strong>DIJUAL KE:</strong> {t?.VendorPenjualan?.nama}
                                              </div>
                                          ))}
                                      </div>
                                  ))}
                                </th>
                               <td className="text-center font-table-body" style={{border: '1px solid grey', fontWeight: 700 }}>
                                  <div className="d-flex justify-content-between">
                                    <span>Rp.</span>
                                    <span>{formatRupiah(jumlahTotal)}</span>
                                  </div>
                                </td>
                              </tr>

                              

                              <tr>
                                <th className="text-center align-middle p-0" scope="col" colSpan="6" style={{ border: '1px solid grey' }}>
                                  <Row>
                                    <Col md="3">
                                      <p className="font-header-sign">MENYERAHKAN</p>
                                    </Col>
                                    <Col md="3">
                                      <p className="font-header-sign">MENERIMA</p>
                                    </Col>
                                    <Col md="6">
                                      <p className="font-header-sign">MENGETAHUI</p>
                                    </Col>
                                  </Row>

                                  <Row>
                                    <Col md="3">
                                      <p className="font-body-sign">
                                        {uniqueID.map((p) => (
                                          <div key={p?.id_transaksi}>
                                            ({p?.Petugas?.nama})
                                          </div>
                                        ))}
                                      </p>
                                    </Col>
                                    <Col md="3">
                                      <p className="font-body-sign"></p>
                                    </Col>
                                    <Col md="3">
                                      <p className="font-body-sign">(FINANCE)</p>
                                    </Col>
                                    <Col md="3">
                                      <p className="font-body-sign">(KASIR)</p>
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

export default DokumenBPBB;