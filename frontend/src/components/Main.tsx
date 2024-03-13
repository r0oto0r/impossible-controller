import React, { useEffect } from "react";
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

		SocketClient.on('COMMUNI_QI_STATUS', (status: { started: boolean; maxPoolSize: number }) => {
			dispatch(setStarted(status));
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
							<LiveLinkCommand />
						</React.Fragment>
					} />
					<Route path="audio" element={
						<React.Fragment>
							<AudioCommand />
						</React.Fragment>
					} />
					<Route path="leap" element={
						<React.Fragment>
							<LeapHandsVisualizer />
						</React.Fragment>
					} />
					<Route path="communiqi" element={
						<React.Fragment>
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
