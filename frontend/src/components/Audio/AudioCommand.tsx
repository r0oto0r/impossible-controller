import React from "react";
import AudioMicPicker from "./AudioMicPicker";
import AudioAnalyzer from "./AudioAnalyzer";
import AudioVisualizer from "./AudioVisualizer";

function AudioCommand(): JSX.Element {
	return (
		<React.Fragment>
			<AudioMicPicker />
			<AudioVisualizer />
			<AudioAnalyzer />
		</React.Fragment>
	);
};

export default AudioCommand;
