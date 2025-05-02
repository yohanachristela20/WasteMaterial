import DetailBarang from "../models/DetailBarang.js";

export const getDetailBarang = async(req, res) => {
    try {
        const response = await DetailBarang.findAll();
        res.status(200).json(response); 
    } catch (error) {
        console.log(error.message); 
    }
}

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
}

export const createDetailBarang = async(req, res) => {
    try {
        console.log(req.body);
        await DetailBarang.create(req.body);
        res.status(201).json({msg: "Master data barang baru telah dibuat"}); 
    } catch (error) {
        res.status(500).json({message: error.message}); 
    }
}

export const getLastBarangId = async (req, res) => {
    try {
        const latestBarang = await DetailBarang.findOne({
            order: [['id_detailbarang', 'DESC']]
        });

        let nextId;
        if (latestBarang) {
            const numericPart = parseInt(latestBarang.id_detailbarang.slice(2), 10);
            nextId = `${String(numericPart + 1)}-K`;
        } else {
            nextId = '1-K';
        }

        res.json({ nextId });

        console.log("Next Id: ", nextId);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }

};