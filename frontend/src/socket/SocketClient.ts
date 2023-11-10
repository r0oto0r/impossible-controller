import { io, Socket } from 'socket.io-client';
import { setConnected } from '../slices/serverSlice';
import store, { RootState } from '../store/store';

export class SocketClient {
	private static socket: Socket;
	private static connected: boolean;
	private static serverAddress: string;

	private constructor() {}

	public static init() {
		const { address, connected } = (store.getState() as RootState).server;
		this.serverAddress = address;
		this.connected = connected;

		store.subscribe(() => {
			const { address, connected } = (store.getState() as RootState).server;

			this.serverAddress = address;
			this.connected = connected;
		});

		this.connectToServer();
	}

	public static connectToServer() {
		if(!this.connected) {
			this.initSocket();
		}
	}

	public static disconnectFromServer() {
		if(this.socket) {
			this.socket.offAny();
			this.socket.disconnect();
			this.socket.close();
		}
	}

	private static initSocket() {
		if(this.socket) {
			this.socket.offAny();
			this.socket.disconnect();
			this.socket.close();
		}

		console.log(`connecting to ${this.serverAddress}`);

		this.socket = io(this.serverAddress, {
			transports: [ 'websocket' ]
		});

		this.socket.on('connect', () => {
			console.log(`connected to ${this.serverAddress}`);
			store.dispatch(setConnected(true));
		});

		this.socket.on('disconnect', () => {
			console.log(`disconnected from ${this.serverAddress}`);
			store.dispatch(setConnected(false));
		});

		this.socket.on('error', error => {
			console.error(error);
		});
	}

	public static emit(messageType: string, data?: any) {
		if(this.connected) {
			this.socket.emit(messageType, data);
		}
	}

	public static on(messageType: string, callback: (data: any) => void) {
		if(this.socket) {
			this.socket.on(messageType, callback);

		}
	}

	public static off(messageType: string, callback: (data: any) => void) {
		if(this.socket) {
			this.socket.off(messageType, callback);
		}
	}

	public static get isConnected(): boolean {
		return this.connected
	}
}
