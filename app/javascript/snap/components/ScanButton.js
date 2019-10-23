import React, { Component } from 'react';
import scan_button from 'images/scan-button.svg';

class ScanButton extends Component {
	constructor(props) {
		super(props);
	}

	handleScan = () => {
		this.props.history.push({ pathname: '/scan' });
	  }

	render() {

		const { handleScan } = this; 
		const { float } = this.props;

		return (
			<div className="scan-wrapper">
				<div className={`scan-button ${(float) ? 'floating' : ''}`} onClick={handleScan} role="button" aria-roledescription="camera button" >
					<img src={scan_button} alt="scan" />
				</div>
			</div>
		)
	}
}

export default ScanButton;