import { Keyboard } from "../common/Keyboard";
import { Log } from "../common/Log";
import { KeyPressedMap } from "../common/SharedInterfaces";
import socketio from "socket.io";
import { AudioCommand, AudioKeyBinding, AudioKeyBindings } from "./AudioKeyBindings";

export interface DrumAudioData {
	hit: string;
};

export class DrumAudioReceiver {
	private static keysPressedCache: KeyPressedMap = {};
	private static drumAudioData: DrumAudioData;

	public static init() {
		Log.info("Initializing Drum Audio Receiver");
	}

	public static onClientConnected = (socket: socketio.Socket) => {
		socket.on('DRUM_AUDIO_DATA', this.handleAudioData);
	}

	public static onClientDisconnected = (_: socketio.Socket) => {
		this.clearAllKeys();
	}

	private static handleAudioData = (drumAudioData: DrumAudioData) => {
		Log.debug(`Received audio data: ${JSON.stringify(drumAudioData)}`);

		this.drumAudioData = drumAudioData;

		if(!this.drumAudioData) {
			this.clearAllKeys();
			return;
		}

		const keyBindings: Array<AudioKeyBinding> = AudioKeyBindings.getBindings();

		if(drumAudioData.hit) {
			const clapMappings = keyBindings.filter(keyBinding => keyBinding.command === AudioCommand.DRUM_HIT);
			if(clapMappings.length > 0) {
				for(const keyBinding of clapMappings) {
					this.keyDown(keyBinding.keyCode);
				}
			}
		} else {
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
