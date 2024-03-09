import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store/store'

export interface AudioInfoState {
	currentKey: string;
	byteTimeDomainData?: Uint8Array;
}

const initialState: AudioInfoState = {
	currentKey: 'NONE'
};

export const audioStreamInfoSlice = createSlice({
    name: 'pitch', 
    initialState,
    reducers: {
		setByteTimeDomainData: (state, action: PayloadAction<Uint8Array>) => {
			state.byteTimeDomainData = action.payload;
		},
		setAudioKey: (state, action: PayloadAction<string>) => {
			state.currentKey = action.payload;
		}
    }
});

export const { setByteTimeDomainData, setAudioKey } = audioStreamInfoSlice.actions;
export const getAudioStreamInfo = (state: RootState): AudioInfoState => state.audioStreamInfo;
export default audioStreamInfoSlice.reducer;
