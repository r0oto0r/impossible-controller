import React from "react";
import ServerSocketSettings from "./ServerSocketSettings";
import LeapServerSocketSettings from "./LeapServerSocketSettings";
import CommuniQiSettings from "./CommuniQiSettings";

function Settings(): JSX.Element {
	return (
		<React.Fragment>
			<div className="w3-container w3-margin" style={{ position: "fixed", left: "50%", transform: "translate(-50%, 0)", width: "50%", top: "0", maxHeight: "50%" }}>
				<div className="w3-row">
					<div className="w3-col s12">
						<h2>Settings</h2>
					</div>
				</div>
				<div className="w3-row">
					<div className="w3-col s12">
						<ServerSocketSettings />
						<LeapServerSocketSettings />
						<CommuniQiSettings />
					</div>
				</div>
			</div>
		</React.Fragment>
	);
}

export default Settings;
