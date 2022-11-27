import {params} from "./util";

export function signInWithZalo(authCredential = {accessToken: ''}, authProvider = {scopes: ['id']}) {
	const {accessToken} = authCredential;
	const scopes = authProvider.getScopes();
	const GRAPH_API = 'https://graph.zalo.me/v2.0';
	return new Promise((resolve, reject) => {
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

		fetch(`${GRAPH_API}/me?fields=${scopes.toString()}`, requestOptions)
			.then(response => response.json())
			.then(resolve)
			.catch(reject);
	});
}