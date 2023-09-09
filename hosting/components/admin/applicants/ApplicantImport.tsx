/**
 * ApplicantImport
 * Project: lumenats
 * Author: jovialis (Dylan Hanson)
 * Date: 9/6/23
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
	VisuallyHiddenInput,
	VStack
} from "@chakra-ui/react";
import Papa from "papaparse";
import {useEffect, useRef, useState} from "react";
import {useCallable} from "../../../hooks/UseCallable";
import {useLazyCallable} from "../../../hooks/UseLazyCallable";
import {useReloadablePage} from "../../../providers/ReloadablePageProvider";
import {ApplicantAnonIDDownload} from "./ApplicantAnonIDDownload";

export function ApplicantImport(props: {
	hasExisting: boolean
}) {
	const parentReload = useReloadablePage();
	const toast = useToast();

	const {data: hasGenerated} = useCallable<{}, boolean>("funcHasReviewsGenerated")

	const fileInputRef = useRef<HTMLInputElement>();

	const [state, setState] = useState<{
		loading: boolean,
		file: File | null,
		columns: string[] | null,
		data: Record<string, any>[] | null,
		error: Error | null
	}>({
		loading: false,
		file: null,
		columns: null,
		data: null,
		error: null
	});

	useEffect(() => {
		if (state.file && state.loading) {
			Papa.parse(state.file, {
				header: true,
				dynamicTyping: true,
				complete: (result) => {
					console.log(result.data);
					setState(prevState => ({
						...prevState,
						loading: false,
						data: result.data,
						columns: result.meta.fields || [],
						error: null
					}));
				},
				error: (error) => {
					setState(prevState => ({
						...prevState,
						loading: false,
						data: null,
						columns: null,
						error: error
					}))
				},
			});
		}
	}, [state]);

	useEffect(() => {
		if (state.error) {
			toast({
				title: "Failed to parse CSV",
				description: "Something went wrong when reading headers from the CSV",
				status: "error"
			});
		}
	}, [state.error]);

	useEffect(() => {
		if (state.data) {
			onOpen();
		}
	}, [state.data]);

	const {isOpen, onOpen, onClose} = useDisclosure()
	const cancelRef = useRef();

	const [funcImportApplicants, {loading}] = useLazyCallable<{
		applicants: Record<string, any>[],
		columns: string[]
	}>("funcImportApplicants", {
		applicants: state.data,
		columns: state.columns
	}, {
		onSuccess: data => {
			toast({
				title: "Successfully imported applicants.",
				status: "success"
			});
			parentReload.reloadPage();
			fileInputRef.current.value = "";
			onClose();
			setState({
				file: null,
				loading: false,
				data: null,
				columns: null,
				error: null
			});
		},
		onError: error => {
			toast({
				title: "Failed to import applicants.",
				status: "error",
				description: error.message
			});
			onClose();
		}
	})

	return <>
		<VStack justifyContent={"stretch"} alignItems={"stretch"} w={"100%"}>
			{hasGenerated && <ApplicantAnonIDDownload/>}
			<Button
				colorScheme={"blue"}
				onClick={() => fileInputRef.current?.click()}
				isLoading={state.loading || loading}
				size={"sm"}
			>
				{state.file ? state.file.name : (hasGenerated ? "Re-Import Applicants from CSV" : "Import Applicants from CSV")}
			</Button>
		</VStack>
		<VisuallyHiddenInput
			ref={fileInputRef}
			type={"file"}
			accept={".csv"}
			multiple={false}
			onChange={e => {
				setState(prevState => {
					const file = e.target.files[0];
					return ({
						file: e.target.files[0],
						loading: !!file,
						data: [],
						columns: [],
						error: null
					})
				});
			}}
		/>
		<AlertDialog
			isOpen={isOpen}
			leastDestructiveRef={cancelRef}
			onClose={onClose}
		>
			<AlertDialogOverlay>
				<AlertDialogContent>
					<AlertDialogHeader fontSize='lg' fontWeight='bold'>
						Import Applicants
					</AlertDialogHeader>

					<AlertDialogBody>
						{props.hasExisting && <Text>
                            Are you sure? This will replace all existing columns and will delete any applicants
                            previously imported.
                        </Text>}

						{state.data && <Text>
							{state.data.length} Applicants
                        </Text>}
					</AlertDialogBody>

					<AlertDialogFooter>
						<Button
							ref={cancelRef}
							onClick={() => {
								fileInputRef.current.value = "";
								setState({
									file: null,
									loading: false,
									data: null,
									columns: null,
									error: null
								});
								onClose();
							}}
						>
							Cancel
						</Button>
						<Button
							colorScheme={'blue'}
							onClick={() => {
								funcImportApplicants();
							}}
							isLoading={loading}
							ml={3}
						>
							Import
						</Button>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialogOverlay>
		</AlertDialog>
	</>
}