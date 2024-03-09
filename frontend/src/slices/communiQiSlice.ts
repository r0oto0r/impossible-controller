import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store/store'

interface CommuniQiState {
	started: boolean;
	twitchChannelName: string;
	youtubeLiveId: string;
};

const initialState: CommuniQiState = {
	started: false,
	twitchChannelName: '',
	youtubeLiveId: ''
};

export const communiQiSlice = createSlice({
	name: 'communiQi', 
	initialState,
	reducers: {
		setStarted: (state, action: PayloadAction<boolean>) => {
			state.started = action.payload;
		},
		setTwitchChannelName: (state, action: PayloadAction<string>) => {
			state.twitchChannelName = action.payload;
		},
		setYouTubeLiveId: (state, action: PayloadAction<string>) => {
			state.youtubeLiveId = action.payload;
		}
	}
});

export const { setTwitchChannelName, setYouTubeLiveId, setStarted } = communiQiSlice.actions;
export const getCommuniQi = (state: RootState): CommuniQiState => state.communiQi;
export default communiQiSlice.reducer;
