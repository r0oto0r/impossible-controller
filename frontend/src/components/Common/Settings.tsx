import React from "react";
import ServerSocketSettings from "./ServerSocketSettings";

function Settings(): JSX.Element {
	return (
		<React.Fragment>
			<div className="w3-container">
				<div className="w3-row">
					<div className="w3-col s12">
						<h2>Settings</h2>
					</div>
				</div>
				<div className="w3-row">
					<div className="w3-col s12">
						<ServerSocketSettings />
					</div>
				</div>
			</div>
		</React.Fragment>
	);
}

export default Settings;
