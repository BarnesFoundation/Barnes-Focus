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
				<div id="camera-btn" className={`scan-button ${(float) ? 'floating' : ''}`} onClick={handleScan} role="button" aria-label="camera" >
					<img src={scan_button} alt="scan" aria-hidden="true" />
				</div>
			</div>
		)
	}
}

export default ScanButton;