/**
 * User profile information, visible only to the Firebase project's apps.
 *
 * @public
 */
export declare interface UserInfo {
	/**
	 * The display name of the user.
	 */
	readonly displayName: string | null;
	/**
	 * The phone number normalized based on the E.164 standard (e.g. +16505550101) for the
	 * user.
	 *
	 * @remarks
	 * This is null if the user has no phone credential linked to the account.
	 */
	readonly phoneNumber: string | null;
	/**
	 * The profile photo URL of the user.
	 */
	readonly photoURL: string | null;
	/**
	 * The provider used to authenticate the user.
	 */
	readonly providerId: string;
	/**
	 * The user's unique ID, scoped to the project.
	 */
	readonly uid: string;
}

/**
 * A user account.
 *
 * @public
 */
export declare interface User extends UserInfo {
	/**
	 * Additional per provider such as displayName and profile information.
	 */
	readonly providerData: UserInfo[];
	/**
	 * Access token
	 */
	readonly accessToken: string;
	/**
	 * Refresh token used to reauthenticate the user. Avoid using this directly and prefer
	 * {@link User.getIdToken} to refresh the ID token instead.
	 */
	readonly refreshToken: string;

	/**
	 * Returns a JSON-serializable representation of this object.
	 *
	 * @returns A JSON-serializable representation of this object.
	 */
	toJSON(): object;
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
export declare interface UserCredential {
	/**
	 * The user authenticated by this credential.
	 */
	user: User;
	/**
	 * The provider which was used to authenticate the user.
	 */
	providerId: string | null;
}

/**
 * Interface that represents the credentials returned by an {@link AuthProvider}.
 *
 * @remarks
 * Implementations specify the details about each auth provider's credential requirements.
 *
 * @public
 */
export declare class AuthCredential {
	/**
	 * The authentication provider ID for the credential.
	 *
	 * @remarks
	 * For example, 'zalo.me'.
	 */
	readonly providerId: string;

	/* Excluded from this release type: __constructor */
	/**
	 * Returns a JSON-serializable representation of this object.
	 *
	 * @returns a JSON-serializable representation of this object.
	 */
	toJSON(): object;

	/* Excluded from this release type: _getIdTokenResponse */
	/* Excluded from this release type: _linkToIdToken */
	/* Excluded from this release type: _getReauthenticationResolver */
}

/**
 * Interface that represents an auth provider, used to facilitate creating {@link AuthCredential}.
 *
 * @public
 */
export declare interface AuthProvider {
	/**
	 * Provider for which credentials can be constructed.
	 */
	readonly providerId: string;

	/* Excluded from this release type: scopes */
	/**
	 * Add an OAuth scope to the credential.
	 *
	 * @param scope - Provider OAuth scope to add.
	 */
	addScope(scope: string): void;

	/**
	 * Retrieve the current list of OAuth scopes.
	 */
	getScopes(): string[];
}

/**
 * Provider for generating {@link ZaloAuthProvider}.
 *
 * @public
 */
export class ZaloAuthProvider implements AuthProvider {
	/** Always set to {@link PROVIDER_ID}.ZALO. **/
	readonly providerId: string;
	readonly scopes: string[] = [];
	private serviceProviderUrl: string | null | undefined = '';

	constructor(serviceProviderUrl?: string) {
		this.providerId = "zalo.me";
		this.scopes = ["id"];
		this.serviceProviderUrl = serviceProviderUrl || null;
	}

	addScope(scope: string): void {
		this.scopes.push(scope);
	}

	getScopes(): string[] {
		return this.scopes;
	}

	credentialFromResult(userCredential: UserCredential): Promise<any> {
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