import React from "react";
import KeysPressedView from "./Common/KeysPressedView";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import AudioCommand from "./Audio/AudioCommand";
import LiveLinkCommand from "./LiveLink/LiveLinkCommand";
import Settings from "./Common/Settings";

function Main(): JSX.Element {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/frontend" element={<React.Fragment />} />
				<Route path="/frontend/livelink" element={
					<React.Fragment>
						<KeysPressedView />
						<LiveLinkCommand />
					</React.Fragment>
				} />
				<Route path="/frontend/audio" element={
					<React.Fragment>
						<KeysPressedView />
						<AudioCommand />
					</React.Fragment>
				} />
				<Route path="/frontend/settings" element={
					<Settings />
				} />
			</Routes>
		</BrowserRouter>
	);
}

export default Main;
