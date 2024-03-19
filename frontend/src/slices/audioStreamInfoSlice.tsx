import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store/store'

export interface AudioInfoState {
	currentKey: string;
	currentOctave: number;
	byteTimeDomainData?: Uint8Array;
}

const initialState: AudioInfoState = {
	currentKey: 'NONE',
	currentOctave: 0
};

export const audioStreamInfoSlice = createSlice({
    name: 'pitch', 
    initialState,
    reducers: {
		setByteTimeDomainData: (state, action: PayloadAction<Uint8Array>) => {
			state.byteTimeDomainData = action.payload;
		},
		setAudioInfo: (state, action: PayloadAction<{ key: string; octave: number }>) => {
			state.currentKey = action.payload.key;
			state.currentOctave = action.payload.octave;
		}
    }
});

export const { setByteTimeDomainData, setAudioInfo } = audioStreamInfoSlice.actions;
export const getAudioStreamInfo = (state: RootState): AudioInfoState => state.audioStreamInfo;
export default audioStreamInfoSlice.reducer;
