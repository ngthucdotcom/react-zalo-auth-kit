import React, {useState} from 'react';
import ZaloLoginButton from "react-zalo-auth-kit/ZaloLoginButton";

function LoginButton() {

	const [userInfo, setUserInfo] = useState(null);

	const defaultCallback = (credential) => {
		console.log('defaultCallback', credential);
		setUserInfo(credential['user']);
	}

	return (
		<div>
			<h1>Login Button</h1>
			{
				userInfo && <div>
					<img src={userInfo.photoURL} alt="avatar"/>
					<p>{userInfo.displayName} ({userInfo.uid})</p>
				</div>
			}
			<ZaloLoginButton
				state="login_kit"
				appId="3850903547114980520"
				callback={defaultCallback}
				permissions={['id', 'name', 'picture.type(large)']}
				redirectUri={window.location.origin}
			/>
		</div>
	);
}

export default LoginButton;