import React from "react";
import KeysPressedView from "./KeysPressedView";
import LiveLinkVRM from "./LiveLinkVRM";
import KeyMapping from "./KeyMapping";

function Main(): JSX.Element {
	return (
		<React.Fragment>
			<KeysPressedView />
			<LiveLinkVRM />
			<KeyMapping />
		</React.Fragment>
	);
}

export default Main;
