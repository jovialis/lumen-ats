/**
 * ApplicantAnonIDDownload
 * Project: lumenats
 * Author: jovialis (Dylan Hanson)
 * Date: 9/7/23
 */
import {Button, Link, VisuallyHidden} from "@chakra-ui/react";
import {useMemo, useRef} from "react";
import {useCallable} from "../../../hooks/UseCallable";

export function ApplicantAnonIDDownload() {
	const {data, loading, error} = useCallable<{}, {
		uid: string
		name: string
		email: string
		anonId: string
	}[]>("funcGetApplicantAnonIDMap");

	const column = ["name", "email", "lumen-id"];

	const csvDownloadURL: string = useMemo(() => {
		if (!data)
			return "";

		let rows = data.map(c => {
			return [
				`"${JSON.parse(c.name)}"`,
				`"${JSON.parse(c.email)}"`,
				`"${c.anonId}"`,
			].join(",")
		});

		rows = [
			column.join(","),
			...rows
		];

		const csvContent = rows.join("\n");

		const blob = new Blob([csvContent], {type: "text/csv"});
		return window.URL.createObjectURL(blob);
	}, [data]);

	const linkRef = useRef<HTMLAnchorElement>();

	return <>
		<Button
			size={"sm"}
			isLoading={loading}
			onClick={() => {
				linkRef.current.click();
			}}
		>
			Download Applicant IDs
		</Button>
		<VisuallyHidden>
			<Link
				ref={linkRef}
				href={csvDownloadURL}
				download={`lumen_ids.csv`}
			/>
		</VisuallyHidden>
	</>
}