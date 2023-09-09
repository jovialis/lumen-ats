/**
 * ReviewProgress
 * Project: lumenats
 * Author: jovialis (Dylan Hanson)
 * Date: 9/8/23
 */
import {CheckCircleIcon, QuestionOutlineIcon} from '@chakra-ui/icons'
import {
	Box,
	Button,
	Card,
	CardBody,
	CardHeader,
	Heading,
	HStack,
	Icon,
	Popover,
	PopoverArrow,
	PopoverBody,
	PopoverContent,
	PopoverTrigger,
	Progress,
	Skeleton,
	Table,
	TableContainer,
	Tbody,
	Td,
	Text,
	Th,
	Thead,
	Tooltip,
	Tr,
	VStack
} from "@chakra-ui/react";
import React, {useMemo} from "react";
import {CgArrowTopRight} from "react-icons/cg";
import {useCallable} from "../../../hooks/UseCallable";
import {ReviewModal} from "../../reader/ReviewModal";

export function ReviewProgress() {
	const {data: hasGenerated, loading, error, refetch} = useCallable<{}, boolean>("funcHasReviewsGenerated")

	if (hasGenerated) {
		return <ReviewProgressView/>
	} else {
		return <></>
	}
}

function ReviewProgressView() {
	const {data, loading, error, refetch} = useCallable<{}, {
		finished: boolean
		totalCount: number
		remainingApplicants: {
			applicant: {
				uid: string
				anonId: string
				email: string
				name: string
			},
			reviews: {
				complete: boolean
				uid: string
				reader: {
					uid: string
					profile: {
						displayName: string
						email: string
						photoURL: string
					}
				}
			}[]
			finished: boolean
		}[],
		completedApplicants: {
			applicant: {
				uid: string
				anonId: string
				email: string
				name: string
			},
			reviews: {
				complete: boolean
				uid: string
				reader: {
					uid: string
					profile: {
						displayName: string
						email: string
						photoURL: string
					}
				}
			}[]
			finished: boolean
		}[]
	}>("funcGetReviewStatus");

	const joinedApplicants = useMemo(() => {
		if (!data) return [];
		return [...data.remainingApplicants, ...data.completedApplicants];
	}, [data])

	return <>
		<Card variant={"outline"} shadow={"lg"} size={"sm"}>
			<CardHeader>
				<Heading size={"sm"}>
					Review Completion Progress
				</Heading>

				{data && <HStack justifyContent={"stretch"} mt={2}>
                    <Progress
                        value={data.completedApplicants.length / data.totalCount}
                        flex={1}
                        colorScheme={"green"}
                    />
                    <Text fontSize={"xs"}>
						{data.completedApplicants.length}/{data.totalCount}
                    </Text>
                </HStack>}
			</CardHeader>
			<CardBody>
				{!data && loading && <VStack alignItems={"stretch"}>
					{Array.from(Array(10).keys()).map(key => <Skeleton key={key} h={6}/>)}
                </VStack>}

				{error && <>Error: {error.message}</>}

				{data && <VStack alignItems={"stretch"} spacing={6}>

                    <TableContainer>
                        <Table variant={'simple'} size={"sm"}>
                            <Thead>
                                <Tr>
                                    <Th>ID</Th>
                                    <Th>Reviews</Th>
                                    <Th>Preview</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
								{joinedApplicants.map(applicant => <Tr
									key={applicant.applicant.uid}
								>
									<Td>
										<HStack>
											<Text fontFamily={"mono"}>
												{applicant.applicant.anonId}
											</Text>
											<Popover trigger={"hover"}>
												<PopoverTrigger>
													<QuestionOutlineIcon
														color={"gray.400"}
														cursor={"help"}
													/>
												</PopoverTrigger>
												<PopoverContent>
													<PopoverArrow/>
													<PopoverBody shadow={"xl"}>
														<VStack py={2} alignItems={"flex-start"} spacing={1}>
															<Text
																fontWeight={"medium"}>{applicant.applicant.name && JSON.parse(applicant.applicant.name)}</Text>
															<Text
																fontSize={"sm"}>{applicant.applicant.email && JSON.parse(applicant.applicant.email)}</Text>
														</VStack>
													</PopoverBody>
												</PopoverContent>
											</Popover>
										</HStack>
									</Td>
									<Td>
										<HStack>
											{applicant.reviews.map(review => <React.Fragment key={review.reader.uid}>
												<Tooltip
													label={review.reader.profile.displayName}
												>
													<Box>
														<CheckCircleIcon
															color={review.complete ? "green.500" : "gray.300"}
														/>
													</Box>
												</Tooltip>
											</React.Fragment>)}
										</HStack>
									</Td>
									<Td>
										{applicant.reviews[0] &&
                                            <ReviewModal review={applicant.reviews[0].uid} preventReview={true}>
												{onOpen => <Button
													colorScheme={"blue"}
													rightIcon={<Icon as={CgArrowTopRight}/>}
													variant={"outline"}
													size={"xs"}
													onClick={onOpen}
												>
													Preview
												</Button>}
                                            </ReviewModal>}
									</Td>
								</Tr>)}
                            </Tbody>
                        </Table>
                    </TableContainer>
                </VStack>}
			</CardBody>
		</Card>
	</>
}