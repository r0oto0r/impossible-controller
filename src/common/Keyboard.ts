import fs, { WriteStream } from 'fs';
import { CLEAR_ALL, HIDKeyMap, HIDModKeyMap, MAX_HID_MESSAGE_LENGTH_WITHOUT_HEADER } from './HIDKeyMap';
import { HIDKeys } from './HIDKeys';
import { Log } from './Log';
import { KeyPressedMap } from './SharedInterfaces';
import { SocketServer } from './SocketServer';
import socketio from 'socket.io';

const KEYBOARD = process.env.PROD ? '/dev/hidg0' : '/dev/null';

export enum KeyboardMessage {
	KEYS_PRESSED = 'KEYS_PRESSED',
	CLEAR_KEYS = 'CLEAR_KEYS'
};

export class Keyboard {
	private static keyboardStream: WriteStream;
	private static keysPressedCache: KeyPressedMap = {} as KeyPressedMap;

	public static async init() {
		Keyboard.keyboardStream = fs.createWriteStream(KEYBOARD);
		Log.info(`Keyboard initialized`);
	}

	public static onClientConnected = (socket: socketio.Socket) => {
		socket.emit(KeyboardMessage.KEYS_PRESSED, Object.keys(Keyboard.keysPressedCache).filter(key => Keyboard.keysPressedCache[key]));
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
		const keysPressed = Object.keys(Keyboard.keysPressedCache).filter(key => Keyboard.keysPressedCache[key]);
		const yetToPress = keys.filter(key => !keysPressed.includes(key));
		if(yetToPress.length > 0) {
			yetToPress.forEach(key => Keyboard.keysPressedCache[key] = true);
			try {
				const HIDMessage = Keyboard.generateHIDMessage(yetToPress);
				Keyboard.keyboardStream.write(HIDMessage);
				SocketServer.emit(KeyboardMessage.KEYS_PRESSED, Object.keys(Keyboard.keysPressedCache).filter(key => Keyboard.keysPressedCache[key]));
			} catch (error) {
				Log.error(`Error occured: ${error}`);
			}
		}
	}

	public static release(keys: Array<string>) {
		const keysPressed = Object.keys(Keyboard.keysPressedCache).filter(key => Keyboard.keysPressedCache[key]);
		const yetToRelease = keys.filter(key => keysPressed.includes(key));
		if(yetToRelease.length > 0) {
			try {
				Keyboard.keyboardStream.write(CLEAR_ALL);
				yetToRelease.forEach(key => Keyboard.keysPressedCache[key] = false);
				const keysStillPressed = Object.keys(Keyboard.keysPressedCache).filter(key => Keyboard.keysPressedCache[key]);
				if(keysStillPressed.length > 0) { 
					const HIDMessage = Keyboard.generateHIDMessage(yetToRelease);
					Keyboard.keyboardStream.write(HIDMessage);
					SocketServer.emit(KeyboardMessage.KEYS_PRESSED, Object.keys(Keyboard.keysPressedCache).filter(key => Keyboard.keysPressedCache[key]));
				}
			} catch (error) {
				Log.error(`Error occured: ${error}`);
			}
		}
	}

	public static keysPressed() {
		return Object.keys(Keyboard.keysPressedCache).filter(key => Keyboard.keysPressedCache[key]);
	}
}
