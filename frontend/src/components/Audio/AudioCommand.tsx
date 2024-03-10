import React from "react";
import AudioMicPicker from "./AudioMicPicker";
import AudioAnalyzer from "./AudioAnalyzer";
import FluteAudioVisualizer from "./FluteAudioVisualizer";
import KeysPressedView from "../Common/KeysPressedView";

function AudioCommand(): JSX.Element {
	return (
		<React.Fragment>
			<KeysPressedView />
			<FluteAudioVisualizer />
			<div className="w3-display-bottommiddle" style={{ maxWidth: "600px", zIndex: 999 }}>
				<AudioMicPicker />
				<AudioAnalyzer />
			</div>
		</React.Fragment>
	);
};

export default AudioCommand;
