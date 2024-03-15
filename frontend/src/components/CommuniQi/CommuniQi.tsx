import React, { useEffect } from 'react';
import { SocketClient } from '../../socket/SocketClient';
import { useAppDispatch, useAppSelector } from '../../hooks/general';
import { getCommuniQi, setPowerPool, addPower, lowerPower } from '../../slices/communiQiSlice';
import './CommuniQi.css';

export enum CommuniQiPowerSource {
	TwitchChat,
	YouTubeChat,
	Regeneration
};

export interface CommuniQiPower {
	userName: string;
	heart: string;
	source: CommuniQiPowerSource;
};

function CommuniQi(): JSX.Element {
	const poolDivRef = React.useRef<HTMLDivElement>(null);
	const { started, maxPoolSize, powerPool } = useAppSelector((state) => getCommuniQi(state));
	const dispatch = useAppDispatch();

	useEffect(() => {
		const createPowerBubble = (userName: string, heart: string) => {
			const bubble = document.createElement('div');
			document.body.appendChild(bubble);

			bubble.className = 'power-bubble';
			bubble.style.animation = 'bubbleUp 2s linear infinite'
			const animationDuration = Math.random() * 2 + 1;
			bubble.style.animationDuration = `${animationDuration}s`;
			bubble.innerHTML = `${heart}<br>${userName}`;
			bubble.style.fontSize = `${Math.random() * 2 + 1}em`;

			let randomLeft = Math.random() * window.innerWidth;
			if(randomLeft + bubble.offsetWidth > window.innerWidth) randomLeft = window.innerWidth - bubble.offsetWidth;

			bubble.style.left = `${randomLeft}px`;
			bubble.style.bottom = `0px`;

			setTimeout(() => {
				document.body.removeChild(bubble);
			}, animationDuration * 1000);
		};

		const handlePowerPool = (newPool: CommuniQiPower[]) => {
			dispatch(setPowerPool(newPool));
		};

		const handlePowerUp = (power: CommuniQiPower) => {
			dispatch(addPower(power));
			createPowerBubble(power.userName, power.heart);
		};

		const handlePowerDown = () => {
			dispatch(lowerPower());
		};

		SocketClient.on('connect', () => {
			SocketClient.emit('JOIN_ROOM', 'COMMUNI_QI');
			SocketClient.on('COMMUNI_QI_POWER_POOL', handlePowerPool);
			SocketClient.on('COMMUNI_QI_POWER_UP', handlePowerUp);
			SocketClient.on('COMMUNI_QI_POWER_DOWN', handlePowerDown);
		});

		SocketClient.on('disconnect', () => {
			SocketClient.off('COMMUNI_QI_POWER_POOL', handlePowerPool);
			SocketClient.off('COMMUNI_QI_POWER_UP', handlePowerUp);
			SocketClient.off('COMMUNI_QI_POWER_DOWN', handlePowerDown);
		});

		if(poolDivRef.current) {
			poolDivRef.current.style.pointerEvents = 'none';
		}

		return () => {
			SocketClient.emit('LEAVE_ROOM', 'COMMUNI_QI');
			SocketClient.off('COMMUNI_QI_POWER_POOL', handlePowerPool);
			SocketClient.off('COMMUNI_QI_POWER_UP', handlePowerUp);
			SocketClient.off('COMMUNI_QI_POWER_DOWN', handlePowerDown);
		};
	}, [ dispatch ]);

	const calculateOpacity = () => {
		if(powerPool.length < 1) {
			return 0;
		}

		let opacity = powerPool.length / maxPoolSize;
		if(opacity > 1) opacity = 1;
		if(opacity < 0.2) opacity = 0.2;

		return opacity;
	};

	const calculateSize = () => {
		if(powerPool.length < 1) {
			return 0;
		}

		const fillPercentage = (powerPool.length / maxPoolSize) * 100;

		const size = (fillPercentage / 100) * 300;
		return size;
	};

	return (
		<div
			ref={poolDivRef}
			className="power-pool-box"
			hidden={!started}
			style={{
				opacity: calculateOpacity(),
				height: `${calculateSize()}px`,
			}}
		></div>
	);
}

export default CommuniQi;
