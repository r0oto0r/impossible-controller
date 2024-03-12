import socketio from 'socket.io';
import { Worker, isMainThread } from 'node:worker_threads'; 
import path from 'node:path';
import { SocketServer } from './SocketServer';

export class AudioMaster {
	public static async init() {
		this.startWorkerThread();
	}

	private static startWorkerThread() {
		if(isMainThread) {
			const worker = new Worker(path.resolve(__dirname, './AudioProcessor.js'));
			worker.on('message', (data) => {
				SocketServer.in('AUDIO').emit('AUDIO_DATA', data);
			});
		}
	}

	public static onClientConnected = (socket: socketio.Socket) => {
		socket.on('JOIN_ROOM', (room: string) => {
			if(room !== 'AUDIO') {
				return;
			}
			socket.join(room);
		});
	}
};
