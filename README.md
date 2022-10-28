# Zalo Account Kit

## Description

|   Develop   |         Mapped        | User Identity |           Mapped          | Business |
|:-----------:|:---------------------:|:-------------:|:-------------------------:|:--------:|
| Zalo App ID |     User ID by App    |    Zalo ID    | Follower ID User ID by OA |   OA ID  |
|             | User identify for App |               | As a sender or recipient  |          |
|             |                       |               |                           |          |

## Usage

### 1. Install

```bash
npm i react-zalo-account-kit
```

### 2. Import ZaloAccountKit

```js
import ZaloAccountKit from 'react-zalo-account-kit';
```

### 3. Use ZaloAccountKit

```js
import React, {useEffect, useState} from 'react';
import queryString from 'query-string';
import {useZaloAccountKit, ZaloLoginPopup} from "react-zalo-account-kit";

const App = () => {
	const zaloKit = useZaloAccountKit({
		appId: 'your-app-id',
		redirectUri: 'your-redirect-uri',
		scopes: ['id', 'name', 'picture.type(large)'],
		providerId: 'zalo.me',
		state: 'zalo_login'
	});
	const [{requestUrl, code_verifier}, verifyCode] = zaloKit.oauthRequest('zalo_login', {length: 43});

	const [openPopup, setOpenPopup] = useState(false);

	const handleLogin = () => {
		setOpenPopup(true);
	};

	const handleAuthCode = (response) => {
		const auth_code = JSON.parse(window.atob(localStorage.getItem('auth_code')));
		if (auth_code.code && verifyCode(auth_code.code_challenge)) {
			zaloKit.signInWithAuthCode(auth_code.code, code_verifier)
				.then((userCredential) => {
					zaloKit.signInSuccessWithAccessToken(userCredential?.access_token)
						.then((userData) => {
							handleLoginSuccess({
								operationType: "signIn",
								providerId: 'zalo.me',
								user: {
									accessToken: userCredential?.access_token,
									displayName: userData?.name,
									photoURL: userData?.picture?.data?.url,
									uid: userData?.id,
									providerData: [{
										providerId: 'zalo.me',
										scopes: ['id', 'name', 'picture.type(large)'],
									}]
								}
							});
						});
				});
		}
	};

	const handleLoginSuccess = (credential) => {
		console.log('handleLoginSuccess', credential);
	};

	useEffect(() => {
		const waitingForAuthCode = setInterval(() => {
			const compareFields = ['code', 'state', 'code_challenge'];
			const redirectUriQueryParams = Object.keys(queryString.parse(window.location.search));
			if (compareFields.length === redirectUriQueryParams.length && compareFields.every((field) => redirectUriQueryParams.includes(field))) {
				const {code, code_challenge} = queryString.parse(window.location.search);
				localStorage.setItem('auth_code', window.btoa(JSON.stringify({code, code_challenge})));
				setOpenPopup(false);
				window.close();
			}
        }, 1000);
		
		return () => clearInterval(waitingForAuthCode);
	})

	return (
		<div>
			<button onClick={handleLogin}>Login</button>
			<ZaloLoginPopup open={openPopup} requestUrl={requestUrl} onClose={handleAuthCode}/>
		</div>
	);
};

export default App;
```