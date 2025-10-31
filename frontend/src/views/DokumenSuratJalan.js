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

function DokumenSuratJalan() {
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

        pdf.save('Surat Jalan.pdf'); 
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
                                            : F.CMPI.LOG.02.00.12 
                                        </div>
                                    ))}
                                  </p>
                                  <p className="mb-1" style={{fontSize: 20}}>
                                    {uniquePengajuan.map((p) => (
                                        <div key={p?.id_pengajuan} >
                                            : 10 JANUARI 2019
                                        </div>
                                    ))}
                                  </p>
                                  <p className="mb-1" style={{fontSize: 20}}>
                                     {uniquePengajuan.map((p) => (
                                        <div key={p?.id_pengajuan} >
                                            : 1 - 0
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
                              <Table> 
                                <table className="w-100">
                                <thead>
                                <tr>
                                    <th className="text-center align-middle p-0" scope="col" colSpan="3" style={{ border: '1px solid grey' }}>
                                    <h3 className="d-flex justify-content-center align-items-center mt-3" style={{fontWeight: 800, marginTop: "50px"}}>
                                        {uniquePengajuan.map((p) => (
                                            <div key={p?.id_pengajuan} className="ml-3">
                                                SURAT IJIN KELUAR WASTE MATERIAL
                                            </div>
                                        ))}
                                    </h3>      
                                    </th>
                                </tr>
                                </thead>

                                <>
																	<tr>
																			<th className="align-middle p-0" scope="col" colSpan="3" style={{ border: '1px solid grey' }}>
																				<Row>
																					<Col md="6" className="text-left ml-2" style={{fontWeight: 500, fontSize: 20}}>
																						<td className="border-bottom-0 border-top-0"><strong>DIBERIKAN IZIN KEPADA</strong></td>
																					</Col>
																					<Col md="6" className="text-right pb-2 " style={{fontWeight: 500, fontSize: 20, marginLeft: -20, marginTop: 12}}>
																						{uniqueID.map((p) => (
																								<div key={p?.id_transaksi}>
																									SURABAYA, {new Date(p?.createdAt).toLocaleString("en-GB", { day: '2-digit', month: '2-digit', year: 'numeric' })}
																								</div>
																						))}
																					</Col>
																				</Row>
																				<Row>
																					<Col md="6" className="text-left ml-2 " style={{fontWeight: 500, fontSize: 20}}>
																						<td className="border-bottom-0 border-top-0 py-1">
																							{uniqueID.map((t) => (
																									<div key={t?.id_transaksi}>
																											{uniquePengajuan.map((p) => (
																												<div key={p?.id_pengajuan} >
																													<strong>NAMA :</strong> {t?.VendorPenjualan?.sopir}
																												</div>
																											))}
																									</div>
																							))}
																						</td>
																					</Col>
																				</Row>
																				<Row>
																					<Col md="6" className="text-left ml-2" style={{fontWeight: 500, fontSize: 20}}>
																						<td className="border-bottom-0 border-top-0 py-2">
																							{uniqueID.map((t) => (
																									<div key={t?.id_transaksi}>
																											{uniquePengajuan.map((p) => (
																												<div key={p?.id_pengajuan} >
																													<strong>NO. KENDARAAN :</strong> {t?.VendorPenjualan?.no_kendaraan || "-"}
																												</div>
																											))}
																									</div>
																							))}
																						</td>
																					</Col>
																				</Row>
																				<Row>
																					<Col md="6" className="text-left ml-2" style={{fontWeight: 500, fontSize: 20}}>
																						<td className="border-bottom-0 border-top-0 pt-2 pb-4"><strong>MEMBAWA BARANG SEBAGAI BERIKUT :</strong></td>
																					</Col>
																				</Row>
																			</th>
																	</tr>
																	<tr>
																			<th className="text-center align-middle" scope="col" style={{ border: '1px solid grey', fontSize: 20 }}>KATEGORI BARANG</th>
																			<th className="text-center align-middle" scope="col"  style={{ border: '1px solid grey', fontSize: 20 }}>SATUAN</th>
																			<th className="text-center align-middle" scope="col" style={{ border: '1px solid grey', fontSize: 20 }}>KUANTITAS</th>
																	</tr>

																	<tbody style={{ border: '1px solid grey' }}>
																		{detailPengajuan.length === 0 ? (
																		<tr><td colSpan={3} className="text-center" style={{ border: '1px solid grey', fontSize: 20 }}>Tidak ada data pengajuan</td></tr>
																		) : (
																		detailPengajuan
																		.map((d, index) => (
																				<tr key={d.id_parent_pengajuan || d.id_pengajuan || Math.random()}>
																					<td className="border-bottom-0 border-top-0 " style={{ border: '1px solid grey', fontSize: 20 }}>{d?.BarangDiajukan?.KategoriBarang?.nama}</td>
																					<td className="text-center border-bottom-0 border-top-0" style={{ border: '1px solid grey', fontSize: 20 }}>{d?.BarangDiajukan?.KategoriBarang?.satuan}</td>
																					<td className="text-center border-bottom-0 border-top-0" style={{ border: '1px solid grey', fontSize: 20 }}>{d?.jumlah_barang}</td>
																				</tr>
																		))
																		)}
																	</tbody>
                                </>

                                <tr>
																	<th className="text-center align-middle p-0" scope="col" colSpan="3" style={{ border: '1px solid grey' }}>
																			<p className="mt-3 text-left ml-3" style={{fontSize: 20}}>
																			{uniqueID.map((t) => (
																					<div key={t?.id_transaksi}>
																							{uniquePengajuan.map((p) => (
																								<div key={p?.id_pengajuan} >
																										<strong>AKAN DISERAHKAN KE : </strong> {t?.VendorPenjualan?.nama}
																								</div>
																							))}
																					</div>
																			))}
																			</p>
																	</th>
                                </tr>

                                <tr>
                                <th className="text-center align-middle p-0" scope="col" colSpan="3" style={{ border: '1px solid grey' }}>
                                    <Row>
                                    <Col md="4">
                                        <p style={{fontSize: 20, marginTop: 20}}>LOGISTIK</p>
																				<p style={{fontSize: 20, marginTop: 150}}></p>
                                    </Col>
                                    <Col md="4">
                                        <p style={{fontSize: 20, marginTop: 20}}>HRD</p>
																				<p style={{fontSize: 20, marginTop: 150}}></p>
                                    </Col>
                                    <Col md="4">
                                        <p style={{fontSize: 20, marginTop: 20}}>SATPAM</p>
                                        <p style={{fontSize: 20, marginTop: 150}}></p>
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

export default DokumenSuratJalan;