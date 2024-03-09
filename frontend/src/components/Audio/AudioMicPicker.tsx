import React from "react";
import { getAudio, startRecording, stopRecording, setDeviceLabel } from "../../slices/audioSlice";
import { useAppDispatch, useAppSelector } from "../../hooks/general";
import { getSettings } from "../../slices/settingsSlice";

function AudioMicPicker(): JSX.Element {
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

	return (
		<div className="w3-container w3-margin w3-center" hidden={extraMenusHidden}>
			<div className="w3-row-padding">
				<div className="w3-half">
					<input className="w3-input w3-border" readOnly type="text" placeholder="Audio Device" value={deviceLabel}/>
				</div>
				<div className="w3-half">
					{recording ?
						<button onClick={stopMicrophone} className="w3-button w3-red">Stop</button>
					:
						<button onClick={getMicrophone} className="w3-button w3-green">Start</button>
					}
				</div>
			</div>
		</div>
	)
}

export default AudioMicPicker;
