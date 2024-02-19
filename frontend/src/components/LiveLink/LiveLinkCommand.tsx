import React from "react";
import LiveLinkVRM from "./LiveLinkVRM";
import LiveLinkAnalyzer from "./LiveLinkAnalyzer";

function LiveLinkCommand(): JSX.Element {
	return (
		<React.Fragment>
			<LiveLinkVRM />
			<LiveLinkAnalyzer />
		</React.Fragment>
	);
};

export default LiveLinkCommand;
