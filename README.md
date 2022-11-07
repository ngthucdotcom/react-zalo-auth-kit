# Zalo Account Kit

## Description

|   Develop   |         Mapped        | User Identity |           Mapped          | Business |
|:-----------:|:---------------------:|:-------------:|:-------------------------:|:--------:|
| Zalo App ID |     User ID by App    |    Zalo ID    | Follower ID User ID by OA |   OA ID  |
|             | User identify for App |               | As a sender or recipient  |          |

## Usage

### 1. Read the [Zalo Developers](https://developers.zalo.me/docs/api/social-api-4) document to understand the principles of the API.

### 2. Register your app and set up the callback URL

2.0. Requires a Zalo account before starting. Sign up
via [Zalo App](https://id.zalo.me/account/static/zalo-register.html)

2.1. Register your app: https://developers.zalo.me/createapp

2.2. Verify your domain: https://developers.zalo.me/app/<your_app_id>/verify-domain

2.3. Set up the callback URL: https://developers.zalo.me/app/<your_app_id>/login

2.3.1. Note: turn off the "Check the secret key when calling API to get the access token" option if you want to use
client side, code challenge and code verifier is required.

2.4. Activate the app: https://developers.zalo.me/app/<your_app_id>/settings

### 3. Install and import the ZaloAccountKit package

* Install the package

```bash
npm i react-zalo-auth-kit
```

* Import the package

```js
// the simple method to use a basic kit
import {useZaloAuthKit} from "react-zalo-auth-kit";
// create a popup window to get the oauth code
import ZaloLoginPopup from "react-zalo-auth-kit/ZaloLoginPopup";
// styled button easy to use
import ZaloStyledButton from "react-zalo-auth-kit/ZaloStyledButton";

or
// kit with styled button and basic auth
import ZaloLoginButton from "react-zalo-auth-kit/ZaloLoginButton";
```

### 4. Use templates

* Kit for Zalo Auth use Styled Button and Basic Auth

```js
import React, {useState} from 'react';
import ZaloLoginButton from "react-zalo-auth-kit/ZaloLoginButton";

function App() {
	const [userInfo, setUserInfo] = useState(null);

	const defaultCallback = (credential) => {
		console.log('defaultCallback', credential);
		setUserInfo(credential['user']);
	}

	if (userInfo) {
		return (
			<div>
				<h1>Login Success</h1>
				<img src={userInfo.photoURL} alt="avatar"/>
				<p>{userInfo.displayName} ({userInfo.uid})</p>
			</div>
		);
	}

	return (
		<div>
			<h1>Login Kit</h1>
			<ZaloLoginButton
				state="login_kit"
				appId="your-app-id"
				callback={defaultCallback}
				permissions={['id', 'name', 'picture']}
				redirectUri={window.location.origin}
			/>
		</div>
	);
}

export default App;
```

* ZaloStyledButton

```js
import React, {useEffect, useState} from 'react';
import ZaloStyledButton from "react-zalo-auth-kit/ZaloStyledButton";

function App() {
	const [isClicked, setIsClicked] = useState(false);

	useEffect(() => {
		const toggle = setTimeout(() => {
			setIsClicked(false);
		}, 3000);
		return () => clearTimeout(toggle);
	}, [isClicked]);

	return (
		<div>
			<h1>Styled Button</h1>
			<p>Action: {isClicked ? "Button pressed" : "Button unpressed"}</p>
			<ZaloStyledButton callback={() => setIsClicked(true)}/>
		</div>
	);
}

export default App;
```

* Basic Auth without Styled Button

```js
import React, {useEffect, useState} from 'react';
import {useZaloAuthKit} from "react-zalo-auth-kit";
import ZaloLoginPopup from "react-zalo-auth-kit/ZaloLoginPopup";

function App() {
	const ZaloKit = useZaloAuthKit({
		appId: 'your-app-id',
		redirectUri: window.location.origin,
		permissions: ['id', 'name', 'picture'],
	});
	const [codeVerifier, setCodeVerifier] = useState("");
	const [authCodeUrl, setAuthCodeUrl] = useState("");
	const [openPopup, setOpenPopup] = useState(false);
	const [userInfo, setUserInfo] = useState(null);

	const handleLogin = () => {
		const [codeVerifier, codeChallenge] = ZaloKit.pkceCode().generate(43);
		setAuthCodeUrl(ZaloKit.oauthRequest('basic_auth', codeChallenge));
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

	window.handleSignInWithZalo = (eventEmitter) => {
		return ZaloKit.login(eventEmitter, codeVerifier).then(handleLoginSuccess);
	}

	const oauthCodeAndAuthProcess = () => {
		if (ZaloKit.hasParamsToProcess(window.location.search) && window.location.search.includes('basic_auth')) {
			window.opener.handleSignInWithZalo(window.location.search);
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
			<h1>Basic Auth</h1>
			{
				userInfo && <div>
					<img src={userInfo.photoURL} alt="avatar"/>
					<p>{userInfo.displayName} ({userInfo.uid})</p>
				</div>
			}
			<button onClick={handleLogin}>Login</button>
			<ZaloLoginPopup open={openPopup} requestUrl={authCodeUrl} onClose={handleAuthCode}/>
		</div>
	);
}

export default App;
```

* Basic Auth with Styled Button

```js
import React, {useEffect, useState} from 'react';
import {useZaloAuthKit} from "react-zalo-auth-kit";
import ZaloLoginPopup from "react-zalo-auth-kit/ZaloLoginPopup";
import ZaloStyledButton from "react-zalo-auth-kit/ZaloStyledButton";

function App() {
	const ZaloKit = useZaloAuthKit({
		appId: 'your-app-id',
		redirectUri: window.location.origin,
		permissions: ['id', 'name', 'picture'],
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

	window.handleSignInWithZaloUseStyledButton = (eventEmitter) => {
		return ZaloKit.login(eventEmitter, codeVerifier).then(handleLoginSuccess);
	}

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

export default App;
```