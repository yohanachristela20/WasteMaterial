import React from "react";
import { useLocation, NavLink } from "react-router-dom";
import { Nav } from "react-bootstrap";

function Sidebar({ color, image, routes }) {
  const role = localStorage.getItem("role");

  const filteredRoutes = routes.filter(
    (route) => !["/login", "/detail-pengajuan", "/transaksi", "/detail-pengajuan-user", "/dok-pengajuan", "/dok-transaksi", "/dok-bpbb", "/dok-surat-jalan", "/pengajuan"].includes(route.path)
  );

  const roleFilteredRoutes = filteredRoutes.filter((route) => {
    if (role === "Admin") return route.layout === "/admin";
    if (role === "User") return route.layout === "/user";
    if (role === "Super Admin") return route.layout === "/super-admin";
    return false; 
  });

  const location = useLocation();

  const activeRoute = (routeName) => {
    return location.pathname.indexOf(routeName) > -1 ? "active" : "";
  };

  return (
    <div className="sidebar" data-image={image} data-color={color}>
      <div className="sidebar-wrapper sidebar-color">
        <div className="logo d-flex align-items-center justify-content-start">
          <a
            className="simple-text logo-mini mx-3"
          >
            <div className="logo-img">
              <img src={require("assets/img/logo5.png")} alt="sidebar-logo" />
            </div>
          </a>
          <a className="simple-text">SIBABE</a>
        </div>
        <Nav>
          {roleFilteredRoutes.map((prop, key) => {
            if (!prop.redirect)
              return (
                <li
                  className={
                    prop.upgrade
                      ? "active active-pro"
                      : activeRoute(prop.layout + prop.path)
                  }
                  key={key}
                >
                  <NavLink
                    to={prop.layout + prop.path}
                    className="nav-link"
                    activeClassName="active"
                  >
                    <i className={prop.icon} />
                    <p>{prop.name}</p>
                  </NavLink>
                </li>
              );
            return null;
          })}
        </Nav>
      </div>
    </div>
  );
}

export default Sidebar;
