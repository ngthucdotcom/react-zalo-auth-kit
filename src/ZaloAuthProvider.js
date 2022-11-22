/**
 * Provider for generating {@link ZaloAuthProvider}.
 *
 * @public
 */
export class ZaloAuthProvider {
	/** Always set to {@link PROVIDER_ID}.ZALO. **/
	static PROVIDER_ID = "zalo.me";
	providerId;
	scopes = [];
	serviceProviderUrl = '';

	constructor(serviceProviderUrl) {
		this.providerId = "zalo.me";
		this.scopes = ["id"];
		this.serviceProviderUrl = serviceProviderUrl || null;
	}

	addScope(scope) {
		this.scopes.push(scope);
	}

	getScopes() {
		return this.scopes;
	}

	credentialFromResult(userCredential) {
		return new Promise((resolve, reject) => {
			if (!this.serviceProviderUrl) {
				return reject(new Error("serviceProviderUrl is null"));
			}
			const endpoint = this.serviceProviderUrl || "";
			if (!userCredential) {
				return reject(new Error("userCredential is null"));
			}
			const {uid, accessToken} = userCredential.user;
			console.log('handleButtonClicked', {userCredential, uid, accessToken});
			const myHeaders = new Headers();
			myHeaders.append("Content-Type", "application/json");

			fetch(endpoint, {
				method: 'POST',
				headers: myHeaders,
				body: JSON.stringify({"uid": uid}),
				redirect: 'follow'
			}).then(response => response.json())
				.then(({token}) => {
					console.log('result', {token, credential: userCredential.user});
					resolve({token, credential: userCredential.user});
				})
				.catch(error => {
					console.log('error', error);
					reject(error);
				});
		})
	}
}