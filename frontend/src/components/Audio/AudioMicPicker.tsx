import React from "react";
import { getAudio, startRecording, stopRecording, setDeviceLabel } from "../../slices/audioSlice";
import { useAppDispatch, useAppSelector } from "../../hooks/general";
import { getSettings } from "../../slices/settingsSlice";
// import { SocketClient } from "../../socket/SocketClient";

function AudioMicPicker(): JSX.Element {
	// const [ audioThreadStarted, setAudioThreadStarted ] = React.useState<boolean>(false);
	const { recording, mediaAudio, deviceLabel } = useAppSelector((state) => getAudio(state));
	const { extraMenusHidden } = useAppSelector((state) => getSettings(state));
	const dispatch = useAppDispatch();

	const getMicrophone = async () => {
		const audio = await navigator.mediaDevices.getUserMedia({
			audio: true,
			video: false
		});
		const devices = await navigator.mediaDevices.enumerateDevices();
		const audioDevice = devices.find(device => device.deviceId === audio.getAudioTracks()[0].getSettings().deviceId);
		if(audioDevice) {
			dispatch(setDeviceLabel(audioDevice.label));
		}
		dispatch(startRecording(audio));
	}

	const stopMicrophone = () => {
		mediaAudio?.getTracks().forEach((track: MediaStreamTrack) => track.stop());
		dispatch(stopRecording())
	}

	// const startThread = () => {
	// 	SocketClient.emit('START_AUDIO');
	// };

	// const stopThread = () => {
	// 	SocketClient.emit('STOP_AUDIO');
	// };

	// useEffect(() => {
	// 	const audioStatusCallback = ({ started }: { started: boolean }) => setAudioThreadStarted(started);
	// 	SocketClient.on('AUDIO_STATUS', audioStatusCallback);

	// 	return () => {
	// 		SocketClient.off('AUDIO_STATUS', audioStatusCallback);
	// 	}
	// }, []);

	return (
		<div className="w3-container w3-center" hidden={extraMenusHidden}>
			<div className="w3-row-padding">
				<div className="w3-half">
					<input className="w3-input w3-border" readOnly type="text" placeholder="Audio Device" value={deviceLabel}/>
				</div>
				<div className="w3-half">
					{recording ?
						<button onClick={stopMicrophone} className="w3-button w3-red">Stop Browser Mic</button>
					:
						<button onClick={getMicrophone} className="w3-button w3-green">Start Browser Mic</button>
					}
				</div>
			</div>
			{/*
			<div className="w3-row-padding">
				<div className="w3-half">
					{audioThreadStarted ?
						<button onClick={stopThread} className="w3-button w3-red">Stop Audio Thread</button>
					:
						<button onClick={startThread} className="w3-button w3-green">Start Audio Thread</button>
					}
				</div>
			</div>
			*/}
		</div>
	)
}

export default AudioMicPicker;
