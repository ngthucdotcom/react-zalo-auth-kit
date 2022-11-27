/**
 * Enumeration of supported operation types.
 *
 * @public
 */
export const OperationType = {
	/** Operation involving linking an additional provider to an already signed-in user. */
	LINK: "link",
	/** Operation involving using a provider to reauthenticate an already signed-in user. */
	REAUTHENTICATE: "reauthenticate",
	/** Operation involving signing in a user. */
	SIGN_IN: "signIn"
};
/**
 * User profile information, visible only to the Firebase project's apps.
 *
 * @public
 */
export class UserInfo {
	/**
	 * The display name of the user.
	 */
	displayName = '';
	/**
	 * The email of the user.
	 */
	email = '';
	/**
	 * The phone number normalized based on the E.164 standard (e.g. +16505550101) for the
	 * user.
	 *
	 * @remarks
	 * This is null if the user has no phone credential linked to the account.
	 */
	phoneNumber = '';
	/**
	 * The profile photo URL of the user.
	 */
	photoURL = '';
	/**
	 * The provider used to authenticate the user.
	 */
	providerId = ZaloAuthProvider.PROVIDER_ID;
	/**
	 * The user's unique ID, scoped to the project.
	 */
	uid = '';

	constructor(displayName, email, phoneNumber, photoURL, uid) {
		this.displayName = displayName;
		this.email = email;
		this.phoneNumber = phoneNumber;
		this.photoURL = photoURL;
		this.uid = uid;
	}
}
/**
 * A user account.
 *
 * @public
 */
export class User extends UserInfo {
	/**
	 * Refresh token used to reauthenticate the user
	 */
	idToken = '';

	constructor(displayName, email, phoneNumber, photoURL, uid, idToken) {
		super(displayName, email, phoneNumber, photoURL, uid);
		this.idToken = idToken;
	}
	/**
	 * Returns a JSON-serializable representation of this object.
	 *
	 * @returns A JSON-serializable representation of this object.
	 */
	toJSON() {
		return {
			uid: this.uid,
			displayName: this.displayName,
			email: this.email,
			phoneNumber: this.phoneNumber,
			photoURL: this.photoURL,
			providerId: this.providerId,
			idToken: this.idToken,
		};
	}
}
/**
 * A structure containing a {@link User}, the {@link OperationType}, and the provider ID.
 *
 * @remarks
 * `operationType` could be {@link OperationType}.SIGN_IN for a sign-in operation,
 * {@link OperationType}.LINK for a linking operation and {@link OperationType}.REAUTHENTICATE for
 * a reauthentication operation.
 *
 * @public
 */
export class UserCredential {
	/**
	 * The user authenticated by this credential.
	 */
	user = new User();
	/**
	 * The provider which was used to authenticate the user.
	 */
	providerId = ZaloAuthProvider.PROVIDER_ID;
	/**
	 * The access token used to authenticate the user.
	 * @type {string}
	 */
	accessToken = '';
	/**
	 * The type of operation which was used to authenticate the user (such as sign-in or link).
	 */
	operationType = OperationType.SIGN_IN;

	constructor(displayName, email, phoneNumber, photoURL, uid, idToken, accessToken) {
		this.user = new User(displayName, email, phoneNumber, photoURL, uid, idToken);
		this.accessToken = accessToken;
	}
}
/**
 * Provider for generating {@link ZaloAuthProvider}.
 *
 * @public
 */
export class ZaloAuthProvider {
	/** Always set to {@link PROVIDER_ID}.ZALO. **/
	static PROVIDER_ID = "zalo.me";
	providerId = ZaloAuthProvider.PROVIDER_ID;
	scopes = ["id"];
	serviceProviderUrl = '';

	constructor(serviceProviderUrl) {
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
				return reject({
					code: "auth/invalid-credential",
					message: "Missing service provider URL",
				});
			}
			const endpoint = this.serviceProviderUrl || "";
			if (!userCredential) {
				return reject({
					code: "auth/invalid-credential",
					message: "Invalid credential",
				});
			}
			const {uid, accessToken, idToken} = userCredential.user;
			const myHeaders = new Headers();
			myHeaders.append("Content-Type", "application/json");

			fetch(endpoint, {
				method: 'POST',
				headers: myHeaders,
				body: JSON.stringify({
					"uid": uid,
					"accessToken": accessToken,
					"refreshToken": idToken
				}),
				redirect: 'follow'
			}).then(response => response.json())
				.then(({token}) => {
					resolve({
						uid: uid,
						token: token,
						idToken: idToken,
						providerId: this.providerId,
					});
				})
				.catch(error => {
					reject({
						...error,
						code: "auth/invalid-credential",
						message: "Invalid credential",
					});
				});
		})
	}
}