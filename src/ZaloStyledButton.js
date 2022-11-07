import React from 'react';
import zaloIcon from './assets/zalo.png';
import './assets/firebaseui.css';
import PropTypes from "prop-types";

/**
 * Zalo login button with firebase style
 * @param props {{id?: string, label?: string, backgroundColor?: string, callback: function}}
 * @returns {JSX.Element}
 * @constructor
 */
function ZaloStyledButton(props) {
	const {id, label, backgroundColor, callback} = props;

	const handlePressButton = () => {
		callback();
	}

	return (
		<button className="firebaseui-idp-button mdl-button mdl-button--raised" data-upgraded=",MaterialButton"
		        data-provider-id={id} style={{backgroundColor}} onClick={handlePressButton}
		>
			<span className="firebaseui-idp-icon-wrapper">
				<img className="firebaseui-idp-icon" alt="icon-provider" src={zaloIcon}/>
			</span>
			<span className="firebaseui-idp-text firebaseui-idp-text-long" style={{fontSize: 13}}>
	            {label}
	        </span>
		</button>
	);
}

ZaloStyledButton.propTypes = {
	label: PropTypes.string,
	backgroundColor: PropTypes.string,
	id: PropTypes.string,
	callback: PropTypes.func
};

ZaloStyledButton.defaultProps = {
	label: 'Đăng nhập bằng Zalo',
	backgroundColor: '#0190f3',
	id: 'zalo.me',
	callback() {}
};

export default ZaloStyledButton;