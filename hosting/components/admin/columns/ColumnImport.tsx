/**
 * ColumnImport
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
	Tag,
	Text,
	useDisclosure,
	useToast,
	VisuallyHiddenInput,
	Wrap,
	WrapItem
} from "@chakra-ui/react";
import Papa from 'papaparse';
import {useEffect, useRef, useState} from "react";
import {Simulate} from "react-dom/test-utils";
import {useLazyCallable} from "../../../hooks/UseLazyCallable";
import {useReloadablePage} from "../../../providers/ReloadablePageProvider";

export function ColumnImport(props: {
	hasExisting?: boolean
}) {
	const parentReload = useReloadablePage();
	const toast = useToast();

	const fileInputRef = useRef<HTMLInputElement>();

	const [state, setState] = useState<{
		loading: boolean,
		file: File | null,
		columns: string[] | null,
		error: Error | null
	}>({
		loading: false,
		file: null,
		columns: null,
		error: null
	});

	useEffect(() => {
		if (state.file && state.loading) {
			Papa.parse(state.file, {
				header: true,
				dynamicTyping: true,
				complete: (result) => {
					setState(prevState => ({
						...prevState,
						loading: false,
						columns: result.meta.fields || [],
						error: null
					}));
				},
				error: (error) => {
					setState(prevState => ({
						...prevState,
						loading: false,
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
		if (state.columns) {
			onOpen();
		}
	}, [state.columns]);

	const {isOpen, onOpen, onClose} = useDisclosure()
	const cancelRef = useRef();

	const [funcSetColumns, {loading}] = useLazyCallable<{
		columns: string[]
	}>("funcSetColumns", {
		columns: state.columns
	}, {
		onSuccess: data => {
			toast({
				title: "Successfully imported columns.",
				status: "success"
			});
			parentReload.reloadPage();
			fileInputRef.current.value = "";
			onClose();
			setState({
				file: null,
				loading: false,
				columns: null,
				error: null
			});
		},
		onError: error => {
			toast({
				title: "Failed to import columns.",
				status: "error",
				description: error.message
			});
			onClose();
		}
	})

	return <>
		<Button
			colorScheme={"blue"}
			flex={1}
			onClick={() => fileInputRef.current?.click()}
			isLoading={state.loading || loading}
			size={"sm"}
		>
			{state.file ? state.file.name : "Import from CSV"}
		</Button>
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
						Set Columns
					</AlertDialogHeader>

					<AlertDialogBody>
						{props.hasExisting && <Text>
                            Are you sure? This will replace all existing columns and will delete any applicants
                            previously imported.
                        </Text>}

						{state.columns && <Wrap>
							{state.columns.map(col => <WrapItem key={col}>
								<Tag>
									{col}
								</Tag>
							</WrapItem>)}
                        </Wrap>}
					</AlertDialogBody>

					<AlertDialogFooter>
						<Button
							ref={cancelRef}
							onClick={() => {
								fileInputRef.current.value = "";
								setState({
									file: null,
									loading: false,
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
								funcSetColumns();
							}}
							isLoading={loading}
							ml={3}
						>
							Submit
						</Button>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialogOverlay>
		</AlertDialog>
	</>
}