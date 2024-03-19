import EventEmitter from "node:events";
import { Log } from "./Log";
import { SocketClient } from "./SocketClient";

export enum ChatMessageSource {
	TWITCH,
	YOUTUBE
}

export interface TwitchSpecialPayload {
	emotes: string,
	uuid: string,
	mod: boolean,
	subscriber: boolean
}

export interface YoutubeSpecialPayload {
	uuid: string;
	mod: boolean;
}

export interface XX_PING {
	id: number;
	tick: number;
};

export enum SocketEvents {
	AC_PING = 'AC_PING',
	CA_PONG = 'CA_PONG',
	AC_CHAT_MESSAGE_FULL = 'chatMessage',
	CA_JOIN_CHAT = 'subscribeChatMessages'
};

export interface PublicMessageObject {
	uuid: string;
	source: ChatMessageSource;
	dateFrom: Date;
	message: string;
	user: string;
	userIdentifier: string;
	specialPayload: TwitchSpecialPayload | YoutubeSpecialPayload;
	supporterLevel?: number;
};

export class WebsiteChatHandler {
	private static socketClient: SocketClient;
	private static eventEmitter = new EventEmitter();

	public static async init() {
		Log.info(`Initializing Website API Handler`);
		this.socketClient = new SocketClient('https://api.rocketbeans.tv');
	}

	private static onClientPing = (data: XX_PING) => {
		this.socketClient.emit(SocketEvents.CA_PONG, data);
	}

	private static processChatMessage = (data: PublicMessageObject) => {
		this.eventEmitter.emit(SocketEvents.AC_CHAT_MESSAGE_FULL, data);
	}

	public static startWebsiteChat = () => {
		if(this.socketClient.isConnected) {
			this.socketClient.disconnectFromServer();
		}
		Log.info(`Starting website chat`);
		this.socketClient.connectToServer();

		this.socketClient.on(SocketEvents.AC_PING, this.onClientPing);
		this.socketClient.on(SocketEvents.AC_CHAT_MESSAGE_FULL, this.processChatMessage);

		this.socketClient.on('connect', () => {
			this.socketClient.emit(SocketEvents.CA_JOIN_CHAT, { allChannels: true });
		});
	}

	public static stopWebsiteChat = () => {
		Log.info(`Stopping website chat`);
		this.socketClient.disconnectFromServer();
	}

	public static getLiveChat = () => {
		return this.eventEmitter;
	}
}
