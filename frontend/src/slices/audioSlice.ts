import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store/store'

interface AudioDevicesState {
	mediaAudio?: MediaStream;
	recording: boolean;
	deviceLabel: string;
}

const initialState: AudioDevicesState = {
	recording: false,
	deviceLabel: 'Press Start'
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
		},
		setDeviceLabel: (state, action: PayloadAction<string>) => {
			state.deviceLabel = action.payload;
		}
    }
});

export const { startRecording, stopRecording, setDeviceLabel } = audioSlice.actions;
export const getAudio = (state: RootState) => state.audio;
export default audioSlice.reducer;
