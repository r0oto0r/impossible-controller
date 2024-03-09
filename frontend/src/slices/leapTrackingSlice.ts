import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store/store'
import { LeapHand, LeapTrackingData } from '../common/LeapInterfaces';

export interface TrackingState {
	trackingData: LeapTrackingData;
	hands: Array<LeapHand> | undefined;
}

const initialState: TrackingState = {
	trackingData: {} as LeapTrackingData,
	hands: undefined
};

export const leapTrackingSlice = createSlice({
    name: 'leapTracking', 
    initialState,
    reducers: {
		setTrackingData: (state, action: PayloadAction<LeapTrackingData>) => {
			state.trackingData = action.payload;
			state.hands = action.payload.hands;
		}
    }
});

export const { setTrackingData } = leapTrackingSlice.actions;
export const getLeapTracking = (state: RootState): TrackingState => state.leapTracking;
export default leapTrackingSlice.reducer;
