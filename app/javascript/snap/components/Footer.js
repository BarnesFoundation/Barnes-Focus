import React from 'react';

const Footer = (props) => (
    <div className="footer-text" style={props.footerStyle} >
        <a onClick={() => { props.onClickAbout() }}>About</a>
        {/* <span>&copy; {new Date().getFullYear()} Barnes Foundation</span>
        <a href="https://www.barnesfoundation.org/terms"><span>Legals</span></a> */}
    </div>
);

export default Footer;