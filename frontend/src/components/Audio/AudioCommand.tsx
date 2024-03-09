import React from "react";
import AudioMicPicker from "./AudioMicPicker";
import AudioAnalyzer from "./AudioAnalyzer";
import FluteAudioVisualizer from "./FluteAudioVisualizer";
import DrumAudioVisulizer from "./DrumAudioVisulizer";
import { AudioMode, getAudio } from "../../slices/audioSlice";
import { useAppSelector } from "../../hooks/general";
import KeysPressedView from "../Common/KeysPressedView";

function AudioCommand(): JSX.Element {
	const { mode } = useAppSelector((state) => getAudio(state));

	return (
		<React.Fragment>
			{mode === AudioMode.FLUTE && <KeysPressedView />}
			{mode === AudioMode.FLUTE && <FluteAudioVisualizer />}
			{mode === AudioMode.DRUM && <DrumAudioVisulizer />}
			<div className="w3-display-bottommiddle" style={{ maxWidth: "600px", zIndex: 999 }}>
				<AudioMicPicker />
				<AudioAnalyzer />
			</div>
		</React.Fragment>
	);
};

export default AudioCommand;
