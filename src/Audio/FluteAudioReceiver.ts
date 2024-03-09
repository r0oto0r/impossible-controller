import { Keyboard } from "../common/Keyboard";
import { Log } from "../common/Log";
import { KeyPressedMap } from "../common/SharedInterfaces";
import socketio from "socket.io";
import { AudioKeyBinding, AudioKeyBindings } from "./AudioKeyBindings";

export interface FluteAudioData {
	key: string;
	octave: number;
};

export class FluteAudioReceiver {
	private static keysPressedCache: KeyPressedMap = {};
	private static fluteAudioData: FluteAudioData;

	public static init() {
		Log.info("Initializing Flute Audio Receiver");
	}

	public static onClientConnected = (socket: socketio.Socket) => {
		socket.on('FLUTE_AUDIO_DATA', this.handleAudioData);
	}

	public static onClientDisconnected = (_: socketio.Socket) => {
		this.clearAllKeys();
	}

	private static handleAudioData = (fluteAudioData: FluteAudioData) => {
		Log.debug(`Received audio data: ${JSON.stringify(fluteAudioData)}`);

		const sameKey = this.fluteAudioData && this.fluteAudioData.key === fluteAudioData.key;
		this.fluteAudioData = fluteAudioData;

		if(!this.fluteAudioData) {
			this.clearAllKeys();
			return;
		}

		const keyBindings: Array<AudioKeyBinding> = AudioKeyBindings.getBindings();

		for(const keyBinding of keyBindings) {
			const { command, keyCode } = keyBinding;
			if(fluteAudioData.key === command) {
				this.keyDown(keyCode);
			}
		}

		if(fluteAudioData.key === 'NONE' && !sameKey) {
			this.clearAllKeys();
		}
	}

	public static clearAllKeys() {
		const keysPressed = Object.keys(this.keysPressedCache).filter(key => this.keysPressedCache[key]);
		if(keysPressed.length > 0) {
			Log.debug(`Clearing all keys.`);
			this.keysPressedCache = {} as KeyPressedMap;
			Keyboard.release(keysPressed);
		}
	}

	public static keyDown(code: string) {
		if(!this.keysPressedCache[code]) {
			Log.debug(`Web key code ${code} pressed.`);
			this.keysPressedCache[code] = true;
			const keysPressed = Object.keys(this.keysPressedCache).filter(code => this.keysPressedCache[code]);
			Keyboard.press(keysPressed);
		}
	}

	public static keyUp(code: string) {
		if(this.keysPressedCache[code]) {
			Log.debug(`Web key code ${code} released.`);
			this.keysPressedCache[code] = undefined;
			Keyboard.release([code]);
		}
	}
}
