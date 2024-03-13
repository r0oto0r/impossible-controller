import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store/store'
import { CommuniQiPower } from '../components/CommuniQi/CommuniQi';

interface CommuniQiState {
	started: boolean;
	twitchChannelName: string;
	youtubeLiveId: string;
	maxPoolSize: number;
	powerPool?: CommuniQiPower[];
};

const initialState: CommuniQiState = {
	started: false,
	twitchChannelName: '',
	youtubeLiveId: '',
	maxPoolSize: 50,
	powerPool: []
};

export const communiQiSlice = createSlice({
	name: 'communiQi',
	initialState,
	reducers: {
		setStarted: (state, action: PayloadAction<{ started: boolean; maxPoolSize: number }>) => {
			state.started = action.payload.started;
			if(action.payload.maxPoolSize !== undefined) {
				state.maxPoolSize = action.payload.maxPoolSize;
			}
		},
		setTwitchChannelName: (state, action: PayloadAction<string>) => {
			state.twitchChannelName = action.payload;
		},
		setYouTubeLiveId: (state, action: PayloadAction<string>) => {
			state.youtubeLiveId = action.payload;
		},
		setPowerPool: (state, action: PayloadAction<CommuniQiPower[]>) => {
			state.powerPool = action.payload;
		},
		setMaxPoolSize: (state, action: PayloadAction<number>) => {
			state.maxPoolSize = action.payload;
		}
	}
});

export const { setTwitchChannelName, setYouTubeLiveId, setStarted, setPowerPool, setMaxPoolSize } = communiQiSlice.actions;
export const getCommuniQi = (state: RootState): CommuniQiState => state.communiQi;
export default communiQiSlice.reducer;
