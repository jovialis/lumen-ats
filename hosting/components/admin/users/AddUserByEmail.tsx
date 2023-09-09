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

export function AddUserByEmail() {
	const [email, setEmail] = useState<string>("");
	const toast = useToast();

	const reloadablePage = useReloadablePage();

	const [submitEmail, {data, loading, error}] = useLazyCallable<{
		email: string
	}>("funcAddUserByEmail", null, {
		onSuccess: data => {
			toast({
				title: "Successfully added user as a reader.",
				status: "success"
			});
			setEmail("");
			reloadablePage.reloadPage();
		},
		onError: error => {
			toast({
				title: "Failed to add as a reader.",
				status: "error",
				description: error.message
			});
		}
	});

	return <HStack w={"100%"}>
		<Input
			value={email}
			onChange={e => setEmail(e.target.value)}
			flex={1}
			size={"sm"}
		/>
		<Button
			onClick={() => {
				if (!email)
					return;
				submitEmail({
					email: email
				})
			}}
			isLoading={loading}
			size={"sm"}
		>
			Add Reader
		</Button>
	</HStack>
}