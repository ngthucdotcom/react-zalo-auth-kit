import pkceChallenge, {verifyChallenge} from "pkce-challenge";

/**
 * Hook to wrap Zalo Social Authentication
 * @param initialState {{appId: string, redirectUri: string, providerId?: string, permissions?: string[]}}
 * @returns {{
 * login: login,
 * typeOf: typeOf,
 * params: params,
 * pkceCode: pkceCode,
 * providerId: string,
 * oauthRequest: oauthRequest,
 * isZaloPlatform: isZaloPlatform,
 * hasParamsToProcess: hasParamsToProcess,
 * signInWithAuthCode: signInWithAuthCode,
 * signInWithRefreshToken: signInWithRefreshToken,
 * signInSuccessWithAccessToken: signInSuccessWithAccessToken,
 * }}
 */
export default function useZaloAuthKit(initialState = {
	appId: '',
	redirectUri: '',
	providerId: 'zalo.me',
	permissions: ['id', 'name', 'picture']
}) {
	const {providerId, appId, redirectUri, permissions} = initialState;
	const oauthUri = 'https://oauth.zaloapp.com/v4/permission';
	const accessTokenUri = 'https://oauth.zaloapp.com/v4/access_token';
	const graphUri = 'https://graph.zalo.me/v2.0';

	/**
	 * Check client using the Zalo app or neither
	 * @returns {boolean} true if using on Zalo app
	 */
	function isZaloPlatform() {
		return new RegExp(/(Z|z)(alo|browser)/g).test(navigator.userAgent);
	}

	/**
	 * Return type of input
	 * @param input {*}
	 * @returns {string}
	 */
	function typeOf(input) {
		return Object.prototype.toString.call(input).slice(8, -1).toLowerCase();
	}

	/**
	 * Handler for object to query string
	 * @param obj {*}
	 * @returns {{builder: (function(*=): string), stringify: (function(*=): string), parser: (function(*=): string)}}
	 */
	function params(obj) {
		const type = typeOf(obj);
		return {
			builder(instance = new URLSearchParams()) {
				if (!obj || type !== 'object') return {}; // type not available
				for (const key in obj) {
					instance.append(key, obj[key]);
				}
				// default return instance of URLSearchParams
				return instance;
			},
			stringify(instance = new URLSearchParams()) {
				if (!obj || type !== 'object') return ''; // type not available
				for (const key in obj) {
					instance.append(key, obj[key]);
				}
				return instance.toString().indexOf('[object ') === 0 ? JSON.stringify(instance) : instance.toString();
			},
			parser() {
				if (!obj || type !== 'string') return {}; // type not available
				const instance = new URLSearchParams(obj);
				const result = {};
				for (const [key, value] of instance) {
					result[key] = value;
				}
				return result;
			}
		}
	}

	/**
	 * PKCE tools
	 * @returns {{
	 * generate: (function(): {code_verifier: string, code_challenge: string}),
	 * verify: (function(code_verifier: string, code_challenge: string): boolean)
	 * }}
	 */
	function pkceCode() {
		return {
			/**
			 * Generate code verifier and code challenge
			 * @param size {number}, default 43 by Zalo Docs
			 * @returns {{code_verifier: string, code_challenge: string}}
			 */
			generate(size = 43) {
				const {code_verifier, code_challenge} = pkceChallenge(size);
				return [code_verifier, code_challenge];
			},
			/**
			 * Verify code verifier and code challenge
			 * @param code_challenge {string}
			 * @param code_verifier {string}
			 * @returns {boolean} true if valid
			 */
			verify(code_challenge, code_verifier) {
				return verifyChallenge(code_verifier, code_challenge);
			}
		}
	}

	/**
	 * Check params is valid
	 * @param args
	 * @returns {false|this is T[]|boolean}
	 */
	function hasParamsToProcess(args = "") {
		if (!args) return false;
		const argsParsed = params(args).parser();
		const compareFields = ['code', 'state', 'code_challenge'];
		const lengthValid = compareFields.length === Object.keys(argsParsed).length;
		const hasAllFields = compareFields.every(field => argsParsed.hasOwnProperty(field));
		return lengthValid && hasAllFields;
	}

	/**
	 * Request Zalo OAuth Code with PKCE
	 * @param state {string}
	 * @param codeChallenge {string} is required
	 * @returns {[{requestUrl: string, code_verifier: string, code_challenge: string},(function(*): boolean)]}
	 */
	function oauthRequest(state = '', codeChallenge = "") {
		if (isZaloPlatform() || !codeChallenge) return "";
		const urlencoded = params({
			redirect_uri: redirectUri,
			state,
			app_id: appId,
			code_challenge: codeChallenge
		}).builder();
		return `${oauthUri}?${urlencoded}`;
	}

	/**
	 * Get access token from Zalo OAuth Code
	 * @param authCode {string} - auth code from Zalo Account Kit
	 * @param codeVerifier {string} - code verifier from PKCE Challenge
	 * @returns {Promise<*>} - access token and refresh token from Zalo
	 */
	function signInWithAuthCode(authCode, codeVerifier) {
		return new Promise((resolve, reject) => {
			if (isZaloPlatform()) return reject(new Error('Not available on Zalo App'));
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

			fetch(accessTokenUri, requestOptions).then(response => response.json()).then(resolve).catch(reject);
		});
	}

	/**
	 * Get access token from Zalo Refresh Token
	 * @param refreshToken {string} - refresh token from Zalo (from signInWithAuthCode and signInWithRefreshToken),
	 * use only once to get a new access token and a new refresh token with the same scope and the expired time is
	 * the remaining time of the first refresh token
	 * @returns {Promise<any>} - access token and refresh token from Zalo
	 */
	function signInWithRefreshToken(refreshToken) {
		return new Promise((resolve, reject) => {
			if (isZaloPlatform()) return reject(new Error('Not available on Zalo App'));
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

			fetch(accessTokenUri, requestOptions).then(response => response.json()).then(resolve).catch(reject);
		});
	}

	/**
	 * Get user profile from Zalo
	 * @param accessToken {string} - access token from Zalo, get from signInWithAuthCode or signInWithRefreshToken
	 * @returns {Promise<any>} - user profile from Zalo with info defined in scopes/permissions
	 */
	function signInSuccessWithAccessToken(accessToken) {
		return new Promise((resolve, reject) => {
			if (isZaloPlatform()) return reject(new Error('Not available on Zalo App'));
			if (!accessToken) return reject(new Error('Missing access token'));

			const myHeaders = params({
				access_token: accessToken,
				"Cookie": "_zlang=vn"
			}).builder(new Headers());

			const requestOptions = {
				method: 'GET',
				headers: myHeaders,
				redirect: 'follow'
			};

			fetch(`${graphUri}/me?fields=${permissions.toString()}`, requestOptions)
				.then(response => response.json())
				.then(resolve)
				.catch(reject);
		});
	}

	function login(redirectParamsString = '', codeVerifier = '') {
		return new Promise((resolve, reject) => {
			if (isZaloPlatform()) return reject(new Error('Not available on Zalo App'));
			if (!redirectParamsString || !codeVerifier) return reject(new Error('Missing redirect params or code verifier'));
			if (!hasParamsToProcess(redirectParamsString)) {
				return reject(new Error('Invalid redirect params'));
			}
			const {code, code_challenge} = params(redirectParamsString).parser();
			if (!pkceCode().verify(code_challenge, codeVerifier)) {
				return reject(new Error('Verify code challenge failed'));
			}
			signInWithAuthCode(code, codeVerifier)
				.then((userCredential) => {
					signInSuccessWithAccessToken(userCredential?.access_token)
						.then((userData) => {
							const result = {
								accessToken: userCredential?.access_token,
								displayName: userData?.name,
								photoURL: userData?.picture?.data?.url,
								uid: userData?.id,
								providerData: [{
									providerId: "zalo.me",
									scopes: permissions,
								}]
							}
							resolve({
								operationType: "signIn",
								providerId: "zalo.me",
								user: result,
								isSignedIn: true,
							});
						});
				});
		});
	}

	return {
		login,
		typeOf,
		params,
		pkceCode,
		providerId,
		oauthRequest,
		isZaloPlatform,
		hasParamsToProcess,
		signInWithAuthCode,
		signInWithRefreshToken,
		signInSuccessWithAccessToken
	}
}