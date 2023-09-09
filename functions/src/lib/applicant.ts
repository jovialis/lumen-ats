/**
 * applicant
 * Project: lumenats
 * Author: jovialis (Dylan Hanson)
 * Date: 9/6/23
 */
import {getFirestore} from "firebase-admin/firestore";
import {adjectives, animals, colors, uniqueNamesGenerator} from "unique-names-generator";
import {getColumns, getEmailColumn, getNameColumn} from "./column";

// TODO: Need to be able to export CSV of names, emails, UIDs

export interface Applicant {
	// name: string
	// email: string
	anonId: string
	responses: Record<string, string> // Maps column ID <> response
	readerCompletion: Record<string, boolean>
}

export type ApplicantWithPIIAndUID = Applicant & {
	uid: string
	name?: string
	email?: string
}

export function getApplicantCollection() {
	return getFirestore().collection("applicants")
}

/**
 * Imports Applicants from a CSV processed client-side
 * @param applicants
 */
export async function importApplicants(applicants: Record<string, any>[]) {
	const columns = await getColumns();


	const batch = getFirestore().batch();

	for (const applicant of applicants) {
		let data: Record<string, any> = {};
		for (const column of columns) {
			if (column.isEmail || column.isName)
				continue;

			const value = applicant[column.name];
			data[column.uid] = value === null ? null : JSON.stringify(value);
		}

		batch.set(getApplicantCollection().doc(), {
			// name: name,
			// email: email,
			anonId: uniqueNamesGenerator({
				dictionaries: [adjectives, animals, colors],
				length: 3,
				separator: "-",
				style: "lowerCase"
			}),
			responses: data
		} as Applicant);
	}

	await batch.commit();
}

/**
 * Clears all Applicants from the collection
 */
export async function clearApplicants() {
	const querySnapshot = await getApplicantCollection().get();

	const batch = getFirestore().batch();

	querySnapshot.forEach((doc) => {
		batch.delete(doc.ref);
	});

	return batch.commit();
}

/**
 * Returns the number of applicants loaded into the system
 */
export async function getApplicantCount(): Promise<number> {
	const querySnapshot = await getApplicantCollection().count().get()
	return querySnapshot.data().count;
}

/**
 * Fetches all applicants and fills in their name/email from responses
 */
export async function getApplicants(): Promise<ApplicantWithPIIAndUID[]> {
	const querySnapshot = await getApplicantCollection().get();

	const emailColumn = await getEmailColumn();
	const nameColumn = await getNameColumn();

	return await Promise.all(querySnapshot.docs.map(async doc => {
		const docData = doc.data() as Applicant;

		return {
			...(doc.data() as Applicant),
			uid: doc.id,
			email: docData.responses[emailColumn.uid],
			name: docData.responses[nameColumn.uid]
		} as ApplicantWithPIIAndUID
	}))
}

/**
 * Fetches all applicants and fills in their name/email from responses
 */
export async function getApplicantAnonIDMap(): Promise<{
	uid: string
	name: string
	email: string
	anonId: string
}[]> {
	const querySnapshot = await getApplicantCollection().get();

	const emailColumn = await getEmailColumn();
	const nameColumn = await getNameColumn();

	return await Promise.all(querySnapshot.docs.map(async doc => {
		const docData = doc.data() as Applicant;

		return {
			uid: doc.id,
			email: docData.responses[emailColumn.uid],
			name: docData.responses[nameColumn.uid],
			anonId: docData.anonId
		}
	}))
}

/**
 * Flags that a reader has completed their review
 * @param applicant
 * @param reader
 */
export async function markApplicantReaderCompleted(applicant: string, reader: string) {
	const docRef = getApplicantCollection().doc(applicant);
	const doc = (await docRef.get());

	const map = (doc.data() as Applicant).readerCompletion;
	map[reader] = true;

	await docRef.update({
		readerCompletion: map
	} as Partial<Applicant>)
}

export async function getApplicant(id: string): Promise<Omit<ApplicantWithPIIAndUID, "name" | "email">> {
	const doc = (await getApplicantCollection()
		.doc(id)
		.get());

	const applicant = doc.data() as Applicant;

	return {
		...applicant,
		uid: doc.id
	} as ApplicantWithPIIAndUID
}