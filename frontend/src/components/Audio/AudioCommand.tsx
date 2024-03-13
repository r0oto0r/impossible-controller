import React from "react";
import AudioMicPicker from "./AudioMicPicker";
import AudioAnalyzer from "./AudioAnalyzer";
import FluteAudioVisualizer from "./FluteAudioVisualizer";

function AudioCommand(): JSX.Element {
	return (
		<React.Fragment>
			<FluteAudioVisualizer />
			<div className="w3-display-bottommiddle" style={{ height: "300px", width: "600px", zIndex: 999 }}>
				<AudioMicPicker />
				<AudioAnalyzer />
			</div>
		</React.Fragment>
	);
};

export default AudioCommand;
