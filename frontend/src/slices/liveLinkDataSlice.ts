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
	mouseModeActive: boolean;
	freeLook: boolean;
	triggerLeft: boolean;
	triggerRight: boolean;
	triggerUp: boolean;
	triggerDown: boolean;
}

const initialState: LiveLinkState = {
	avatar: 'default_male',
	mouseModeActive: false,
	freeLook: false,
	triggerLeft: false,
	triggerRight: false,
	triggerUp: false,
	triggerDown: false
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
		},
		setMouseModeActive: (state, action: PayloadAction<boolean>) => {
			state.mouseModeActive = action.payload;
		},
		setFreeLook: (state, action: PayloadAction<boolean>) => {
			state.freeLook = action.payload;
		},
		setTrigger(state, action: PayloadAction<{
			leftTrigger: boolean;
			rightTrigger: boolean;
			upTrigger: boolean;
			downTrigger: boolean;
		}>) {
			state.triggerLeft = action.payload.leftTrigger;
			state.triggerRight = action.payload.rightTrigger;
			state.triggerUp = action.payload.upTrigger;
			state.triggerDown = action.payload.downTrigger;
		}
	}
});

export const { setLiveLinkData, setSelectedBlendShape, setAvatar, setMouseModeActive, setTrigger, setFreeLook } = liveLinkDataSlice.actions;
export const getLiveLinkData = (state: RootState): LiveLinkState => state.liveLinkData;
export default liveLinkDataSlice.reducer;
