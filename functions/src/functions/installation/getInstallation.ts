/**
 * getInstallation
 * Project: lumenats
 * Author: jovialis (Dylan Hanson)
 * Date: 9/7/23
 */

import {HttpsError, onCall} from "firebase-functions/v2/https";
import {getSingletonInstallation} from "../../lib/installation";
import {initApp} from "../../utils/initApp";

initApp();

export const funcGetInstallation = onCall({}, async (request) => {
	if (!request.auth) {
		throw new HttpsError('unauthenticated', 'User is not authenticated.');
	}

	return getSingletonInstallation();
});