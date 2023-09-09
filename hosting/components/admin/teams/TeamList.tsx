/**
 * UserList
 * Project: lumenats
 * Author: jovialis (Dylan Hanson)
 * Date: 9/6/23
 */
import {
	Avatar,
	Button,
	Card,
	CardBody,
	CardFooter,
	CardHeader,
	Editable,
	EditableInput,
	EditablePreview,
	Heading,
	HStack,
	Icon,
	IconButton,
	Popover,
	PopoverArrow,
	PopoverBody,
	PopoverContent,
	PopoverTrigger,
	Skeleton,
	StackDivider,
	Tag,
	TagCloseButton,
	TagLabel,
	Text,
	useToast,
	VStack,
	Wrap,
	WrapItem
} from "@chakra-ui/react";
import {CgMathPlus, CgTrash} from "react-icons/cg";
import {useCallable} from "../../../hooks/UseCallable";
import {useLazyCallable} from "../../../hooks/UseLazyCallable";
import {ReloadablePageProvider} from "../../../providers/ReloadablePageProvider";
import {UserRowProps} from "../users/UserRow";
import {AddTeam} from "./AddTeam";

export function TeamList() {
	const toast = useToast();

	const {data, loading, error, refetch} = useCallable<{}, {
		uid: string
		teamName: string
		users: UserRowProps[]
	}[]>("funcGetTeams");
	const {data: users, loading: userLoading, error: userError} = useCallable<{}, UserRowProps[]>("funcGetUsers");

	const [addUserToTeam] = useLazyCallable<{
		team: string
		user: string
	}>("funcAddUserToTeam", null, {
		onSuccess: data => {
			toast({
				title: "Successfully added user to team.",
				status: "success"
			});
			refetch();
		},
		onError: error => {
			toast({
				title: "Failed to add user to team.",
				status: "error",
				description: error.message
			});
		}
	});

	const [removeUserFromTeam] = useLazyCallable<{
		team: string
		user: string
	}>("funcRemoveUserFromTeam", null, {
		onSuccess: data => {
			toast({
				title: "Successfully removed user from team.",
				status: "success"
			});
			refetch();
		},
		onError: error => {
			toast({
				title: "Failed to remove user from team.",
				status: "error",
				description: error.message
			});
		}
	});

	const [setTeamDisplayName] = useLazyCallable<{
		team: string
		displayName: string
	}>("funcSetTeamDisplayName", null, {
		onSuccess: data => {
			toast({
				title: "Successfully renamed team.",
				status: "success"
			});
			refetch();
		},
		onError: error => {
			toast({
				title: "Failed to rename team.",
				status: "error",
				description: error.message
			});
		}
	});

	const [deleteTeam] = useLazyCallable<{
		team: string
	}>("funcDeleteTeam", null, {
		onSuccess: data => {
			toast({
				title: "Successfully deleted team.",
				status: "success"
			});
			refetch();
		},
		onError: error => {
			toast({
				title: "Failed to delete team.",
				status: "error",
				description: error.message
			});
		}
	});


	if (error) {
		return <>Error: {error.message}</>
	}

	return <ReloadablePageProvider onPageReloaded={() => {
		refetch();
	}}>
		<Card variant={"outline"} shadow={"xl"} size={"sm"}>
			<CardHeader>
				<Heading size={"sm"}>
					Teams
				</Heading>
			</CardHeader>

			{data && <>
                <CardBody>
                    <VStack
                        alignItems={"stretch"}
                        divider={data && <StackDivider/>}
                    >
						{data && data.map(team => <Card
							size={"sm"}
						>
							<CardHeader mb={0}>
								<HStack>
									<Text flex={1}>
										<Editable
											defaultValue={team.teamName}
											onSubmit={newName => setTeamDisplayName({
												team: team.uid,
												displayName: newName
											})}
										>
											<EditablePreview/>
											<EditableInput/>
										</Editable>
									</Text>
									<IconButton
										size={"sm"}
										aria-label={"Delete team"}
										icon={<Icon as={CgTrash}/>}
										variant={"ghost"}
										onClick={() => deleteTeam({
											team: team.uid
										})}
									/>
								</HStack>
							</CardHeader>
							<CardBody pt={0}>
								<Wrap>
									{team.users.map(user => <Tag key={user.uid}>
										<Avatar
											size={"2xs"}
											src={user.profile.photoURL}
											mr={2}
										/>
										<TagLabel>
											{user.profile.displayName}
										</TagLabel>
										<TagCloseButton
											onClick={() => removeUserFromTeam({
												user: user.uid,
												team: team.uid
											})}
										/>
									</Tag>)}
									{users && <WrapItem>
                                        <Popover>
											{(context) => <>
												<PopoverTrigger>
													<IconButton
														size={"xs"}
														aria-label={"Add users"}
														icon={<Icon as={CgMathPlus}/>}
													/>
												</PopoverTrigger>
												<PopoverContent>
													<PopoverArrow/>
													<PopoverBody py={4}>
														<VStack
															alignItems={"stretch"}
															divider={<StackDivider/>}
														>
															{users.filter(user => !team.users.map(user => user.uid).includes(user.uid)).map(user =>
																<HStack
																	key={user.uid}
																	alignItems={"stretch"}
																>
																	<Avatar
																		size={"xs"}
																		src={user.profile.photoURL}
																	/>
																	<Text flex={1}>
																		{user.profile.displayName}
																	</Text>
																	<Button
																		size={"xs"}
																		onClick={() => {
																			context.onClose();
																			addUserToTeam({
																				team: team.uid,
																				user: user.uid
																			})
																		}}
																	>
																		Add
																	</Button>
																</HStack>)}
														</VStack>
													</PopoverBody>
												</PopoverContent>
											</>}
                                        </Popover>
                                    </WrapItem>}
								</Wrap>
							</CardBody>
						</Card>)}
                    </VStack>
                </CardBody>
            </>}

			{loading && !data && <CardBody>
                <Skeleton h={14} w={"100%"}/>
            </CardBody>}
			<CardFooter>
				<HStack w={"100%"} justifyContent={"stretch"}>
					<AddTeam/>
				</HStack>
			</CardFooter>
		</Card>
	</ReloadablePageProvider>
}