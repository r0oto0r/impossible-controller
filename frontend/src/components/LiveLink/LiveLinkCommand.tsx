import React from "react";
import LiveLinkVRM from "./LiveLinkVRM";
import LiveLinkAnalyzer from "./LiveLinkAnalyzer";

function LiveLinkCommand(): JSX.Element {
	return (
		<React.Fragment>
			<div className="w3-display-middle">
				<LiveLinkVRM />
				<LiveLinkAnalyzer />
			</div>
		</React.Fragment>
	);
};

export default LiveLinkCommand;
