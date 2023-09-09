/**
 * setMemberRole
 * Project: lumenats
 * Author: jovialis (Dylan Hanson)
 * Date: 9/6/23
 */
import {HttpsError, onCall} from "firebase-functions/v2/https";
import {getUserProfileByEmail, hasUserRole, setUserRole} from "../../lib/user";
import {initApp} from "../../utils/initApp";

initApp();

export const funcAddUserByEmail = onCall({}, async (request) => {
	if (!request.auth) {
		throw new HttpsError('unauthenticated', 'User is not authenticated.');
	}

	// Make sure the user has an Admin role
	if (!(await hasUserRole(request.auth.uid, "admin"))) {
		throw new HttpsError('unauthenticated', 'User does not have requisite permissions.');
	}

	const data = request.data as {
		email: string
	}

	try {
		const user = await getUserProfileByEmail(data.email);

		// Sets the role of the target user
		await setUserRole(user.uid, "reader");
		return {
			success: true
		}
	} catch (e) {
		throw new HttpsError('invalid-argument', 'Error adding user by email: User is not registered.');
	}

});