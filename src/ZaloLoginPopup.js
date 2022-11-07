import React from 'react';
import PropTypes from 'prop-types';
import NewWindow from "react-new-window";

/**
 * Zalo login popup
 * @param props {{open: boolean, onClose: function, requestUrl: string}}
 * @returns {JSX.Element}
 * @constructor
 */
function ZaloLoginPopup(props) {
	const {open, requestUrl, onClose} = props;
	return (
		open && <NewWindow url={requestUrl} onUnload={onClose}/>
	);
}

ZaloLoginPopup.propTypes = {
	open: PropTypes.bool.isRequired,
	requestUrl: PropTypes.string.isRequired,
	onClose: PropTypes.func.isRequired,
};

ZaloLoginPopup.defaultProps = {
	open: false,
	requestUrl: '',
	onClose() {},
};

export default ZaloLoginPopup;