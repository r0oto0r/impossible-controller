import React, { useEffect } from 'react';
import { SocketClient } from '../../socket/SocketClient';
import { useAppDispatch, useAppSelector } from '../../hooks/general';
import { getCommuniQi, setPowerPool } from '../../slices/communiQiSlice';
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
	const [ poolSize, setPoolSize ] = React.useState<number>(0);
	const poolRef = React.useRef<CommuniQiPower[] | null>(null);
	const poolDivRef = React.useRef<HTMLDivElement>(null);
	const { started, maxPoolSize } = useAppSelector((state) => getCommuniQi(state));
	const dispatch = useAppDispatch();

	useEffect(() => {
		const createPowerBubble = (userName: string, heart: string) => {
			const bubble = document.createElement('div');
			const rootElement = document.getElementById("root");
			rootElement?.appendChild(bubble);

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
				rootElement?.removeChild(bubble);
			}, animationDuration * 1000);
		};

		const addPower = (power: CommuniQiPower[]) => {
			for (let i = 0; i < power.length; i++) {
				createPowerBubble(power[i].userName, power[i].heart);
			}
		};

		const handlePowerPool = (newPool: CommuniQiPower[]) => {
			if(poolRef.current !== null && newPool.length > poolRef.current.length) {
				const newItems: CommuniQiPower[] = newPool.slice(poolRef.current.length);
				addPower(newItems);
			}
			poolRef.current = newPool;
			setPoolSize(newPool.length);
			dispatch(setPowerPool(newPool));
		};

		const handlePowerUp = (power: CommuniQiPower) => {
			if(poolRef.current !== null) {
				poolRef.current.push(power);
				setPoolSize(poolRef.current.length);
				dispatch(setPowerPool(poolRef.current));
			}
		};

		const handlePowerDown = () => {
			if(poolRef.current !== null) {
				poolRef.current.shift();
				setPoolSize(poolRef.current.length);
				dispatch(setPowerPool(poolRef.current));
			}
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

	const calculateOpacity = React.useCallback(() => {
		if(poolSize < 1) {
			return 0;
		}

		let opacity = poolSize / maxPoolSize;
		if(opacity > 1) opacity = 1;
		if(opacity < 0.2) opacity = 0.2;

		return opacity;
	}, [ poolSize, maxPoolSize ]);

	const calculateSize = React.useCallback(() => {
		if(poolSize < 1) {
			return 0;
		}

		const fillPercentage = (poolSize / maxPoolSize) * 100;

		const size = (fillPercentage / 100) * 300;
		return size;
	}, [ poolSize, maxPoolSize ]);

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
