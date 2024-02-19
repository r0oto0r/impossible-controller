import React, { useEffect, useRef } from "react";
import { useAppSelector } from "../../hooks/general";
import { getAudioStreamInfo } from "../../slices/audioStreamInfoSlice";
import { SocketClient } from "../../socket/SocketClient";

const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

const MIN_RMS = 10;
const CLAP_THRESHOLD_PEAK_FREQUENCY = 220;
const CLAP_THRESHOLD_RMS = 0.9;

function AudioAnalyzer(): JSX.Element {
	const { currentPitch, currentPeakFrequency, currentRMS } = useAppSelector((state) => getAudioStreamInfo(state));
	const octave = useRef<number>(0);
	const key = useRef<string>('NONE');
	const lastKey = useRef<string>('NONE');
	const previouslyClapped = useRef<boolean>(false);
	const currentlyClapped = useRef<boolean>(false);
	const timeout = useRef<NodeJS.Timeout>();

	useEffect(() => {
		let updated = false;

		const detectClap = () => {
			if(currentPeakFrequency > CLAP_THRESHOLD_PEAK_FREQUENCY && currentRMS > CLAP_THRESHOLD_RMS) {
				return true;
			}
			return false;
		}

		if(currentPitch !== null) {
			// Convert the frequency to a musical pitch. source https://stackoverflow.com/questions/41174545/pitch-detection-node-js
			// c = 440.0(2^-4.75)
			const c0 = 440.0 * Math.pow(2.0, -4.75);
			// h = round(12log2(f / c))
			const halfStepsBelowMiddleC = Math.round(12.0 * Math.log2(currentPitch / c0));
			// o = floor(h / 12)
			octave.current = Math.floor(halfStepsBelowMiddleC / 12.0);
			key.current = keys[Math.floor(halfStepsBelowMiddleC % 12)];
		} else {
			octave.current = 0;
			key.current = 'NONE';
		}

		if(lastKey.current !== key.current) {
			lastKey.current = key.current;
			updated = true;
		}

		currentlyClapped.current = detectClap();

		if(updated || currentlyClapped.current) {
			if(timeout.current) {
				clearTimeout(timeout.current);
			}

			timeout.current = setTimeout(() => {
				timeout.current && clearTimeout(timeout.current);
				previouslyClapped.current = false;
			}, currentlyClapped.current ? 50 : 500);

			if(!previouslyClapped.current && currentlyClapped.current) {
				previouslyClapped.current = true;
				updated = true;
			}
		}

		if(updated && currentRMS > MIN_RMS) {
			SocketClient.emit('AUDIO_DATA', {
				key: key.current,
				octave: octave.current,
				clapped: currentlyClapped.current
			});
		}
	}, [currentPitch, currentPeakFrequency, currentRMS]);	

	return (
		<div className="audiostreaminfo">
			<div className="w3-container">
				<div className="w3-row-padding" style={{ display: "flex" }}>
					<div className="w3-third">
						<div className="value-container">
							<span className="label">Octave: </span>
							<span className="value">{octave.current}</span>
						</div>
					</div>
					<div className="w3-third">
						<div className="value-container">
							<span className="label">Key: </span>
							<span className="value">{key.current}</span>
						</div>
					</div>
					<div className="w3-third">
						<div className="value-container">
							<span className="label">Frequency: </span>
							<span className="value">{currentPeakFrequency}</span>
						</div>
					</div>
					<div className="w3-third">
						<div className="value-container">
							<span className="label">RMS: </span>
							<span className="value">{currentRMS}</span>
						</div>
					</div>
					<div className="w3-third">
						<div className="value-container">
							<span className="label">Clapped: </span>
							<span className="value">{currentlyClapped.current.toString()}</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default AudioAnalyzer;
