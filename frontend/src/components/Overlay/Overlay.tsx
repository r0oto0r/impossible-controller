import React, { useEffect, useState } from 'react';
import CommuniQi, { maxPoolSize } from '../CommuniQi/CommuniQi';
import { SocketClient } from '../../socket/SocketClient';

const maxGifs = 20;
const minGifs = 10;
const tenorAppKey = 'AIzaSyDRwWBmJBR3R409K_RyE-7wypCUXABXyUQ';
const tenorTags = ['lol', 'rofl', 'smirk', 'smile', 'grin', 'laugh', 'chuckle', 'giggle', 'snicker', 'cackle', 'guffaw', 'titter', 'teehee', 'snort', 'chortle', 'hehe', 'haha', 'hohoho', 'hahaha', 'hohohoho'];

function Overlay(): JSX.Element {
	const [powerPoolSize, setPowerPoolSize] = useState<number | null>(null);
	const gifImgRefArray = React.useRef<{ div: HTMLImageElement, gif: { url: string, duration: number } }[]>([]);
	const currentRunningGifRef = React.useRef<{ 
		div: HTMLImageElement,
		gif: {
			url: string,
			duration: number
		},
		timeOut: NodeJS.Timeout
	} | null>(null);

	useEffect(() => {
		document.body.style.backgroundColor = 'transparent';

		let timeout: NodeJS.Timeout | null = null;

		const getRandomInt = (min: number, max: number): number => {
			min = Math.ceil(min);
			max = Math.floor(max);
			return Math.floor(Math.random() * (max - min) + min);
		};

		const getRandomGifs = async (count: number = 1, query?: string, contentFilter: string = 'medium', media_filter: string = 'gif'): Promise<{url: string; duration: number; height: number; width: number }[] | undefined> => {
			if (!query) {
				query = tenorTags[getRandomInt(0, tenorTags.length)];
			}
			const tenorResponse = await fetch(`https://tenor.googleapis.com/v2/search?q=${query}&key=${tenorAppKey}&contentfilter=${contentFilter}&media_filter=${media_filter}&limit=${count}&random=true`);
			const gifs = [];
			const tenorData = await tenorResponse.json();
			if(tenorData.results && tenorData.results.length > 0) {
				for(const result of tenorData.results) {
					gifs.push({
						url: result.media_formats.gif.url,
						duration: result.media_formats.gif.duration,
						height: result.media_formats.gif.dims[0],
						width: result.media_formats.gif.dims[1]
					});
				}
				return gifs;
			}

			return undefined;
		};

		const appendGif = (tenorGif: { url: string; duration: number; height: number; width: number }) => {
			const gif = document.createElement('img');
			gif.style.position = 'absolute';
			const maxTop = window.innerHeight - gif.height;
			const maxLeft = window.innerWidth - gif.width;
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
				gif.div.remove();
			});

			if(timeout) {
				clearTimeout(timeout);
			}

			SocketClient.off('COMMUNI_QI_POWER_POOL', setPowerPoolSize);
		};
	}, []);

	useEffect(() => {
		const showRandomGif = () => {
			if(currentRunningGifRef.current) {
				return;
			}
			const gif = gifImgRefArray?.current.pop();
			if(gif) {
				gif.div.hidden = false;
				currentRunningGifRef.current = {
					...gif,
					timeOut: setTimeout(() => {
						document.body.removeChild(gif.div);
						currentRunningGifRef.current = null;
						if(powerPoolSize !== null && powerPoolSize >= maxPoolSize) {
							showRandomGif();
						}
					}, gif.gif.duration > 0 ? gif.gif.duration * 1000 : 1000)
				};
			}
		};

		if(powerPoolSize !== null && powerPoolSize >= maxPoolSize) {
			showRandomGif();
		}
	}, [powerPoolSize]);

	return (
		<React.Fragment>
			<CommuniQi />
		</React.Fragment>
	);
}

export default Overlay;
