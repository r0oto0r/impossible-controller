import { Keyboard } from "../common/Keyboard";
import { LeapHandControllerInput, LeapHandType } from "../common/LeapInterfaces";
import { Log } from "../common/Log";
import { KeyPressedMap } from "../common/SharedInterfaces";
import socketio from "socket.io";
import { LeapCommand, LeapKeyBindings } from "./LeapKeyBindings";

export class LeapReceiver {
	private static keysPressedCache: KeyPressedMap = {};
	public static async init() {
		Log.info("Initializing Leap Receiver");
	}

	public static onClientConnected = (socket: socketio.Socket) => {
		socket.on('LEAP_DATA', this.handleLeapData);
	}

	public static onClientDisconnected = (_: socketio.Socket) => {
		this.clearAllKeys();
	}

	private static handleLeapData = (leapData: LeapHandControllerInput) => {
		Log.debug(`Received leap data: ${JSON.stringify(leapData)}`);

		if(!leapData) {
			this.clearAllKeys();
			return;
		}

		const keyBindings = LeapKeyBindings.getBindings();

		if(!leapData.leftHandClosed && !leapData.rightHandClosed) {
			keyBindings.filter(keyBinding => keyBinding.command === LeapCommand.BothHandsClosed).forEach(keyBinding => this.keyUp(keyBinding.keyCode));
		} else {
			keyBindings.filter(keyBinding => keyBinding.command === LeapCommand.BothHandsClosed).forEach(keyBinding => this.keyDown(keyBinding.keyCode));
		}

		if(!leapData.leftHandClosed) {
			keyBindings.filter(keyBinding => keyBinding.command === LeapCommand.LeftHandClosed).forEach(keyBinding => this.keyUp(keyBinding.keyCode));
		} else {
			keyBindings.filter(keyBinding => keyBinding.command === LeapCommand.LeftHandClosed).forEach(keyBinding => this.keyDown(keyBinding.keyCode));
		}

		if(!leapData.rightHandClosed) {
			keyBindings.filter(keyBinding => keyBinding.command === LeapCommand.RightHandClosed).forEach(keyBinding => this.keyUp(keyBinding.keyCode));
		} else {
			keyBindings.filter(keyBinding => keyBinding.command === LeapCommand.RightHandClosed).forEach(keyBinding => this.keyDown(keyBinding.keyCode));
		}

		if(!leapData.handsTouch) {
			keyBindings.filter(keyBinding => keyBinding.command === LeapCommand.HandsTouch).forEach(keyBinding => this.keyUp(keyBinding.keyCode));
		} else {
			keyBindings.filter(keyBinding => keyBinding.command === LeapCommand.HandsTouch).forEach(keyBinding => this.keyDown(keyBinding.keyCode));
		}

		if(leapData.barTouchedLastHand === undefined || leapData.barTouchedLastHand === LeapHandType.RIGHT) {
			keyBindings.filter(keyBinding => keyBinding.command === LeapCommand.BarTouchedLeft).forEach(keyBinding => this.keyUp(keyBinding.keyCode));
		} else {
			keyBindings.filter(keyBinding => keyBinding.command === LeapCommand.BarTouchedLeft).forEach(keyBinding => this.keyDown(keyBinding.keyCode));
		}

		if(leapData.barTouchedLastHand === undefined || leapData.barTouchedLastHand === LeapHandType.LEFT) {
			keyBindings.filter(keyBinding => keyBinding.command === LeapCommand.BarTouchedRight).forEach(keyBinding => this.keyUp(keyBinding.keyCode));
		} else {
			keyBindings.filter(keyBinding => keyBinding.command === LeapCommand.BarTouchedRight).forEach(keyBinding => this.keyDown(keyBinding.keyCode));
		}

		if(!leapData.leftHandAboveBar) {
			keyBindings.filter(keyBinding => keyBinding.command === LeapCommand.LeftHandAboveBar).forEach(keyBinding => this.keyUp(keyBinding.keyCode));
		} else {
			keyBindings.filter(keyBinding => keyBinding.command === LeapCommand.LeftHandAboveBar).forEach(keyBinding => this.keyDown(keyBinding.keyCode));
		}

		if(!leapData.rightHandAboveBar) {
			keyBindings.filter(keyBinding => keyBinding.command === LeapCommand.RightHandAboveBar).forEach(keyBinding => this.keyUp(keyBinding.keyCode));
		} else {
			keyBindings.filter(keyBinding => keyBinding.command === LeapCommand.RightHandAboveBar).forEach(keyBinding => this.keyDown(keyBinding.keyCode));
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
