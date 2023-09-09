/**
 * setColumns
 * Project: lumenats
 * Author: jovialis (Dylan Hanson)
 * Date: 9/6/23
 */

import {HttpsError, onCall} from "firebase-functions/v2/https";
import {clearApplicants, importApplicants} from "../../lib/applicant";
import {clearColumns, createColumns} from "../../lib/column";
import {clearReviews} from "../../lib/review";
import {hasUserRole} from "../../lib/user";
import {initApp} from "../../utils/initApp";

initApp();

export const funcImportApplicants = onCall({}, async (request) => {
	if (!request.auth) {
		throw new HttpsError('unauthenticated', 'User is not authenticated.');
	}

	// Make sure the user has an Admin role
	if (!(await hasUserRole(request.auth.uid, "admin"))) {
		throw new HttpsError('unauthenticated', 'User does not have requisite permissions.');
	}

	try {
		const data: {
			columns: string[]
			applicants: Record<string, any>[]
		} = request.data;

		// Delete all existing Applicants
		await clearApplicants();
		await clearColumns();
		await clearReviews();

		await createColumns(data.columns);
		await importApplicants(data.applicants);

		return {
			success: true
		}
	} catch (e) {
		console.log(e);
		throw e;
	}

});