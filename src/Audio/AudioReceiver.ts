import { Keyboard } from "../common/Keyboard";
import { Log } from "../common/Log";
import { KeyPressedMap } from "../common/SharedInterfaces";
import socketio from "socket.io";
import { AudioKeyBinding, AudioKeyBindings } from "./AudioKeyBindings";

export interface AudioData {
	key: string;
	octave: number;
	clapped: boolean;
};

export class AudioReceiver {
	private static keysPressedCache: KeyPressedMap = {};
	private static audioData: AudioData;

	public static init() {
		Log.info("Initializing Audio Receiver");
	}

	public static onClientConnected = (socket: socketio.Socket) => {
		Log.info(`Client connected: ${socket.id}`);
		socket.on('AUDIO_DATA', this.handleAudioData);
	}

	public static onClientDisconnected = (socket: socketio.Socket) => {
		Log.info(`Client disconnected: ${socket.id}`);
		this.clearAllKeys();
	}

	private static handleAudioData = (audioData: AudioData) => {
		Log.debug(`Received audio data: ${JSON.stringify(audioData)}`);

		this.audioData = audioData;

		if(!this.audioData) {
			this.clearAllKeys();
			return;
		}

		const keyBindings: Array<AudioKeyBinding> = AudioKeyBindings.getBindings();

		for(const keyBinding of keyBindings) {
			const { audioCommand, keyCode } = keyBinding;
			if(audioData.key === audioCommand) {
				this.keyDown(keyCode);
			}
		}

		if(audioData.clapped) {
			const clapMappings = keyBindings.filter(keyBinding => keyBinding.audioCommand === 'CLAP');
			if(clapMappings.length > 0) {
				for(const keyBinding of clapMappings) {
					this.keyDown(keyBinding.keyCode);
				}
			}
		}

		if(audioData.key === 'NONE') {
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
