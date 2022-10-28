import pkceChallenge, {verifyChallenge} from "pkce-challenge";
import queryString from "query-string";

export default function useZaloAccountKit(initialState = {
	providerId: '',
	state: '',
	appId: '',
	redirectUri: '',
	scopes: ['id', 'name', 'picture']
}) {
	const {providerId, state, appId, redirectUri, scopes} = initialState;
	const challenge = pkceChallenge(43);
	const oauthUri = 'https://oauth.zaloapp.com/v4/permission';
	const accessTokenUri = 'https://oauth.zaloapp.com/v4/access_token';
	const graphUri = 'https://graph.zalo.me/v2.0';
	const oauthUrl = queryString.stringifyUrl({
		url: 'https://oauth.zaloapp.com/v4/permission',
		query: {
			redirect_uri: redirectUri,
			state,
			app_id: appId,
			code_challenge: challenge.code_challenge
		}
	});

	function params(obj = {}) {
		return {
			builder(instance = new URLSearchParams()) {
				for (const key in obj) {
					instance.append(key, obj[key]);
				}
				// default return instance of URLSearchParams
				return instance;
			}
		}
	}

	function pkceCode() {
		return {
			generate(size = 43) {
				return pkceChallenge(size);
			},
			verify(code_challenge, code_verifier) {
				return verifyChallenge(code_verifier, code_challenge);
			}
		}
	}

	function oauthRequest(state = '', pkceSpecs = {length: 43}) {
		const challenge = pkceCode().generate(pkceSpecs.length);
		const urlencoded = params({
			redirect_uri: redirectUri,
			state,
			app_id: appId,
			code_challenge: challenge.code_challenge
		}).builder();
		return [{requestUrl: `${oauthUri}?${urlencoded}`, ...challenge}, function (code_challenge) {
			return pkceCode().verify(code_challenge, challenge.code_verifier);
		}];
	}

	/**
	 * Get access token from Zalo Account Kit
	 * @param authCode {string} - auth code from Zalo Account Kit
	 * @param codeVerifier {string} - code verifier from PKCE Challenge
	 * @returns {Promise<*>}
	 */
	function signInWithAuthCode(authCode, codeVerifier) {
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

		return fetch(accessTokenUri, requestOptions).then(response => response.json());
	}

	function signInWithRefreshToken(refreshToken) {
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

		return fetch(accessTokenUri, requestOptions).then(response => response.json());
	}

	function signInSuccessWithAccessToken(accessToken) {
		const myHeaders = params({
			access_token: accessToken,
			"Cookie": "_zlang=vn"
		}).builder(new Headers());

		const requestOptions = {
			method: 'GET',
			headers: myHeaders,
			redirect: 'follow'
		};

		return fetch(`${graphUri}/me?fields=${scopes.toString()}`, requestOptions).then(response => response.json());
	}

	return {
		providerId,
		oauthUrl,
		oauthRequest,
		signInWithAuthCode,
		signInWithRefreshToken,
		signInSuccessWithAccessToken
	}
}