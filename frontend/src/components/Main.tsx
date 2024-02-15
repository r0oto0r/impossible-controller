import React from "react";
import KeysPressedView from "./KeysPressedView";
import LiveLinkVRM from "./LiveLinkVRM";
import KeyMapping from "./KeyMapping";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import VoiceCommand from "./VoiceCommand";

function Main(): JSX.Element {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<React.Fragment />} />
				<Route path="/facelink" element={
					<React.Fragment>
						<KeysPressedView />
						<LiveLinkVRM />
						<KeyMapping />
					</React.Fragment>
				} />
				<Route path="/voicecommand" element={
					<React.Fragment>
						<KeysPressedView />
						<VoiceCommand />
					</React.Fragment>
				} />
			</Routes>
		</BrowserRouter>
	);
}

export default Main;
