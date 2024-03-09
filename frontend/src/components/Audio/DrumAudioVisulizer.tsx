import React, { useEffect } from "react";
import { useAppSelector } from "../../hooks/general";
import { getAudio } from "../../slices/audioSlice";

const maxGifs = 10;
const tenorAppKey = 'STUPID ME';
const tenorTags = ['hit', 'bang', 'pow', 'smack', 'whack', 'thud', 'thump', 'punch', 'slap', 'smash', 'crash', 'boom', 'bang', 'bop', 'clap', 'clunk', 'crunch', 'pop', 'smack', 'snap'];

function DrumAudioVisulizer(): JSX.Element {
	const { drumHit } = useAppSelector((state) => getAudio(state));
	const gifImgRefArray = React.useRef<{ div: HTMLImageElement, gif: { url: string, duration: number } }[]>([]);
	const gifDivRef = React.useRef<HTMLDivElement>(null);

	console.log('drumHit', drumHit);

	useEffect(() => {
		let timeout: NodeJS.Timeout | null = null;

		const getRandomInt = (min: number, max: number): number => {
			min = Math.ceil(min);
			max = Math.floor(max);
			return Math.floor(Math.random() * (max - min) + min);
		}

		const getRandomGifs = async (count: number = 1, query?: string, contentFilter: string = 'medium', media_filter: string = 'gif'): Promise<{url: string; duration: number; }[] | undefined> => {
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
						duration: result.media_formats.gif.duration
					});
				}
				return gifs;
			}

			return undefined;
		}

		const appendGif = (tenorGif: { url: string; duration: number; }) => {
			if(gifDivRef.current) {
				const gif = document.createElement('img');
				gif.hidden = true;
				gif.src = tenorGif.url;

				gifDivRef.current.appendChild(gif);
				gifImgRefArray.current.push({
					div: gif,
					gif: {
						url: tenorGif.url,
						duration: tenorGif.duration
					}
				});
			}
		}

		timeout = setInterval(async () => {
			if(gifImgRefArray.current.length < maxGifs) {
				const missingGifs = maxGifs - gifImgRefArray.current.length;
				const gifs = await getRandomGifs(missingGifs);
				if(gifs) {
					for(const gif of gifs) {
						appendGif(gif);
					}
				}
			}
		}, 1000);

		const currentGifDivRef = gifImgRefArray.current;
		return () => {
			currentGifDivRef?.forEach((gif) => {
				gif.div.remove();
			});

			if(timeout) {
				clearTimeout(timeout);
			}
		}
	}, []);

	useEffect(() => {
		if(drumHit) {
			gifImgRefArray?.current.forEach((gif) => { 
				if(!gif.div.hidden) {
					if(gifDivRef.current) {
						gifDivRef.current.removeChild(gif.div);
					}
				}
			});
			const gif = gifImgRefArray?.current.pop();
			if(gif) {
				gif.div.hidden = false;
				setTimeout(() => {
					if(gifDivRef.current) {
						gifDivRef.current.removeChild(gif.div);
					}
				}, gif.gif.duration * 1000);
			}
		}
	}, [drumHit]);

	return (
		<div className="w3-display-middle" ref={gifDivRef} />
	);
}

export default DrumAudioVisulizer;
