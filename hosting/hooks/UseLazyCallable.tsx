/**
 * UseLazyCallable
 * Project: lumenats
 * Author: jovialis (Dylan Hanson)
 * Date: 9/6/23
 */
import {useCallable, UseCallableOptions} from "./UseCallable";

export function useLazyCallable<RequestData = any, Data = any>(func: string, data?: RequestData, options?: UseCallableOptions<Data>): [
	(data?: RequestData) => void,
	{ data?: Data, loading: boolean, error?: Error }
] {
	const callable = useCallable<RequestData, Data>(func, data, options, true);

	return [
		(data?: RequestData) => {
			callable.refetch(data);
		},
		{
			data: callable.data,
			loading: callable.loading,
			error: callable.error
		}
	];
}