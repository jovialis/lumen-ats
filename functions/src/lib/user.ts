/**
 * auth
 * Project: lumenats
 * Author: jovialis (Dylan Hanson)
 * Date: 9/6/23
 */
import {getAuth} from "firebase-admin/auth";
import {getFirestore} from "firebase-admin/firestore";
import {HttpsError} from "firebase-functions/v2/https";

export type UserRole = null | "reader" | "admin";

export interface User {
	role: UserRole
}

export type UserWithProfileAndUID = User & {
	uid: string,
	profile: UserProfile
}

export interface UserProfile {
	uid: string
	email: string
	displayName: string
	photoURL: string
}

/**
 * Returns the collection for users
 */
function getCollection() {
	return getFirestore().collection("users")
}

/**
 * Gets the numeric power level of a given role
 * @param role
 */
export function getRolePower(role: UserRole) {
	switch (role) {
		case "admin":
			return 2;
		case "reader":
			return 1;
		default:
			return 1;
	}
}

/**
 * Gets a user profile by their UID
 * @param uid
 */
export async function getUserProfileByUID(uid: string): Promise<UserProfile> {
	try {
		const userRecord = await getAuth().getUser(uid);
		const userProfile = {
			uid: userRecord.uid,
			email: userRecord.email,
			displayName: userRecord.displayName,
			photoURL: userRecord.photoURL,
		};
		return userProfile;
	} catch (error) {
		throw new HttpsError('internal', 'Error fetching user: ' + error.message);
	}
}

/**
 * Gets a user profile by their email
 * @param email
 */
export async function getUserProfileByEmail(email: string): Promise<UserProfile> {
	try {
		const userRecord = await getAuth().getUserByEmail(email);
		const userProfile = {
			uid: userRecord.uid,
			email: userRecord.email,
			displayName: userRecord.displayName,
			photoURL: userRecord.photoURL,
		};
		return userProfile;
	} catch (error) {
		throw new HttpsError('internal', 'Error fetching user: ' + error.message);
	}
}

/**
 * Gets a user's role by UID
 * @param uid
 */
export async function getUserRole(uid: string): Promise<UserRole> {
	const userRef = getCollection().doc(uid);

	try {
		const userDoc = await userRef.get();

		if (userDoc.exists) {
			return (userDoc.data() as User).role || null;
		} else {
			return null;
		}
	} catch (error) {
		throw new HttpsError('internal', 'Error creating/updating user: ' + error.message);
	}
}

/**
 * Sets a user's role by UID
 * @param uid
 * @param role
 */
export async function setUserRole(uid: string, role: UserRole): Promise<void> {
	const userRef = getCollection().doc(uid);
	try {
		const userDoc = await userRef.get();

		if (userDoc.exists) {
			// User document exists, update the role
			await userRef.update({role});
		} else {
			// User document doesn't exist, create a new one
			await userRef.set({role});
		}
	} catch (error) {
		throw new HttpsError('internal', 'Error creating/updating user: ' + error.message);
	}
}

/**
 * Returns whether a given User has a role
 * @param uid
 * @param role
 */
export async function hasUserRole(uid: string, role: UserRole): Promise<boolean> {
	const hasRole = await getUserRole(uid);
	return getRolePower(hasRole) >= getRolePower(role);
}

/**
 * Gets all registered users
 */
export async function getUsers(): Promise<UserWithProfileAndUID[]> {
	const querySnapshot = await getCollection()
		.where('role', 'in', ['reader', 'admin'])
		.get();

	const users: UserWithProfileAndUID[] = [];

	for (const doc of querySnapshot.docs) {
		const user = doc.data() as User;
		const profile: UserProfile = await getUserProfileByUID(doc.id);

		users.push({
			...user,
			profile,
			uid: doc.id
		});
	}

	return users;
}