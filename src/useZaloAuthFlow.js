import {useEffect} from "react";

export function signInZaloWithPopup(authConfig, authProvider) {
	const {appId, state} = authConfig;
	const oauthUri = 'https://oauth.zaloapp.com/v4/permission';

	window.handleZaloResponse = function (event) {
		return new Promise((resolve, reject) => {
			if (!event) {
				return reject(new Error('No oauth response'));
			}

			const {data} = event;
			if (data.error) {
				return reject(new Error(data.error));
			}

			const {code} = data;
			if (!code) {
				return reject(new Error('No code'));
			}
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
}