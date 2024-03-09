import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store/store'

interface SettingsState {
	extraMenusHidden: boolean;
};

const initialState: SettingsState = {
	extraMenusHidden: false
};

export const settingsSlice = createSlice({
	name: 'settings', 
	initialState,
	reducers: {
		setExtraMenusHidden: (state, action: PayloadAction<boolean>) => {
			state.extraMenusHidden = action.payload;
		},
	}
});

export const { setExtraMenusHidden } = settingsSlice.actions;
export const getSettings = (state: RootState): SettingsState => state.settings;
export default settingsSlice.reducer;
