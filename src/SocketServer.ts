import * as socketio from 'socket.io';
import http from 'http';
import { Log } from './Log';
import { Keyboard } from './Keyboard';

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

			Keyboard.initSocketClient(socket.id);

			socket.on('disconnect', () => {
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

	public static onClient(socketId: string, messageType: string, callback: (data?: any, responseCallback?: Function) => void) {
		const socket = this.clients.get(socketId);
		if(socket) {
			socket.on(messageType, callback);
		}
	}

	public static joinRoom(socketId: string, room: string) {
		const socket = this.clients.get(socketId);
		if(socket) {
			socket.join(room);
		}
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
