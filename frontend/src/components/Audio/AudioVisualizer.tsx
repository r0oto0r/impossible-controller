import React, { useEffect, useRef } from "react";
import Pitchfinder from "pitchfinder";
import { getAudio } from "../../slices/audioSlice";
import { AudioInfoState, setAudioInfo } from "../../slices/audioStreamInfoSlice";
import { useAppDispatch, useAppSelector } from "../../hooks/general";
import { PitchDetector } from "pitchfinder/lib/detectors/types";

function AudioVisualizer(): JSX.Element {
	const { mediaAudio, recording } = useAppSelector((state) => getAudio(state));
	const dispatch = useAppDispatch();

	const canvasRef = React.useRef<HTMLCanvasElement>(null);
	const detectPitch = useRef<PitchDetector>(Pitchfinder.AMDF());
	const audioContext = useRef<AudioContext>(new window.AudioContext());
	const byteTimeDomainData = useRef<Uint8Array>(new Uint8Array());
	const floatTimeDomainData = useRef<Float32Array>(new Float32Array());
	const byteFrequencyData = useRef<Uint8Array>(new Uint8Array());
	const floatFrequencyData = useRef<Float32Array>(new Float32Array());
	const rafId = useRef<number>(0);
	const analyser = useRef<AnalyserNode>()
	const lastTick  = useRef<number>(performance.now());
	const duration  = useRef<number>(0);

	cancelAnimationFrame(rafId.current);

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
				draw();
				const currentPitch = detectPitch.current(floatTimeDomainData.current);
				const currentPeakFrequency = Math.max.apply(null, Array.from(byteTimeDomainData.current));
				const currentRMS = calculateRMS(byteTimeDomainData.current);
				dispatch(setAudioInfo({ currentDuration: duration.current, currentPitch, currentPeakFrequency, currentRMS } as AudioInfoState));
				rafId.current = requestAnimationFrame(tick);
			}
		}
	
		const draw = () => {
			const canvas = canvasRef.current;
			if(canvas) {
				const { height, width } = canvas;
				const context = canvas.getContext('2d');
				if(context) {
					if(byteTimeDomainData) {
						let x = 0;
						const sliceWidth = width / byteTimeDomainData.current.length;
	
						context.lineCap = 'round';
						context.lineWidth = 2;
						context.strokeStyle = '#C71585';
						context.clearRect(0, 0, width, height);
	
						context.beginPath();
	
						if(byteTimeDomainData.current.length > 0) {
							for(let i = 0; i < byteTimeDomainData.current.length; i++) {
								const v = byteTimeDomainData.current[i] / 128.0;
								const y = v * canvas.height / 2;
	
								if(i === 0) {
									context.moveTo(x, y);
								} else {
									context.lineTo(x, y);
								}
	
								x += sliceWidth;
							}
						} else {
							context.moveTo(0, canvas.height / 2);
						}
	
						context.lineTo(canvas.width, canvas.height / 2);
						context.stroke();
					}
				}			
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

			rafId.current = requestAnimationFrame(tick.bind(AudioVisualizer));

			return () => {
				analyser.current && analyser.current.disconnect();
				source.disconnect();
			}
		} else {
			draw();
		}
	}, [mediaAudio, recording, dispatch]);

	return (
		<div className="w3-container w3-margin w3-center">
			<canvas width="700" height="100" ref={canvasRef} />
		</div>
	);
}

export default AudioVisualizer;
