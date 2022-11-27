import {useEffect, useState} from "react";
import {openPopup, params} from "./util";
import pkceChallenge from "pkce-challenge";

const OAUTH_URI = 'https://oauth.zaloapp.com/v4/permission';
const ACCESS_TOKEN_URI = 'https://oauth.zaloapp.com/v4/access_token';

export function useZaloAuthFlow() {
	const [state, setState] = useState('');

	/**
	 * Get access token from Zalo OAuth Code
	 * @param appId {string} - Zalo App ID
	 * @param authCode {string} - auth code from Zalo Account Kit
	 * @param codeVerifier {string} - code verifier from PKCE Challenge
	 * @returns {Promise<*>} - access token and refresh token from Zalo
	 */
	function signInWithAuthCode(appId, authCode, codeVerifier) {
		return new Promise((resolve, reject) => {
			if (!authCode || !codeVerifier) return reject(new Error('Missing auth code or code verifier'));

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

			fetch(ACCESS_TOKEN_URI, requestOptions).then(response => response.json()).then(resolve).catch(reject);
		});
	}

	/**
	 * Get access token from Zalo Refresh Token
	 * @param appId {string} - Zalo App ID
	 * @param refreshToken {string} - refresh token from Zalo (from signInWithAuthCode and signInWithRefreshToken),
	 * use only once to get a new access token and a new refresh token with the same scope and the expired time is
	 * the remaining time of the first refresh token
	 * @returns {Promise<any>} - access token and refresh token from Zalo
	 */
	function signInWithRefreshToken(appId, refreshToken) {
		return new Promise((resolve, reject) => {
			if (!refreshToken) return reject(new Error('Missing refresh token'));

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

			fetch(ACCESS_TOKEN_URI, requestOptions).then(response => response.json()).then(resolve).catch(reject);
		});
	}

	useEffect(() => {
		const syncState = setInterval(() => {
			const fieldsRequired = ['code', 'state', 'code_challenge'];
			const callbackString = window.location.search;
			if (fieldsRequired.every(field => callbackString.includes(field)) && callbackString.includes(state)) {
				window.opener.handleZaloResponse(callbackString);
				window.close();
			}
		}, 500);
		return () => clearInterval(syncState);
	});

	return {
		signInZaloWithPopup(authConfig, authProvider) {
			return new Promise((resolve, reject) => {
				if (!authConfig) {
					return reject(new Error('No auth config'));
				}
				if (!authProvider) {
					return reject(new Error('No auth provider'));
				}
				const {appId, state} = authConfig;
				if (!appId) {
					return reject(new Error('No app id'));
				}
				setState(state);
				const {code_verifier, code_challenge} = pkceChallenge(43); // 43 is the Zalo recommended length
				console.log('pkce generated', {code_verifier, code_challenge});
				const url = `${OAUTH_URI}?app_id=${appId}&redirect_uri=${window.location.origin}&state=${state}&code_challenge=${code_challenge}`;
				openPopup(url);

				window.handleZaloResponse = function (event) {
					console.log('handleZaloResponse', event);
					const {code} = params(event).parser();
					if (!code) {
						return reject(new Error('No auth code'));
					}
					signInWithAuthCode(appId, code, code_verifier)
						.then(response => {
							if (response.error) {
								const {error_description} = response;
								return reject(new Error(error_description));
							}
							const {access_token, refresh_token} = response;
							resolve({
								accessToken: access_token,
								refreshToken: refresh_token,
							});
						})
						.catch(reject);
				}
			});
		},
		signInZaloWithRefreshToken(authConfig, authProvider, refreshToken) {
			return new Promise((resolve, reject) => {
				if (!authConfig) {
					return reject(new Error('No auth config'));
				}
				if (!authProvider) {
					return reject(new Error('No auth provider'));
				}
				const {appId} = authConfig;
				if (!appId) {
					return reject(new Error('No app id'));
				}
				// const {refreshToken} = authProvider;
				if (!refreshToken) {
					return reject(new Error('No refresh token'));
				}
				signInWithRefreshToken(appId, refreshToken)
					.then(response => {
						if (response.error) {
							const {error_description} = response;
							return reject(new Error(error_description));
						}
						resolve(response);
					})
					.catch(reject);
			});
		}
	}
}