import Barang from "../models/BarangModel.js";
import Kategori from "../models/KategoriModel.js";

export const getDataBarang = async(req, res) => {
    try {
        const response = await Barang.findAll();
        res.status(200).json(response); 
    } catch (error) {
        console.log(error.message); 
    }
};

export const getDataBarangById = async(req, res) => {
    try {
        const response = await Barang.findOne({
            where:{
                id_barang: req.params.id_barang 
            }
        });
        res.status(200).json(response); 
    } catch (error) {
        console.log(error.message); 
    }
};

export const getDetailBarangById = async(req, res) => {
    try {
        const dataBarang = await Barang.findAll({
            where:{ id_barang: req.params.id_barang}, 
            include: [
                {
                    model: Kategori,
                    as: 'KategoriBarang', 
                    attributes: ['id_kategori', 'nama', 'satuan', 'harga_barang', 'jenis_barang'],
                },
            ],
        });

        if (!dataBarang){
            return res.status(404).json({message: "Detail barang tidak ditemukan"});
        }

        const { id_kategori, nama, satuan, harga_barang, jenis_barang } = dataBarang.KategoriBarang;

        res.json({
            id_kategori,
            nama,
            satuan, 
            harga_barang, 
            jenis_barang
        });

    } catch (error) {
        console.log(error.message); 
    }
};

export const createDataBarang = async(req, res) => {
    try {
        console.log(req.body);
        await Barang.create(req.body);
        res.status(201).json({msg: "Data barang baru telah dibuat"}); 
    } catch (error) {
        res.status(500).json({message: error.message}); 
    }
};

export const getLastDataBarangId = async (req, res) => {
    try {
        const latestBarang = await Barang.findOne({
            order: [['id_barang', 'DESC']]
        });

        // let nextId = '1-B';
        if (latestBarang) {
					return res.status(200).json({ nextId: latestBarang.id_barang });
        }
        return res.status(200).json({nextId: null});


    } catch (error) {
        console.error(error);
        return res.status(500).json({message: 'error retrieving last id barang'});
    }
};

export const updateBarang = async(req, res) => {
    try {
        await Barang.update(req.body, {
            where: {
							id_barang: req.params.id_barang
            }
        });
        res.status(200).json({msg: "Data barang berhasil diperbarui."});
    } catch (error) {
        res.status(500).json({message: error.message});
    }
};

export const deleteDataBarang = async(req, res) => {
    try {
        await Barang.destroy({
            where: {
                id_barang: req.params.id_barang
            }
        });
        res.status(200).json({msg: "Data barang berhasil dihapus."});
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}


export const detailBarang = async(req, res) => {
    try {
        const dataBarang = await Barang.findAll({
            include: [
                {
                    model: Kategori,
                    as: 'KategoriBarang', 
                    attributes: ['id_kategori', 'nama', 'satuan', 'harga_barang', 'jenis_barang', 'tanggal_penetapan']
                }
            ],
        }); 
        return res.status(200).json(dataBarang);

    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: "Failed to fetch Detail Barang" });
    }
}


export const namaBarang = async(req, res) => {
    try {
        const response = await Barang.findAll({
            attributes: ['id_barang', 'nama'], 
            order: [['nama', 'ASC']]
        }); 
        return res.status(200).json(response);

    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: "Failed to fetch Nama Barang" });
    }
}
