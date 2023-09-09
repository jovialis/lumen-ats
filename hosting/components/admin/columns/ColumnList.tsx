/**
 * ColumnList
 * Project: lumenats
 * Author: jovialis (Dylan Hanson)
 * Date: 9/6/23
 */
import {Card, CardBody, CardHeader, Heading, Skeleton, StackDivider, VStack} from "@chakra-ui/react";
import {useCallable} from "../../../hooks/UseCallable";
import {ReloadablePageProvider} from "../../../providers/ReloadablePageProvider";
import {ColumnRow, ColumnRowProps} from "./ColumnRow";

export function ColumnList() {
	const {data, loading, error, refetch} = useCallable<{}, ColumnRowProps[]>("funcGetColumns");

	if (error) {
		return <>Error: {error.message}</>
	}

	if (!data) {
		return <></>
	}

	return <ReloadablePageProvider onPageReloaded={() => {
		refetch();
	}}>
		<Card variant={"outline"} shadow={"xl"} size={"sm"}>
			<CardHeader>
				<Heading size={"sm"}>
					Columns
				</Heading>
			</CardHeader>

			<CardBody>
				<VStack
					alignItems={"stretch"}
					divider={data && <StackDivider/>}
				>
					{data && data.length > 0 && data.map(col => <ColumnRow key={col.uid} {...col}/>)}
					{!data && Array.from(Array(3).keys()).map(key => <Skeleton key={key} h={4}/>)}
				</VStack>
			</CardBody>

			{/*<CardFooter>*/}
			{/*    <HStack w={"100%"} justifyContent={"stretch"}>*/}
			{/*        <ColumnImport/>*/}
			{/*    </HStack>*/}
			{/*</CardFooter>*/}

		</Card>
	</ReloadablePageProvider>
}