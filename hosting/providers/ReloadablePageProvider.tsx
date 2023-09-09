/**
 * ReloadablePageProvider
 * Project: lumenats
 * Author: jovialis (Dylan Hanson)
 * Date: 9/6/23
 */
import React, {PropsWithChildren} from "react";

const ReloadablePageContext = React.createContext<() => void>(() => {
});

export function useReloadablePage() {
	const reloadablePage = React.useContext(ReloadablePageContext);
	return {
		reloadPage: () => {
			reloadablePage();
		}
	}
}

export function ReloadablePageProvider(props: PropsWithChildren & {
	onPageReloaded: () => void
}) {
	return <ReloadablePageContext.Provider
		value={props.onPageReloaded}
	>
		{props.children}
	</ReloadablePageContext.Provider>
}