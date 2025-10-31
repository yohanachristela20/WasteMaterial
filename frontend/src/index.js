import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";

import { BrowserRouter, Route, Router, Switch, Redirect } from "react-router-dom";

import "bootstrap/dist/css/bootstrap.min.css";
import "./assets/css/animate.min.css";
import "./assets/scss/light-bootstrap-dashboard-react.scss?v=2.0.0";
import "./assets/css/demo.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

import AdminLayout from "layouts/Admin.js";
import UserLayout from "layouts/User.js";
import SuperAdminLayout from "layouts/SuperAdmin.js"; 
import Login from "views/Login.js";
import PrivateRoute from "components/PrivateRoute/PrivateRoute.js";

import { PlafondProvider } from "components/Provider/PlafondContext.js";
import DataPengajuan from "views/DataPengajuan.js";

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Heartbeat from "views/Heartbeat.js";

const DisableBackButton = () => {
  useEffect(() => {
    // Mencegah kembali ke halaman sebelumnya
    const preventBack = () => {
      // history.pushState(null, null, location.href);
      window.history.forward();
    };

    preventBack(); 

  }, []);

  return null;
};

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <PlafondProvider>
  <DisableBackButton />
  <BrowserRouter>
  <DisableBackButton />
  <ToastContainer />
    <Switch>
      <Route path="/login"  
      exact
          render={(props) => (
            <Login
              {...props}
              onLoginSuccess={() => {
                const lastRoute = localStorage.getItem("lastRoute"); 
                localStorage.removeItem("lastRoute");
                console.log("Last route: ", lastRoute);
                props.history.push(lastRoute);
              }}
            />
          )} /> 

      <PrivateRoute path="/user" roles={["User"]} render={(props) =>
        (
          <>
           <UserLayout {...props} />
           <Heartbeat />
          </>
        )} />
        
      <PrivateRoute path="/admin" roles={["Admin"]} render={(props) => (
        <>
          <AdminLayout {...props} />
          <Heartbeat />
        </>
      ) } />
      <PrivateRoute path="/super-admin" roles={["Super Admin"]} render={(props) => (
        <>
          <SuperAdminLayout {...props} />
          <Heartbeat />
        </>
      )} />

      {/* <Route path="/admin/screening-karyawan" component={ScreeningKaryawan} /> */}
      {/* <Route path="/laporan-piutang" element={<DataPengajuan />} /> */}
      {/* <Route path="/screening-karyawan" element={<PageScreeningKaryawan />} /> */}
      <Redirect from="/" to="/login" />
    </Switch>
  </BrowserRouter>
  </PlafondProvider>
);
