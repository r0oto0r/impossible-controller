import React, { useEffect, useState } from 'react';
import CommuniQi, { maxPoolSize } from '../CommuniQi/CommuniQi';
import { SocketClient } from '../../socket/SocketClient';
import KeysPressedView from '../Common/KeysPressedView';

const maxGifs = 20;
const minGifs = 10;
const tenorAppKey = 'AIzaSyDRwWBmJBR3R409K_RyE-7wypCUXABXyUQ';
const tenorTags = ['lol', 'rofl', 'smirk', 'smile', 'grin', 'laugh', 'chuckle', 'giggle', 'snicker', 'cackle', 'guffaw', 'titter', 'teehee', 'snort', 'chortle', 'hehe', 'haha', 'hahaha'];

function Overlay(): JSX.Element {
	const [powerPoolSize, setPowerPoolSize] = useState<number | null>(null);
	const gifImgRefArray = React.useRef<{ div: HTMLImageElement, gif: { url: string, duration: number } }[]>([]);
	const currentRunningGifRef = React.useRef<{ 
		div?: HTMLImageElement,
		gif?: {
			url: string,
			duration: number
		},
		timeOut: NodeJS.Timeout
	} | null>(null);

	useEffect(() => {
		document.body.style.backgroundColor = 'transparent';

		let timeout: NodeJS.Timeout | null = null;

		const getRandomGifs = async (count: number = 1, query?: string, contentFilter: string = 'medium', media_filter: string = 'gif'): Promise<{url: string; duration: number; height: number; width: number }[] | undefined> => {
			if(!query) {
				query = tenorTags.join(',');
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

		timeout = setInterval(async () => {
			if(gifImgRefArray.current.length <= minGifs) {
				const missingGifs = maxGifs - gifImgRefArray.current.length;
				const gifs = await getRandomGifs(missingGifs);
				if(gifs) {
					for(const gif of gifs) {
						appendGif(gif);
					}
				}
			}
		}, 1000);

		SocketClient.on('COMMUNI_QI_POWER_POOL', setPowerPoolSize);

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

			if(timeout) {
				clearTimeout(timeout);
			}

			SocketClient.off('COMMUNI_QI_POWER_POOL', setPowerPoolSize);
		};
	}, []);

	useEffect(() => {
		console.log('powerPoolSize', powerPoolSize, maxPoolSize);
		const spawnGif = () => {
			const gifIndex = Math.floor(Math.random() * gifImgRefArray.current.length);
			const gif = gifImgRefArray.current[gifIndex];
			if(!gif || !gif.div || !gif.gif) {
				console.log('no gif found');
				currentRunningGifRef.current = {
					timeOut: setTimeout(() => {
						spawnGif();
					}, 1000)
				}
				return;
			}
			gif.div.hidden = false;

			currentRunningGifRef.current = {
				div: gif.div,
				gif: gif.gif,
				timeOut: setTimeout(() => {
					if(currentRunningGifRef.current && currentRunningGifRef.current.div) {
						console.log('removing gif after timeout');
						currentRunningGifRef.current.div.remove();
						currentRunningGifRef.current = null;
						spawnGif();
					}
				}, gif.gif.duration === 0 ? 1000 : gif.gif.duration * 1000)
			};
		};

		if(powerPoolSize !== null && powerPoolSize >= maxPoolSize) {
			spawnGif();
		} else {
			if(currentRunningGifRef.current && currentRunningGifRef.current.div && currentRunningGifRef.current.timeOut) {
				clearTimeout(currentRunningGifRef.current.timeOut);
				console.log('removing gif before redraw');
				currentRunningGifRef.current.div.remove();
				currentRunningGifRef.current = null;
			}
		}
	}, [powerPoolSize]);

	return (
		<React.Fragment>
			<KeysPressedView />
			<CommuniQi />
		</React.Fragment>
	);
}

export default Overlay;
