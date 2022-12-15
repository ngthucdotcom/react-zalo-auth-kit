/**
 * Interface representing Firebase Auth service.
 *
 * @remarks
 * See {@link https://firebase.google.com/docs/auth/ | Firebase Authentication} for a full guide
 * on how to use the Firebase Auth service.
 *
 * @public
 */
export class Auth {
	/** The {@link @firebase/app#FirebaseApp} associated with the `Auth` service instance. */
	app = new FirebaseApp();
	/** The name of the app associated with the `Auth` service instance. */
	name = '';
	/** The {@link Config} used to initialize this instance. */
	config = new Config();
	/**
	 * The {@link Auth} instance's language code.
	 *
	 * @remarks
	 * This is a readable/writable property. When set to null, the default Firebase Console language
	 * setting is applied. The language code will propagate to email action templates (password
	 * reset, email verification and email change revocation), SMS templates for phone authentication,
	 * reCAPTCHA verifier and OAuth popup/redirect operations provided the specified providers support
	 * localization with the language code specified.
	 */
	languageCode = '';
	/**
	 * The {@link Auth} instance's tenant ID.
	 *
	 * @remarks
	 * This is a readable/writable property. When you set the tenant ID of an {@link Auth} instance, all
	 * future sign-in/sign-up operations will pass this tenant ID and sign in or sign up users to
	 * the specified tenant project. When set to null, users are signed in to the parent project.
	 *
	 * @example
	 * ```javascript
	 * // Set the tenant ID on Auth instance.
	 * auth.tenantId = 'TENANT_PROJECT_ID';
	 *
	 * // All future sign-in request now include tenant ID.
	 * const result = await signInWithEmailAndPassword(auth, email, password);
	 * // result.user.tenantId should be 'TENANT_PROJECT_ID'.
	 * ```
	 *
	 * @defaultValue null
	 */
	tenantId = '';
	/**
	 * The {@link Auth} instance's settings.
	 *
	 * @remarks
	 * This is used to edit/read configuration related options such as app verification mode for
	 * phone authentication.
	 */
	settings = new AuthSettings();
	/**
	 * Adds an observer for changes to the user's sign-in state.
	 *
	 * @remarks
	 * To keep the old behavior, see {@link Auth.onIdTokenChanged}.
	 *
	 * @param nextOrObserver - callback triggered on change.
	 * @param error - Deprecated. This callback is never triggered. Errors
	 * on signing in/out can be caught in promises returned from
	 * sign-in/sign-out functions.
	 * @param completed - Deprecated. This callback is never triggered.
	 */
	onAuthStateChanged(nextOrObserver, error, completed) {}
	/**
	 * Adds an observer for changes to the signed-in user's ID token.
	 *
	 * @remarks
	 * This includes sign-in, sign-out, and token refresh events.
	 *
	 * @param nextOrObserver - callback triggered on change.
	 * @param error - Deprecated. This callback is never triggered. Errors
	 * on signing in/out can be caught in promises returned from
	 * sign-in/sign-out functions.
	 * @param completed - Deprecated. This callback is never triggered.
	 */
	onIdTokenChanged(nextOrObserver, error, completed) {}
	/** The currently signed-in user (or null). */
	currentUser = new User();
	/**
	 * Asynchronously sets the provided user as {@link Auth.currentUser} on the {@link Auth} instance.
	 *
	 * @remarks
	 * A new instance copy of the user provided will be made and set as currentUser.
	 *
	 * This will trigger {@link Auth.onAuthStateChanged} and {@link Auth.onIdTokenChanged} listeners
	 * like other sign in methods.
	 *
	 * The operation fails with an error if the user to be updated belongs to a different Firebase
	 * project.
	 *
	 * @param user - The new {@link User}.
	 */
	updateCurrentUser(user) {
		return Promise.resolve();
	}
	/**
	 * Signs out the current user.
	 */
	signOut() {
		return Promise.resolve();
	}
}
/**
 * Interface that represents the credentials returned by an {@link AuthProvider}.
 *
 * @remarks
 * Implementations specify the details about each auth provider's credential requirements.
 *
 * @public
 */
export class AuthCredential {
	/**
	 * The authentication provider ID for the credential.
	 *
	 * @remarks
	 * For example, 'facebook.com', or 'google.com'.
	 */
	providerId = '';
	/**
	 * The authentication sign in method for the credential.
	 *
	 * @remarks
	 * For example, {@link SignInMethod}.EMAIL_PASSWORD, or
	 * {@link SignInMethod}.EMAIL_LINK. This corresponds to the sign-in method
	 * identifier as returned in {@link fetchSignInMethodsForEmail}.
	 */
	signInMethod = '';
	/* Excluded from this release type: __constructor */
	/**
	 * Returns a JSON-serializable representation of this object.
	 *
	 * @returns a JSON-serializable representation of this object.
	 */
	toJSON() {
		return {};
	}
	/* Excluded from this release type: _getIdTokenResponse */
	/* Excluded from this release type: _linkToIdToken */
	/* Excluded from this release type: _getReauthenticationResolver */
}
/**
 * Interface for an `Auth` error.
 *
 * @public
 */
export class AuthError extends FirebaseError {
	/** Details about the Firebase Auth error.  */
	customData = {
		/** The name of the Firebase App which triggered this error.  */
		appName: '',
		/** The email address of the user's account, used for sign-in and linking. */
		email: '',
		/** The phone number of the user's account, used for sign-in and linking. */
		phoneNumber: '',
		/**
		 * The tenant ID being used for sign-in and linking.
		 *
		 * @remarks
		 * If you use {@link signInWithRedirect} to sign in,
		 * you have to set the tenant ID on the {@link Auth} instance again as the tenant ID is not persisted
		 * after redirection.
		 */
		tenantId: '',
	};
}
/**
 * A map of potential `Auth` error codes, for easier comparison with errors
 * thrown by the SDK.
 *
 * @remarks
 * Note that you can't tree-shake individual keys
 * in the map, so by using the map you might substantially increase your
 * bundle size.
 *
 * @public
 */
/**
 * Interface that represents an auth provider, used to facilitate creating {@link AuthCredential}.
 *
 * @public
 */
export class AuthProvider {
	/**
	 * Provider for which credentials can be constructed.
	 */
	providerId = '';
	/**
	 * Constructs the current provider using the provided ID.
	 */
	constructor(providerId) {
		this.providerId = providerId;
	}
}
/**
 * Interface representing an {@link Auth} instance's settings.
 *
 * @remarks Currently used for enabling/disabling app verification for phone Auth testing.
 *
 * @public
 */
export class AuthSettings {
	/**
	 * When set, this property disables app verification for the purpose of testing phone
	 * authentication. For this property to take effect, it needs to be set before rendering a
	 * reCAPTCHA app verifier. When this is disabled, a mock reCAPTCHA is rendered instead. This is
	 * useful for manual testing during development or for automated integration tests.
	 *
	 * In order to use this feature, you will need to
	 * {@link https://firebase.google.com/docs/auth/web/phone-auth#test-with-whitelisted-phone-numbers | whitelist your phone number}
	 * via the Firebase Console.
	 *
	 * The default value is false (app verification is enabled).
	 */
	appVerificationDisabledForTesting = false;
}

/**
 * Common code to all OAuth providers. This is separate from the
 * {@link OAuthProvider} so that child providers (like
 * {@link GoogleAuthProvider}) don't inherit the `credential` instance method.
 * Instead, they rely on a static `credential` method.
 */
class BaseOAuthProvider extends FederatedAuthProvider {
	/* Excluded from this release type: scopes */
	/**
	 * Add an OAuth scope to the credential.
	 *
	 * @param scope - Provider OAuth scope to add.
	 */
	addScope(scope) {
		this.scopes.push(scope);
		return this;
	}
	/**
	 * Retrieve the current list of OAuth scopes.
	 */
	getScopes() {
		return [...this.scopes];
	}
}

/**
 * Interface representing the `Auth` config.
 *
 * @public
 */
export class Config {
	/**
	 * The API Key used to communicate with the Firebase Auth backend.
	 */
	apiKey = '';
	/**
	 * The host at which the Firebase Auth backend is running.
	 */
	apiHost = '';
	/**
	 * The scheme used to communicate with the Firebase Auth backend.
	 */
	apiScheme = '';
	/**
	 * The host at which the Secure Token API is running.
	 */
	tokenApiHost = '';
	/**
	 * The SDK Client Version.
	 */
	sdkClientVersion = '';
	/**
	 * The domain at which the web widgets are hosted (provided via Firebase Config).
	 */
	authDomain = '';
}

export class CustomTokenFlow {
	/**
	 * Default flow is turned off. To use custom token flow, you need to turn it on with the 'enabled' is true.
	 * @type {boolean}
	 */
	enabled = false;
	/**
	 * The custom token flow need to be configured with the following parameters.
	 * We use firebase config to get the following parameters so this field is an instance of {@link Auth}.
	 * @type {string[]}
	 */
	customTokenAuthConfig = null;
	/**
	 * You need to provide the endpoint of the custom token flow service to get the custom token.
	 * Firebase Cloud Function is a good choice to provide this service. The endpoint should be a address of the function.
	 * @type {string[]}
	 */
	endpoint = '';

	constructor() {
		this.enabled = false;
		this.customTokenAuthConfig = null;
		this.endpoint = '';
	}

	static fromJSON(json) {
		const configured = new CustomTokenFlow();
		configured.enabled = json.enabled;
		configured.customTokenAuthConfig = json.customTokenAuthConfig;
		configured.endpoint = json.endpoint;
		return configured;
	}
}

/**
 * The base class for all Federated providers (OAuth (including OIDC), SAML).
 *
 * This class is not meant to be instantiated directly.
 *
 * @public
 */
class FederatedAuthProvider extends AuthProvider {
	providerId = '';
	/* Excluded from this release type: defaultLanguageCode */
	/* Excluded from this release type: customParameters */
	/**
	 * Constructor for generic OAuth providers.
	 *
	 * @param providerId - Provider for which credentials should be generated.
	 */
	constructor(providerId) {
		super(providerId);
		this.customParameters = {};
	}
	/**
	 * Set the language gode.
	 *
	 * @param languageCode - language code
	 */
	setDefaultLanguage(languageCode) {
		this.defaultLanguageCode = languageCode;
		return this;
	}
	/**
	 * Sets the OAuth custom parameters to pass in an OAuth request for popup and redirect sign-in
	 * operations.
	 *
	 * @remarks
	 * For a detailed list, check the reserved required OAuth 2.0 parameters such as `client_id`,
	 * `redirect_uri`, `scope`, `response_type`, and `state` are not allowed and will be ignored.
	 *
	 * @param customOAuthParameters - The custom OAuth parameters to pass in the OAuth request.
	 */
	setCustomParameters(customOAuthParameters) {
		this.customParameters = customOAuthParameters;
		return this;
	}
	/**
	 * Retrieve the current list of {@link CustomParameters}.
	 */
	getCustomParameters() {
		return { ...this.customParameters };
	}
}
/**
 * A {@link @firebase/app#FirebaseApp} holds the initialization information for a collection of
 * services.
 *
 * Do not call this constructor directly. Instead, use
 * {@link (initializeApp:1) | initializeApp()} to create an app.
 *
 * @public
 */
export class FirebaseApp {
	/**
	 * The (read-only) name for this app.
	 *
	 * The default app's name is `"[DEFAULT]"`.
	 *
	 * @example
	 * ```javascript
	 * // The default app's name is "[DEFAULT]"
	 * const app = initializeApp(defaultAppConfig);
	 * console.log(app.name);  // "[DEFAULT]"
	 * ```
	 *
	 * @example
	 * ```javascript
	 * // A named app's name is what you provide to initializeApp()
	 * const otherApp = initializeApp(otherAppConfig, "other");
	 * console.log(otherApp.name);  // "other"
	 * ```
	 */
	name = '';
	/**
	 * The (read-only) configuration options for this app. These are the original
	 * parameters given in {@link (initializeApp:1) | initializeApp()}.
	 *
	 * @example
	 * ```javascript
	 * const app = initializeApp(config);
	 * console.log(app.options.databaseURL === config.databaseURL);  // true
	 * ```
	 */
	options = new FirebaseOptions();
	/**
	 * The settable config flag for GDPR opt-in/opt-out
	 */
	automaticDataCollectionEnabled = false;
}
export class FirebaseError extends Error {
	/** The error code for this error. */
	code = '';
	/** Custom data for this error. */
	customData = {};
	/** The custom name for all FirebaseErrors. */
	name = 'FirebaseError';
	constructor(
		/** The error code for this error. */
		code, message,
		/** Custom data for this error. */
		customData
	) {
		super(message);
	}
}
/**
 * @public
 *
 * Firebase configuration object. Contains a set of parameters required by
 * services in order to successfully communicate with Firebase server APIs
 * and to associate client data with your Firebase project and
 * Firebase application. Typically this object is populated by the Firebase
 * console at project setup. See also:
 * {@link https://firebase.google.com/docs/web/setup#config-object | Learn about the Firebase config object}.
 */
export class FirebaseOptions {
	/**
	 * An encrypted string used when calling certain APIs that don't need to
	 * access private user data
	 * (example value: `AIzaSyDOCAbC123dEf456GhI789jKl012-MnO`).
	 */
	apiKey = '';
	/**
	 * Auth domain for the project ID.
	 */
	authDomain = '';
	/**
	 * Default Realtime Database URL.
	 */
	databaseURL = '';
	/**
	 * The unique identifier for the project across all of Firebase and
	 * Google Cloud.
	 */
	projectId = '';
	/**
	 * The default Cloud Storage bucket name.
	 */
	storageBucket = '';
	/**
	 * Unique numerical value used to identify each sender that can send
	 * Firebase Cloud Messaging messages to client apps.
	 */
	messagingSenderId = '';
	/**
	 * Unique identifier for the app.
	 */
	appId = '';
	/**
	 * An ID automatically created when you enable Analytics in your
	 * Firebase project and register a web app. In versions 7.20.0
	 * and higher, this parameter is optional.
	 */
	measurementId = '';
}

/**
 * Represents the OAuth credentials returned by an {@link OAuthProvider}.
 *
 * @remarks
 * Implementations specify the details about each auth provider's credential requirements.
 *
 * @public
 */
export class OAuthCredential extends AuthCredential {
	/**
	 * The OAuth ID token associated with the credential if it belongs to an OIDC provider,
	 * such as `google.com`.
	 * @readonly
	 */
	idToken = '';
	/**
	 * The OAuth access token associated with the credential if it belongs to an
	 * {@link OAuthProvider}, such as `facebook.com`, `twitter.com`, etc.
	 * @readonly
	 */
	accessToken = '';
	/**
	 * The OAuth access token secret associated with the credential if it belongs to an OAuth 1.0
	 * provider, such as `twitter.com`.
	 * @readonly
	 */
	secret = '';
	/**
	 * The request URI associated with the credential if it belongs to an
	 * {@link OAuthProvider}, such as `facebook.com`, `twitter.com`, etc.
	 * @readonly
	 */
	requestUri = '';
	/* Excluded from this release type: _fromParams */
	/** {@inheritdoc AuthCredential.toJSON}  */
	toJSON() {
		return {
			idToken: this.idToken,
			accessToken: this.accessToken,
			secret: this.secret,
			providerId: this.providerId,
			signInMethod: this.signInMethod
		};
	}
	/**
	 * Static method to deserialize a JSON representation of an object into an
	 * {@link  AuthCredential}.
	 *
	 * @param json - Input can be either Object or the stringified representation of the object.
	 * When string is provided, JSON.parse would be called first.
	 *
	 * @returns If the JSON input does not represent an {@link  AuthCredential}, null is returned.
	 */
	static fromJSON(json) {
		const obj = typeof json === 'string' ? JSON.parse(json) : json;
		const { providerId, signInMethod, ...rest } = obj;
		if (!providerId || !signInMethod) {
			return null;
		}
		const provider = _getInstance(providerId);
		if (!provider || provider.oauthSignInMethod !== signInMethod) {
			return null;
		}
		return provider.credential(rest);
	}
	/* Excluded from this release type: _getIdTokenResponse */
	/* Excluded from this release type: _linkToIdToken */
	/* Excluded from this release type: _getReauthenticationResolver */
	buildRequest = () => {
		const request = {};
		if (this.idToken) {
			request.idToken = this.idToken;
		}
		if (this.accessToken) {
			request.accessToken = this.accessToken;
		}
		if (this.secret) {
			request.oauthTokenSecret = this.secret;
		}
		return request;
	};
}
/**
 * Defines the options for initializing an {@link OAuthCredential}.
 *
 * @remarks
 * For ID tokens with nonce claim, the raw nonce has to also be provided.
 *
 * @public
 */
export class OAuthCredentialOptions {
	/**
	 * The OAuth ID token used to initialize the {@link OAuthCredential}.
	 */
	idToken = '';
	/**
	 * The OAuth access token used to initialize the {@link OAuthCredential}.
	 */
	accessToken = '';

	constructor(idToken, accessToken) {
		this.idToken = idToken;
		this.accessToken = accessToken;
	}
}
/**
 * Provider for generating generic {@link OAuthCredential}.
 *
 * @example
 * ```javascript
 * // Sign in using a redirect.
 * const provider = new OAuthProvider('google.com');
 * // Start a sign in process for an unauthenticated user.
 * provider.addScope('profile');
 * provider.addScope('email');
 * await signInWithRedirect(auth, provider);
 * // This will trigger a full page redirect away from your app
 *
 * // After returning from the redirect when your app initializes you can obtain the result
 * const result = await getRedirectResult(auth);
 * if (result) {
 *   // This is the signed-in user
 *   const user = result.user;
 *   // This gives you a OAuth Access Token for the provider.
 *   const credential = provider.credentialFromResult(auth, result);
 *   const token = credential.accessToken;
 * }
 * ```
 *
 * @example
 * ```javascript
 * // Sign in using a popup.
 * const provider = new OAuthProvider('google.com');
 * provider.addScope('profile');
 * provider.addScope('email');
 * const result = await signInWithPopup(auth, provider);
 *
 * // The signed-in user info.
 * const user = result.user;
 * // This gives you a OAuth Access Token for the provider.
 * const credential = provider.credentialFromResult(auth, result);
 * const token = credential.accessToken;
 * ```
 * @public
 */
export class OAuthProvider extends BaseOAuthProvider {
	/**
	 * Creates an {@link OAuthCredential} from a JSON string or a plain object.
	 * @param json - A plain object or a JSON string
	 */
	static credentialFromJSON(json) {
		return OAuthCredential._fromJSON(json);
	}
	/**
	 * Creates a {@link OAuthCredential} from a generic OAuth provider's access token or ID token.
	 *
	 * @remarks
	 * The raw nonce is required when an ID token with a nonce field is provided. The SHA-256 hash of
	 * the raw nonce must match the nonce field in the ID token.
	 *
	 * @example
	 * ```javascript
	 * // `googleUser` from the onsuccess Google Sign In callback.
	 * // Initialize a generate OAuth provider with a `google.com` providerId.
	 * const provider = new OAuthProvider('google.com');
	 * const credential = provider.credential({
	 *   idToken: googleUser.getAuthResponse().id_token,
	 * });
	 * const result = await signInWithCredential(credential);
	 * ```
	 *
	 * @param params - Either the options object containing the ID token, access token and raw nonce
	 * or the ID token string.
	 */
	credential(params) {
		if (typeof params === 'string') {
			return OAuthCredential._fromParams({
				providerId: this.providerId,
				signInMethod: this.oauthSignInMethod,
				idToken: params
			});
		}
		return OAuthCredential._fromParams({
			providerId: this.providerId,
			signInMethod: this.oauthSignInMethod,
			...params
		});
	}
	/** An internal credential method that accepts more permissive options */
	_credential = this.credential;
	/**
	 * Used to extract the underlying {@link OAuthCredential} from a {@link UserCredential}.
	 *
	 * @param userCredential - The user credential.
	 */
	static credentialFromResult(userCredential) {
		return OAuthCredential._fromParams({
			providerId: userCredential.providerId,
			signInMethod: userCredential.signInMethod,
			...userCredential
		});
	}
	/**
	 * Used to extract the underlying {@link OAuthCredential} from a {@link AuthError} which was
	 * thrown during a sign-in, link, or reauthenticate operation.
	 *
	 * @param userCredential - The user credential.
	 */
	static credentialFromError(error) {
		return OAuthCredential._fromParams({
			providerId: error.providerId,
			signInMethod: error.signInMethod,
			...error
		});
	}
	static oauthCredentialFromTaggedObject = (response) => {
		if (!response.oauthIdToken && !response.oauthAccessToken) {
			return null;
		}
		const { oauthAccessToken, oauthTokenSecret, oauthIdToken } = response;
		const params = {
			accessToken: oauthAccessToken,
			secret: oauthTokenSecret,
			idToken: oauthIdToken
		};
		return OAuthCredential._fromParams({
			providerId: response.providerId,
			signInMethod: response.signInMethod,
			...params
		});
	};
}

/**
 * Create a observable from a callback function.
 * Refers from {@link:https://studysection.com/blog/observer-pattern-in-react-reactjs/}
 */
// class Observable {
// 	constructor() {
// 		this.observer = [];
// 	}
// 	subscribe(item) {
// 		this.observer.push(item);
// 	}
// 	unsubscribe(item) {
// 		if(!this.observer) return undefined;
// 		else {
// 			this.observer.filter(subscribe => subscribe !== item);
// 		}
// 	}
// 	notify(data) {
// 		this.observer.forEach(item => item(data));
// 	}
// }
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
 * Enumeration of supported providers.
 *
 * @public
 */
export const ProviderId = {
	/** Facebook provider ID */
	FACEBOOK: "facebook.com",
	/** GitHub provider ID */
	GITHUB: "github.com",
	/** Google provider ID */
	GOOGLE: "google.com",
	/** Password provider */
	PASSWORD: "password",
	/** Phone provider */
	PHONE: "phone",
	/** Twitter provider ID */
	TWITTER: "twitter.com",
	/** Zalo provider ID */
	ZALO: "zalo.me",
};

/**
 * Enumeration of supported sign-in methods.
 *
 * @public
 */
export const SignInMethod = {
	/** Email link sign in method */
	EMAIL_LINK: "emailLink",
	/** Email/password sign in method */
	EMAIL_PASSWORD: "password",
	/** Facebook sign in method */
	FACEBOOK: "facebook.com",
	/** GitHub sign in method */
	GITHUB: "github.com",
	/** Google sign in method */
	GOOGLE: "google.com",
	/** Phone sign in method */
	PHONE: "phone",
	/** Twitter sign in method */
	TWITTER: "twitter.com",
	/** Zalo sign in method */
	ZALO: "zalo.me"
};

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

export class ZaloAuthConfigure {
	/**
	 * Your Zalo App ID of your app in Zalo Developer and this field is required
	 */
	appId = '';
	/**
	 * The redirect URI of your app. Required if you are using the OAuth 2.0 authorization code flow.
	 * If you choose to use the popup flow, you can skip this parameter because the redirect URI will be
	 * get from the current page URL.
	 */
	redirectUri = '';
	/**
	 * The scopes of the user information that your app requires.
	 * The Zalo SDK provide some basic scopes, you can find them in
	 * the document at https://developers.zalo.me/docs/api/social-api/tai-lieu/thong-tin-ten-anh-dai-dien-post-28
	 * If you want to use Firebase Custom Token to authenticate with Firebase, you must request the scope "id".
	 */
	scopes = ['id'];
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
	customTokenFlow = new CustomTokenFlow();

	constructor(appId, scopes) {
		this.appId = appId;
		this.scopes = scopes;
	}

	static fromJSON(json) {
		const config = new ZaloAuthConfigure(json.appId, json.scopes);
		config.redirectUri = json.redirectUri;
		config.customTokenFlow = CustomTokenFlow.fromJSON(json.customTokenFlow);
		return config;
	}
}
/**
 * Provider for generating {@link ZaloAuthProvider}.
 *
 * @public
 */
export class ZaloAuthProvider extends OAuthProvider {
	/** Always set to {@link PROVIDER_ID}.ZALO. **/
	static PROVIDER_ID = "zalo.me";
	providerId = ZaloAuthProvider.PROVIDER_ID;
	scopes = ["id"];
	auth = new ZaloAuthConfigure();
	/**
	 * @param auth - The Firebase {@link Auth} instance in which sign-ins should occur.
	 *
	 */
	constructor(auth) {
		super(ZaloAuthProvider.PROVIDER_ID);
		this.auth = auth;
		this.scopes = [...auth.config.scopes];
	}

	credentialFromResult(userCredential = new UserCredential()) {
		return new Promise((resolve, reject) => {
			if (!this.auth.serviceProviderUrl) {
				return reject({
					code: "auth/invalid-credential",
					message: "Missing service provider URL",
				});
			}
			const endpoint = userCredential.serviceProviderUrl || "";
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