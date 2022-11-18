import React, {useEffect, useState} from 'react';
import ZaloLoginButton from "react-zalo-auth-kit/ZaloLoginButton";
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth, signInWithCustomToken, signOut} from "firebase/auth";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
	apiKey: "AIzaSyAN1T0ISEww5OheAJiaTvlYGtvXM4YR-hg",
	authDomain: "etrans-db.firebaseapp.com",
	projectId: "etrans-db",
	storageBucket: "etrans-db.appspot.com",
	messagingSenderId: "590945278802",
	appId: "1:590945278802:web:d83d1db6ecd3a3a1ee788b",
	measurementId: "G-K02DDKJTV3"
};

// Initialize Firebase
initializeApp(firebaseConfig);
const auth = getAuth();

function App() {

	const [isLogin, setIsLogin] = useState(false);

	const handleLogin = async (credential) => {
		const {uid, accessToken} = credential.user;
		console.log('handleButtonClicked', {credential, uid, accessToken});
		const myHeaders = new Headers();
		myHeaders.append("Content-Type", "application/json");

		const requestOptions = {
			method: 'POST',
			headers: myHeaders,
			body: JSON.stringify({"uid": uid}),
			redirect: 'follow'
		};

		const {token} = await fetch("https://us-central1-etrans-db.cloudfunctions.net/auth", requestOptions).then(response => response.json());
		console.log('token', token);

		const userCred = await signInWithCustomToken(auth, token);
		console.log(userCred);
	}

	const handleLogout = () => signOut(auth)

	useEffect(() => {
		const unregisterAuthObserver = auth.onAuthStateChanged((user) => {
			setIsLogin(!!user);
		});
		return () => unregisterAuthObserver(); // Make sure we un-register Firebase observers when the component unmounts.
	}, []);

	if (isLogin) {
		return (
			<div>
				<button onClick={handleLogout}>Logout</button>
			</div>
		);
	}

	return (
		<ZaloLoginButton
			state="login_kit"
			appId="3850903547114980520"
			callback={handleLogin}
			permissions={['id', 'name', 'picture.type(large)']}
			redirectUri={window.location.origin}
		/>
	);
}

export default App;
