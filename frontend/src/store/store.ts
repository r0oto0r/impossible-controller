import { configureStore, EnhancedStore } from '@reduxjs/toolkit'
import thunk from 'redux-thunk';
import serverReducer from '../slices/serverSlice';
import liveLinkDataReducer from '../slices/liveLinkDataSlice';
import keysPressedReducer from '../slices/keysPressedSlice';
import audioReducer from '../slices/audioSlice';
import audioStreamInfoReducer from '../slices/audioStreamInfoSlice';

const store: EnhancedStore = configureStore({
    reducer: {
		server: serverReducer,
		liveLinkData: liveLinkDataReducer,
		keysPressed: keysPressedReducer,
		audio: audioReducer,
		audioStreamInfo: audioStreamInfoReducer
    },
	middleware: [thunk]
});

export type RootState = ReturnType<typeof store.getState>;

export default store;
