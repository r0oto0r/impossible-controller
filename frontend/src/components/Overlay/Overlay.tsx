import React, { useEffect } from 'react';
import CommuniQi from '../CommuniQi/CommuniQi';
import { SocketClient } from '../../socket/SocketClient';
import KeysPressedView from '../Common/KeysPressedView';
import store from '../../store/store';
import { getCommuniQi } from '../../slices/communiQiSlice';
import { useAppSelector } from '../../hooks/general';

const tenorAppKey = 'AIzaSyDRwWBmJBR3R409K_RyE-7wypCUXABXyUQ';
const tenorTags = ['lol', 'rofl', 'smirk', 'smile', 'grin', 'laugh', 'chuckle', 'giggle', 'snicker', 'cackle', 'guffaw', 'titter', 'teehee', 'snort', 'chortle', 'hehe', 'haha', 'hahaha'];

function Overlay(): JSX.Element {
	const { maxPoolSize } = useAppSelector(state => getCommuniQi(state));
	const gifImgRefArray = React.useRef<{ div: HTMLImageElement, gif: { url: string, duration: number } }[]>([]);

	useEffect(() => {
		document.body.style.backgroundColor = 'transparent';
		document.body.style.overflow = 'hidden';

		const getRandomGifs = async (count: number = 1, query?: string, contentFilter: string = 'medium', media_filter: string = 'gif'): Promise<{url: string; duration: number; height: number; width: number }[] | undefined> => {
			if(!query) {
				query = tenorTags[Math.floor(Math.random() * tenorTags.length)];
			}
			const tenorResponse = await fetch(`https://tenor.googleapis.com/v2/search?q=${query}&key=${tenorAppKey}&contentfilter=${contentFilter}&media_filter=${media_filter}&limit=${count}&random=true`);
			const gifs = [];
			const tenorData = await tenorResponse.json();
			if(tenorData.results && tenorData.results.length > 0) {
				for(const result of tenorData.results) {
					gifs.push({
						url: result.media_formats.gif.url,
						duration: result.media_formats.gif.duration,
						width: result.media_formats.gif.dims[0],
						height: result.media_formats.gif.dims[1]
					});
				}
				return gifs;
			}

			return undefined;
		};

		const appendGif = (tenorGif: { url: string; duration: number; height: number; width: number }) => {
			const gif = document.createElement('img');
			gif.style.position = 'absolute';
			const maxTop = window.innerHeight - tenorGif.height;
			const maxLeft = window.innerWidth - tenorGif.width;
			gif.style.top = `${Math.random() * maxTop}px`;
			gif.style.left = `${Math.random() * maxLeft}px`;
			gif.hidden = true;
			gif.src = tenorGif.url;

			document.body.appendChild(gif);
			gifImgRefArray.current.push({
				div: gif,
				gif: {
					url: tenorGif.url,
					duration: tenorGif.duration
				}
			});
		};

		const fillGifBuffer = async () => {
			const gifs = await getRandomGifs(Math.floor(maxPoolSize / 2));
			if(!gifs) {
				return;
			}
			for(const gif of gifs) {
				appendGif(gif);
			}
		}

		const spawnAllGifs = () => {
			for(let i = 0; i < gifImgRefArray.current.length; i++) {
				const gif = gifImgRefArray.current[i];
				setTimeout(() => {
					gif.div.hidden = false;
					setTimeout(() => {
						gif.div.remove();
					}, gif.gif.duration * 1000);
				}, Math.random() * 5000);
			}

			fillGifBuffer();
		};

		fillGifBuffer();

		SocketClient.on('COMMUNI_QI_POWER_POOL_EXPLODED', () => {
			spawnAllGifs();
			const powerPool = getCommuniQi(store.getState()).powerPool;
			if(powerPool && powerPool.length > 0) {
				const lastPower = powerPool[powerPool.length - 1];
				const hurlName = document.createElement('div');
				hurlName.style.position = 'absolute';
				hurlName.style.color = 'red';
				hurlName.style.fontWeight = 'bold';
				hurlName.style.fontSize = '8em';
				hurlName.style.left = `${window.innerWidth / 2}px`;
				hurlName.style.top = `${window.innerHeight / 2}px`;
				hurlName.style.transform = 'translate(-50%, -50%)';
				hurlName.style.zIndex = '1000';
				hurlName.style.overflow = 'hidden';
				hurlName.animate([
					{ transform: 'translate(-50%, -50%) rotate(0)', color: 'red' },
					{ transform: 'translate(-50%, -50%) rotate(360deg)', color: 'orange' },
					{ transform: 'translate(-50%, -50%) rotate(720deg) scale(1.5)', color: 'yellow' },
					{ transform: 'translate(-50%, -50%) rotate(1080deg) scale(1)', color: 'green' },
					{ transform: 'translate(-50%, -50%) rotate(1440deg) scale(1)', color: 'blue' },
					{ transform: 'translate(-50%, -50%) rotate(1800deg) scale(1)', color: 'indigo' },
					{ transform: 'translate(-50%, -50%) rotate(2160deg) scale(1)', color: 'violet' }
				], {
					duration: 3000,
					iterations: 1
				});
				hurlName.innerText = lastPower.userName;
				document.body.appendChild(hurlName);
				setTimeout(() => {
					hurlName.remove();
				}, 7000);
			}
		});

		const currentGifDivRef = gifImgRefArray.current;
		return () => {
			currentGifDivRef?.forEach((gif) => {
				if(gif.div) {
					try {
						document.body.removeChild(gif.div);
					} catch (e) {
						console.log('failed to remove gif', e);
					}
				}
			});
		};
	}, [ maxPoolSize ]);

	return (
		<React.Fragment>
			<KeysPressedView />
			<CommuniQi />
		</React.Fragment>
	);
}

export default Overlay;
