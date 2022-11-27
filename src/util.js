import pkceChallenge, {verifyChallenge} from "pkce-challenge";

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
export function typeOf(input) {
	return Object.prototype.toString.call(input).slice(8, -1).toLowerCase();
}

/**
 * Handler for object to query string
 * @param obj {*}
 * @returns {{builder: (function(*=): string), stringify: (function(*=): string), parser: (function(*=): string)}}
 */
export function params(obj) {
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
 * verify: (function(code_challenge: string, code_verifier: string): boolean)
 * }}
 */
export function pkceCode() {
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
export function hasParamsToProcess(args = "") {
	if (!args) return false;
	const argsParsed = params(args).parser();
	const compareFields = ['code', 'state', 'code_challenge'];
	const lengthValid = compareFields.length === Object.keys(argsParsed).length;
	const hasAllFields = compareFields.every(field => argsParsed.hasOwnProperty(field));
	return lengthValid && hasAllFields;
}

/**
 * Open url in new window as a popup
 * @param url {string}
 * @param width {number}
 * @param height {number}
 * @param topRatio {number}
 * @param leftRatio {number}
 */
export function openPopup(url = '', width = 360, height = 575, topRatio = 0.25, leftRatio = 0.25) {
	if (!url) {
		throw new Error('URL is required');
	}
	const builder = (val = {}) => {
		return Object.keys(val).reduce((acc, item, index, arr) => {
			acc += (index === 0 ? '' : ',') + item + '=' + val[item];
			return acc;
		}, '');
	}
	const theTop = (screen.height * topRatio);
	const theLeft = (screen.width * leftRatio);
	const features = builder({
		width: width,
		height: height,
		top: theTop,
		left: theLeft,
		toolbar: 0,
		location: 0,
		directories: 0,
		status: 0,
		menubar: 0,
		scrollbars: 0,
		resizable: 0
	});
	// 'width=' + width + ',height=' + height + ',top=' + theTop + ',left=' + theLeft + ',toolbar=0,location=0,directories=0,status=0,menubar=0,scrollbars=0,resizable=0';
	window.open(url, "_blank", features);
}