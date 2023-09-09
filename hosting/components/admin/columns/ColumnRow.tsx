/**
 * ColumnRow
 * Project: lumenats
 * Author: jovialis (Dylan Hanson)
 * Date: 9/6/23
 */
import {
	Box,
	Button,
	Checkbox,
	Editable,
	EditableInput,
	EditablePreview,
	HStack,
	Icon,
	Popover,
	PopoverArrow,
	PopoverBody,
	PopoverContent,
	PopoverTrigger,
	Spinner,
	Tag,
	TagLabel,
	Text,
	useToast,
	VStack
} from "@chakra-ui/react";
import {CgDanger} from "react-icons/cg";
import {useLazyCallable} from "../../../hooks/UseLazyCallable";
import {useReloadablePage} from "../../../providers/ReloadablePageProvider";

export interface ColumnRowProps {
	displayName: string,
	hidden: boolean
	isName: boolean
	isEmail: boolean
	isResume: boolean
	uid: string
}

export function ColumnRow(props: ColumnRowProps) {
	const toast = useToast();
	const parentReload = useReloadablePage();

	const [setColumnDisplayName, {loading: nameLoading}] = useLazyCallable<{
		displayName: string,
		column: string
	}>("funcSetColumnDisplayName", null, {
		onSuccess: data => {
			toast({
				title: "Successfully renamed column.",
				status: "success"
			});
		},
		onError: error => {
			toast({
				title: "Failed to rename column.",
				status: "error",
				description: error.message
			});
		}
	});

	const [setColumnVisibility, {loading: visibilityLoading}] = useLazyCallable<{
		visibility: boolean,
		column: string
	}>("funcSetColumnVisibility", null, {
		onSuccess: data => {
			toast({
				title: "Successfully changed column visibility.",
				status: "success"
			});
		},
		onError: error => {
			toast({
				title: "Failed to change column visibility.",
				status: "error",
				description: error.message
			});
		}
	});

	const [setColumnIsName, {loading: isNameLoading}] = useLazyCallable<{
		isName: boolean,
		column: string
	}, {
		isName: boolean
	}>("funcSetColumnIsName", null, {
		onSuccess: data => {
			toast({
				title: "Successfully labeled Column as name.",
				status: "success"
			});
			parentReload.reloadPage();
		},
		onError: error => {
			toast({
				title: "Failed to label Column as name.",
				status: "error",
				description: error.message
			});
		}
	});

	const [setColumnIsResume, {loading: isResumeLoading}] = useLazyCallable<{
		isResume: boolean,
		column: string
	}, {
		isName: boolean
	}>("funcSetColumnIsResume", null, {
		onSuccess: data => {
			toast({
				title: "Successfully labeled Column as resume.",
				status: "success"
			});
			parentReload.reloadPage();
		},
		onError: error => {
			toast({
				title: "Failed to label Column as resume.",
				status: "error",
				description: error.message
			});
		}
	});

	const [setColumnIsEmail, {loading: isEmailLoading}] = useLazyCallable<{
		isEmail: boolean,
		column: string
	}, {
		isEmail: boolean
	}>("funcSetColumnIsEmail", null, {
		onSuccess: data => {
			toast({
				title: "Successfully labeled Column as email.",
				status: "success"
			});
			parentReload.reloadPage();
		},
		onError: error => {
			toast({
				title: "Failed to label Column as email.",
				status: "error",
				description: error.message
			});
		}
	});

	return <>
		<HStack key={props.uid}>
			<Checkbox
				defaultChecked={!props.hidden}
				onChange={(e) => setColumnVisibility({
					column: props.uid,
					visibility: !e.target.checked
				})}
			/>
			<Box flex={1}>
				<Tag cursor={"pointer"}>
					<TagLabel>
						<Editable
							defaultValue={props.displayName}
							onSubmit={nextValue => setColumnDisplayName({
								displayName: nextValue,
								column: props.uid
							})}
						>
							<EditablePreview/>
							<EditableInput/>
						</Editable>
					</TagLabel>
					{nameLoading && <Spinner ml={2} size={"xs"}/>}
				</Tag>
			</Box>
			<Box/>
			<Popover>
				<PopoverTrigger>
					<Button
						size={"xs"}
						leftIcon={(props.isName || props.isEmail || props.isResume) &&
                            <Icon as={CgDanger} color={"green.500"}/>}
						isLoading={isNameLoading || isEmailLoading || isResumeLoading}
					>
						Attributes
					</Button>
				</PopoverTrigger>
				<PopoverContent>
					<PopoverArrow/>
					<PopoverBody py={4}>

						<VStack alignItems={"stretch"}>

							<HStack justifyContent={"stretch"}>
								<Text flex={1}>Applicant Name</Text>
								<Checkbox
									defaultChecked={props.isName}
									onChange={e => setColumnIsName({
										column: props.uid,
										isName: e.target.checked
									})}
								/>
							</HStack>

							<HStack justifyContent={"stretch"}>
								<Text flex={1}>Applicant Email</Text>
								<Checkbox
									defaultChecked={props.isEmail}
									onChange={e => setColumnIsEmail({
										column: props.uid,
										isEmail: e.target.checked
									})}
								/>
							</HStack>

							<HStack justifyContent={"stretch"}>
								<Text flex={1}>Applicant Resume</Text>
								<Checkbox
									defaultChecked={props.isResume}
									onChange={e => setColumnIsResume({
										column: props.uid,
										isResume: e.target.checked
									})}
								/>
							</HStack>

						</VStack>

					</PopoverBody>
				</PopoverContent>
			</Popover>

			{/*<Menu closeOnSelect={true}>*/}

			{/*	<MenuList>*/}
			{/*		<MenuOptionGroup*/}
			{/*			type={'checkbox'}*/}
			{/*			value={[*/}
			{/*				props.isName ? "name" : null,*/}
			{/*				props.isEmail ? "email" : null,*/}
			{/*				props.isResume ? "resume" : null,*/}
			{/*			].filter(val => !!val)}*/}
			{/*			// onChange={selected => {*/}
			{/*			// 	if (props.)*/}
			{/*			// }}*/}
			{/*		>*/}
			{/*			<MenuItemOption value='name'>Name Column</MenuItemOption>*/}
			{/*			<MenuItemOption value='email'>Email Column</MenuItemOption>*/}
			{/*			<MenuItemOption value='resume'>Resume Column</MenuItemOption>*/}
			{/*		</MenuOptionGroup>*/}
			{/*	</MenuList>*/}
			{/*</Menu>*/}

			{/*<Button*/}

			{/*>*/}
			{/*	Name Column*/}
			{/*</Button>*/}
			{/*<Button*/}
			{/*	size={"xs"}*/}
			{/*	leftIcon={props.isEmail && <Icon as={CgCheckO} color={"green.500"}/>}*/}
			{/*	variant={!props.isEmail ? "outline" : "solid"}*/}
			{/*	colorScheme={props.isEmail ? "gray" : "gray"}*/}
			{/*	onClick={() => {*/}
			{/*		setColumnIsEmail({*/}
			{/*			column: props.uid,*/}
			{/*			isEmail: !props.isEmail*/}
			{/*		})*/}
			{/*	}}*/}
			{/*	isLoading={isEmailLoading}*/}
			{/*>*/}
			{/*	Email Column*/}
			{/*</Button>*/}
			<Box/>
			{/*<Tooltip label={!props.hidden ? "Show column to readers" : "Hide column from readers"}>*/}
			{/*	*/}
			{/*</Tooltip>*/}

		</HStack>
	</>
}