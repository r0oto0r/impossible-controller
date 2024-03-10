import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store/store'

export type Avatar = 'default_male' | 'default_female';

export const AvatarCameraPosition = {
	default_female: { x: 0.0, y: 1.47, z: 0.7 },
	default_male: { x: 0.0, y: 1.63, z: 0.7 }
};

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

export interface LiveLinkState {
	liveLinkData?: LiveLinkData;
	selectedBlendShape?: string;
	avatar: Avatar;
}

const initialState: LiveLinkState = {
	avatar: 'default_male'
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
		},
		setAvatar: (state, action: PayloadAction<Avatar>) => {
			state.avatar = action.payload;
		}
	}
});

export const { setLiveLinkData, setSelectedBlendShape, setAvatar } = liveLinkDataSlice.actions;
export const getLiveLinkData = (state: RootState): LiveLinkState => state.liveLinkData;
export default liveLinkDataSlice.reducer;
