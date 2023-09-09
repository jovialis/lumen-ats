/**
 * GenerateReviews
 * Project: lumenats
 * Author: jovialis (Dylan Hanson)
 * Date: 9/7/23
 */
import {
	AlertDialog,
	AlertDialogBody,
	AlertDialogContent,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogOverlay,
	Button,
	Text,
	useDisclosure,
	useToast,
	VStack
} from "@chakra-ui/react";
import {useRef} from "react";
import {useCallable} from "../../../hooks/UseCallable";
import {useLazyCallable} from "../../../hooks/UseLazyCallable";

export function GenerateReviews() {
	const toast = useToast();

	const {data: hasGenerated, loading, error, refetch} = useCallable<{}, boolean>("funcHasReviewsGenerated")
	;
	const [generateReviews, {loading: generateLoading}] = useLazyCallable<{}>("funcGenerateReviews", null, {
		onSuccess: data => {
			toast({
				title: "Successfully generated reviews.",
				status: "success"
			});
			refetch();
			onClose();
		},
		onError: error => {
			toast({
				title: "Failed to generate reviews.",
				status: "error",
				description: error.message
			});
		}
	});

	const {isOpen, onOpen, onClose} = useDisclosure()
	const cancelRef = useRef()

	return <>
		<Button
			colorScheme={hasGenerated ? "red" : "blue"}
			onClick={hasGenerated ? () => {
				onOpen();
			} : () => {
				generateReviews();
			}}
			isLoading={loading || generateLoading}
			minH={10}
			h={"auto"}
		>
			{!hasGenerated && "Assign Reviewers"}
			{hasGenerated && <>
                <VStack py={2} spacing={0}>
                    <Text>
                        Re-assign Reviewers
                    </Text>
                    <Text fontSize={"xs"}>
                        This will erase all reviewer progress and cannot be undone.
                    </Text>
                </VStack>
            </>}
		</Button>

		<AlertDialog
			isOpen={isOpen}
			leastDestructiveRef={cancelRef}
			onClose={onClose}
		>
			<AlertDialogOverlay>
				<AlertDialogContent>
					<AlertDialogHeader fontSize='lg' fontWeight='bold'>
						Re-assign Reviewers
					</AlertDialogHeader>

					<AlertDialogBody>
						Are you sure? This will erase all reviewer progress and cannot be undone.
					</AlertDialogBody>

					<AlertDialogFooter>
						<Button ref={cancelRef} onClick={onClose}>
							Cancel
						</Button>
						<Button
							colorScheme='red'
							onClick={() => {
								generateReviews();
							}}
							ml={3}
							isLoading={generateLoading}
						>
							Re-Assign
						</Button>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialogOverlay>
		</AlertDialog>
	</>
}