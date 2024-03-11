import { Log } from "./Log";
import fs from 'fs';
import { CommuniQi } from "../CommuniQi/CommuniQi";

export enum MouseMessage {
	MOUSE_POSITION = 'MOUSE_POSITION'
};

export interface MousePosition {
	x: number;
	y: number;
};

const hidMouseXMax = 127;
const hidMouseYMax = 127;
const hidMouseXMin = -127;
const hidMouseYMin = -127;

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
		x = Math.round(x);
		y = Math.round(y);

		if(x > hidMouseXMax) {
			x = hidMouseXMax;
		} else if(x < hidMouseXMin) {
			x = hidMouseXMin;
		}

		if(y > hidMouseYMax) {
			y = hidMouseYMax;
		} else if(y < hidMouseYMin) {
			y = hidMouseYMin;
		}

		if(x === -0) {
			x = 0;
		}

		if(y === -0) {
			y = 0;
		}

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
