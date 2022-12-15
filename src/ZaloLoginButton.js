import React, {useEffect} from 'react';
import PropTypes from 'prop-types';
import ZaloStyledButton from "./ZaloStyledButton";
import {signInZaloWithPopup} from "./index";
import {ProviderId} from "./ZaloAuthProvider";

const PROVIDER_ID = ProviderId.ZALO;

function ZaloLoginButton({auth, authProvider, callback}) {
	const handleButtonPressed = () => {
		signInZaloWithPopup(auth, authProvider).then(callback).catch(callback);
	};

	useEffect(() => {
		const unregisterZaloAuthObserver = auth.onAuthStateChanged(auth, authProvider, {showLoading: true});
		return () => unregisterZaloAuthObserver(); // Make sure we un-register Zalo observers when the component unmounts.
	}, []);

	return (
		<ZaloStyledButton callback={handleButtonPressed}/>
	);
}

ZaloLoginButton.propTypes = {
	auth: PropTypes.shape({
		appId: PropTypes.string.isRequired,
		onAuthStateChanged: PropTypes.func.isRequired,
	}).isRequired,
	authProvider: PropTypes.shape({
		providerId: PropTypes.string.isRequired,
		scopes: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
	}).isRequired,
	callback: PropTypes.func,
};

ZaloLoginButton.defaultProps = {
	auth: {
		appId: '',
		onAuthStateChanged() {},
	},
	authProvider: {
		providerId: PROVIDER_ID,
		scopes: ['id'],
	},
	callback() {},
};

export default ZaloLoginButton;