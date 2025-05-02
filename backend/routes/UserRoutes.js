import express from "express";
import multer from 'multer'; // Import multer for file upload handling
import path from 'path';
import fs from 'fs';
import csvParser from "csv-parser";
import bcrypt from 'bcrypt';
import db from "../config/database.js";
import User from "../models/UserModel.js";
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import verifyToken from '../middlewares/authMiddleware.js';
import { clearUserSession } from "../middlewares/checkSessionTimeout.js";

dotenv.config();

import {getUser,
        getUserById, 
        createUser, 
        updateUser, 
        deleteUser, 
        getUserDetails, 
        getLastUserId,
        checkUserActivity,
} from "../controllers/UserController.js"; 

const router = express.Router(); 

const uploadDirectory = './uploads/user'

const jwtSecret = process.env.JWT_SECRET_KEY;

if (!fs.existsSync(uploadDirectory)) {
        fs.mkdirSync(uploadDirectory, {recursive: true});
}  

const storage = multer.diskStorage({
        destination: (req, file, cb) => {
                cb(null, uploadDirectory);
        },
        filename: (req, file, cb) => {
                cb(null, Date.now() + path.extname(file.originalname));
        }
});

const upload = multer({ storage: storage });

const activeUsers = {};

router.get('/user', getUser); 
router.get('/user/:id_user', getUserById);
router.post('/user', createUser);  
router.patch('/user/:id_user', updateUser);
router.delete('/user/:id_user', deleteUser);
router.get('/user-details/:username', getUserDetails); 
router.get('/last-id', getLastUserId); 


router.post('/change-password', async (req, res) => {
  const { username, role, oldPassword, newPassword } = req.body;

  // Validasi input
  if (!username || !role || !oldPassword || !newPassword) {
      return res.status(400).json({ message: "Semua field harus diisi!" });
  }

  try {
      // Cari user berdasarkan username dan role
      const user = await User.findOne({ where: { username, role } });

      if (!user) {
          return res.status(404).json({ message: "User tidak ditemukan." });
      }

      // Validasi password lama
      const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
      if (!isPasswordValid) {
          return res.status(400).json({ message: "Password lama salah." });
      }

      // Hash password baru
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);

      // Update password
      await User.update({ password: hashedNewPassword }, { where: { username, role } });

      res.status(200).json({ message: "Password berhasil diperbarui." });

      // history.push("/login"); 
  } catch (error) {
      console.error("Error saat mengganti password:", error.message);
      res.status(500).json({ message: "Terjadi kesalahan server.", error: error.message });
  }
});

router.post('/user/import-csv', upload.single("csvfile"), (req,res) => {
        if (!req.file) {
                return res.status(400).json({ success: false, message: 'No file uploaded' });
        }
        
        const filePath = req.file.path;
        const data_user = [];
        const defaultPassword = process.env.DEFAULT_PASS; 
        
        if (!fs.existsSync('./uploads/user')) {
                fs.mkdirSync('./uploads/user');
        }    
        
        fs.createReadStream(filePath)
        .pipe(csvParser())
        .on("data", (row) => {
          const salt =  bcrypt.genSaltSync(10); //salt: data acak untuk hashing/ enkripsi pass
          const hashedPassword =  bcrypt.hashSync(defaultPassword, salt); 
      
          data_user.push({
            id_user: row.id_user,
            username: row.username,
            password: hashedPassword, 
            role: row.role
          });
        })
        .on("end", async () => {
          try {
            if (data_user.length === 0) {
              throw new Error("Tidak ada data untuk diimport");
            }
            
            await User.bulkCreate(data_user);
        
            res.status(200).json({
              success: true,
              message: "Data berhasil diimport ke database",
            });
          } catch (error) {
            console.error("Error importing data:", error);
            res.status(500).json({
              success: false,
              message: "Gagal mengimport data ke database",
              error: error.message,
            });
          } finally {
            fs.unlinkSync(filePath);
          }
        })
        .on("error", (error) => {
          console.error("Error parsing file:", error);
          res.status(500).json({ success: false, message: "Error parsing file" });
        });
        
});

router.post('/user-login', async (req, res) => {
    const { username, password, role, user_active} = req.body;

    console.log("Received login request with:", { username, role, user_active});

    if (!username || !password || !role) {
        return res.status(400).json({ message: "Semua field harus diisi!" });
    }

    try {
        const user = await User.findOne({
            where: {username, role}
        }); 

        if (user.user_active === true) {
          console.log("User sudah login");
          return res.status(400).json({message: "User sudah login di perangkat lain. Mohon logout terlebih dahulu"}); 
        }

        if (!user) {
          console.log("User not found for username:", username, "and role:", role);
          return res.status(400).json({message: "User tidak ditemukan."}); 
        }


        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          return res.status(400).json({ message: 'Password salah' });
        }

        const jwtSecret = process.env.JWT_SECRET_KEY;

        if (!jwtSecret) {
            return res.status(500).json({ message: "JWT Secret key belum diatur di .env file." });
        }

        const token = jwt.sign(
            { id: user.id_user, role: user.role },
            jwtSecret, 
        );

        console.log("Token berhasil dibuat:", token);

        await User.update(
          {user_active: true},
          { 
            where: {id_user: user.id_user},
          }
        );
    
        res.status(200).json({ token, role, username, user_active});
        console.log("User login: ", token, role);
 
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Server error.", error: error.message });
    }
});

router.put('/user/:id_user', async (req, res) => {
  const { id_user } = req.params;
  const defaultPassword = process.env.DEFAULT_PASS; 
  let { password } = req.body;

  console.log("Data yang diterima di server:", req.body); 

  try {

    const user = await User.findByPk(id_user);

    user.password = defaultPassword;

    if (user.password) {
      const salt = await bcrypt.genSalt(10); //salt: data acak untuk hashing/ enkripsi pass
      user.password = await bcrypt.hash(user.password, salt); 
  }

    await user.save();

    res.status(200).json({ message: 'Password berhasil diperbarui', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/heartbeat', (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1]; 

  if (!token) {
    return res.status(401).json({ message: 'Token tidak ditemukan, silakan login ulang.' });
  }

  const jwtSecret = process.env.JWT_SECRET_KEY;

  try {
    const decoded = jwt.verify(token, jwtSecret); 
    const userId = decoded?.id_user;

    const currentTime = new Date();
    activeUsers[userId] = currentTime;

    // console.log(`Aktivitas terbaru pengguna ${userId}: ${currentTime}`); 
    res.status(200).json({ message: 'Heartbeat diterima' }); 
  } catch (error) {
    console.error("Token error: ", error.message); 
    res.status(401).json({message: 'Token tidak valid atau telah kedaluwarsa.'});

  }
});

router.post('/logout', async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token tidak ditemukan." });
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  const userId = decoded?.id;
  // const idUser = decoded?.id;

  console.log("userId: ", userId);

  await User.update(
    {user_active: false}, 
    {
      where: {id_user: userId},
    }
  )

  clearUserSession(userId);
  console.log(`Sesi pengguna ${userId} telah dihapus.`);

  return res.status(200).json({ message: "Logout berhasil" });

});

router.patch('/delete-session/:id_user', async (req, res) => {
  try {
      const { id_user } = req.params;

      const user = await User.findOne({ where: { id_user } });

      if (!user) {
          return res.status(404).json({ msg: "User tidak ditemukan." });
      }

      await User.update(
        {user_active: false}, 
        {
          where: {id_user: id_user}
        }
      );

      clearUserSession(id_user);
      console.log(`Sesi pengguna ${id_user} telah dihapus.`);

      res.status(200).json({ 
        msg: "Session user berhasil dihapus.",
        redirect: "/login" });
      
  } catch (error) {
      console.error("Error saat menghapus session user:", error.message);
      res.status(500).json({ message: "Gagal menghapus session user." });
  }
});

router.post('/logout-user/:id_user', async(req,res) => {
  try {
    const { id_user } = req.params;

    const user = await User.findOne({ where: { id_user } });

    if (!user) {
        return res.status(404).json({ msg: "User tidak ditemukan." });
    }

    await User.update(
      {user_active: false}, 
      {
        where: {id_user: id_user}
      }
    );

    clearUserSession(id_user);
    console.log(`Sesi pengguna ${id_user} telah dihapus.`);

    res.status(200).json({ 
    msg: "Session user berhasil dihapus."});

    // console.log("user active:", user.user_active);

    // res.redirect('/');
    
} catch (error) {
    console.error("Error saat menghapus session user:", error.message);
    res.status(500).json({ message: "Gagal menghapus session user." });
}
});

export default router;
