/**
 * review
 * Project: lumenats
 * Author: jovialis (Dylan Hanson)
 * Date: 9/7/23
 */
import {getFirestore} from "firebase-admin/firestore";
import {HttpsError} from "firebase-functions/v2/https";
import {
	Applicant,
	ApplicantWithPIIAndUID,
	getApplicant,
	getApplicantCollection,
	getApplicants,
	markApplicantReaderCompleted
} from "./applicant";
import {getColumns} from "./column";
import {getTeams} from "./team";
import {getUsers, UserWithProfileAndUID} from "./user";

export interface Review {
	applicant: string
	reader: string
	complete: boolean
}

export type ReviewWithUIDAndAnonID = Review & {
	uid: string
	anonId: string
}

export type PackagedReview = {
	uid: string
	anonId: string
	complete: boolean
	resumeLink?: string
	responses: {
		question: string,
		response: string
	}[]
}

function getCollection() {
	return getFirestore().collection("reviews")
}

/**
 * Assigns all of the Applicants to be read by a team
 */
export async function generateReviews() {
	const teams = await getTeams();

	if (!teams.length) {
		throw new HttpsError('failed-precondition', 'At least one reviewing team must be defined.');
	}

	const applicants = await getApplicants();

	if (!applicants.length) {
		throw new HttpsError('failed-precondition', 'There must be at least one applicant.');
	}

	const randomizedTeams = teams.sort((a, b) => 0.5 - Math.random())
	const randomizedApplicants = applicants.sort((a, b) => 0.5 - Math.random())

	let batch = getFirestore().batch();
	let applicantBatch = getFirestore().batch();

	// Iterate over all applicants and pick a team for them. All members of the team are assigned a review.
	let teamI = 0;
	for (const applicant of randomizedApplicants) {
		const nextTeam = randomizedTeams[teamI % randomizedTeams.length];

		let applicantReadershipPkg: Record<string, boolean> = {};

		// Add a review for all members of the team
		for (const member of nextTeam.users) {
			batch.set(getCollection().doc(), {
				reader: member.uid,
				applicant: applicant.uid,
				complete: false
			} as Review);

			applicantReadershipPkg[member.uid] = false;
		}

		applicantBatch.update(getApplicantCollection().doc(applicant.uid), {
			readerCompletion: applicantReadershipPkg
		} as Partial<Applicant>);

		teamI += 1;

		if (teamI > 300) {
			await batch.commit();
			await applicantBatch.commit();

			batch = getFirestore().batch();
			applicantBatch = getFirestore().batch();
		}
	}

	await batch.commit();
	await applicantBatch.commit();
}

/**
 * Gets all of the reviews for a given Reader
 * @param user
 */
export async function getReviewsForReader(user: string) {
	const collection = await getCollection()
		.where('reader', '==', user)
		.get()

	const applicants = await getApplicants();
	const applicantMap: Record<string, ApplicantWithPIIAndUID> = applicants.reduce((sum, cur) => ({
		...sum,
		[cur.uid]: cur
	}), {});

	let reviews: ReviewWithUIDAndAnonID[] = [];
	for (const doc of collection.docs) {
		const review = doc.data() as Review;

		reviews.push({
			...review,
			uid: doc.id,
			anonId: applicantMap[review.applicant]?.anonId
		})
	}

	return reviews;
}

/**
 * Packages a Review for reading
 * @param review
 */
export async function getReviewPackage(review: string): Promise<PackagedReview> {
	try {
		const reviewRef = getCollection().doc(review);
		const reviewDoc = await reviewRef.get();

		if (reviewDoc.exists) {
			const review: Review = reviewDoc.data() as Review;

			const columns = await getColumns()

			const applicant = await getApplicant(review.applicant);

			let applicantResponses: PackagedReview["responses"] = [];

			let resumeLink: string;

			for (const column of columns) {
				if (column.isName || column.isEmail || column.hidden)
					continue

				if (column.isResume) {
					resumeLink = applicant.responses[column.uid];
					continue;
				}

				applicantResponses.push({
					question: column.displayName,
					response: applicant.responses[column.uid]
				});
			}

			return {
				responses: applicantResponses,
				anonId: applicant.anonId,
				uid: applicant.uid,
				complete: review.complete,
				resumeLink: resumeLink
			};
		}
	} catch (error) {
		console.error('Error generating review package:', error);
		throw new HttpsError('internal', 'Error generating review package.');
	}

	throw new HttpsError('not-found', 'Review not found.');
}

/**
 * Marks a review as complete
 * @param review
 */
export async function completeReview(review: string) {
	try {
		const reviewRef = getCollection().doc(review);
		const reviewDoc = await reviewRef.get();

		if (reviewDoc.exists) {
			const reviewVal: Review = reviewDoc.data() as Review;

			await reviewRef.update({complete: true} as Partial<Review>);

			// Marks in the map that this review is completed
			await markApplicantReaderCompleted(reviewVal.applicant, reviewVal.reader);
			return;
		}
	} catch (error) {
		console.error('Error completing review:', error);
		throw new HttpsError('internal', 'Error completing review.');
	}

	throw new HttpsError('not-found', 'Review not found.');
}

/**
 * Returns true if the user is a reader
 * @param review
 * @param user
 */
export async function userIsReader(review: string, user: string) {
	const querySnapshot = await getCollection()
		.doc(review)
		.get();

	return querySnapshot.get("reader") === user;
}


/**
 * Returns whether there are reviews
 */
export async function hasReviews() {
	const querySnapshot = await getCollection().get();
	return querySnapshot.size > 0;
}

/**
 * Outputs the progress of current reviews
 */
export async function getReviewsProgress(): Promise<{
	finished: boolean
	totalCount: number
	remainingApplicants: {
		applicant: Omit<ApplicantWithPIIAndUID, "readerCompletion" | "responses">,
		reviews: {
			uid: string
			complete: boolean
			reader: UserWithProfileAndUID
		}[]
		finished: boolean
	}[],
	completedApplicants: {
		applicant: Omit<ApplicantWithPIIAndUID, "readerCompletion" | "responses">,
		reviews: {
			uid: string
			complete: boolean
			reader: UserWithProfileAndUID
		}[]
		finished: boolean
	}[]
}> {
	const applicants = await getApplicants();
	const applicantMap: Record<string, ApplicantWithPIIAndUID> = applicants.reduce((sum, cur) => ({
		...sum,
		[cur.uid]: {
			...cur,
			readerCompletion: undefined,
			responses: undefined
		}
	}), {});

	const readers = await getUsers()
	const readerMap: Record<string, UserWithProfileAndUID> = readers.reduce((sum, cur) => ({
		...sum,
		[cur.uid]: cur
	}), {});

	const reviews = await getCollection().get();
	const applicantReviewMap: Record<string, (Review & { uid: string })[]> = reviews.docs.reduce((sum, cur) => {
		const review: Review = cur.data() as Review;
		return ({
			...sum,
			[review.applicant]: [...(sum[review.applicant] || []), {
				...review,
				uid: cur.id
			}]
		});
	}, {});

	const applicantList = applicants.map(applicant => ({
		applicant: applicantMap[applicant.uid],
		reviews: (applicantReviewMap[applicant.uid] || []).map(review => ({
			complete: review.complete,
			reader: readerMap[review.reader],
			uid: review.uid
		}))
	}));

	const applicantListWithFinished = applicantList.map(app => ({
		...app,
		finished: app.reviews.filter(rev => !rev.complete).length === 0
	}));

	const finishedApps = applicantListWithFinished.filter(app => app.finished);
	const remainingApps = applicantListWithFinished.filter(app => !app.finished);

	return {
		remainingApplicants: remainingApps,
		completedApplicants: finishedApps,
		totalCount: remainingApps.length + finishedApps.length,
		finished: remainingApps.length === 0
	}
}


/**
 * Clears all reviews from the collection
 */
export async function clearReviews() {
	const querySnapshot = await getCollection().get();

	const batch = getFirestore().batch();

	querySnapshot.forEach((doc) => {
		batch.delete(doc.ref);
	});

	return batch.commit();
}
