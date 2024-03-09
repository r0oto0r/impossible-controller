import React, { useState, useEffect } from 'react';
import { SocketClient } from '../../socket/SocketClient';
import { useAppSelector } from '../../hooks/general';
import { getCommuniQi } from '../../slices/communiQiSlice';
import './CommuniQi.css';

export const CommuniQiHearts = ['❤️', '💛', '💚', '💙', '💜', '🖤', '🤎', '🤍'];
export const CommuniQiBrokenHeart = '💔';

function CommuniQi(): JSX.Element {
	const [powerPoolSize, setPowerPoolSize] = useState<number | null>(null);
	const poolDivRef = React.useRef<HTMLDivElement>(null);
	const { started } = useAppSelector((state) => getCommuniQi(state));
	const maxPoolSize = 50;

	useEffect(() => {
		const createPowerBubble = () => {
			const bubble = document.createElement('div');
			const rootElement = document.getElementById("root");
			rootElement?.appendChild(bubble);

			bubble.className = 'power-bubble';
			bubble.style.animation = 'bubbleUp 2s linear infinite'
			const animationDuration = Math.random() * 2 + 1;
			bubble.style.animationDuration = `${animationDuration}s`;
			bubble.innerHTML = CommuniQiHearts[Math.floor(Math.random() * CommuniQiHearts.length)];
			bubble.style.fontSize = `${Math.random() * 2 + 1}em`;

			let randomLeft = Math.random() * window.innerWidth;
			if(randomLeft + bubble.offsetWidth > window.innerWidth) randomLeft = window.innerWidth - bubble.offsetWidth;

			bubble.style.left = `${randomLeft}px`;
			bubble.style.bottom = `0px`;

			setTimeout(() => {
				rootElement?.removeChild(bubble);
			}, animationDuration * 1000);
		};

		const handlePowerPool = (size: number) => {
			if(powerPoolSize !== null && size > powerPoolSize) {
				addPower(size - powerPoolSize);
			}
			setPowerPoolSize(size);
		};

		const addPower = (count: number) => {
			for (let i = 0; i < count; i++) {
				createPowerBubble();
			}
		};

		SocketClient.on('COMMUNI_QI_POWER_POOL', handlePowerPool);

		return () => {
			SocketClient.off('COMMUNI_QI_POWER_POOL', handlePowerPool);
		};
	}, [powerPoolSize, started])

	const calculateColorAndSize = () => {
		if(powerPoolSize === null) {
			return 'red';
		}

		const fillPercentage = (powerPoolSize / maxPoolSize) * 100;

		const red = Math.round(255 - (255 * fillPercentage) / 100);
		const green = Math.round((39 * fillPercentage) / 100);
		const blue = Math.round(176 - (176 * fillPercentage) / 100);

		return `linear-gradient(0deg, rgb(${red}, ${green}, ${blue}), #282c34)`;
	};

	const calculateSize = () => {
		if(powerPoolSize === null) {
			return 0;
		}

		const fillPercentage = (powerPoolSize / maxPoolSize) * 100;

		const size = (fillPercentage / 100) * 300;
		return size;
	}

	return (
		<div
			ref={poolDivRef}
			className="power-pool-box"
			hidden={!started}
			style={{
				background: calculateColorAndSize(), // Set the gradient background color dynamically
				height: `${calculateSize()}px`, // Set the height dynamically based on pool size
			}}
		></div>
	);
}

export default CommuniQi;
