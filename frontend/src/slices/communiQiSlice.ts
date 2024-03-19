import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store/store'
import { CommuniQiPower } from '../components/CommuniQi/CommuniQi';

interface CommuniQiState {
	started: boolean;
	twitchChannelName: string;
	youtubeLiveId: string;
	maxPoolSize: number;
	powerPool: CommuniQiPower[];
	useRBTVWebsiteChat: boolean;
};

const initialState: CommuniQiState = {
	started: false,
	twitchChannelName: '',
	youtubeLiveId: '',
	maxPoolSize: 50,
	powerPool: [],
	useRBTVWebsiteChat: false
};

export const communiQiSlice = createSlice({
	name: 'communiQi',
	initialState,
	reducers: {
		setStarted: (state, action: PayloadAction<{ started: boolean; maxPowerPoolSize: number; useRBTVWebsiteChat: boolean; }>) => {
			state.started = action.payload.started;
			state.maxPoolSize = action.payload.maxPowerPoolSize;
			state.useRBTVWebsiteChat = action.payload.useRBTVWebsiteChat;
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
		},
		setUseRBTVWebsiteChat: (state, action: PayloadAction<boolean>) => {
			state.useRBTVWebsiteChat = action.payload;
		},
		addPower: (state, action: PayloadAction<CommuniQiPower>) => {
			state.powerPool.push(action.payload);
		},
		lowerPower: (state) => {
			state.powerPool.pop();
		}
	}
});

export const { setTwitchChannelName, setYouTubeLiveId, setStarted, setPowerPool, setMaxPoolSize, setUseRBTVWebsiteChat, addPower, lowerPower } = communiQiSlice.actions;
export const getCommuniQi = (state: RootState): CommuniQiState => state.communiQi;
export default communiQiSlice.reducer;
