/**
 * setColumns
 * Project: lumenats
 * Author: jovialis (Dylan Hanson)
 * Date: 9/6/23
 */

import {HttpsError, onCall} from "firebase-functions/v2/https";
import {clearApplicants} from "../../lib/applicant";
import {clearColumns, createColumns} from "../../lib/column";
import {clearReviews} from "../../lib/review";
import {hasUserRole} from "../../lib/user";
import {initApp} from "../../utils/initApp";

initApp();

export const funcSetColumns = onCall({}, async (request) => {
	if (!request.auth) {
		throw new HttpsError('unauthenticated', 'User is not authenticated.');
	}

	// Make sure the user has an Admin role
	if (!(await hasUserRole(request.auth.uid, "admin"))) {
		throw new HttpsError('unauthenticated', 'User does not have requisite permissions.');
	}

	const data: {
		columns: string[]
	} = request.data;

	await clearColumns();
	await clearApplicants();
	await clearReviews();

	await createColumns(data.columns);

	return {
		success: true
	}
});