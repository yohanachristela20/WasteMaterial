import Vendor from "../models/VendorModel.js";
import Pengajuan from "../models/PengajuanModel.js";

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

	// let nextId = '1-V';
	if (latestIdVendor) {
		return res.status(200).json({ nextId: latestIdVendor.id_vendor });
	}
	return res.status(200).json({nextId: null});

	} catch (error) {
		console.error(error);
		return res.status(500).json({message: 'error retrieving last id detail barang'});
	}
};

// export const detailVendor = async(req, res) => {
//     try {
//         const {id_vendor} = req.params;
//          const vendor = await Vendor.findOne({
//             where:{
//                 id_vendor: id_vendor 
//             }
//         });

//         if (!vendor) return res.status(404).json({message: "Vendor tidak ditemukan"});

//         const result = {
//             id_vendor: vendor.id_vendor,
//             sopir: vendor.sopir,
//         };

//         res.status(200).json(result);
//     } catch (error) {
//         console.error("Error fetching detail vendor:", error);
//         res.status(500).json({message: "Gagal mengambil detail vendor."});
//     }
// }


export const detailVendor = async(req,res) => {
  try {
		const response = await Vendor.findOne({
			where: {
				id_vendor: req.params.id_vendor
			}
		});
		res.status(200).json(response);
	} catch (error) {
		console.log(error.message); 
	}
};
