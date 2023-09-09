/**
 * setMemberRole
 * Project: lumenats
 * Author: jovialis (Dylan Hanson)
 * Date: 9/6/23
 */
import {HttpsError, onCall} from "firebase-functions/v2/https";
import {getUserRole} from "../../lib/user";
import {initApp} from "../../utils/initApp";

initApp();

export const funcGetUserRole = onCall({}, async (request) => {
	if (!request.auth) {
		throw new HttpsError('unauthenticated', 'User is not authenticated.');
	}

	const role = await getUserRole(request.auth.uid);
	return {
		role
	};
});