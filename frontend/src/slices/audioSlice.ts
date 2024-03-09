import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store/store'

export const enum AudioMode {
	FLUTE,
	DRUM
}

interface AudioDevicesState {
	mediaAudio?: MediaStream;
	recording: boolean;
	deviceLabel: string;
	mode: AudioMode;
	drumHit: boolean;
}

const initialState: AudioDevicesState = {
	recording: false,
	deviceLabel: 'Press Start',
	mode: AudioMode.FLUTE,
	drumHit: false
};

export const audioSlice = createSlice({
    name: 'audio', 
    initialState,
    reducers: {
		startRecording: (state, action: PayloadAction<MediaStream>) => {
			state.recording = true;
			state.mediaAudio = action.payload;
		},
		stopRecording: (state) => {
			state.recording = false;
			state.mediaAudio = undefined;
			state.deviceLabel = 'Press Start';
			state.drumHit = false;
		},
		setDeviceLabel: (state, action: PayloadAction<string>) => {
			state.deviceLabel = action.payload;
		},
		setAudioMode: (state, action: PayloadAction<AudioMode>) => {
			state.mode = action.payload;
		},
		setDrumHit: (state, action: PayloadAction<boolean>) => {
			state.drumHit = action.payload;
		}
    }
});

export const { startRecording, stopRecording, setDeviceLabel, setAudioMode, setDrumHit } = audioSlice.actions;
export const getAudio = (state: RootState): AudioDevicesState => state.audio;
export default audioSlice.reducer;
