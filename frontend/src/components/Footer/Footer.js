import React, { Component } from "react";
import { Container } from "react-bootstrap";

class Footer extends Component {
  render() {
    return (
      <footer className="footer px-0 px-lg-3">
        <Container fluid>
          <nav>
            <p className="copyright text-center">
              ©2025 Accounting Dev - PT Campina Ice Cream Industry, Tbk.
              {/* {new Date().getFullYear()}{" "} */}
            </p>
          </nav>
        </Container>
      </footer>
    );
  }
}

export default Footer;
