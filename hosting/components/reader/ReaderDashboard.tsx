/**
 * AdminDashboard
 * Project: lumenats
 * Author: jovialis (Dylan Hanson)
 * Date: 9/7/23
 */
import {
	Alert,
	AlertDescription,
	AlertTitle,
	Box,
	Button,
	Card,
	CardBody,
	CardHeader,
	Container,
	Heading,
	HStack,
	Icon,
	Skeleton,
	Tab,
	Table,
	TableContainer,
	TabList,
	TabPanel,
	TabPanels,
	Tabs,
	Tbody,
	Td,
	Text,
	Th,
	Thead,
	Tr,
	VStack
} from "@chakra-ui/react";
import {useMemo} from "react";
import {CgArrowTopRight} from "react-icons/cg";
import {useCallable} from "../../hooks/UseCallable";
import {ReloadablePageProvider} from "../../providers/ReloadablePageProvider";
import {useUser} from "../UserLoginGate";
import {ReviewModal} from "./ReviewModal";

export function ReaderDashboard() {
	const user = useUser();

	const {data, loading, error, refetch} = useCallable<{}, {
		reader: string,
		complete: boolean
		applicant: string
		uid: string
		anonId: string
	}[]>("funcGetMyReviews");

	const completedReviews = useMemo(() => {
		if (!data) return [];
		return data.filter(rev => rev.complete)
	}, [data]);

	const uncompletedReviews = useMemo(() => {
		if (!data) return [];
		return data.filter(rev => !rev.complete)
	}, [data]);

	if (error) {
		return <>Error: {error.message}</>
	}

	return <ReloadablePageProvider onPageReloaded={() => {
		refetch();
	}}>
		<Container maxW={"container.md"} mt={12}>
			<VStack alignItems={"stretch"} spacing={4}>
				<Heading size={"lg"}>
					Welcome, {user.displayName}
				</Heading>

				{data && <HStack>
                    <Text fontSize={"lg"} fontWeight={"bold"} color={"gray.600"}>
						{uncompletedReviews.length} Remaining
                    </Text>
                    <Text fontSize={"lg"} fontWeight={"bold"} color={"gray.400"}>
						{completedReviews.length} Read
                    </Text>
                </HStack>}

				{loading && Array.from(Array(5).keys()).map(key => <Skeleton key={key} h={4}/>)}

				{data && !loading && data.length === 0 && <>
                    <Alert>
                        <AlertTitle>
                            No Reviews Assigned
                        </AlertTitle>
                        <AlertDescription>
                            Check back to this page later to see your assigned applicants.
                        </AlertDescription>
                    </Alert>
                </>}

				{data && !loading && data.length > 0 && <>
                    <Tabs size={"sm"}>
                        <TabList>
                            <Tab>To Read</Tab>
                            <Tab>Already Read</Tab>
                        </TabList>

                        <TabPanels>
                            <TabPanel
                                px={0}
                            >
								{uncompletedReviews.length === 0 && <>
                                    <Alert>
                                        <AlertTitle>
                                            All reviews completed
                                        </AlertTitle>
                                        <AlertDescription>
                                            Congratulations! You did it!
                                        </AlertDescription>
                                    </Alert>
                                </>}

								{uncompletedReviews.length > 0 && <>
                                    <Card variant={"outline"} shadow={"lg"} mb={8}>
                                        <CardHeader pb={0}>
                                            <VStack alignItems={"flex-start"} spacing={1}>
                                                <Heading size={"xs"}>Next Applicant:</Heading>
                                                <Text fontFamily={"mono"} fontSize={"md"}>
													{uncompletedReviews[0].anonId}
                                                </Text>
                                            </VStack>
                                        </CardHeader>
                                        <CardBody alignItems={"stretch"}>
                                            <ReviewModal review={uncompletedReviews[0].uid}>
												{onOpen => <Button
													colorScheme={"blue"}
													w={"100%"}
													rightIcon={<Icon as={CgArrowTopRight}/>}
													onClick={onOpen}
												>
													Open Applicant Responses
												</Button>}
                                            </ReviewModal>
                                        </CardBody>
                                    </Card>
                                    <TableContainer>
                                        <Table variant={'simple'} size={"sm"}>
                                            <Thead>
                                                <Tr>
                                                    <Th>Upcoming Applicants</Th>
                                                    <Th isNumeric={true}/>
                                                </Tr>
                                            </Thead>
                                            <Tbody>
												{uncompletedReviews.slice(1).map(review => <Tr key={review.uid}>
													<Td>
														<Text py={1} fontFamily={"mono"} fontSize={"sm"}>
															{review.anonId}
														</Text>
													</Td>
													<Td>
														<ReviewModal review={review.uid} preventReview={true}>
															{onOpen => <Button
																colorScheme={"blue"}
																rightIcon={<Icon as={CgArrowTopRight}/>}
																variant={"outline"}
																size={"xs"}
																onClick={onOpen}
															>
																Preview
															</Button>}
														</ReviewModal>
													</Td>
												</Tr>)}
                                            </Tbody>
                                        </Table>
                                    </TableContainer>
                                </>}

                            </TabPanel>
                            <TabPanel
                                px={0}
                            >
								{completedReviews.length === 0 && <>
                                    <Alert>
                                        <AlertTitle>
                                            No Reviews Completed
                                        </AlertTitle>
                                        <AlertDescription>
                                            Use this page to review applicants you have already screened.
                                        </AlertDescription>
                                    </Alert>
                                </>}

								{completedReviews.length > 0 && <>
                                    <TableContainer>
                                        <Table variant={'simple'} size={"sm"}>
                                            <Thead>
                                                <Tr>
                                                    <Th>Completed Applicants</Th>
                                                    <Th isNumeric={true}/>
                                                </Tr>
                                            </Thead>
                                            <Tbody>
												{completedReviews.map(review => <Tr key={review.uid}>
													<Td>
														<Text py={1} fontFamily={"mono"} fontSize={"sm"}>
															{review.anonId}
														</Text>
													</Td>
													<Td isNumeric={true}>
														<ReviewModal review={review.uid}>
															{onOpen => <Button
																colorScheme={"blue"}
																rightIcon={<Icon as={CgArrowTopRight}/>}
																variant={"outline"}
																size={"xs"}
																onClick={onOpen}
															>
																Review
															</Button>}
														</ReviewModal>
													</Td>
												</Tr>)}
                                            </Tbody>
                                        </Table>
                                    </TableContainer>
                                </>}

                            </TabPanel>

                        </TabPanels>
                    </Tabs>
                </>}
			</VStack>
			<Box h={40}/>
		</Container>
	</ReloadablePageProvider>
}