import React, { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/general";
import { setAudioInfo, setByteTimeDomainData } from "../../slices/audioStreamInfoSlice";
import { SocketClient } from "../../socket/SocketClient";
import { getSettings } from "../../slices/settingsSlice";
import { getAudio } from "../../slices/audioSlice";
import { PitchDetector } from "pitchfinder/lib/detectors/types";
import Pitchfinder from "pitchfinder";

export const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

const FLUTE_THRESHOLD_RMS = 7;
const FLUTE_LOUDNESS_THRESHOLD = 200;

function AudioAnalyzer(): JSX.Element {
	const dispatch = useAppDispatch();
	const { extraMenusHidden } = useAppSelector((state) => getSettings(state));
	const { mediaAudio, recording } = useAppSelector((state) => getAudio(state));
	const [ currentAudioValues, setCurrentAudioValues ] = React.useState<{
		peakFrequency: number,
		rms: number,
		pitch: number,
		loudness: number
	}>({
		peakFrequency: 0,
		rms: 0,
		pitch: 0,
		loudness: 0
	});
	const octave = useRef<number>(0);
	const key = useRef<string>('NONE');
	const lastKey = useRef<string>('NONE');
	const lastOctave = useRef<number>(0);
	const audioContext = useRef<AudioContext>(new window.AudioContext());
	const analyser = useRef<AnalyserNode>()
	const byteTimeDomainData = useRef<Uint8Array>(new Uint8Array());
	const floatTimeDomainData = useRef<Float32Array>(new Float32Array());
	const byteFrequencyData = useRef<Uint8Array>(new Uint8Array());
	const floatFrequencyData = useRef<Float32Array>(new Float32Array());
	const rafId = useRef<number>(0);
	const detectPitch = useRef<PitchDetector>(Pitchfinder.AMDF());

	useEffect(() => {
		const requestAnalyzerFrame = (callback: FrameRequestCallback) => {
			return setTimeout(callback, 1000 / 30);
		};

		const cancelAnalyzerFrame = (id: number) => {
			clearInterval(id);
		};

		if(rafId.current) cancelAnalyzerFrame(rafId.current);

		const calculateRMS = (dataUint8Array: Uint8Array) => {
			let sum = 0;
			for (let i = 0; i < dataUint8Array.length; i++) {
				const value = dataUint8Array[i];
				sum += value * value;
			}
			return Math.sqrt(sum / dataUint8Array.length);
		};

		// Convert the frequency to a musical pitch. source https://stackoverflow.com/questions/41174545/pitch-detection-node-js
		// c = 440.0(2^-4.75)
		const c0 = 440.0 * Math.pow(2.0, -4.75);
		const detectKey = (currentPitch: number, currentRMS: number, currentLoudness: number) => {
			if(currentPitch !== null && currentLoudness > FLUTE_LOUDNESS_THRESHOLD && currentRMS > FLUTE_THRESHOLD_RMS) {
				// h = round(12log2(f / c))
				const halfStepsBelowMiddleC = Math.round(12.0 * Math.log2(currentPitch / c0));
				// o = floor(h / 12)
				return {
					octave: Math.floor(halfStepsBelowMiddleC / 12.0),
					key: keys[Math.floor(halfStepsBelowMiddleC % 12)]
				};
			} else {
				return {
					octave: 0,
					key: 'NONE'
				};
			}
		};

		const tick = () => {
			if(analyser.current) {
				byteTimeDomainData.current && analyser.current.getByteTimeDomainData(byteTimeDomainData.current);
				floatTimeDomainData.current && analyser.current.getFloatTimeDomainData(floatTimeDomainData.current);
				byteFrequencyData.current && analyser.current.getByteFrequencyData(byteFrequencyData.current);
				floatFrequencyData.current && analyser.current.getFloatFrequencyData(floatFrequencyData.current);
				let currentPitch = detectPitch.current(floatTimeDomainData.current);
				let currentPeakFrequency = Math.max.apply(null, Array.from(byteTimeDomainData.current));
				let currentRMS = calculateRMS(byteTimeDomainData.current);
				let currentLoudness = Math.max.apply(null, Array.from(byteFrequencyData.current));
				if(!currentPitch) currentPitch = 0;
				if(!currentPeakFrequency) currentPeakFrequency = 0;
				if(!currentRMS) currentRMS = 0;
				if(!currentLoudness) currentLoudness = 0;

				const { key: currentKey, octave: currentOctave } = detectKey(currentPitch, currentRMS, currentLoudness);
				if(currentKey !== key.current || currentOctave !== octave.current) {
					key.current = currentKey;
					octave.current = currentOctave;
				}

				if(lastKey.current !== key.current || lastOctave.current !== octave.current) {
					SocketClient.emit('FLUTE_AUDIO_DATA', {
						key: key.current,
						octave: octave.current
					});
					dispatch(setAudioInfo({
						key: key.current,
						octave: octave.current
					}));
					lastKey.current = key.current;
					lastOctave.current = octave.current;
				}

				dispatch(setByteTimeDomainData(byteTimeDomainData?.current));
				if(!extraMenusHidden) {
					setCurrentAudioValues({
						peakFrequency: currentPeakFrequency,
						rms: currentRMS,
						pitch: currentPitch,
						loudness: currentLoudness
					});
				}

				rafId.current = requestAnalyzerFrame(tick);
			}
		}

		if(mediaAudio && recording) {
			const source = audioContext.current.createMediaStreamSource(mediaAudio);

			analyser.current = audioContext.current.createAnalyser();
			byteTimeDomainData.current = new Uint8Array(analyser.current.frequencyBinCount);
			floatTimeDomainData.current = new Float32Array(analyser.current.frequencyBinCount);
			byteFrequencyData.current = new Uint8Array(analyser.current.frequencyBinCount);
			floatFrequencyData.current = new Float32Array(analyser.current.frequencyBinCount);
			source.connect(analyser.current);

			rafId.current = requestAnalyzerFrame(tick);

			return () => {
				cancelAnalyzerFrame(rafId.current);
				analyser.current && analyser.current.disconnect();
				source.disconnect();
			}
		}
	}, [mediaAudio, recording, dispatch, extraMenusHidden]);

	return (
		<div className="w3-container w3-center" hidden={extraMenusHidden}>
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
						<span className="value">{currentAudioValues.peakFrequency.toFixed(2)}</span>
					</div>
				</div>
				<div className="w3-third">
					<div className="value-container">
						<span className="label">RMS: </span>
						<span className="value">{currentAudioValues.rms.toFixed(2)}</span>
					</div>
				</div>
				<div className="w3-third">
					<div className="value-container">
						<span className="label">Pitch: </span>
						<span className="value">{currentAudioValues.pitch.toFixed(2)}</span>
					</div>
				</div>
				<div className="w3-third">
					<div className="value-container">
						<span className="label">Loudness: </span>
						<span className="value">{currentAudioValues.loudness.toFixed(2)}</span>
					</div>
				</div>
			</div>
		</div>
	);
}

export default AudioAnalyzer;
