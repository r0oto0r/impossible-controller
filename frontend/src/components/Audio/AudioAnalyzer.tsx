import React, { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/general";
import { setAudioKey, setByteTimeDomainData } from "../../slices/audioStreamInfoSlice";
import { SocketClient } from "../../socket/SocketClient";
import { getSettings } from "../../slices/settingsSlice";
import { AudioMode, getAudio, setAudioMode, setDrumHit } from "../../slices/audioSlice";
import { PitchDetector } from "pitchfinder/lib/detectors/types";
import Pitchfinder from "pitchfinder";

const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

const FLUTE_THRESHOLD_RMS = 0.5;
const FLUTE_LOUDNESS_THRESHOLD = 200;

const DRUM_HIT_THRESHOLD_FREQUENCY = 128;
const DRUM_HIT_THRESHOLD_RMS = 1;
const DRUM_LOUDNESS_THRESHOLD = 150;

const detectDrumHit = (currentPeakFrequency: number, currentRMS: number) => {
	if(currentPeakFrequency > DRUM_HIT_THRESHOLD_FREQUENCY && currentRMS > DRUM_HIT_THRESHOLD_RMS) {
		return true;
	}
	return false;
}

function AudioAnalyzer(): JSX.Element {
	const dispatch = useAppDispatch();
	const { extraMenusHidden } = useAppSelector((state) => getSettings(state));
	const { mediaAudio, recording, mode } = useAppSelector((state) => getAudio(state));
	const [currentAudioValues, setCurrentAudioValues ] = React.useState<{
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
	const previouslyDrumHit = useRef<boolean>(false);
	const currentlyDrumHit = useRef<boolean>(false);
	const timeout = useRef<NodeJS.Timeout>();
	const audioContext = useRef<AudioContext>(new window.AudioContext());
	const analyser = useRef<AnalyserNode>()
	const byteTimeDomainData = useRef<Uint8Array>(new Uint8Array());
	const floatTimeDomainData = useRef<Float32Array>(new Float32Array());
	const byteFrequencyData = useRef<Uint8Array>(new Uint8Array());
	const floatFrequencyData = useRef<Float32Array>(new Float32Array());
	const rafId = useRef<number>(0);
	const lastTick  = useRef<number>(performance.now());
	const duration  = useRef<number>(0);
	const detectPitch = useRef<PitchDetector>(Pitchfinder.AMDF());

	useEffect(() => {
		const calculateRMS = (dataUint8Array: Uint8Array) => {
			const sq = dataUint8Array.map((v) => (v * v));
			const s = sq.reduce((a, v) => (a + v));
			return Math.sqrt(s / dataUint8Array.length);
		}

		const tick = () => {
			if(analyser.current) {
				const now = performance.now();
				duration.current = now - lastTick.current;
				lastTick.current = now;
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

				if(mode === AudioMode.FLUTE) {
					if(currentPitch !== null && currentLoudness > FLUTE_LOUDNESS_THRESHOLD && currentRMS > FLUTE_THRESHOLD_RMS) {
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
						SocketClient.emit('FLUTE_AUDIO_DATA', {
							key: key.current,
							octave: octave.current
						});
						dispatch(setAudioKey(key.current));
						lastKey.current = key.current;
					}
				} else {
					currentlyDrumHit.current = detectDrumHit(currentPeakFrequency, currentRMS);
					if(currentLoudness > DRUM_LOUDNESS_THRESHOLD) {
						if(currentlyDrumHit.current) {
							if(timeout.current) {
								clearTimeout(timeout.current);
							}
		
							timeout.current = setTimeout(() => {
								timeout.current && clearTimeout(timeout.current);
								previouslyDrumHit.current = false;
								SocketClient.emit('DRUM_AUDIO_DATA', {
									hit: false
								});
								dispatch(setDrumHit(false));
							}, currentlyDrumHit.current ? 50 : 500);
		
							if(!previouslyDrumHit.current && currentlyDrumHit.current) {
								previouslyDrumHit.current = true;
								SocketClient.emit('DRUM_AUDIO_DATA', {
									hit: true
								});
								dispatch(setDrumHit(true));
							}
						}
					}
				}

				dispatch(setByteTimeDomainData(byteTimeDomainData?.current));
				rafId.current = requestAnimationFrame(tick);

				setCurrentAudioValues({
					peakFrequency: currentPeakFrequency,
					rms: currentRMS,
					pitch: currentPitch,
					loudness: currentLoudness
				});
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

			rafId.current = requestAnimationFrame(tick.bind(AudioAnalyzer));

			return () => {
				cancelAnimationFrame(rafId.current);
				analyser.current && analyser.current.disconnect();
				source.disconnect();
			}
		}
	}, [mediaAudio, recording, dispatch, currentlyDrumHit, mode]);

	return (
		<div className="w3-container  w3-margin w3-center" hidden={extraMenusHidden}>
			<div className="w3-row-padding" style={{ display: "flex" }}>
				<div className="w3-half">
					<button onClick={() => dispatch(setAudioMode(AudioMode.FLUTE))} className={`w3-button ${mode === AudioMode.FLUTE ? 'w3-green' : 'w3-red'}`}>
						Flute
					</button>
				</div>
				<div className="w3-half">
					<button onClick={() => dispatch(setAudioMode(AudioMode.DRUM))} className={`w3-button ${mode === AudioMode.DRUM ? 'w3-green' : 'w3-red'}`}>
						Drum
					</button>
				</div>
				{mode === AudioMode.FLUTE && <React.Fragment>
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
				</React.Fragment>}
				{mode === AudioMode.DRUM && <React.Fragment>
						<div className="w3-third">
						<div className="value-container">
							<span className="label">Drum Hit: </span>
							<span className="value">{currentlyDrumHit.current.toString()}</span>
						</div>
					</div>
				</React.Fragment>}
				<div className="w3-third">
					<div className="value-container">
						<span className="label">Frequency: </span>
						<span className="value">{currentAudioValues.peakFrequency.toFixed(0)}</span>
					</div>
				</div>
				<div className="w3-third">
					<div className="value-container">
						<span className="label">RMS: </span>
						<span className="value">{currentAudioValues.rms.toFixed(0)}</span>
					</div>
				</div>
				<div className="w3-third">
					<div className="value-container">
						<span className="label">Pitch: </span>
						<span className="value">{currentAudioValues.pitch.toFixed(0)}</span>
					</div>
				</div>
				<div className="w3-third">
					<div className="value-container">
						<span className="label">Loudness: </span>
						<span className="value">{currentAudioValues.loudness.toFixed(0)}</span>
					</div>
				</div>
			</div>
		</div>
	);
}

export default AudioAnalyzer;
