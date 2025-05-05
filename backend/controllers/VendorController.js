import Vendor from "../models/VendorModel.js";

export const getVendor = async(req, res) => {
    try {
        const response = await Vendor.findAll();
        res.status(200).json(response); 
    } catch (error) {
        console.log(error.message); 
    }
};

export const getVendorById = async(req, res) => {
    try {
        const response = await Vendor.findOne({
            where:{
                id_vendor: req.params.id_vendor 
            }
        });
        res.status(200).json(response); 
    } catch (error) {
        console.log(error.message); 
    }
};

export const createVendor = async(req, res) => {
    try {
        // console.log(req.body);
        await Vendor.create(req.body);
        res.status(201).json({msg: "Data Vendor baru telah dibuat"}); 
    } catch (error) {
        res.status(500).json({message: error.message}); 
    }
};

export const updateVendor = async(req, res) => {
    try {
        await Vendor.update(req.body, {
            where:{
                id_vendor: req.params.id_vendor
            }
        });
        res.status(200).json({msg: "Data Vendor berhasil diperbarui"}); 
    } catch (error) {
        res.status(500).json({message: error.message}); 
    }
}


export const deleteVendor = async(req, res) => {
    try {
        await Vendor.destroy({
            where:{
                id_vendor: req.params.id_vendor
            }
        });
        res.status(200).json({msg: "Data Vendor berhasil dihapus"}); 
    } catch (error) {
        res.status(500).json({message: error.message}); 
    }
}


export const getLastVendorId = async (req, res) => {
    try {
        const latestIdVendor = await Vendor.findOne({
            order: [['id_vendor', 'DESC']]
        });

        let nextId = '1-V';
        if (latestIdVendor && latestIdVendor.id_vendor) {
            const lastNumeric = parseInt(latestIdVendor.id_vendor.split('-')[0], 10);
            const incremented = lastNumeric + 1;
            nextId = `${incremented}-V`;
        }
        console.log("getLastIdVendor: ", nextId);
        return res.status(200).json({nextId});


    } catch (error) {
        console.error(error);
        return res.status(500).json({message: 'error retrieving last id detail barang'});
    }
};