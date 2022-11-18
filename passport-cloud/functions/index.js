/**
 * Copyright 2017 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for t`he specific language governing permissions and
 * limitations under the License.
 */
'use strict';

const functions = require('firebase-functions');

// CORS Express middleware to enable CORS Requests.
const cors = require('cors')({origin: true});

// Firebase Setup
const admin = require("firebase-admin");
// @ts-ignore
const serviceAccount = require('./service-account.json');
const {getAuth} = require("firebase-admin/auth");
admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	projectId: "etrans-db",
});

const firestore = admin.firestore();

/**
 * Authenticate the provided credentials returning a Firebase custom auth token.
 * `uid` and `password` values are expected in the body of the request.
 * If authentication fails return a 401 response.
 * If the request is badly formed return a 400 response.
 * If the request method is unsupported (not POST) return a 403 response.
 * If an error occurs log the details and return a 500 response.
 */
exports.auth = functions.https.onRequest((req, res) => {
	const handleError = (uid, error) => {
		functions.logger.error({User: uid}, error);
		return res.sendStatus(500);
	};

	const handleResponse = (uid, status, body) => {
		functions.logger.log(
			{User: uid},
			{
				Response: {
					Status: status,
					Body: body,
				},
			}
		);
		if (body) {
			return res.status(200).json(body);
		}
		return res.sendStatus(status);
	};

	let uid = '';
	try {
		return cors(req, res, async () => {
			// Authentication requests are POSTed, other requests are forbidden
			if (req.method !== 'POST') {
				return handleResponse(uid, 403);
			}
			uid = req.body.uid;
			if (!uid) {
				return handleResponse(uid, 400);
			}

			const user = await firestore.collection('users').doc(uid).get();
			if (!user.exists) {
				return handleResponse(uid, 401); // Invalid uid
			}

			const {name, phone, avatar} = user.data();
			functions.logger.log(
				{User: uid},
				{
					UserData: {name, phone, avatar, uid}
				}
			)

			// On success return the Firebase Custom Auth Token.
			const firebaseToken = await getAuth().createCustomToken(uid, {
				uid: uid,
				avatar: avatar,
				displayName: name,
				phoneNumber: phone
			});
			return handleResponse(uid, 200, {token: firebaseToken});
		});
	} catch (error) {
		return handleError(uid, error);
	}
});