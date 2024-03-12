import { Log } from "../common/Log";
import { TwitchChatHandler } from "../common/TwitchChatHandler";
import * as tmi from "tmi.js";
import { YoutubeChatHandler } from "../common/YoutubeChatHandler";
import { Application } from "express";
import { SocketServer } from "../common/SocketServer";
import socketio from 'socket.io';

export enum CommuniQiPowerSource {
	TwitchChat,
	YouTubeChat,
	Regeneration
};

export interface CommuniQiPower {
	userName: string;
	source: CommuniQiPowerSource;
};

export class CommuniQi {
	private static communiQiPowerPool: CommuniQiPower[] = [];
	private static powerRegenerationInterval: NodeJS.Timeout;
	private static started: boolean = false;
	private static maxPowerPoolSize = 50;

	public static async init(app: Application) {
		Log.info("Initializing CommuniQi");

		app.post('/communi-qi/start', async (req, res) => {
			const { twitchChannelName, youtubeLiveId } = req.body as { twitchChannelName: string, youtubeLiveId: string};
			if(!twitchChannelName || !youtubeLiveId) {
				res.status(400).json({ message: `Invalid request` });
				return;
			}
			await TwitchChatHandler.startTwitchChat(twitchChannelName);
			await YoutubeChatHandler.startLiveChat(youtubeLiveId);
			await this.startCommuniQi();
			res.json({ message: `CommuniQi started` });
		});

		app.post('/communi-qi/stop', async (_, res) => {
			await TwitchChatHandler.stopTwitchChat();
			await YoutubeChatHandler.stopLiveChat();
			this.stopCommuniQi();
			res.json({ message: `CommuniQi stopped` });
		});
	}

	public static onClientConnected = (socket: socketio.Socket) => {
		socket.on('JOIN_ROOM', (room: string) => {
			if(room !== 'COMMUNI_QI') {
				return;
			}
			socket.join(room);
			socket.emit('COMMUNI_QI_POWER_POOL', this.communiQiPowerPool.length);
			socket.emit('COMMUNI_QI_STATUS', { started: this.started });
		});
	}

	private static startCommuniQi = async () => {
		TwitchChatHandler.getClient().on('message', this.handleTwitchChatMessage);
		YoutubeChatHandler.getLiveChat().on('chat', this.handleYoutubeChatMessage);

		this.powerRegenerationInterval = setInterval(this.regeneratePower, 5000);
		this.started = true;

		SocketServer.in('COMMUNI_QI').emit('COMMUNI_QI_POWER_POOL', this.communiQiPowerPool.length);
		SocketServer.in('COMMUNI_QI').emit('COMMUNI_QI_STATUS', { started: this.started });
	}

	private static stopCommuniQi = () => {
		TwitchChatHandler.getClient()?.removeListener('message', this.handleTwitchChatMessage);
		YoutubeChatHandler.getLiveChat()?.removeListener('chat', this.handleYoutubeChatMessage);

		clearInterval(this.powerRegenerationInterval);
		this.communiQiPowerPool = [];
		this.started = false;

		SocketServer.in('COMMUNI_QI').emit('COMMUNI_QI_POWER_POOL', this.communiQiPowerPool.length);
		SocketServer.in('COMMUNI_QI').emit('COMMUNI_QI_STATUS', { started: this.started });
	}

	private static detectHeartUnicodeEmojies = (message: string) => {
		//return message.match(/[\u2764-\u2764]|<3|\uD83D\uDC9B/g);
		return message.match(/\u2764|<3|\uD83D\uDC9B|z|y/g);
	}

	private static handleTwitchChatMessage = (channel: string, userstate: tmi.ChatUserstate, message: string, self: boolean) => {
		if(self || userstate.username === 'nightbot') return;

		Log.debug(`Twitch Chat: ${userstate.username}: ${message}`);

		const hearts = this.detectHeartUnicodeEmojies(message);
		if(hearts) {
			for(const _ of hearts) {
				this.addPower(userstate.username, CommuniQiPowerSource.TwitchChat);
			}
		}
	}

	private static handleYoutubeChatMessage = (chatItem: { displayName: string; message: string; }) => {
		Log.debug(`Youtube Chat: ${chatItem.displayName}: ${chatItem.message}`);

		const hearts = this.detectHeartUnicodeEmojies(chatItem.message);
		if(hearts) {
			for(const _ of hearts) {
				this.addPower(chatItem.displayName, CommuniQiPowerSource.YouTubeChat);
			}
		}
	}

	private static addPower = (userName: string, source: CommuniQiPowerSource) => {
		if(this.communiQiPowerPool.length >= this.maxPowerPoolSize) {
			return;
		}

		const communiQiPower = {
			userName,
			source
		};

		this.communiQiPowerPool.push(communiQiPower);

		Log.debug(`Adding power from ${CommuniQiPowerSource[source]}: ${userName}`);

		SocketServer.in('COMMUNIQI').emit('COMMUNI_QI_POWER_POOL', this.communiQiPowerPool.length);
	};

	private static regeneratePower = () => {
		if(this.communiQiPowerPool.length > 0) {
			return;
		}
		Log.debug("Regenerating power");

		this.addPower(Date.now().toString(), CommuniQiPowerSource.Regeneration);
	}

	public static usePower(): boolean {
		if(!this.started) {
			return true;
		}
		if(this.communiQiPowerPool.length > 0) {
			const communiQiPower = this.communiQiPowerPool.shift();
			Log.debug(`Using power from user: ${communiQiPower.userName} from source: ${communiQiPower.source}`);
			SocketServer.in('COMMUNIQI').emit('COMMUNI_QI_POWER_POOL', this.communiQiPowerPool.length);
			return true;
		}
		return false;
	}
}
