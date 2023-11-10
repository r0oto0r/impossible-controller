import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store/store'

export const SERVER_ADDRESS = 'http://localhost:9090';

interface ServerState {
	address: string;
	connected: boolean;
};

const initialState: ServerState = {
	address: SERVER_ADDRESS,
	connected: false
};

export const serverSlice = createSlice({
	name: 'server', 
	initialState,
	reducers: {
		setServerAddress: (state, action: PayloadAction<string>) => {
			state.address = action.payload;
		},
		setConnected: (state, action: PayloadAction<boolean>) => {
			state.connected = action.payload;
		}
	}
});

export const { setServerAddress, setConnected } = serverSlice.actions;
export const getServer = (state: RootState) => state.server;
export default serverSlice.reducer;
