import React from 'react';

const Footer = (props) => (
    <div className="row footer">
        <div className="col-12">
            <hr />
            <div className="pt-2 pb-4 d-flex justify-content-around">
                <span>&copy; 2018 Barnes Foundation</span>
                <a href="https://www.barnesfoundation.org/terms"><span>Terms & Conditions</span></a>
            </div >
        </div>
    </div>
);

export default Footer;