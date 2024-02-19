import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store/store'

export interface AudioInfoState {
	currentPitch: number | null;
	currentPeakFrequency: number;
	currentRMS: number | null;
	currentDuration: number | null;
	currentAmplitude: number | null;
}

const initialState: AudioInfoState = {
	currentPitch: null,
	currentPeakFrequency: 0,
	currentRMS: null,
	currentDuration: null,
	currentAmplitude: null
};

export const audioStreamInfoSlice = createSlice({
    name: 'pitch', 
    initialState,
    reducers: {
		setAudioInfo: (state, action: PayloadAction<AudioInfoState>) => {
			state.currentPitch = action.payload.currentPitch;
			state.currentPeakFrequency = action.payload.currentPeakFrequency;
			state.currentRMS = action.payload.currentRMS;
			state.currentDuration = action.payload.currentDuration;
			state.currentAmplitude = action.payload.currentAmplitude;
		}
    }
});

export const { setAudioInfo } = audioStreamInfoSlice.actions;
export const getAudioStreamInfo = (state: RootState) => state.audioStreamInfo;
export default audioStreamInfoSlice.reducer;
