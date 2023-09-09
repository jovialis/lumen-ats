/**
 * AdminDashboard
 * Project: lumenats
 * Author: jovialis (Dylan Hanson)
 * Date: 9/7/23
 */
import {Box, Container, Heading, Tab, TabList, TabPanel, TabPanels, Tabs, Text, VStack} from "@chakra-ui/react";
import {useInstallation} from "../InstallationGate";
import {useUser} from "../UserLoginGate";
import {ApplicantCard} from "./applicants/ApplicantCard";
import {ColumnList} from "./columns/ColumnList";
import {GenerateReviews} from "./reviews/GenerateReviews";
import {ReviewProgress} from "./reviews/ReviewProgress";
import {TeamList} from "./teams/TeamList";
import {UserList} from "./users/UserList";

export function AdminDashboard() {
	const user = useUser();
	const installation = useInstallation();

	return <Container maxW={"container.md"} mt={12}>
		<VStack alignItems={"stretch"} spacing={4}>
			<Heading size={"lg"}>
				Welcome, {user.displayName}
			</Heading>
			<Text mt={-2} fontFamily={"mono"} fontSize={"xs"}>
				{installation.applicationName}
			</Text>

			<Tabs isLazy={true}>
				<TabList>
					<Tab>
						Add Users
					</Tab>
					<Tab>
						Configure Reviewing
					</Tab>
					<Tab>
						Monitor Progress
					</Tab>
				</TabList>

				<TabPanels>
					<TabPanel px={0}>
						<VStack alignItems={"stretch"} spacing={4}>
							<UserList/>
							<TeamList/>
						</VStack>
					</TabPanel>
					<TabPanel px={0}>
						<VStack alignItems={"stretch"} spacing={4}>
							<ApplicantCard/>
							<ColumnList/>
						</VStack>
					</TabPanel>
					<TabPanel px={0}>
						<VStack alignItems={"stretch"} spacing={10}>
							<ReviewProgress/>
							<GenerateReviews/>
						</VStack>
					</TabPanel>
				</TabPanels>
			</Tabs>

		</VStack>
		<Box h={40}/>
	</Container>
}