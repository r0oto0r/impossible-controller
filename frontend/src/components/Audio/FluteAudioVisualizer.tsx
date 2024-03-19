import React, { useEffect } from "react";
import { getAudioStreamInfo } from "../../slices/audioStreamInfoSlice";
import store from "../../store/store";

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
		let lastOctave = 4;
		let lastKey = 'NONE';

		const positionMap: { [keyAndOctave: string]: number } = {
			'NONE4': 0,
			'A4': 700,
			'A#4': 650,
			'B4': 600,
			'C5': 550,
			'C#5': 500,
			'D5': 450,
			'D#5': 400,
			'E5': 350,
			'F5': 300,
			'F#5': 250,
			'G5': 200,
			'G#5': 150,
			'A5': 100,
			'A#5': 50,
			'B5': 0,
		};

		const draw = () => {
			const canvas = canvasRef.current;
			if(canvas) {
				const { height, width } = canvas;
				const context = canvas.getContext('2d');
				if(context) {
					context.clearRect(0, 0, width, height);

					context.globalAlpha = 0.5;

					const rectWidth = 800;
					const rectHeight = 70;
					const rectX = (width - rectWidth) / 2;
					const rectY = (height - rectHeight) / 2;
					context.fillStyle = '#333';
					context.fillRect(rectX, rectY, rectWidth, rectHeight);

					context.fillStyle = '#fff';
					context.fillRect(rectX + rectWidth - 150, rectY - 5, 150, rectHeight + 10);

					let { currentKey, currentOctave, byteTimeDomainData } = getAudioStreamInfo(store.getState());
					if(currentKey !== 'NONE') {
						lastOctave = currentOctave;
						lastKey = currentKey;
					} else {
						currentOctave = lastOctave;
						currentKey = lastKey;
					}

					context.fillStyle = '#fff';
					context.fillRect(rectX - positionMap[currentKey+currentOctave], rectY + (rectHeight / 2) - 5, 700, 10);

					context.globalAlpha = 1.0;

					if(byteTimeDomainData) {
						let x = 0;
						const sliceWidth = width / byteTimeDomainData.length;

						context.lineCap = 'round';
						context.lineWidth = 7;

						if(currentKey && currentKey !== 'NONE' && ColorKeyMap[currentKey]) {
							context.strokeStyle = ColorKeyMap[currentKey];
						} else {
							context.strokeStyle = '#9c27b0';
						}

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
					} else {
						context.strokeStyle = '#9c27b0';
						context.beginPath();
						context.moveTo(0, canvas.height / 2);
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
				canvas.height = 0.9 * window.innerHeight;
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
		<div style={{ position: "absolute", top: '5%', left: 0, right: 0, bottom: 0 }}>
			<canvas ref={canvasRef} />
		</div>
	);
}

export default AudioVisualizer;
