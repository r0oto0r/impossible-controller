import { configureStore, EnhancedStore } from '@reduxjs/toolkit'
import thunk from 'redux-thunk';
import serverReducer from '../slices/serverSlice';
import liveLinkDataReducer from '../slices/liveLinkDataSlice';
import keysPressedReducer from '../slices/keysPressedSlice';
import audioReducer from '../slices/audioSlice';
import audioStreamInfoReducer from '../slices/audioStreamInfoSlice';
import leapServerReducer from '../slices/leapServerSlice';
import leapTrackingReducer from '../slices/leapTrackingSlice';
import communiQiReducer from '../slices/communiQiSlice';
import { persistReducer, persistStore } from 'redux-persist';
import settingsReducer from '../slices/settingsSlice';
import storage from 'redux-persist/lib/storage';

const store: EnhancedStore = configureStore({
    reducer: {
		server: persistReducer({
			key: 'server',
			storage,
			whitelist: ['address']
		}, serverReducer),
		leapServer: persistReducer({
			key: 'leapServer',
			storage,
			whitelist: ['address']
		}, leapServerReducer),
		liveLinkData: liveLinkDataReducer,
		keysPressed: keysPressedReducer,
		audio: audioReducer,
		audioStreamInfo: audioStreamInfoReducer,
		leapTracking: leapTrackingReducer,
		communiQi: persistReducer({
			key: 'communiQi',
			storage,
			whitelist: ['twitchChannelName', 'youtubeLiveId']
		}, communiQiReducer),
		settings: settingsReducer
    },
	middleware: [thunk]
});

export type RootState = ReturnType<typeof store.getState>;

export const persistor = persistStore(store);

export default store;
