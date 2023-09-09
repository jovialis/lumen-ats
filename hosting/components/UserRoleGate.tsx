/**
 * UserRoleGate
 * Project: lumenats
 * Author: jovialis (Dylan Hanson)
 * Date: 9/7/23
 */
import {Center, Spinner, Text, VStack} from "@chakra-ui/react";
import {useCallable} from "../hooks/UseCallable";
import {AdminDashboard} from "./admin/AdminDashboard";
import {ReaderDashboard} from "./reader/ReaderDashboard";
import {useUser} from "./UserLoginGate";

export function UserRoleGate() {
	const {data, loading, error} = useCallable<{}, {
		role: null | "reader" | "admin"
	}>("funcGetUserRole");

	if (error) {
		return <>Error: {error.message}</>
	}

	const user = useUser();

	if (data) {
		switch (data.role) {
			case "admin": {
				return <AdminDashboard/>
			}
			case "reader": {
				return <ReaderDashboard/>
			}
			default: {
				return <>
					<Center h={"90vh"}>
						<VStack>
							<Text fontWeight={"bold"}>
								You do not have access to this application.
							</Text>
							<Text fontSize={"sm"}>
								Please contact an administrator if you think that is a mistake.
							</Text>
						</VStack>
					</Center>
				</>
			}
		}
	}

	return <>
		<Center h={"95vh"}>
			<Spinner/>
		</Center>
	</>
}