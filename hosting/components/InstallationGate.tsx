/**
 * InstallationGate
 * Project: lumenats
 * Author: jovialis (Dylan Hanson)
 * Date: 9/7/23
 */
import {Center, Spinner} from "@chakra-ui/react";
import React, {PropsWithChildren} from "react";
import {useCallable} from "../hooks/UseCallable";

interface Installation {
	applicationName: string,
	reviewForm: string,
	reviewFormApplicantVariable: string
}

const InstallationContext = React.createContext<Installation>(null)

export function useInstallation() {
	return React.useContext(InstallationContext);
}

export function InstallationGate(props: PropsWithChildren) {
	const {data, loading, error} = useCallable<{}, Installation>("funcGetInstallation");

	if (error) {
		return <>Error: {error.message}</>
	}

	if (data) {
		return <InstallationContext.Provider value={data}>
			{props.children}
		</InstallationContext.Provider>
	}

	return <>
		<Center h={"95vh"}>
			<Spinner/>
		</Center>
	</>
}