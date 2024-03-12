import { PitchDetector } from 'pitchfinder/lib/detectors/types';
import Pitchfinder from "pitchfinder";
import * as portAudio from 'naudiodon';
import { parentPort } from 'node:worker_threads';

const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const pitchDetector: PitchDetector = Pitchfinder.AMDF();

const detectKey = (pitch: number) => {
	if (pitch !== null) {
		// Convert the frequency to a musical pitch. source https://stackoverflow.com/questions/41174545/pitch-detection-node-js
		const c0 = 440.0 * Math.pow(2.0, -4.75);
		const halfStepsBelowMiddleC = Math.round(12.0 * Math.log2(pitch / c0));
		const octave = Math.floor(halfStepsBelowMiddleC / 12.0);
		const key = keys[Math.floor(halfStepsBelowMiddleC % 12)];
		return { octave, key };
	} else {
		return { octave: -1, key: 'NONE' };
	}
};

const getRMS = (data: Float32Array) => {
	const squaredSum = data.reduce((sum, value) => sum + value * value, 0);
	return Math.sqrt(squaredSum / data.length);
};

const getLoudness = (data: Float32Array) => {
	return data.reduce((sum, value) => sum + Math.abs(value), 0) / data.length;
};

const getPeakFrequency = (data: Float32Array) => {
	return Math.max(...data);
};

const getByteTimeDomainData = (data: Float32Array) => {
	const byteTimeDomainData = new Uint8Array(data.length);
	for (let i = 0; i < data.length; i++) {
		byteTimeDomainData[i] = (data[i] * 128) + 128;
	}
	return byteTimeDomainData;
};

const processAudioData = (data: Buffer) => {
	const audioData = new Float32Array(data.buffer);
	const pitch = pitchDetector(audioData);
	const loudness = getLoudness(audioData);
	const rms = getRMS(audioData);
	const peakFrequency = getPeakFrequency(audioData);
	const { key } = detectKey(pitch);
	const byteTimeDomainData = getByteTimeDomainData(audioData);

	parentPort.postMessage({
		pitch,
		loudness,
		rms,
		peakFrequency,
		key,
		byteTimeDomainData
	});
};

(async () => {
	const audioIO = portAudio.AudioIO({
		inOptions: {
			channelCount: 2,
			sampleFormat: portAudio.SampleFormatFloat32,
			sampleRate: 44100,
			deviceId: -1,
			closeOnError: false
		}
	});
	audioIO.on('data', processAudioData);
	audioIO.start();
})().catch((err) => console.error(err));
