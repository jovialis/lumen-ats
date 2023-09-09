/**
 * ApplicantModal
 * Project: lumenats
 * Author: jovialis (Dylan Hanson)
 * Date: 9/7/23
 */
import {
	AspectRatio,
	Box,
	Button,
	Center,
	HStack,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
	Spacer,
	Spinner,
	Text,
	useDisclosure
} from "@chakra-ui/react";
import {ReactElement} from "react";

export function ResumeModal(props: {
	resumeLink: string,
	children: (onOpen: () => void) => ReactElement
}) {
	const {isOpen, onOpen, onClose} = useDisclosure();

	const match = props.resumeLink.match(/\/d\/([^/]+)/);
	const fileId = match ? match[1] : null;

	return (
		<>
			{props.children(onOpen)}
			<Modal
				isOpen={isOpen}
				onClose={onClose}
				size={"5xl"}
				scrollBehavior={"inside"}
			>
				<ModalOverlay/>
				<ModalContent position={"relative"}>
					<ModalHeader>
						View Resume
					</ModalHeader>
					<ModalCloseButton/>
					<ModalBody position={"relative"}>
						<HStack pb={2}>
							<Spacer/>
							<Text>
								Caution: Do not click the popout button in the PDF embed. It will expose the applicant's
								name and identifying information.
							</Text>
						</HStack>
						<Box position={"absolute"} w={"100%"} h={["20%", null, 20, null]} zIndex={1000}/>
						<AspectRatio
							width={"100%"}
						>
							<iframe
								title="Embedded PDF"
								src={`https://drive.google.com/file/d/${fileId}/preview`}
								width="100%"
								height="500px" // Adjust the height as needed
								frameBorder="0"
							/>
						</AspectRatio>
						<Box h={40}/>
					</ModalBody>
					<ModalFooter>
						<Button onClick={onClose}>
							Close
						</Button>
					</ModalFooter>
					<Center position={"absolute"} h={"100%"} w={"100%"} zIndex={-1}>
						<Spinner/>
					</Center>
				</ModalContent>
			</Modal>
		</>
	)
}