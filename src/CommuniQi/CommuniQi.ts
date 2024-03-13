import { Log } from "../common/Log";
import { TwitchChatHandler } from "../common/TwitchChatHandler";
import * as tmi from "tmi.js";
import { YoutubeChatHandler } from "../common/YoutubeChatHandler";
import { Application } from "express";
import { SocketServer } from "../common/SocketServer";
import socketio from 'socket.io';

export const CommuniQiHearts = ['❤️', '💛', '💚', '💙', '💜', '🖤', '🤎', '🤍', '<3', 'e'];
const regex = new RegExp(CommuniQiHearts.map(heart => `\\${heart}`).join('|'), 'g');

export enum CommuniQiPowerSource {
	TwitchChat,
	YouTubeChat,
	Regeneration
};

export interface CommuniQiPower {
	userName: string;
	heart: string;
	source: CommuniQiPowerSource;
};

export class CommuniQi {
	private static communiQiPowerPool: CommuniQiPower[] = [];
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
			socket.emit('COMMUNI_QI_POWER_POOL', this.communiQiPowerPool);
			socket.emit('COMMUNI_QI_STATUS', { started: this.started });
		});
	}

	private static startCommuniQi = async () => {
		TwitchChatHandler.getClient().on('message', this.handleTwitchChatMessage);
		YoutubeChatHandler.getLiveChat().on('chat', this.handleYoutubeChatMessage);

		this.started = true;

		SocketServer.in('COMMUNI_QI').emit('COMMUNI_QI_POWER_POOL', this.communiQiPowerPool);
		SocketServer.in('COMMUNI_QI').emit('COMMUNI_QI_STATUS', { started: this.started, maxPowerPoolSize: this.maxPowerPoolSize });
	}

	private static stopCommuniQi = () => {
		TwitchChatHandler.getClient()?.removeListener('message', this.handleTwitchChatMessage);
		YoutubeChatHandler.getLiveChat()?.removeListener('chat', this.handleYoutubeChatMessage);

		this.communiQiPowerPool = [];
		this.started = false;

		SocketServer.in('COMMUNI_QI').emit('COMMUNI_QI_POWER_POOL', this.communiQiPowerPool);
		SocketServer.in('COMMUNI_QI').emit('COMMUNI_QI_STATUS', { started: this.started });
	}

	private static detectHeartUnicodeEmojies = (message: string) => {
		const matches = message.match(regex);
		return matches;
	}

	private static handleTwitchChatMessage = (channel: string, userstate: tmi.ChatUserstate, message: string, self: boolean) => {
		if(self || userstate.username === 'nightbot') return;

		Log.debug(`Twitch Chat: ${userstate.username}: ${message}`);

		const hearts = this.detectHeartUnicodeEmojies(message);
		if(hearts) {
			this.addPower(userstate.username, hearts[0] === 'e' ? CommuniQiHearts[0] : hearts[0], CommuniQiPowerSource.TwitchChat);
		}
	}

	private static handleYoutubeChatMessage = (chatItem: { displayName: string; message: string; }) => {
		Log.debug(`Youtube Chat: ${chatItem.displayName}: ${chatItem.message}`);

		const hearts = this.detectHeartUnicodeEmojies(chatItem.message);
		if(hearts) {
			this.addPower(chatItem.displayName, hearts[0] === 'e' ? CommuniQiHearts[0] : hearts[0], CommuniQiPowerSource.YouTubeChat);
		}
	}

	private static addPower = (userName: string, heart: string, source: CommuniQiPowerSource) => {
		if(this.communiQiPowerPool.length >= this.maxPowerPoolSize) {
			return;
		}

		const communiQiPower: CommuniQiPower = {
			userName,
			heart,
			source
		};

		this.communiQiPowerPool.push(communiQiPower);

		Log.debug(`Adding power from ${CommuniQiPowerSource[source]}: ${userName}`);

		SocketServer.in('COMMUNI_QI').emit('COMMUNI_QI_POWER_POOL', this.communiQiPowerPool);

		if(this.communiQiPowerPool.length >= this.maxPowerPoolSize) {
			this.communiQiPowerPool = [];
			SocketServer.in('COMMUNI_QI').emit('COMMUNI_QI_POWER_POOL_EXPLODED');
			SocketServer.in('COMMUNI_QI').emit('COMMUNI_QI_POWER_POOL', this.communiQiPowerPool);
		}
	};

	public static usePower = (howMuch: number) => {
		if(this.communiQiPowerPool.length > 0) {
			for(let i = 0; i < howMuch; i++) {
				this.communiQiPowerPool.shift();
			}
			SocketServer.in('COMMUNI_QI').emit('COMMUNI_QI_POWER_POOL', this.communiQiPowerPool);
		}
	}
}
