import React, { useEffect } from "react";
import { getAudioStreamInfo, setAudioKey, setByteTimeDomainData } from "../../slices/audioStreamInfoSlice";
import store from "../../store/store";
import { SocketClient } from "../../socket/SocketClient";

const ColorKeyMap: {
	[key: string]: string
} = {
	'C': '#ff0000',
	'C#': '#ff4000',
	'D': '#ff8000',
	'D#': '#ffbf00',
	'E': '#ffff00',
	'F': '#bfff00',
	'F#': '#80ff00',
	'G': '#40ff00',
	'G#': '#00ff00',
	'A': '#00ff40',
	'A#': '#00ff80',
	'B': '#00ffbf'
};

function AudioVisualizer(): JSX.Element {
	const canvasRef = React.useRef<HTMLCanvasElement>(null);
	const rafId = React.useRef<number>(0);

	useEffect(() => {
		SocketClient.on('connect', () => {
			SocketClient.emit('JOIN_ROOM', 'AUDIO');
			SocketClient.on('AUDIO_DATA', (data) => {
				store.dispatch(setAudioKey(data.key));
				store.dispatch(setByteTimeDomainData(new Uint8Array(data.byteTimeDomainData)));
			});
		});

		const draw = () => {
			const canvas = canvasRef.current;
			const byteTimeDomainData = getAudioStreamInfo(store.getState()).byteTimeDomainData;

			if(canvas) {
				const { height, width } = canvas;
				const context = canvas.getContext('2d');
				if(context) {
					if(byteTimeDomainData) {
						let x = 0;
						const sliceWidth = width / byteTimeDomainData.length;
	
						context.lineCap = 'round';
						context.lineWidth = 5;

						const key = getAudioStreamInfo(store.getState()).currentKey;
						if(key && key !== 'NONE' && ColorKeyMap[key]) {
							context.strokeStyle = ColorKeyMap[key];
						} else {
							context.strokeStyle = '#9c27b0';
						}

						context.clearRect(0, 0, width, height);
						context.beginPath();
	
						if(byteTimeDomainData.length > 0) {
							for(let i = 0; i < byteTimeDomainData.length; i++) {
								const v = byteTimeDomainData[i] / 128.0;
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

			rafId.current = requestAnimationFrame(draw);
		}

		const handleResize = () => {
			const canvas = canvasRef.current;
			if(canvas) {
				canvas.width = window.innerWidth;
			}
		};

		window.addEventListener("resize", handleResize);
		handleResize();

		rafId.current = requestAnimationFrame(draw);

		return () => {
			window.removeEventListener("resize", handleResize);
			cancelAnimationFrame(rafId.current);
		};
	}, []);

	return (
		<div className="w3-display-middle" style={{ width: '100%' }}>
			<canvas ref={canvasRef} style={{ width: "100%", height: "300" }} />
		</div>
	);
}

export default AudioVisualizer;
