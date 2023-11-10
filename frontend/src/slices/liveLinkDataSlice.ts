import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store/store'

export interface LiveLinkData {
	uuid: string;
	name: string;
	fps: number;
	version: number;
	frameNumber: number;
	subFrame: number;
	denominator: number;
	blendShapes: number[];
};

export interface TwitchChannelState {
	liveLinkData?: LiveLinkData;
	selectedBlendShape?: string;
}

const initialState: TwitchChannelState = {
};

export const liveLinkDataSlice = createSlice({
	name: 'liveLinkData', 
	initialState,
	reducers: {
		setLiveLinkData: (state, action: PayloadAction<LiveLinkData | undefined>) => {
			state.liveLinkData = action.payload;
		},
		setSelectedBlendShape: (state, action: PayloadAction<string | undefined>) => {
			state.selectedBlendShape = action.payload;
		}
	}
});

export const { setLiveLinkData, setSelectedBlendShape } = liveLinkDataSlice.actions;
export const getLiveLinkData = (state: RootState) => state.liveLinkData;
export default liveLinkDataSlice.reducer;
