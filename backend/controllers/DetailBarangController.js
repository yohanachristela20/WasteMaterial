import DetailBarang from "../models/DetailBarang.js";

export const getDetailBarang = async(req, res) => {
    try {
        const response = await DetailBarang.findAll();
        res.status(200).json(response); 
    } catch (error) {
        console.log(error.message); 
    }
};

export const getDetailBarangById = async(req, res) => {
    try {
        const response = await DetailBarang.findOne({
            where:{
                id_detailbarang: req.params.id_detailbarang 
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
        await DetailBarang.create(req.body);
        res.status(201).json({msg: "Master data barang baru telah dibuat"}); 
    } catch (error) {
        res.status(500).json({message: error.message}); 
    }
};

export const getLastBarangId = async (req, res) => {
    try {
        const latestBarang = await DetailBarang.findOne({
            order: [['id_detailbarang', 'DESC']]
        });

        let nextId = '1-K';
        if (latestBarang && latestBarang.id_detailbarang) {
            const lastNumeric = parseInt(latestBarang.id_detailbarang.split('-')[0], 10);
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

export const updateDetailBarang = async(req, res) => {
    try {
        await DetailBarang.update(req.body, {
            where: {
                id_detailbarang: req.params.id_detailbarang
            }
        });
        res.status(200).json({msg: "Master barang berhasil diperbarui."});
    } catch (error) {
        res.status(500).json({message: error.message});
    }
};

export const deleteDetailBarang = async(req, res) => {
    try {
        await DetailBarang.destroy({
            where: {
                id_detailbarang: req.params.id_detailbarang
            }
        });
        res.status(200).json({msg: "Master barang berhasil dihapus."});
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}