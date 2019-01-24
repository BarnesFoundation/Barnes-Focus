import React from 'react';
import { Link } from "react-router-dom";

const Footer = (props) => (
    <div className="footer-text" style={props.footerStyle} >
        <Link to="/about">About</Link>
        {/* <span>&copy; {new Date().getFullYear()} Barnes Foundation</span>
        <a href="https://www.barnesfoundation.org/terms"><span>Legals</span></a> */}
    </div>
);

export default Footer;