import React, {useEffect, useState} from 'react';
// import ZaloLoginButton from "react-zalo-auth-kit/ZaloLoginButton";
// Import the functions you need from the SDKs you need
import {initializeApp} from "firebase/app";
import {
	EmailAuthProvider,
	getAuth,
	GoogleAuthProvider,
	linkWithCredential,
	linkWithPopup,
	PhoneAuthProvider,
	RecaptchaVerifier,
	signOut,
	unlink
} from "firebase/auth";
import parsePhoneNumber from "libphonenumber-js";
import StyledFirebaseAuth from "react-firebase-web-auth/StyledFirebaseAuth";
import {ZaloAuthProvider} from "react-zalo-auth-kit/ZaloAuthProvider";
import {getZaloAuth} from "react-zalo-auth-kit";

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
const googleAuthProvider = new GoogleAuthProvider();
const phoneAuthProvider = new PhoneAuthProvider(auth);
const emailAuthProvider = new EmailAuthProvider();

// Initialize Zalo
const zaloConfig = {
	/**
	 * Your Zalo App ID of your app in Zalo Developer and this field is required
	 */
	appId: "3850903547114980520",
	/**
	 * The redirect URI of your app. Required if you are using the OAuth 2.0 authorization code flow.
	 * If you choose to use the popup flow, you can skip this parameter because the redirect URI will be
	 * get from the current page URL.
	 */
	// redirectUri: "http://localhost:3000",
	/**
	 * The scopes of the user information that your app requires.
	 * The Zalo SDK provide some basic scopes, you can find them in
	 * the document at https://developers.zalo.me/docs/api/social-api/tai-lieu/thong-tin-ten-anh-dai-dien-post-28
	 * If you want to use Firebase Custom Token to authenticate with Firebase, you must request the scope "id".
	 */
	scopes: ["id", "name", "picture.type(large)"],
	/**
	 * The custom token flow is a way to authenticate users using a custom token.
	 * Default is false. If you want to use custom token flow, set it to true.
	 * You need to provide a config of the custom token provider. In this case, we use Firebase.
	 * You need to provide an endpoint to generate custom token for your app.
	 * The endpoint should be a POST request that accepts a Zalo user id and returns a custom token
	 * The endpoint should return a JSON object with a "token" field.
	 * Currently, the custom token flow is only available for the Firebase Custom Token authorization code flow.
	 * Refer to https://firebase.google.com/docs/auth/admin/create-custom-tokens for more information
	 */
	customTokenFlow: {
		enabled: true, // default is false
		customTokenAuthConfig: auth, // const auth = getAuth(); - Firebase Auth
		endpoint: "https://us-central1-etrans-db.cloudfunctions.net/auth", // Your endpoint to generate custom token
	},
};
const zaloAuth = getZaloAuth(zaloConfig);
const zaloAuthProvider = new ZaloAuthProvider(zaloAuth);

function findByProviderId(providerData, providerId = '') {
	if (!providerData || providerData.length === 0 || !providerId) return null;
	return providerData.find(provider => provider.providerId === providerId);
}

function App() {

	const [isLogin, setIsLogin] = useState(false);

	const handleLogout = () => signOut(auth)

	const handleLinkOrUnlinkAccount = (provider) => {
		const providerId = provider.providerId;
		const providerData = auth.currentUser.providerData;
		if (!!findByProviderId(providerData, providerId)) {
			console.log("handleUnlinkAccount", {provider, currentUser: auth.currentUser});
			unlink(auth.currentUser, provider.providerId).then(() => {
				// Auth provider unlinked from account
				console.log("Account unlink success");
			}).catch((error) => {
				// An error happened
				console.log("Account unlink error", error);
			});
			return;
		}
		console.log("handleLinkAccount", {provider, currentUser: auth.currentUser});
		switch (providerId) {
			case "google.com":
				linkWithPopup(auth.currentUser, provider)
					.then((userCred) => {
						// Accounts successfully linked.
						const user = userCred.user;
						console.log("Account linking success", {userCred, user});
					})
					.catch((error) => {
						// Handle Errors here.
						console.log("Account linking error", error);
					});
				break;
			case "phone":
				const phoneParser = parsePhoneNumber("0969696969", "VN");
				console.log("phoneNumber", {phoneNumber: phoneParser.number, isValid: phoneParser.isValid()});
				if (!phoneParser.isValid()) return;
				const otp = '123456';
				let appVerifier = new RecaptchaVerifier('recaptcha-container', {
					'size': 'invisible'
				}, auth);
				console.log("appVerifier", {phoneNumber: phoneParser.number, otp, appVerifier});

				provider.verifyPhoneNumber(phoneParser.number, appVerifier)
					.then(verificationId => {
						const phoneCredential = PhoneAuthProvider.credential(verificationId, otp);
						console.log("phoneCredential", {phoneCredential, verificationId});
						linkWithCredential(auth.currentUser, phoneCredential)
							.then((userCred) => {
								const user = userCred.user;
								console.log("Account linking success", user);
							}).catch((error) => {
							console.log("Account linking error", error);
						});
					})
					.catch(error => {
						console.log("verifyPhoneNumber", error);
					});
				break;
			case "password":
				const credential = EmailAuthProvider.credential("lenguyenthuc.edu@gmail.com", "RT9YeCRB@2022");
				linkWithCredential(auth.currentUser, credential)
					.then((userCred) => {
						const user = userCred.user;
						console.log("Account linking success", {userCred, user});
					})
					.catch((error) => {
						console.log("Account linking error", error);
					});
				break;
			default:
				throw new Error("Provider not support");
		}
	}

	useEffect(() => {
		console.log(emailAuthProvider, googleAuthProvider, PhoneAuthProvider, zaloAuthProvider, zaloAuth)
		const unregisterAuthObserver = auth.onAuthStateChanged((user) => {
			setIsLogin(!!user);
		});
		return () => unregisterAuthObserver(); // Make sure we un-register Firebase observers when the component unmounts.
	}, []);

	useEffect(() => {
		const unregisterZaloAuthObserver = zaloAuth.onAuthStateChanged(zaloAuth, zaloAuthProvider, {showLoading: true});
		return () => unregisterZaloAuthObserver(); // Make sure we un-register Zalo observers when the component unmounts.
	}, []);

	if (isLogin) {
		return (
			<div>
				<p>
					<button onClick={() => handleLinkOrUnlinkAccount(googleAuthProvider)}>Google</button>
				</p>
				<p>
					<button onClick={() => handleLinkOrUnlinkAccount(phoneAuthProvider)}>Phone</button>
				</p>
				<div id="recaptcha-container"></div>
				<p>
					<button onClick={() => handleLinkOrUnlinkAccount(emailAuthProvider)}>Email</button>
				</p>
				<p>
					<button onClick={handleLogout}>Logout</button>
				</p>
			</div>
		);
	}

	return (
		<>
			<StyledFirebaseAuth
				uiConfig={{
					defaultCountry: "VN",
					signInOptions: [
						zaloAuthProvider,
						googleAuthProvider,
						phoneAuthProvider,
						emailAuthProvider,
					],
					callbacks: {
						signInSuccessWithAuthResult: (authResult) => {
							console.log('signInSuccessWithAuthResult', authResult);
						},
						signInFailure: (error) => {
							// Handle Errors here.
							const errorCode = error.code;
							const errorMessage = error.message;
							console.log('SignIn fail:', {errorCode, errorMessage, ...error});
						},
					},
					locale: {
						parsePhoneNumber
					}
				}}
				firebaseAuth={auth}
				zaloAuth={zaloAuth}
			/>
		</>
	);
}

export default App;
