/**
 * UserList
 * Project: lumenats
 * Author: jovialis (Dylan Hanson)
 * Date: 9/6/23
 */
import {
	Card,
	CardBody,
	CardFooter,
	CardHeader,
	Heading,
	HStack,
	Skeleton,
	StackDivider,
	VStack
} from "@chakra-ui/react";
import {useCallable} from "../../../hooks/UseCallable";
import {ReloadablePageProvider} from "../../../providers/ReloadablePageProvider";
import {AddUserByEmail} from "./AddUserByEmail";
import {UserRow, UserRowProps} from "./UserRow";

export function UserList() {
	const {data, loading, error, refetch} = useCallable<{}, UserRowProps[]>("funcGetUsers");

	if (error) {
		return <>Error: {error.message}</>
	}

	return <ReloadablePageProvider onPageReloaded={() => {
		refetch();
	}}>
		<Card variant={"outline"} shadow={"xl"} size={"sm"}>
			<CardHeader>
				<Heading size={"sm"}>
					Users
				</Heading>
			</CardHeader>
			<CardBody>
				<VStack
					alignItems={"stretch"}
					divider={data && <StackDivider/>}
				>
					{data && data.map(user => <UserRow key={user.uid} {...user}/>)}
					{!data && Array.from(Array(3).keys()).map(key => <Skeleton key={key} h={8}/>)}
				</VStack>
			</CardBody>
			<CardFooter>
				<HStack w={"100%"} justifyContent={"stretch"}>
					<AddUserByEmail/>
				</HStack>
			</CardFooter>
		</Card>
	</ReloadablePageProvider>
}