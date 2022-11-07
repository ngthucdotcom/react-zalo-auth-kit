import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import ZaloStyledButton from "./ZaloStyledButton";
import ZaloLoginPopup from "./ZaloLoginPopup";
import useZaloAuthKit from "./useZaloAuthKit";

function ZaloLoginButton(props) {
	const { appId, redirectUri, permissions, state, callback } = props;
	const ZaloKit = useZaloAuthKit({ appId, redirectUri, permissions });
	const [openPopup, setOpenPopup] = useState(false);
	const [authCodeUrl, setAuthCodeUrl] = useState('');
	const [codeVerifier, setCodeVerifier] = useState(null);

	const handleButtonPressed = () => {
		const [codeVerifier, codeChallenge] = ZaloKit.pkceCode().generate(43);
		setAuthCodeUrl(ZaloKit.oauthRequest(state, codeChallenge));
		setCodeVerifier(codeVerifier);
		setOpenPopup(true);
	};

	const handleZaloAuthCode = () => {
		if (ZaloKit.hasParamsToProcess(window.location.search) && window.location.search.includes(state)) {
			window.opener.signInWithZalo(window.location.search);
			setOpenPopup(false);
			window.close();
		}
	}

	window.signInWithZalo = function (event) {
		if (!callback || ZaloKit.typeOf(callback) !== 'function') {
			console.error('ZaloLoginButton callback is not a function');
			return;
		}
		ZaloKit.login(event, codeVerifier).then(callback).catch(callback);
	}

	useEffect(() => {
		handleZaloAuthCode();
	})

	return (
		<>
			<ZaloStyledButton callback={handleButtonPressed} />
			<ZaloLoginPopup open={openPopup} requestUrl={authCodeUrl} onClose={() => setOpenPopup(false)} />
		</>
	);
}

ZaloLoginButton.propTypes = {
	appId: PropTypes.string.isRequired,
	redirectUri: PropTypes.string.isRequired,
	permission: PropTypes.array.isRequired,
	state: PropTypes.string,
	callback: PropTypes.func,
};

ZaloLoginButton.defaultProps = {
	appId: '',
	redirectUri: '',
	permission: ['id'],
	state: 'zalo_login',
	callback() {},
};

export default ZaloLoginButton;