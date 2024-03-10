import React, { useEffect } from "react";
import KeysPressedView from "./Common/KeysPressedView";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import AudioCommand from "./Audio/AudioCommand";
import LiveLinkCommand from "./LiveLink/LiveLinkCommand";
import Settings from "./Common/Settings";
import LeapHandsVisualizer from "./Leap/LeapHandsVisualizer";
import CommuniQi from "./CommuniQi/CommuniQi";
import Overlay from "./Overlay/Overlay";
import { useAppDispatch } from "../hooks/general";
import { setStarted } from "../slices/communiQiSlice";
import { setExtraMenusHidden } from "../slices/settingsSlice";
import { SocketClient } from "../socket/SocketClient";

function Main(): JSX.Element {
	const dispatch = useAppDispatch();

	useEffect(() => {
		const handleKeyPress = (event: KeyboardEvent) => {
			if(event.key === "ü") {
				dispatch(setExtraMenusHidden(true));
			}
			if(event.key === "ö") {
				dispatch(setExtraMenusHidden(false));
			}
		};

		SocketClient.on('COMMUNI_QI_STATUS', (status: { started: boolean }) => {
			dispatch(setStarted(status.started));
		});

		document.addEventListener("keydown", handleKeyPress);

		return () => {
			document.removeEventListener("keydown", handleKeyPress);
		};
	}, [dispatch]);

	return (
		<BrowserRouter>
			<Routes>
				<Route path="/frontend">
					<Route path="livelink" element={
						<React.Fragment>
							<KeysPressedView />
							<LiveLinkCommand />
							<CommuniQi />
						</React.Fragment>
					} />
					<Route path="audio" element={
						<React.Fragment>
							<AudioCommand />
							<CommuniQi />
						</React.Fragment>
					} />
					<Route path="leap" element={
						<React.Fragment>
							<KeysPressedView />
							<LeapHandsVisualizer />
							<CommuniQi />
						</React.Fragment>
					} />
					<Route path="communiqi" element={
						<React.Fragment>
							<KeysPressedView />
							<CommuniQi />
						</React.Fragment>
					} />
					<Route path="overlay" element={
						<Overlay />
					} />
					<Route path="settings" element={
						<Settings />
					} />
				</Route>
			</Routes>
		</BrowserRouter>
	);
}

export default Main;
