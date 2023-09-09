/**
 * setMemberRole
 * Project: lumenats
 * Author: jovialis (Dylan Hanson)
 * Date: 9/6/23
 */
import {HttpsError, onCall} from "firebase-functions/v2/https";
import {getUsers, hasUserRole} from "../../lib/user";
import {initApp} from "../../utils/initApp";

initApp();

export const funcGetUsers = onCall({}, async (request) => {
	if (!request.auth) {
		throw new HttpsError('unauthenticated', 'User is not authenticated.');
	}

	// Make sure the user has an Admin role
	if (!(await hasUserRole(request.auth.uid, "admin"))) {
		throw new HttpsError('unauthenticated', 'User does not have requisite permissions.');
	}

	return await getUsers();
});