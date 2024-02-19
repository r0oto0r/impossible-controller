import React from "react";
import KeysPressedView from "./Common/KeysPressedView";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import AudioCommand from "./Audio/AudioCommand";
import LiveLinkCommand from "./LiveLink/LiveLinkCommand";

function Main(): JSX.Element {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<React.Fragment />} />
				<Route path="/livelink" element={
					<React.Fragment>
						<KeysPressedView />
						<LiveLinkCommand />
					</React.Fragment>
				} />
				<Route path="/audio" element={
					<React.Fragment>
						<KeysPressedView />
						<AudioCommand />
					</React.Fragment>
				} />
			</Routes>
		</BrowserRouter>
	);
}

export default Main;
