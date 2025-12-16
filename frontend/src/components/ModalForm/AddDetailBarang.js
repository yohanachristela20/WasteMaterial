import { Badge, Button, Modal, Form, Row, Col, OverlayTrigger, Tooltip, Popover, Alert } from "react-bootstrap";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from 'react-toastify';
import { FaExclamationCircle, FaSearch, FaWindowClose } from "react-icons/fa";

const AddDetailBarang = ({ showAddModal, setShowAddModal, onSuccess }) => {
	const [id_kategori, setIdKategori] = useState("");
	const [namaBaru, setNamaBaru] = useState("");
	const [tanggal_penetapan, setTanggalPenetapan] = useState("");
	const [satuan, setSatuan] = useState("");
	const [harga_barang, setHargaBarang] = useState("");
	const [jenis_barang, setJenisBarang] = useState("");
	const [jenisBarangError, setJenisBarangError] = useState(false);
	const [satuanError, setSatuanError] = useState(false);
	const [showDropdown, setShowDropdown] = useState(false);
	const [selectedValue, setSelectedValue] = useState("");
	const [show, setShow] = useState(true);
	const [namaBarangError, setNamaBarangError] = useState(false);
	const [detailBarang, setDetailBarang] = useState([]); 


	const token = localStorage.getItem("token");

	const allOptions = [
		{ value: "BAG", label: "BAG" },
		{ value: "BTG", label: "BTG" },
		{ value: "BTL", label: "BTL" },
		{ value: "BOX", label: "BOX" },
		{ value: "BKS", label: "BKS" },
		{ value: "CAN", label: "CAN" },
		{ value: "CAR", label: "CAR" },
		{ value: "CS", label: "CS" },
		{ value: "CC", label: "CC" },
		{ value: "CM", label: "CM" },
		{ value: "DR", label: "DR" },
		{ value: "DOZ", label: "DOZ" },
		{ value: "EA", label: "EA" },
		{ value: "FT", label: "FT" },
		{ value: "GLN", label: "GLN" },
		{ value: "GR", label: "GR" },
		{ value: "INC", label: "INC" },
		{ value: "JRG", label: "JRG" },
		{ value: "KLG", label: "KLG" },
		{ value: "KG", label: "KG" },
		{ value: "LBR", label: "LBR" },
		{ value: "LT", label: "LT" },
		{ value: "LSN", label: "LSN" },
		{ value: "M", label: "M" },
		{ value: "MG", label: "MG" },
		{ value: "ML", label: "ML" },
		{ value: "PAC", label: "PAC" },
		{ value: "PL", label: "PL" },
		{ value: "PLT", label: "PLT" },
		{ value: "PSG", label: "PSG" },
		{ value: "PCS", label: "PCS" },
		{ value: "RIM", label: "RIM" },
		{ value: "ROL", label: "ROL" },
		{ value: "ZAK", label: "ZAK" },
		{ value: "SET", label: "SET" },
		{ value: "TB", label: "TB" },
		{ value: "UNT", label: "UNT" },
		{ value: "GAL", label: "GAL" },
	];

	const [searchTerm, setSearchTerm] = useState('');
	const [filteredOptions, setFilteredOptions] = useState(allOptions);

	const handleSearchChange = (e) => {
			const term = e.target.value.toLowerCase();
			setSearchTerm(term);
			const filtered = allOptions.filter(option =>
			option.label.toLowerCase().includes(term)
			);
			setFilteredOptions(filtered);
	};

	const handleSelect = (option) => {
		setSelectedValue(option.value);
		setSearchTerm(option.label);
		setSatuan(option.value);
		setSatuanError(false);
		setShowDropdown(false);
	};

	const getDataBarang = async () =>{
		try {
			const response = await axios.get("http://localhost:5001/kategori-barang", {
				headers: {
					Authorization: `Bearer ${token}`,
			},
			});
			setDetailBarang(response.data);
		} catch (error) {
			console.error("Error fetching data:", error.message); 
		}
	};

	useEffect(()=> {
			getDataBarang();
	}, []); 

	const IdBarang = async(e) => {
		const response = await axios.get('http://localhost:5001/getLastBarangId', {
			headers: {
				Authorization: `Bearer ${token}`,
			}
		});

		let newId = "K00001"; //spare data up to 100.000 data 
		if (response.data?.nextId) {
			const lastIdNumber = parseInt(response.data.nextId.substring(1), 10);
			const incrementedIdNumber = (lastIdNumber + 1).toString().padStart(5, '0');
			newId= `K${incrementedIdNumber}`;
		}

		setIdKategori(newId);
	};

	useEffect(() => {
			const now = new Date();
			const jakartaTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Jakarta"}));
			const yyyy = jakartaTime.getFullYear();
			const mm = String(jakartaTime.getMonth() + 1).padStart(2, '0'); // bulan dimulai dari 0
			const dd = String(jakartaTime.getDate()).padStart(2, '0');
			const formattedDate = `${yyyy}-${mm}-${dd}`;
			setTanggalPenetapan(formattedDate); 
			IdBarang();
	}, []);

	const normalizeString = (str) => {
    if (typeof str !== 'string') return '';
    return str.replace(/\s/g, '').toLowerCase();
  };

	const sameName = detailBarang.find(nb => normalizeString(nb.nama) === normalizeString(namaBaru));
	console.log("sameName:", sameName);

	const saveDetailBarang = async (e) => {
			e.preventDefault();

			if (!jenis_barang) {
					setJenisBarangError(true);
					return;
			}
			if (!satuan) {
					setSatuanError(true);
					return;
			}
			if (sameName) {
				setNamaBarangError(true);
				return;
			}

			try {
					await axios.post('http://localhost:5001/kategori-barang', {
							id_kategori,
							nama: namaBaru,
							satuan,
							harga_barang,
							jenis_barang,
							tanggal_penetapan,
					}, {
							headers: {
									Authorization: `Bearer ${token}`,
							},
					});
					window.location.reload();
					setShowAddModal(false); 
					onSuccess();
					
			} catch (error) {
					console.log(error.message);
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

	const handleHargaBarang = (value) => {
			const numericValue = value.replace(/\D/g, "");
			setHargaBarang(numericValue);
	};

	// const listNamaBarang = detailBarang.map(n => n.nama);
	// console.log("listNamaBarang: ", listNamaBarang);

	const handleNamaChange = (value) => {
		// setNamaDetailBarang(value);
		setNamaBaru(value);
	};


	if (!show) return null;

	return (
		<>
			<div>
				<Modal
						className="modal-primary"
						show={showAddModal}
						onHide={() => setShowAddModal(false)}
				>
					<Modal.Header>
						<h3 className="mt-2 mb-0"><strong>Form Kategori Barang</strong></h3>
					</Modal.Header>
					<Modal.Body className="text-left pt-0 mt-2 mb-1">
							<Form onSubmit={saveDetailBarang}>
							<span className="text-danger required-select">(*) Wajib diisi.</span>
								<Row>
									<Alert className="mb-0 mt-2 mx-3" variant="info">
										<Alert.Heading className="mt-2 mb-0" style={{fontWeight: "500"}}><FaExclamationCircle className="info-icon mr-3"/><strong>Unit of Measure</strong><hr/></Alert.Heading>
										<p style={{fontSize: "12px"}}>BAG=BAG; BTG=BATANG; BTL=BOTTLE; BOX=BOX; BKS=BUNGKUS; CAN=CAN; CAR=CARTON; CS=CASE; CC=CC; CM=CENTIMETER; DR=DRUM; DOZ=DUS; EA=EACH; FT=FEET; GLN=GALON; GR=GRAM; INC=INCH; JRG=JIRIGEN; KLG=KALENG; KG=KILOGRAM; LBR=LEMBAR; LT=LITER; LSN=LUSIN; M=METER; MG=MILIGRAM; ML=MILILITER; PAC=PAC; PL=PAIL; PLT=PALLET; PSG=PASANG; PCS=PIECE; RIM=RIM; ROL=ROL; ZAK=SAK; SET=SET; TB=TABUNG; UNT=UNIT; GAL=US GALLON</p>
									</Alert>
								</Row>
								<Row>
									<Col md="12" className="mt-3 mb-2">
										<Form.Group>
												<label>ID Detail Barang</label>
												<Form.Control
														type="text"
														value={id_kategori}
														readOnly
												/>
										</Form.Group>
									</Col>
								</Row>
								<Row className="mb-2">
										<Col md="12">
												<Form.Group>
												<span className="text-danger">*</span>
														<label>Nama Barang</label>
														<Form.Control
																type="text"
																value={namaBaru}
																uppercase
																required
																onChange={(e) => handleNamaChange(e.target.value.toUpperCase())}
														/>
												</Form.Group>
												{namaBarangError && <span className="text-danger required-select">Nama barang tidak boleh sama!</span>}
										</Col>
								</Row>
								<Row className="mb-2">
									{/* <Col md="12">
													<Form.Group>
													<span className="text-danger">*</span>
													<label>Satuan</label>
															<>
															<div>
																	<span><FaSearch /></span>
																	<Form.Control
																			type="text"
																			className="form-control"
																			placeholder="Cari satuan..."
																			value={searchTerm}
																			onChange={handleSearchChange}
																	/>

															</div>
																	<OverlayTrigger 
																	key={top}
																	placement="top"
																	
																	// style={{ width: '200px', maxWidth: 'none' }}
																	overlay={
																					<Popover id={`popover-top`} style={{ backgroundColor: "#e2feff"}}>
																									<Popover.Header as="h4" className="mt-0"  style={{ backgroundColor: "#b8f3f5ff"}} >
																													Deskripsi Satuan
																									</Popover.Header>
																									<Popover.Body>
																													<div style={{fontSize: '12px', marginTop: '5px', marginBottom: '5px'}} >                                                
																													BAG=BAG; BTG=BATANG; BTL=BOTTLE; BOX=BOX; BKS=BUNGKUS; CAN=CAN; CAR=CARTON; CS=CASE; CC=CC; CM=CENTIMETER; DR=DRUM; DOZ=DUS; EA=EACH; FT=FEET; GLN=GALON; GR=GRAM; INC=INCH; JRG=JIRIGEN; KLG=KALENG; KG=KILOGRAM; LBR=LEMBAR; LT=LITER; LSN=LUSIN; M=METER; MG=MILIGRAM; ML=MILILITER; PAC=PAC; PL=PAIL; PLT=PALLET; PSG=PASANG; PCS=PIECE; RIM=RIM; ROL=ROL; ZAK=SAK; SET=SET; TB=TABUNG; UNT=UNIT; GAL=US GALLON</div>
																									</Popover.Body>
																					</Popover>
																	}
																	
													>
															<Form.Select className="mt-2 form-control" value={satuan} onChange={(e) => {
																			setSatuan(e.target.value);
																			setSatuanError(false);
															}}
															>
																	{filteredOptions.map(option => (
																			<option key={option.value} value={option.value}>
																					{option.label}
																			</option>
																	))}
															</Form.Select>
															</OverlayTrigger>

															</>

													{satuanError && <span className="text-danger required-select">Satuan belum dipilih</span>}
													</Form.Group>
									</Col> */}

									<Col md="12">
											<Form.Group>
												<span className="text-danger">*</span>
												<label>Satuan</label>
												<div style={{position: "relative"}}>
														<FaSearch 
															style={{
																	position: "absolute",
																	left: "10px",
																	top: "50%", 
																	transform: "translateY(-50%)",
																	color: "#aaa",
															}}
														/>
														<Form.Control
																type="text"
																className="form-control"
																placeholder="Cari Satuan..."
																style={{paddingLeft: "35px"}}
																value={searchTerm}
																onChange={handleSearchChange}
																onFocus={() => setShowDropdown(true)}
																onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
														/>

														{showDropdown && filteredOptions.length > 0 && (
															<div 
																	style={{
																			position: "absolute",
																			zIndex: 10,
																			width: "100%",
																			background: "#fff",
																			border: "1px solid #ddd",
																			borderRadius: "6px",
																			marginTop: "2px",
																			maxHeight: "180px",
																			overflowY: "auto",
																			boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
																	}}
															>
																	
															{filteredOptions.map((option) => (
																	<div
																			key={option.value}
																			onClick={() => handleSelect(option)}
																			style={{
																					padding: "8px 12px",
																					cursor: "pointer",
																					transition: "background 0.2s",
																			}}
																			onMouseEnter={(e) =>
																					(e.currentTarget.style.background = "#f5f5f5")
																			}
																			onMouseLeave={(e) =>
																					(e.currentTarget.style.background = "transparent")
																			}
																	>
																			{option.label}
																	</div>
															))}
															</div>
															)}
														{satuanError && <span className="text-danger required-select">Satuan belum dipilih</span>}

												</div>
											</Form.Group>
									</Col>
								</Row>
								<Row className="mb-2">
										<Col md="12">
												<Form.Group>
												<span className="text-danger">*</span>
														<label>Harga Barang</label>
														<Form.Control
																placeholder="Rp"
																type="text"
																required
																value={"Rp " + formatRupiah(harga_barang)}
																onChange={(e) => handleHargaBarang(e.target.value)}
														/>
												</Form.Group>
										</Col>
								</Row>
								<Row className="mb-2">
										<Col md="12">
											<Form.Group>
											<span className="text-danger">*</span>
											<label>Jenis Barang</label>
											<Form.Select 
											className="form-control"
											required
											value={jenis_barang}
											onChange={(e) => {
													setJenisBarang(e.target.value);
													setJenisBarangError(false);
											}}
											>
													<option className="placeholder-form" key='blankChoice' hidden value>Pilih Jenis Barang</option>
													<option value="ASSET">ASSET</option>
													<option value="NON-ASSET">NON-ASSET</option>
											</Form.Select>
											{jenisBarangError && <span className="text-danger required-select">Jenis barang belum dipilih</span>}
											</Form.Group>
										</Col>
								</Row>
								<Row className="mb-2">
										<Col md="12">
												<Form.Group>
												<span className="text-danger">*</span>
														<label>Tanggal Penetapan</label>
														<Form.Control
																type="date"
																value={tanggal_penetapan}
																required
																onChange={(e) => setTanggalPenetapan(e.target.value)}
														/>
												</Form.Group>
										</Col>
								</Row>
								
								<Row>
										<Col md="12">
												<div className="d-flex flex-column">
														<Button className="btn-fill w-100 my-3" type="submit" variant="primary">
																Simpan
														</Button>
												</div>
										</Col>
								</Row>
							</Form>
					</Modal.Body>
				</Modal>
			</div>
		</>
	);
};

export default AddDetailBarang;
