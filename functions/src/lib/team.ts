/**
 * team
 * Project: lumenats
 * Author: jovialis (Dylan Hanson)
 * Date: 9/7/23
 */
import {FieldValue, getFirestore} from "firebase-admin/firestore";
import {HttpsError} from "firebase-functions/v2/https";
import {getUsers, UserWithProfileAndUID} from "./user";

export interface Team {
	users: string[]
	teamName: string
}

export type TeamWithUserAndUID = {
	teamName: string
	uid: string
	users: UserWithProfileAndUID[]
}

function getCollection() {
	return getFirestore().collection("teams")
}

/**
 * Creates a team with a given name and a set of users
 * @param teamName
 * @param withUsers
 */
export async function createTeam(teamName: string, withUsers: string[]) {
	const coll = getCollection();

	await coll.doc().create({
		users: withUsers,
		teamName: teamName
	} as Team);
}

/**
 * Removes a user from a team
 * @param team
 * @param user
 */
export async function removeUserFromTeam(team: string, user: string) {
	try {
		const teamRef = getCollection().doc(team);
		const teamDoc = await teamRef.get();

		if (teamDoc.exists) {
			// Update the document to remove the UID from the array
			await teamRef.update({
				users: FieldValue.arrayRemove(user),
			});
			return;
		}
	} catch (error) {
		console.error('Error removing user from team:', error);
		throw new HttpsError('internal', 'Error removing user from team.');
	}

	throw new HttpsError('not-found', 'Team not found.');
}

/**
 * Adds a user to a team
 * @param team
 * @param user
 */
export async function addUserToTeam(team: string, user: string) {
	try {
		const teamRef = getCollection().doc(team);
		const teamDoc = await teamRef.get();

		if (teamDoc.exists) {
			// Update the document to remove the UID from the array
			await teamRef.update({
				users: [...(teamDoc.get("users") || []), user],
			});
			return;
		}
	} catch (error) {
		console.error('Error adding user to team:', error);
		throw new HttpsError('internal', 'Error adding user to team.');
	}

	throw new HttpsError('not-found', 'Team not found.');
}

/**
 * Renames a team by its ID
 * @param team
 * @param teamName
 */
export async function renameTeam(team: string, teamName: string) {
	try {
		const teamRef = getCollection().doc(team);
		const teamDoc = await teamRef.get();

		if (teamDoc.exists) {
			// Update the document to remove the UID from the array
			await teamRef.update({
				teamName: teamName,
			} as Partial<Team>);
			return;
		}
	} catch (error) {
		console.error('Error updating team name:', error);
		throw new HttpsError('internal', 'Error updating team name.');
	}

	throw new HttpsError('not-found', 'Team not found.');
}

/**
 * Deletes a team by its UID
 * @param team
 */
export async function deleteTeam(team: string) {
	try {
		const teamRef = getCollection().doc(team);
		const teamDoc = await teamRef.get();

		if (teamDoc.exists) {
			// Update the document to remove the UID from the array
			await teamRef.delete()
			return;
		}
	} catch (error) {
		console.error('Error deleting team:', error);
		throw new HttpsError('internal', 'Error deleting team.');
	}

	throw new HttpsError('not-found', 'Team not found.');
}


/**
 * Gets the Teams
 */
export async function getTeams() {
	const querySnapshot = await getCollection().get();
	const teamList: TeamWithUserAndUID[] = [];

	const users = await getUsers();
	const userMap: Record<string, UserWithProfileAndUID> = users.reduce((sum, cur) => ({
		...sum,
		[cur.uid]: cur
	}), {});

	for (const doc of querySnapshot.docs) {
		const team = doc.data() as Team;

		teamList.push({
			...team,
			users: team.users.map(userId => userMap[userId]).filter(user => !!user),
			uid: doc.id
		});
	}

	return teamList;
}