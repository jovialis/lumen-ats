/**
 * column
 * Project: lumenats
 * Author: jovialis (Dylan Hanson)
 * Date: 9/6/23
 */
import {getFirestore} from "firebase-admin/firestore";
import {HttpsError} from "firebase-functions/v2/https";

export interface Column {
	name: string
	displayName: string
	hidden: boolean
	isName: boolean
	isEmail: boolean
	isResume: boolean
	index: number
}

export type ColumnWithUID = Column & {
	uid: string
}

function getCollection() {
	return getFirestore().collection("columns")
}

/**
 * Renames a column by its UID
 * @param uid
 * @param displayName
 */
export async function renameColumn(uid: string, displayName: string) {
	try {
		const columnRef = getCollection().doc(uid);
		const columnDoc = await columnRef.get();

		if (columnDoc.exists) {
			// The document exists, update the displayName field
			await columnRef.update({displayName: displayName} as Partial<Column>);
			return;
		}
	} catch (error) {
		console.error('Error setting column display name:', error);
		throw new HttpsError('internal', 'Error setting column display name.');
	}

	throw new HttpsError('not-found', 'Column not found.');
}

/**
 * Hides a column or not by its UID
 * @param uid
 * @param hidden
 */
export async function setColumnVisibility(uid: string, hidden: boolean) {
	try {
		const columnRef = getCollection().doc(uid);
		const columnDoc = await columnRef.get();

		if (columnDoc.exists) {
			// The document exists, update the displayName field
			await columnRef.update({hidden} as Partial<Column>);
			return;
		}
	} catch (error) {
		console.error('Error setting column visibility:', error);
		throw new HttpsError('internal', 'Error setting column visibility.');
	}

	throw new HttpsError('not-found', 'Column not found.');
}

/**
 * Gets the Columns
 */
export async function getColumns() {
	const querySnapshot = await getCollection().orderBy('index').get();
	const columnsList: ColumnWithUID[] = [];

	querySnapshot.forEach((doc) => {
		columnsList.push({
			...(doc.data() as Column),
			uid: doc.id
		});
	});

	return columnsList;
}

/**
 * Creates columns given a list of names
 * @param names
 */
export async function createColumns(names: string[]) {
	const coll = getCollection();

	const batch = getFirestore().batch();

	const columns: Column[] = names.map((name, i) => ({
		name: name,
		displayName: name,
		hidden: false,
		isName: false,
		isEmail: false,
		isResume: false,
		index: i
	}));

	for (const column of columns) {
		const newDocRef = coll.doc();
		batch.set(newDocRef, column);
	}

	await batch.commit();
}

/**
 * Sets one column to be the name column
 * @param column
 * @param isName
 */
export async function setNameColumn(column: string, isName: boolean) {
	try {
		const columnRef = getCollection().doc(column);
		const columnDoc = await columnRef.get();

		if (columnDoc.exists) {
			// Unset any other columns
			const coll = getCollection();
			const batch = getFirestore().batch();

			const querySnapshot = await coll.where('isName', '==', true).get();

			querySnapshot.forEach((doc) => {
				const docRef = getCollection().doc(doc.id);
				batch.update(docRef, {isName: false});
			});

			await batch.commit();

			// The document exists, update the displayName field
			await columnRef.update({isName} as Partial<Column>);
			return;
		}
	} catch (error) {
		console.error('Error setting column isName:', error);
		throw new HttpsError('internal', 'Error setting column isName.');
	}

	throw new HttpsError('not-found', 'Column not found.');
}

/**
 * Sets one column to be the email column
 * @param column
 * @param isEmail
 */
export async function setEmailColumn(column: string, isEmail: boolean) {
	try {
		const columnRef = getCollection().doc(column);
		const columnDoc = await columnRef.get();

		if (columnDoc.exists) {
			// Unset any other columns
			const coll = getCollection();
			const batch = getFirestore().batch();

			const querySnapshot = await coll.where('isEmail', '==', true).get();

			querySnapshot.forEach((doc) => {
				const docRef = getCollection().doc(doc.id);
				batch.update(docRef, {isEmail: false});
			});

			await batch.commit();

			// The document exists, update the displayName field
			await columnRef.update({isEmail} as Partial<Column>);
			return;
		}
	} catch (error) {
		console.error('Error setting column isEmail:', error);
		throw new HttpsError('internal', 'Error setting column isEmail.');
	}

	throw new HttpsError('not-found', 'Column not found.');
}

/**
 * Sets one column to be the resume column
 * @param column
 * @param isResume
 */
export async function setResumeColumn(column: string, isResume: boolean) {
	try {
		const columnRef = getCollection().doc(column);
		const columnDoc = await columnRef.get();

		if (columnDoc.exists) {
			// Unset any other columns
			const coll = getCollection();
			const batch = getFirestore().batch();

			const querySnapshot = await coll.where('isResume', '==', true).get();

			querySnapshot.forEach((doc) => {
				const docRef = getCollection().doc(doc.id);
				batch.update(docRef, {isResume: false});
			});

			await batch.commit();

			// The document exists, update the displayName field
			await columnRef.update({isResume} as Partial<Column>);
			return;
		}
	} catch (error) {
		console.error('Error setting column isResume:', error);
		throw new HttpsError('internal', 'Error setting column isResume.');
	}

	throw new HttpsError('not-found', 'Column not found.');
}

/**
 * Fetches the Email Column
 */
export async function getEmailColumn(): Promise<ColumnWithUID> {
	const coll = getCollection();
	const querySnapshot = await coll.where('isEmail', '==', true).get();

	if (querySnapshot.empty) {
		throw new HttpsError('not-found', 'Email-labeled column not found.');
	}

	return {
		...(querySnapshot.docs[0].data() as Column),
		uid: querySnapshot.docs[0].id
	};
}

/**
 * Fetches the Name Column
 */
export async function getNameColumn(): Promise<ColumnWithUID> {
	const coll = getCollection();
	const querySnapshot = await coll.where('isName', '==', true).get();

	if (querySnapshot.empty) {
		throw new HttpsError('not-found', 'Name-labeled column not found.');
	}

	return {
		...(querySnapshot.docs[0].data() as Column),
		uid: querySnapshot.docs[0].id
	};
}

/**
 * Clears all columns from the collection
 */
export async function clearColumns() {
	const querySnapshot = await getCollection().get();

	const batch = getFirestore().batch();

	querySnapshot.forEach((doc) => {
		batch.delete(doc.ref);
	});

	return batch.commit();
}
