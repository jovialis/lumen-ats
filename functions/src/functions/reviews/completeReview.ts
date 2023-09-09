/**
 * setColumns
 * Project: lumenats
 * Author: jovialis (Dylan Hanson)
 * Date: 9/6/23
 */

import {HttpsError, onCall} from "firebase-functions/v2/https";
import {completeReview, userIsReader} from "../../lib/review";
import {hasUserRole} from "../../lib/user";
import {initApp} from "../../utils/initApp";

initApp();

export const funcCompleteReview = onCall({}, async (request) => {
	if (!request.auth) {
		throw new HttpsError('unauthenticated', 'User is not authenticated.');
	}

	// Make sure the user has an Admin role
	if (!(await hasUserRole(request.auth.uid, "reader"))) {
		throw new HttpsError('unauthenticated', 'User does not have requisite permissions.');
	}

	const args: {
		review: string
	} = request.data;

	if (!(await userIsReader(args.review, request.auth.uid))) {
		throw new HttpsError('unauthenticated', 'User does not have requisite permissions.');
	}

	await completeReview(args.review);

	return {
		success: true
	}
});