import fs, { WriteStream } from 'fs';
import { CLEAR_ALL, HIDKeyMap, HIDModKeyMap, MAX_HID_MESSAGE_LENGTH_WITHOUT_HEADER } from './HIDKeyMap';
import { HIDKeys } from './HIDKeys';
import { Log } from './Log';
import { SocketServer } from './SocketServer';

const KEYBOARD = process.env.PROD ? '/dev/hidg0' : '/dev/null';

export enum KeyboardMessage {
	KEYS_PRESSED = 'KEYS_PRESSED',
	CLEAR_KEYS = 'CLEAR_KEYS'
};

export class Keyboard {
	private static keyboardStream: WriteStream;

	public static async init() {
		Keyboard.keyboardStream = fs.createWriteStream(KEYBOARD);
		Log.info(`Keyboard initialized`);
	}

	public static initSocketClient(socketId: string) {
		SocketServer.onClient(socketId, KeyboardMessage.KEYS_PRESSED, (keysPressed: Array<string>) => {
			Log.debug(KeyboardMessage.KEYS_PRESSED);
			Log.debug(keysPressed);
			Keyboard.press(keysPressed);
		});

		SocketServer.onClient(socketId, KeyboardMessage.CLEAR_KEYS, () => {
			Log.debug(KeyboardMessage.CLEAR_KEYS);
			Keyboard.release();
		});

		SocketServer.onClient(socketId, 'disconnect', () => {
			Log.info(`${socketId} disconnected`);
			Keyboard.release();
		});
	}

	private static generateHIDMessage(keys: Array<string>): string {
		let HIDMessage = '';
		let modifiers = 0;
		let payloadLength = 0;

		for(let i = 0; i < keys.length; ++i) {
			const key = keys[i];
			const modKey = HIDModKeyMap[key];
			if(modKey) {
				modifiers = modifiers ^ modKey;
			} else {
				const normalKey = HIDKeyMap[key];
				if(normalKey && payloadLength < MAX_HID_MESSAGE_LENGTH_WITHOUT_HEADER) {
					payloadLength = payloadLength + 1;
					HIDMessage = `${HIDMessage}${normalKey}`;
				}
			}
		}

		while(payloadLength < MAX_HID_MESSAGE_LENGTH_WITHOUT_HEADER) {
			++payloadLength
			HIDMessage = `${HIDMessage}${HIDKeys.KEY_NONE}`;
		}

		return `${String.fromCharCode(modifiers)}${HIDKeys.KEY_NONE}${HIDMessage}`;
	}

	public static press(keys: Array<string>) {
		const HIDMessage = Keyboard.generateHIDMessage(keys);
		Keyboard.keyboardStream.write(HIDMessage);
	}

	public static release() {
		Keyboard.keyboardStream.write(CLEAR_ALL);
	}
}
