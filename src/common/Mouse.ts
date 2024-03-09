import { SocketServer } from "./SocketServer";
import { Log } from "./Log";
import fs from 'fs';
import socketio from 'socket.io';
import { CommuniQi } from "../CommuniQi/CommuniQi";

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
	private static powerLastUsed: Date;

	public static async init() {
		this.mouseStream = fs.createWriteStream(MOUSE);
		Log.info(`Mouse initialized`);
	}

	private static generateHIDMessage(x: number, y: number): string {
		return `${String.fromCharCode(0)}${String.fromCharCode(x)}${String.fromCharCode(y)}`;
	}

	public static move(x: number, y: number) {
		if(!this.powerLastUsed || (new Date().getTime() - this.powerLastUsed.getTime()) > 3000) {
			this.powerLastUsed = undefined;
			const powerUsed = CommuniQi.usePower();
			if(!powerUsed) {
				return;
			}
			this.powerLastUsed = new Date();
			this.mousePosition.x = x;
			this.mousePosition.y = y;
			this.mouseStream.write(this.generateHIDMessage(x, y));
		} else if (new Date().getTime() - this.powerLastUsed.getTime() <= 3000) {
			this.mousePosition.x = x;
			this.mousePosition.y = y;
			this.mouseStream.write(this.generateHIDMessage(x, y));
		}
	}
}
