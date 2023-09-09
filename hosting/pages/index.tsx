/**
 * index
 * Project: lumenats
 * Author: jovialis (Dylan Hanson)
 * Date: 9/6/23
 */
import {InstallationGate} from "../components/InstallationGate";
import {UserRoleGate} from "../components/UserRoleGate";

export default function HomePage() {
	return <InstallationGate>
		<UserRoleGate/>
	</InstallationGate>
}