import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import {Server} from "socket.io";
import http from "http";

import KaryawanRoute from "./routes/KaryawanRoute.js"
import KategoriRoute from "./routes/KategoriRoute.js";
import UserRoute from "./routes/UserRoutes.js";
import VendorRoute from "./routes/VendorRoute.js";
import BarangRoute from "./routes/BarangRoute.js";
import verifyToken from "./middlewares/authMiddleware.js";
import PengajuanRoute from "./routes/PengajuanRoute.js";
import GenPengajuanRoute from "./routes/GenPengajuanRoute.js";
import TransaksiRoute from "./routes/TransaksiRoute.js";
import AntreanRoute from "./routes/AntreanRoute.js";
import dotenv from 'dotenv';

import './models/KaryawanModel.js';
import './models/Association.js';
import './models/UserModel.js';
import './models/KategoriModel.js';
import './models/VendorModel.js';
import './models/BarangModel.js';
import './models/PengajuanModel.js';
import './models/GenPengajuan.js';
import './models/TransaksiModel.js';
import './models/AntreanModel.js';
import jwt from 'jsonwebtoken';
import Vendor from "./models/VendorModel.js";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"], 
        credentials: true,
    }
});

io.on("connection", (socket) => {
    console.log("Client connected: ", socket.id);

    socket.on("disconnect", () => {
        console.log("Client disconnected: ", socket.id);
    });
}); 

app.set("io", io);



app.use(bodyParser.json());
app.use(cors({origin: "http://localhost:3000", credentials: true}));
app.use(express.json());

app.use(UserRoute); 

const protectedRoutes = [
    KaryawanRoute,
    KategoriRoute,
    VendorRoute,
    BarangRoute,
    PengajuanRoute,
    GenPengajuanRoute,
    TransaksiRoute,
    AntreanRoute,
];

protectedRoutes.forEach(route => {
    app.use(verifyToken, route); 
});


const PORT = process.env.PORT || 5001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

