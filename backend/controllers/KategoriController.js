import Kategori from "../models/KategoriModel.js";
import Barang from "../models/BarangModel.js";

export const getDetailBarang = async(req, res) => {
    try {
        const response = await Kategori.findAll();
        res.status(200).json(response); 
    } catch (error) {
        console.log(error.message); 
    }
};

export const getDetailBarangById = async(req, res) => {
    try {
			const response = await Kategori.findOne({
				where:{
						id_kategori: req.params.id_kategori 
				}
			});
			res.status(200).json(response); 
    } catch (error) {
			console.log(error.message); 
    }
};

export const createDetailBarang = async(req, res) => {
    try {
        console.log(req.body);
        await Kategori.create(req.body);
        res.status(201).json({msg: "Master data barang baru telah dibuat"}); 
    } catch (error) {
        res.status(500).json({message: error.message}); 
    }
};

export const getLastBarangId = async (req, res) => {
    try {
        const latestBarang = await Kategori.findOne({
            order: [['id_kategori', 'DESC']]
        });

        let nextId = '1-K';
        if (latestBarang && latestBarang.id_kategori) {
            const lastNumeric = parseInt(latestBarang.id_kategori.split('-')[0], 10);
            const incremented = lastNumeric + 1;
            nextId = `${incremented}-K`;
        }
        console.log("getLastBarangId: ", nextId);
        return res.status(200).json({nextId});


    } catch (error) {
        console.error(error);
        return res.status(500).json({message: 'error retrieving last id detail barang'});
    }
};

export const updateKategori = async(req, res) => {
    try {
        await Kategori.update(req.body, {
            where: {
                id_kategori: req.params.id_kategori
            }
        });
        res.status(200).json({msg: "Master barang berhasil diperbarui."});
    } catch (error) {
        res.status(500).json({message: error.message});
    }
};

export const deleteDetailBarang = async(req, res) => {
    try {
        await Kategori.destroy({
            where: {
                id_kategori: req.params.id_kategori
            }
        });
        res.status(200).json({msg: "Master barang berhasil dihapus."});
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}

export const namaKategori = async(req, res) => {
    try {
        const response = await Kategori.findAll({
            attributes: ['id_kategori', 'nama'], 
            order: [['id_kategori', 'ASC']]
        }); 
        return res.status(200).json(response);

    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: "Failed to fetch Kategori Barang" });
    }
}

export const detailKategori = async(req, res) => {
    try {
        const barang = await Barang.findOne({
            where: { id_barang: req.params.id_barang }, 
            include: [
                {
                    model: Kategori,
                    as: "KategoriBarang", 
                    attributes: ["id_kategori", "nama", "satuan", "harga_barang", "jenis_barang"], 
                    required: false,
                },
            ],
        }); 

        if (!barang) return res.status(404).json({message: "Barang tidak ditemukan"});

        const result = {
            id_barang: barang.id_barang,
            nama_barang: barang.nama,
            id_kategori: barang.KategoriBarang?.id_kategori || null,
            kategori: barang.KategoriBarang?.nama || "-",
            jenis_barang: barang.KategoriBarang?.jenis_barang || "-",
            satuan: barang.KategoriBarang?.satuan || "-", 
            harga_barang: barang.KategoriBarang?.harga_barang || 0,
        };

        // console.log("NAMA BARANG:", result.nama_barang);


        res.status(200).json(result);
    } catch (error) {
        console.error("Error fetching detail kategori:", error);
        res.status(500).json({message: "Gagal mengambil detail kategori."});
    }
}
