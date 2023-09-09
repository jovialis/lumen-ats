/**
 * getMyReviews
 * Project: lumenats
 * Author: jovialis (Dylan Hanson)
 * Date: 9/7/23
 */
import {HttpsError, onCall} from "firebase-functions/v2/https";
import {getReviewsProgress} from "../../lib/review";
import {hasUserRole} from "../../lib/user";

export const funcGetReviewStatus = onCall({}, async (request) => {
	if (!request.auth) {
		throw new HttpsError('unauthenticated', 'User is not authenticated.');
	}

	// Make sure the user has an Admin role
	if (!(await hasUserRole(request.auth.uid, "admin"))) {
		throw new HttpsError('unauthenticated', 'User does not have requisite permissions.');
	}

	return await getReviewsProgress();
});