import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store/store'

interface KeysPressedState {
	keysPressed: string[];
};

const initialState: KeysPressedState = {
	keysPressed: []
};

export const keysPressedSlice = createSlice({
	name: 'keysPressed', 
	initialState,
	reducers: {
		setKeysPressed: (state, action: PayloadAction<string[]>) => {
			state.keysPressed = action.payload;
		}
	}
});

export const { setKeysPressed } = keysPressedSlice.actions;
export const getKeysPressed = (state: RootState) => state.keysPressed;
export default keysPressedSlice.reducer;
