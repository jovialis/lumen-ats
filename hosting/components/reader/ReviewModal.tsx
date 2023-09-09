/**
 * ApplicantModal
 * Project: lumenats
 * Author: jovialis (Dylan Hanson)
 * Date: 9/7/23
 */
import {
	Box,
	Button,
	Center,
	Container,
	Heading,
	HStack,
	Icon,
	Link,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalFooter,
	ModalOverlay,
	Spinner,
	Text,
	useDisclosure,
	useToast,
	VStack
} from "@chakra-ui/react";
import {ReactElement, useEffect, useMemo} from "react";
import {CgArrowTopRight, CgCheck, CgExternal} from "react-icons/cg";
import {useLazyCallable} from "../../hooks/UseLazyCallable";
import {useReloadablePage} from "../../providers/ReloadablePageProvider";
import {useInstallation} from "../InstallationGate";
import {ResumeModal} from "./ResumeModal";

export function ReviewModal(props: {
	review: string,
	preventReview?: boolean
	children: (onOpen: () => void) => ReactElement
}) {
	const toast = useToast();
	const parentReloadable = useReloadablePage();

	const {isOpen, onOpen, onClose} = useDisclosure();

	const installation = useInstallation();

	const [reviewApplication, {data, loading, error}] = useLazyCallable<{
		review: string
	}, {
		uid: string
		complete: boolean
		anonId: string
		resumeLink?: string
		responses: {
			question: string,
			response: string
		}[]
	}>("funcReviewApplication", {
		review: props.review
	});

	const [completeReview, {loading: completeLoading}] = useLazyCallable<{
		review: string
	}>("funcCompleteReview", {
		review: props.review
	}, {
		onSuccess: data => {
			toast({
				title: "Successfully completed review.",
				status: "success"
			});
			onClose();
			parentReloadable.reloadPage();
		},
		onError: error => {
			toast({
				title: "Failed to complete review.",
				status: "error",
				description: error.message
			});
		}
	});

	useEffect(() => {
		if (isOpen) {
			reviewApplication();
		}
	}, [isOpen]);

	const reviewLink = useMemo(() => {
		const url = installation.reviewForm;
		return url.replaceAll(installation.reviewFormApplicantVariable, data?.anonId);
	}, [data]);

	return (
		<>
			{props.children(onOpen)}
			<Modal
				isOpen={isOpen}
				onClose={onClose}
				size={"full"}
				scrollBehavior={"inside"}
			>
				<ModalOverlay/>
				<ModalContent>
					<ModalCloseButton/>
					<ModalBody bg={"gray.50"}>
						<Container maxW={"container.md"} mt={10}>
							{loading && <Center>
                                <Spinner/>
                            </Center>}
							{data && !loading && <>
                                <Text fontSize={"2xl"} fontFamily={"mono"}>
									{data.anonId}
                                </Text>

								{data.resumeLink && <>
                                    <Box h={4}/>
                                    <ResumeModal
                                        resumeLink={JSON.parse(data.resumeLink)}
                                    >
										{onOpen => <Button
											colorScheme={"blue"}
											w={"100%"}
											variant={"outline"}
											rightIcon={<Icon as={CgArrowTopRight}/>}
											onClick={onOpen}
										>
											View Resume
										</Button>}
                                    </ResumeModal>
                                </>}

                                <Box h={8}/>

                                <VStack
                                    alignItems={"stretch"}
                                    spacing={6}
                                >
									{data.responses.map(response => <VStack
										key={response.question}
										alignItems={"stretch"}
									>
										<Heading size={"md"}>
											{response.question}
										</Heading>
										<Text whiteSpace={"pre-line"}>
											{response.response ? JSON.parse(response.response) : "-"}
										</Text>
									</VStack>)}

                                </VStack>
                                <Box h={20}/>
                            </>}
						</Container>
					</ModalBody>
					{data && !data.complete && !props.preventReview && <ModalFooter shadow={"lg"} borderTopWidth={1}>
                        <Container maxW={"container.md"}>
                            <HStack w={"100%"}>
                                <Link
                                    href={reviewLink}
                                    target={"review"}
                                    flex={1}
                                >
                                    <Button
                                        w={"100%"}
                                        colorScheme={"blue"}
                                        size={"md"}
                                        rightIcon={<Icon as={CgExternal} boxSize={6}/>}
                                        isDisabled={!data || data?.complete}
                                    >
                                        Open Review Form
                                    </Button>
                                </Link>
                                <Button
                                    flex={1}
                                    w={"100%"}
                                    colorScheme={"green"}
                                    size={"md"}
                                    rightIcon={<Icon as={CgCheck} boxSize={6}/>}
                                    isDisabled={!data || data?.complete}
                                    isLoading={completeLoading}
                                    onClick={() => completeReview()}
                                >
                                    Mark as Read
                                </Button>
                            </HStack>
                        </Container>
                    </ModalFooter>}
				</ModalContent>
			</Modal>
		</>
	)
}