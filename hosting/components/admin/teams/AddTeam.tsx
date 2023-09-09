/**
 * AddUserByEmail
 * Project: lumenats
 * Author: jovialis (Dylan Hanson)
 * Date: 9/6/23
 */
import {Button, HStack, Input, useToast} from "@chakra-ui/react";
import {useState} from "react";
import {useLazyCallable} from "../../../hooks/UseLazyCallable";
import {useReloadablePage} from "../../../providers/ReloadablePageProvider";

export function AddTeam() {
	const [team, setTeam] = useState<string>("");
	const toast = useToast();

	const reloadablePage = useReloadablePage();

	const [createTeam, {data, loading, error}] = useLazyCallable<{
		teamName: string,
		users: []
	}>("funcCreateTeam", null, {
		onSuccess: data => {
			toast({
				title: "Successfully created team.",
				status: "success"
			});
			setTeam("");
			reloadablePage.reloadPage();
		},
		onError: error => {
			toast({
				title: "Failed to create team.",
				status: "error",
				description: error.message
			});
		}
	});

	return <HStack w={"100%"}>
		<Input
			value={team}
			onChange={e => setTeam(e.target.value)}
			flex={1}
			size={"sm"}
			placeholder={"Team Name"}
		/>
		<Button
			onClick={() => {
				if (!team)
					return;
				createTeam({
					teamName: team,
					users: []
				})
			}}
			isLoading={loading}
			size={"sm"}
		>
			Create Team
		</Button>
	</HStack>
}