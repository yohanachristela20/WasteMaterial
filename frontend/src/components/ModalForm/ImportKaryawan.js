import React, { useState } from "react";
import { Badge, Button, Modal, Form, Row, Col } from "react-bootstrap";
import { FaFileImport,FaFileCsv } from "react-icons/fa";
import { toast } from 'react-toastify';

const ImportKaryawan = ({showImportModal, setShowImportModal, onSuccess}) => {
  const token = localStorage.getItem("token");
  const [file, setFile] = useState(null);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleFileImport = () => {
    if (file.type !== "text/csv") {
      alert("File harus berformat CSV.");
      return;
    }
  
    const formData = new FormData();
    formData.append("csvfile", file);

    fetch("http://localhost:5000/karyawan/import-csv", {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`,
    },
    })
    .then(async (response) => {
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText);
        }
        return response.json();
    })
    .then((data) => {
        if (data.success) {
            setShowImportModal(false); 
            onSuccess(); 
        } else {
            alert(data.message || "Gagal mengimpor data.");
        }
    })
    .catch((error) => {
        console.error("Error:", error);
        alert(`Terjadi kesalahan: ${error.message}`);
    });

  };

  const downloadCSV = (data) => {
    const header = ["id_karyawan", "nama", "jenis_kelamin", "departemen", "divisi", "tanggal_lahir", "tanggal_masuk", "gaji_pokok"];
  
    const csvContent = [header]
      .map((e) => e.join(","))
      .join("\n");
  
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "format-karyawan.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Modal 
      className="modal-primary"
      show={showImportModal}
      onHide={() => setShowImportModal(false)}>
    <Modal.Header className="text-center pb-1">
      <h3 className="mt-2 mb-0">Import Karyawan</h3>
    </Modal.Header>
    <Modal.Body className="text-left pt-0">
      <hr />
      <div>
      <span className="text-danger required-select">*Gunakan format CSV di bawah ini untuk mengimpor data karyawan.</span>
      <p>Unduh format CSV disini.</p>
      <Button
        className="btn-fill pull-right mb-4"
        type="button"
        variant="warning"
        onClick={() => downloadCSV()}>
        <FaFileCsv style={{ marginRight: '8px' }} />
        Format CSV
      </Button>
      <p>Pilih file CSV yang akan diimport. </p>
        <input type="file" accept=".csv" onChange={handleFileChange} />
        <div className="d-grid d-flex justify-content-end">
          <Button
            className="btn-fill pull-right mt-2 mb-2"
            type="button"
            variant="info"
            onClick={handleFileImport}
            disabled={!file}
          >
            <FaFileImport style={{ marginRight: "8px" }} />
            Import Data
          </Button>
        </div>
      </div>
    </Modal.Body>
    </Modal>
    
  );
};

export default ImportKaryawan;


