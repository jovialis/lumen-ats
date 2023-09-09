/**
 * ApplicantCard
 * Project: lumenats
 * Author: jovialis (Dylan Hanson)
 * Date: 9/6/23
 */
import {Box, Card, CardBody, CardFooter, CardHeader, Heading, HStack, Skeleton, Text, VStack} from "@chakra-ui/react";
import {useCallable} from "../../../hooks/UseCallable";
import {ReloadablePageProvider} from "../../../providers/ReloadablePageProvider";
import {ApplicantImport} from "./ApplicantImport";

export function ApplicantCard() {

	const {data, loading, error, refetch} = useCallable<{}, number>("funcGetApplicantCount");

	if (error) {
		return <>Error: {error.message}</>
	}

	return <ReloadablePageProvider onPageReloaded={() => {
		// refetch();
	}}>
		<Card variant={"outline"} shadow={"xl"} size={"sm"}>
			<CardHeader>
				<Heading size={"sm"}>
					Applicants
				</Heading>
			</CardHeader>

			<CardBody>
				{loading && <VStack alignItems={"stretch"} w={"100%"}>
                    <Skeleton h={6} w={40}/>
                    <Box h={4}/>
                    <Skeleton h={6}/>
                </VStack>}

				{data && !loading && <Text>
					{data} Applicants Imported
                </Text>}
			</CardBody>

			<CardFooter>
				<HStack w={"100%"} justifyContent={"stretch"}>
					<ApplicantImport hasExisting={true}/>
				</HStack>
			</CardFooter>

		</Card>
	</ReloadablePageProvider>
}