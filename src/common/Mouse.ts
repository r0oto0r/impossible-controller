import { SocketServer } from "./SocketServer";
import { Log } from "./Log";
import fs from 'fs';
import socketio from 'socket.io';

export enum MouseMessage {
	MOUSE_POSITION = 'MOUSE_POSITION'
};

export interface MousePosition {
	x: number;
	y: number;
};

const MOUSE = process.env.PROD ? '/dev/hidg1' : '/dev/null';

export class Mouse {
	private static mouseStream: fs.WriteStream;
	private static mousePosition: MousePosition = { x: 0, y: 0 };

	public static async init() {
		this.mouseStream = fs.createWriteStream(MOUSE);
		Log.info(`Mouse initialized`);
	}

	public static onClientConnected = (socket: socketio.Socket) => {
		socket.emit(MouseMessage.MOUSE_POSITION, this.mousePosition);
	}

	private static generateHIDMessage(x: number, y: number): string {
		return `${String.fromCharCode(0)}${String.fromCharCode(x)}${String.fromCharCode(y)}`;
	}

	public static move(x: number, y: number) {
		this.mousePosition.x = x;
		this.mousePosition.y = y;
		this.mouseStream.write(this.generateHIDMessage(x, y));
		SocketServer.emit(MouseMessage.MOUSE_POSITION, this.mousePosition);
	}
}
