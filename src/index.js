import useZaloAuthKit from "./useZaloAuthKit";
import ZaloLoginPopup from "./ZaloLoginPopup";
import ZaloLoginButton from "./ZaloLoginButton";
import ZaloStyledButton from "./ZaloStyledButton";
import {UserCredential, ZaloAuthProvider} from "./ZaloAuthProvider";
import {useZaloAuthFlow} from "./useZaloAuthFlow";
import pkceChallenge from "pkce-challenge";
import {openPopup, params} from "./util";
import {signInWithCustomToken} from "firebase/auth";
import {HideLoading, ShowLoading} from "./loading";

const MESSAGE_TYPE = {
	SUCCESS: {code: "SUCCESS", message: "Success"},
	UNKNOWN: {code: "UNKNOWN", message: "Unknown error"},
	MISSING_AUTH_APP: {code: "MISSING_AUTH_APP", message: "Missing auth app"},
	MISSING_THIRD_PARTY_AUTH_APP: {code: "MISSING_THIRD_PARTY_AUTH_APP", message: "Missing third party auth app"},
	MISSING_AUTH_PROVIDER: {code: "MISSING_AUTH_PROVIDER", message: "Missing auth provider"},
	MISSING_APP_ID: {code: "MISSING_APP_ID", message: "Missing app id"},
	MISSING_ACCESS_TOKEN: {code: "MISSING_ACCESS_TOKEN", message: "Missing access token"},
	MISSING_REFRESH_TOKEN: {code: "MISSING_REFRESH_TOKEN", message: "Missing refresh token"},
	MISSING_AUTH_CODE: {code: "MISSING_AUTH_CODE", message: "Missing auth code"},
	MISSING_CODE_VERIFIER: {code: "MISSING_CODE_VERIFIER", message: "Missing code verifier"},
	MISSING_CUSTOM_TOKEN: {code: "MISSING_CUSTOM_TOKEN", message: "Missing custom token"},
}

function getZaloAuth(config = {appId: '', redirectUri: undefined, customTokenFlow: undefined}) {
	const DEFAULT_STATE = 'zalo_auth';
	const OAUTH_URI = 'https://oauth.zaloapp.com/v4/permission';
	const ACCESS_TOKEN_URI = 'https://oauth.zaloapp.com/v4/access_token';
	return {
		...config,
		defaultState: DEFAULT_STATE,
		oauthUri: OAUTH_URI,
		accessTokenUri: ACCESS_TOKEN_URI,
		redirectUri: config.redirectUri || window.location.origin,
		onAuthStateChanged: (authApp, authProvider, options = {showLoading: false}) => {
			const fieldsRequired = ['code', 'state', 'code_challenge'];
			const callbackString = window.location.search;
			const hasCallback = fieldsRequired.every(field => callbackString.includes(field));
			if (options.showLoading && hasCallback) ShowLoading();
			const eventEmitter = (event) => {
				HideLoading();
				const message = event.message || 'onAuthStateChanged';
				console.log(message, event);
				window.opener.handleZaloResponse({...event, message});
				window.close();
			}
			const authStateChanged = setInterval(() => {
				if (hasCallback) {
					const eventData = params(callbackString).parser();
					const {authCode, codeVerifier} = {
						authCode: eventData['code'] || '',
						codeVerifier: window.atob(decodeURIComponent(eventData['state'] || '')),
					};
					signInWithAuthCode(authApp, authCode, codeVerifier)
						.then(authCredential => {
							signInWithZalo(authCredential, authProvider)
								.then(result => {
									/**
									 * If customTokenFlow is undefined, then use default flow
									 * If customTokenFlow is defined, use uid from result to get custom token
									 * and sign in with Firebase
									 */
									if (!config.customTokenFlow) return eventEmitter({...result, ...MESSAGE_TYPE.SUCCESS});

									if (!config.customTokenFlow.firebaseAuth) {
										return eventEmitter({
											...MESSAGE_TYPE.MISSING_THIRD_PARTY_AUTH_APP,
											refMessage: 'signInWithCustomToken:firebase-auth-app'
										});
									}
									const {firebaseAuth} = config.customTokenFlow;
									const {id, name, picture, accessToken, refreshToken} = result;
									const userCredential = new UserCredential(name, null, null, picture.data.url, id, refreshToken, accessToken);
									authProvider.credentialFromResult(userCredential)
										.then(({token}) => {
											if (!token) {
												return eventEmitter({
													...MESSAGE_TYPE.MISSING_CUSTOM_TOKEN,
													refMessage: 'signInWithCustomToken:custom-token'
												});
											}
											signInWithCustomToken(firebaseAuth, token)
												.then((userCred) => {
													eventEmitter({
														...userCred,
														...MESSAGE_TYPE.SUCCESS,
														providerId: authProvider.providerId,
														refMessage: 'signInWithCustomToken:success'
													})
												})
												.catch((error) => {
													eventEmitter({
														...error,
														...MESSAGE_TYPE.UNKNOWN,
														refMessage: 'signInWithCustomToken:custom-token'
													});
												})
										})
										.catch((error) => {
											eventEmitter({
												...error,
												...MESSAGE_TYPE.UNKNOWN,
												refMessage: 'signInWithCustomToken:custom-token'
											});
										})
								})
								.catch(error => eventEmitter({
									...error,
									refMessage: 'signInWithZalo:error',
									authCode,
									authCredential,
									codeVerifier,
									callbackString
								}));
						})
						.catch(error => eventEmitter({
							...error,
							refMessage: 'signInWithAuthCode:error',
							authCode,
							codeVerifier,
							callbackString
						}));
				}
			}, 5000);
			return () => clearInterval(authStateChanged);
		},
	};
}

/**
 * Get access token from Zalo OAuth Code
 * @param authApp {{appId: string, accessTokenUri: string}} - auth credential from Zalo Account Kit
 * @param authCode {string} - auth code from Zalo Account Kit
 * @param codeVerifier {string} - code verifier from PKCE Challenge
 * @returns {Promise<*>} - access token and refresh token from Zalo
 */
function signInWithAuthCode(authApp = {appId: '', accessTokenUri: ''}, authCode, codeVerifier) {
	const {appId, accessTokenUri} = authApp;
	return new Promise((resolve, reject) => {
		if (!authCode) {
			return reject(MESSAGE_TYPE.MISSING_AUTH_CODE);
		}
		if (!codeVerifier) return reject(MESSAGE_TYPE.MISSING_CODE_VERIFIER);

		const myHeaders = params({"Content-Type": "application/x-www-form-urlencoded"}).builder(new Headers());

		const urlencoded = params({
			code: authCode,
			app_id: appId,
			grant_type: 'authorization_code',
			code_verifier: codeVerifier
		}).builder();

		const requestOptions = {
			method: 'POST',
			headers: myHeaders,
			body: urlencoded,
			redirect: 'follow'
		};

		fetch(accessTokenUri, requestOptions).then(response => response.json())
			.then(result => {
				if (result.error) return reject({...MESSAGE_TYPE.UNKNOWN, ...result});
				resolve({
					...MESSAGE_TYPE.SUCCESS,
					accessToken: result.access_token,
					refreshToken: result.refresh_token
				});
			})
			.catch(error => reject({...MESSAGE_TYPE.UNKNOWN, ...error}));
	});
}

/**
 * Get access token from Zalo Refresh Token
 * @param authApp {{appId: string, accessTokenUri: string}} - auth credential from Zalo Account Kit
 * @param refreshToken {string} - refresh token from Zalo (from signInWithAuthCode and signInWithRefreshToken),
 * use only once to get a new access token and a new refresh token with the same scope and the expired time is
 * the remaining time of the first refresh token
 * @returns {Promise<any>} - access token and refresh token from Zalo
 */
function signInWithRefreshToken(authApp = {appId: '', accessTokenUri: ''}, refreshToken) {
	const {appId, accessTokenUri} = authApp;
	return new Promise((resolve, reject) => {
		if (!refreshToken) return reject(MESSAGE_TYPE.MISSING_REFRESH_TOKEN);

		const myHeaders = params({"Content-Type": "application/x-www-form-urlencoded"}).builder(new Headers());

		const urlencoded = params({
			refresh_token: refreshToken,
			app_id: appId,
			grant_type: 'refresh_token',
		}).builder();

		const requestOptions = {
			method: 'POST',
			headers: myHeaders,
			body: urlencoded,
			redirect: 'follow'
		};

		fetch(accessTokenUri, requestOptions).then(response => response.json())
			.then(resolve)
			.catch(error => reject({...MESSAGE_TYPE.UNKNOWN, ...error}));
	});
}

function signInWithZalo(authCredential = {accessToken: '', refreshToken: ''}, authProvider = {scopes: ['id']}) {
	const {accessToken} = authCredential;
	const scopes = authProvider.getScopes();
	const GRAPH_API = 'https://graph.zalo.me/v2.0';
	return new Promise((resolve, reject) => {
		if (!accessToken) return reject(MESSAGE_TYPE.MISSING_ACCESS_TOKEN);

		const myHeaders = params({
			access_token: accessToken,
			"Cookie": "_zlang=vn"
		}).builder(new Headers());

		const requestOptions = {
			method: 'GET',
			headers: myHeaders,
			redirect: 'follow'
		};

		fetch(`${GRAPH_API}/me?fields=${scopes.toString()}`, requestOptions)
			.then(response => response.json())
			.then(result => {
				if (result.error) return reject({...MESSAGE_TYPE.UNKNOWN, ...result});
				resolve({
					...result,
					...authCredential,
					...MESSAGE_TYPE.SUCCESS
				});
			})
			.catch(error => reject({...MESSAGE_TYPE.UNKNOWN, ...error}));
	});
}

function signInZaloWithPopup(authApp, authProvider) {
	return new Promise((resolve, reject) => {
		if (!authApp) {
			return reject(MESSAGE_TYPE.MISSING_AUTH_APP);
		}
		if (!authProvider) {
			return reject(MESSAGE_TYPE.MISSING_AUTH_PROVIDER);
		}
		const {appId, oauthUri, redirectUri} = authApp;
		if (!appId) {
			return reject(MESSAGE_TYPE.MISSING_APP_ID);
		}
		const {code_verifier, code_challenge} = pkceChallenge(43); // 43 is the Zalo recommended length
		console.log('pkce generated', {code_verifier, code_challenge});
		const url = `${oauthUri}?app_id=${appId}&redirect_uri=${redirectUri}&state=${window.btoa(code_verifier)}&code_challenge=${code_challenge}`;
		openPopup(url);

		window.handleZaloResponse = function (event) {
			if (event.code !== "SUCCESS") {
				return reject(event);
			}
			resolve({...MESSAGE_TYPE.SUCCESS, ...event, message: event.message || MESSAGE_TYPE.SUCCESS.message});
		}
	});
}

export {
	useZaloAuthKit,
	ZaloLoginPopup,
	ZaloLoginButton,
	ZaloStyledButton,
	useZaloAuthFlow,
	ZaloAuthProvider,
	getZaloAuth,
	signInZaloWithPopup,
	signInWithAuthCode,
	signInWithRefreshToken,
	signInWithZalo,
};