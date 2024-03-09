import React from 'react';
import Main from './components/Main';
import { Provider } from "react-redux";
import store from './store/store';
import { PersistGate } from 'redux-persist/integration/react'
import { persistor } from './store/store';
import { SocketClient } from './socket/SocketClient';
import { LeapSocketClient } from './socket/LeapSocketClient';

SocketClient.init();
LeapSocketClient.init();

function App() {
	return (
		<Provider store={store}>
			<PersistGate loading={
				<div>Loading...</div>
			} persistor={persistor}>
				<Main />
			</PersistGate>
		</Provider>
	);
}

export default App;
