/**
 * UserRow
 * Project: lumenats
 * Author: jovialis (Dylan Hanson)
 * Date: 9/6/23
 */
import {
	Avatar,
	Badge,
	HStack,
	Icon,
	IconButton,
	Menu,
	MenuButton,
	Spacer,
	Text,
	Tooltip,
	useToast
} from "@chakra-ui/react";
import {CgEyeAlt} from "react-icons/cg";
import {useReloadablePage} from "../../../providers/ReloadablePageProvider";

export interface TeamRowProps {
	uid: string
	profile: {
		uid: string
		email: string
		displayName: string
		photoURL: string
	}
	role: null | "admin" | "reader"
}

export function TeamRow(props: TeamRowProps) {
	const reloadablePage = useReloadablePage();
	const toast = useToast();

	// const [setUserRole, {loading}] = useLazyCallable<{
	// 	role: null | string,
	// 	user: string
	// }>("funcSetUserRole", null, {
	// 	onSuccess: data => {
	// 		toast({
	// 			title: "Successfully changed column visibility.",
	// 			status: "success"
	// 		});
	//
	// 		reloadablePage.reloadPage();
	// 	},
	// 	onError: error => {
	// 		toast({
	// 			title: "Failed to change column visibility.",
	// 			status: "error",
	// 			description: error.message
	// 		});
	// 	}
	// });

	return <>
		<HStack key={props.uid}>
			<Avatar
				src={props.profile.photoURL}
				name={props.profile.displayName}
				size={"sm"}
			/>
			<Text>
				{props.profile.displayName}
			</Text>
			<Badge>
				{props.role}
			</Badge>
			<Spacer/>
			<Menu>
				<Tooltip label={"Set User Role"}>
					<MenuButton
						as={IconButton}
						aria-label={"Set User Role"}
						icon={<Icon as={CgEyeAlt}/>}
						size={"sm"}
						variant={"ghost"}
						// isLoading={loading}
					/>
				</Tooltip>
			</Menu>
		</HStack>
	</>
}