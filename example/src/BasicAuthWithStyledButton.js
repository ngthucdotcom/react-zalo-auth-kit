import React, {useEffect, useState} from 'react';
import {useZaloAuthKit} from "react-zalo-auth-kit";
import ZaloLoginPopup from "react-zalo-auth-kit/ZaloLoginPopup";
import ZaloStyledButton from "react-zalo-auth-kit/ZaloStyledButton";

function BasicAuthWithStyledButton() {
	const ZaloKit = useZaloAuthKit({
		appId: '3850903547114980520',
		redirectUri: window.location.origin,
		permissions: ['id', 'name', 'picture.type(large)'],
	});
	const [codeVerifier, setCodeVerifier] = useState("");
	const [authCodeUrl, setAuthCodeUrl] = useState('');
	const [openPopup, setOpenPopup] = useState(false);
	const [userInfo, setUserInfo] = useState(null);

	const handleLogin = () => {
		const [codeVerifier, codeChallenge] = ZaloKit.pkceCode().generate(43);
		setAuthCodeUrl(ZaloKit.oauthRequest('styled_auth', codeChallenge));
		setCodeVerifier(codeVerifier);
		setOpenPopup(true);
	};

	const handleAuthCode = () => {
		setOpenPopup(false);
	};

	const handleLoginSuccess = (credential) => {
		console.log('handleLoginSuccess', credential);
		setUserInfo(credential['user']);
	};

	window.handleSignInWithZaloUseStyledButton = (eventEmitter) => ZaloKit.login(eventEmitter, codeVerifier).then(handleLoginSuccess);

	const oauthCodeAndAuthProcess = () => {
		if (ZaloKit.hasParamsToProcess(window.location.search) && window.location.search.includes('styled_auth')) {
			window.opener.handleSignInWithZaloUseStyledButton(window.location.search);
			setOpenPopup(false);
			window.close();
		}
	};

	useEffect(() => {
		const checkingAuthCode = setInterval(() => {
			oauthCodeAndAuthProcess();
		}, 1000);
		return () => clearInterval(checkingAuthCode);
	})

	return (
		<div>
			<h1>Styled Auth</h1>
			{
				userInfo && <div>
					<img src={userInfo.photoURL} alt="avatar"/>
					<p>{userInfo.displayName} ({userInfo.uid})</p>
				</div>
			}
			<ZaloStyledButton callback={handleLogin}/>
			<ZaloLoginPopup open={openPopup} requestUrl={authCodeUrl} onClose={handleAuthCode}/>
		</div>
	);
}

export default BasicAuthWithStyledButton;