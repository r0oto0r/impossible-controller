import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store/store'

export const SERVER_ADDRESS = 'http://localhost:9090';

interface LeapServerState {
	address: string;
	connected: boolean;
};

const initialState: LeapServerState = {
	address: SERVER_ADDRESS,
	connected: false
};

export const leapServerSlice = createSlice({
	name: 'leapServer', 
	initialState,
	reducers: {
		setLeapServerAddress: (state, action: PayloadAction<string>) => {
			state.address = action.payload;
		},
		setConnected: (state, action: PayloadAction<boolean>) => {
			state.connected = action.payload;
		}
	}
});

export const { setLeapServerAddress, setConnected } = leapServerSlice.actions;
export const getLeapServer = (state: RootState) => state.leapServer;
export default leapServerSlice.reducer;
