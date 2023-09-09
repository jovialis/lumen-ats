/**
 * 404
 * Project: lumenats
 * Author: jovialis (Dylan Hanson)
 * Date: 9/7/23
 */
import {useRouter} from "next/router";
import {useEffect} from "react";

export default function NotFoundPage() {
	const router = useRouter();

	useEffect(() => {
		router.push("/");
	}, []);

	return <>
	</>
}