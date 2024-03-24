import { Log } from '../common/Log';
import struct from 'python-struct';
import { dgramServer } from '../common/dgramServer';
import { Keyboard } from '../common/Keyboard';
import { LiveLinkKeyBindings } from './LiveLinkKeyBindings';
import { RemoteInfo } from 'dgram';
import { SocketServer } from '../common/SocketServer';
import { KeyPressedMap } from '../common/SharedInterfaces';
import socketio from "socket.io";
import { Mouse } from '../common/Mouse';

export enum FaceBlendShape {
	EyeBlinkLeft = 0,
	EyeLookDownLeft = 1,
	EyeLookInLeft = 2,
	EyeLookOutLeft = 3,
	EyeLookUpLeft = 4,
	EyeSquintLeft = 5,
	EyeWideLeft = 6,
	EyeBlinkRight = 7,
	EyeLookDownRight = 8,
	EyeLookInRight = 9,
	EyeLookOutRight = 10,
	EyeLookUpRight = 11,
	EyeSquintRight = 12,
	EyeWideRight = 13,
	JawForward = 14,
	JawLeft = 15,
	JawRight = 16,
	JawOpen = 17,
	MouthClose = 18,
	MouthFunnel = 19,
	MouthPucker = 20,
	MouthLeft = 21,
	MouthRight = 22,
	MouthSmileLeft = 23,
	MouthSmileRight = 24,
	MouthFrownLeft = 25,
	MouthFrownRight = 26,
	MouthDimpleLeft = 27,
	MouthDimpleRight = 28,
	MouthStretchLeft = 29,
	MouthStretchRight = 30,
	MouthRollLower = 31,
	MouthRollUpper = 32,
	MouthShrugLower = 33,
	MouthShrugUpper = 34,
	MouthPressLeft = 35,
	MouthPressRight = 36,
	MouthLowerDownLeft = 37,
	MouthLowerDownRight = 38,
	MouthUpperUpLeft = 39,
	MouthUpperUpRight = 40,
	BrowDownLeft = 41,
	BrowDownRight = 42,
	BrowInnerUp = 43,
	BrowOuterUpLeft = 44,
	BrowOuterUpRight = 45,
	CheekPuff = 46,
	CheekSquintLeft = 47,
	CheekSquintRight = 48,
	NoseSneerLeft = 49,
	NoseSneerRight = 50,
	TongueOut = 51,
	HeadYaw = 52,
	HeadPitch = 53,
	HeadRoll = 54,
	LeftEyeYaw = 55,
	LeftEyePitch = 56,
	LeftEyeRoll = 57,
	RightEyeYaw = 58,
	RightEyePitch = 59,
	RightEyeRoll = 60
};

export interface LiveLinkData {
	uuid: string;
	name: string;
	fps: number;
	version: number;
	frameNumber: number;
	subFrame: number;
	denominator: number;
	blendShapes: number[];
};

export class LiveLinkReceiver {
	private static keysPressedCache: KeyPressedMap = {} as KeyPressedMap;
	private static lastFrameNumber: number = 0;
	private static freeLook: boolean = false;
	private static lastMousePosition: { x: number, y: number } = { x: 0, y: 0 };
	private static freeLookSensivity: number = 50;

	public static init() {
		Log.info("Initializing Live Link Face Receiver");

		const serverSocket = dgramServer.init();

		serverSocket.on('message', this.handleFaceLinkMessage);
	}

	private static moveMouse = (data: { x: number, y: number }) => {
		Mouse.move(data.x * 100, data.y * 100);
	}

	public static onClientConnected = (socket: socketio.Socket) => {
		socket.on('JOIN_ROOM', (room: string) => {
			if(room !== 'LIVE_LINK') {
				return;
			}
			socket.join(room);
			socket.emit('LIVE_LINK_FREE_LOOK', this.freeLook);
		});

		socket.on('LIVE_LINK_TEST_MOVE_MOUSE', this.moveMouse);
		socket.on('LIVE_LINK_FREE_LOOK', (freeLook: boolean) => {
			Log.info(`Free look: ${freeLook}`);
			this.freeLook = freeLook;
			SocketServer.in('LIVE_LINK').emit('LIVE_LINK_FREE_LOOK', freeLook);
		});
	}

	private static handleFaceLinkMessage = (message: Buffer, remote: RemoteInfo) => {
		try {
			const liveLinkData = LiveLinkReceiver.decode(message);

			if(liveLinkData) {
				if(liveLinkData.frameNumber > this.lastFrameNumber) {
					this.lastFrameNumber = liveLinkData.frameNumber;

					SocketServer.in('LIVE_LINK').emit('LIVE_LINK_DATA', liveLinkData);

					const keyBindings = LiveLinkKeyBindings.getBindings();

					for(const key in this.keysPressedCache) {
						if(this.keysPressedCache[key]) {
							const keyBinding = keyBindings.find(keyBinding => keyBinding.keyCode === key);
							if(keyBinding) {
								const { faceBlendShape, maxThreshold, minThreshold } = keyBinding;
								if(liveLinkData.blendShapes[FaceBlendShape[faceBlendShape as keyof typeof FaceBlendShape]] < minThreshold || liveLinkData.blendShapes[FaceBlendShape[faceBlendShape as keyof typeof FaceBlendShape]] > maxThreshold) {
									this.keyUp(key);
								}
							}
						}
					}

					for(const keyBinding of keyBindings) {
						const { faceBlendShape, keyCode, maxThreshold, minThreshold } = keyBinding;
						if(liveLinkData.blendShapes[FaceBlendShape[faceBlendShape as keyof typeof FaceBlendShape]] >= minThreshold && liveLinkData.blendShapes[FaceBlendShape[faceBlendShape as keyof typeof FaceBlendShape]] <= maxThreshold) {
							this.keyDown(keyCode);
						}
					}

					const x = -liveLinkData.blendShapes[FaceBlendShape.HeadYaw];
					const y = -liveLinkData.blendShapes[FaceBlendShape.HeadPitch];

					if(!this.freeLook) {
						if(x < -0.2 || x > 0.2 || y < -0.2 || y > 0.2) {
							this.moveMouse({ x, y });
						};
					} else {
						if(x < -0.1 || x > 0.1 || y < -0.1 || y > 0.1) {
							const { x: lastX, y: lastY } = this.lastMousePosition;
							const deltaX = x - lastX;
							const deltaY = y - lastY;
							this.moveMouse({ x: deltaX * this.freeLookSensivity, y: deltaY * this.freeLookSensivity });
							this.lastMousePosition = { x, y };
						} else {
							this.lastMousePosition = { x: 0, y: 0 };
						}
					}
				}
			} else {
				if(Object.keys(this.keysPressedCache).length > 0) {
					this.clearAllKeys();
				}
				if(this.lastFrameNumber !== 0) {
					this.lastFrameNumber = 0;
					SocketServer.in('LIVE_LINK').emit('LIVE_LINK_DATA', undefined);
				}
			}
		} catch (error) {
			Log.error(`Error occured: ${error}`);
		}
	}

	public static clearAllKeys() {
		const keysPressed = Object.keys(this.keysPressedCache).filter(key => this.keysPressedCache[key]);
		if(keysPressed.length > 0) {
			this.keysPressedCache = {} as KeyPressedMap;
			Keyboard.release(keysPressed);
		}
	}

	public static keyDown(code: string) {
		if(!this.keysPressedCache[code]) {
			this.keysPressedCache[code] = true;
			const keysPressed = Object.keys(this.keysPressedCache).filter(code => this.keysPressedCache[code]);
			Keyboard.press(keysPressed);
		}
	}

	public static keyUp(code: string) {
		if(this.keysPressedCache[code]) {
			this.keysPressedCache[code] = undefined;
			Keyboard.release([code]);
		}
	}

	public static decode(bytesData: Uint8Array): LiveLinkData {
		const version = struct.unpack('<i', Buffer.from(bytesData.slice(0, 4)))[0];
		const uuid = new TextDecoder().decode(bytesData.slice(4, 41));
		const nameLength = struct.unpack('!i', Buffer.from(bytesData.slice(41, 45)))[0];
		const nameEndPos = 45 + (nameLength as number);
		const name = new TextDecoder().decode(bytesData.slice(45, nameEndPos));

		if(bytesData.length > nameEndPos + 17) {
			const [ frameNumber, subFrame, fps, denominator, dataLength ] = struct.unpack(
				"!if2ib",
				Buffer.from(bytesData.slice(nameEndPos, nameEndPos + 17))
			);

			if(dataLength !== 61) {
				throw new Error(`Blend shape length is ${dataLength} but should be 61.`);
			}

			const data = struct.unpack("!61f", Buffer.from(bytesData.slice(nameEndPos + 17))); 

			return {
				uuid,
				name,
				fps: fps as number,
				version: version as number,
				frameNumber: frameNumber as number,
				subFrame: subFrame as number,
				denominator: denominator as number,
				blendShapes: data as number[]
			}
		}
	}
}
