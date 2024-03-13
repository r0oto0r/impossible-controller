import * as socketio from 'socket.io';
import http from 'http';
import { Log } from './Log';
import { Keyboard } from './Keyboard';
import { FluteAudioReceiver } from '../Audio/FluteAudioReceiver';
import { LeapReceiver } from '../Leap/LeapReceiver';
import { CommuniQi } from '../CommuniQi/CommuniQi';
import { LiveLinkReceiver } from '../LiveLink/LiveLinkReceiver';

export class SocketServer {
	private static io: socketio.Server;
	private static clients: Map<string, socketio.Socket> = new Map<string, socketio.Socket>();

	public static init(httpServer: http.Server) {
		Log.info('Initializing socket server');

		this.io = new socketio.Server(httpServer, {
			cors: {
				origin: '*',
				methods: [ 'GET', 'POST', 'OPTIONS' ]
			},
			transports: [ 'websocket' ]
		});

		this.io.on('connection', (socket) => {
			Log.info(`${socket.id} connected`);

			this.clients.set(socket.id, socket);

			Keyboard.onClientConnected(socket);
			LiveLinkReceiver.onClientConnected(socket);

			FluteAudioReceiver.onClientConnected(socket);
			LeapReceiver.onClientConnected(socket);
			CommuniQi.onClientConnected(socket);

			socket.on('disconnect', () => {
				FluteAudioReceiver.onClientDisconnected(socket);
				LeapReceiver.onClientDisconnected(socket);

				this.clients.delete(socket.id);
				Log.info(`${socket.id} disconnected`);
			});
		});
	}

	public static emit(messageType: string, data?: any) {
		this.io.emit(messageType, data);
	}

	public static in(room: string) {
		return this.io.in(room);
	}

	public static on(messageType: string, callback: (data?: any, responseCallback?: Function) => void) {
		this.io.on(messageType, callback);
	}

	public static disconnectClient(socketId: string) {
		const socket = this.clients.get(socketId);
		if(socket) {
			socket.disconnect();
		}
	}

	public static getClientCount() {
		return this.clients.size;
	}
}
