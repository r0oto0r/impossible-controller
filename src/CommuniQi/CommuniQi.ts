import { Log } from "../common/Log";
import { TwitchChatHandler } from "../common/TwitchChatHandler";
import * as tmi from "tmi.js";
import { YoutubeChatHandler } from "../common/YoutubeChatHandler";
import { Application } from "express";
import { SocketServer } from "../common/SocketServer";
import socketio from 'socket.io';
import { WebsiteChatHandler } from "../common/WebsiteChatHandler";

export const CommonHeartWaveCandidates = ['❤️', '💛', '💚', '💙', '💜', '🖤', '🤎', '🤍', '💖', '💗', '💘', '💝', '💞', '💟', '❣️', '<3', 'e', 'n']
export const TwitchHeartWaveCandidates = [':rbtvLovenado:', ':TransgenderPride:', ':PansexualPride:', ':NonbinaryPride:', ':LesbianPride:', ':IntersexPride:', ':GenderFluidPride:', ':GayPride:', ':BisexualPride:', ':AsexualPride:', ':VirtualHug:', ':TwitchUnity:', ':bleedPurple:'];
export const YoutTubeHeartWaveCandidates = [':thanksdoc:', ':virtualhug:'];
export const CommuniQiHearts = CommonHeartWaveCandidates.concat(TwitchHeartWaveCandidates).concat(YoutTubeHeartWaveCandidates);
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
	private static useRBTVWebsiteChat = false;
	private static communiQiPowerPool: CommuniQiPower[] = [];
	private static started: boolean = false;
	private static maxPowerPoolSize = 50;

	public static async init(app: Application) {
		Log.info("Initializing CommuniQi");

		app.post('/communi-qi/start', async (req, res) => {
			const { twitchChannelName, youtubeLiveId, useRBTVWebsiteChat } = req.body as { twitchChannelName: string, youtubeLiveId: string, useRBTVWebsiteChat: boolean};
			this.useRBTVWebsiteChat = useRBTVWebsiteChat;
			if(!this.useRBTVWebsiteChat && (!twitchChannelName || !youtubeLiveId)) {
				res.status(400).json({ message: `Missing twitchChannelName or youtubeLiveId` });
				return;
			}
			if(this.useRBTVWebsiteChat) {
				WebsiteChatHandler.startWebsiteChat();
			} else {
				TwitchChatHandler.startTwitchChat(twitchChannelName);
				await YoutubeChatHandler.startLiveChat(youtubeLiveId);
			}
			this.startCommuniQi();

			res.json({ message: `CommuniQi started` });
		});

		app.post('/communi-qi/stop', async (_, res) => {
			this.stopCommuniQi();

			if(this.useRBTVWebsiteChat) {
				WebsiteChatHandler.stopWebsiteChat();
			} else {
				TwitchChatHandler.stopTwitchChat();
				YoutubeChatHandler.stopLiveChat();
			}
			this.useRBTVWebsiteChat = false;

			res.json({ message: `CommuniQi stopped` });
		});
	}

	private static makeQmmuniQiStatus = () => {
		return {
			started: this.started,
			maxPowerPoolSize: this.maxPowerPoolSize,
			useRBTVWebsiteChat: this.useRBTVWebsiteChat
		};
	}

	public static onClientConnected = (socket: socketio.Socket) => {
		socket.on('JOIN_ROOM', (room: string) => {
			if(room !== 'COMMUNI_QI') {
				return;
			}
			socket.join(room);
			socket.emit('COMMUNI_QI_POWER_POOL', this.communiQiPowerPool);
			socket.emit('COMMUNI_QI_STATUS', this.makeQmmuniQiStatus());
		});
	}

	private static startCommuniQi = () => {
		if(this.useRBTVWebsiteChat) {
			Log.info(`Starting CommuniQi with RBTV Website Chat`);
			WebsiteChatHandler.getLiveChat().on('chatMessage', this.handleWebsiteChatMessage);
		} else {
			Log.info(`Starting CommuniQi with Twitch and YouTube Chat`);
			TwitchChatHandler.getClient().on('message', this.handleTwitchChatMessage);
			YoutubeChatHandler.getLiveChat().on('chat', this.handleYoutubeChatMessage);
		}

		this.started = true;

		SocketServer.in('COMMUNI_QI').emit('COMMUNI_QI_POWER_POOL', this.communiQiPowerPool);
		SocketServer.in('COMMUNI_QI').emit('COMMUNI_QI_STATUS', this.makeQmmuniQiStatus());
	}

	private static stopCommuniQi = () => {
		if(this.useRBTVWebsiteChat) {
			WebsiteChatHandler.getLiveChat().removeListener('chatMessage', this.handleWebsiteChatMessage);
		} else {
			TwitchChatHandler.getClient()?.removeListener('message', this.handleTwitchChatMessage);
			YoutubeChatHandler.getLiveChat()?.removeListener('chat', this.handleYoutubeChatMessage);
		}

		this.communiQiPowerPool = [];
		this.started = false;

		SocketServer.in('COMMUNI_QI').emit('COMMUNI_QI_POWER_POOL', this.communiQiPowerPool);
		SocketServer.in('COMMUNI_QI').emit('COMMUNI_QI_STATUS', this.makeQmmuniQiStatus());
	}

	private static detectHeartUnicodeEmojies = (message: string) => {
		const matches = message.match(regex);
		return matches;
	}

	private static handleTwitchChatMessage = (channel: string, userstate: tmi.ChatUserstate, message: string, self: boolean) => {
		if(self || userstate.username === 'Nightbot' || userstate.username === 'nightbot') return;

		const hearts = this.detectHeartUnicodeEmojies(message);
		if(hearts) {
			this.addPower(userstate.username, hearts[0], CommuniQiPowerSource.TwitchChat);
		}
	}

	private static handleYoutubeChatMessage = (chatItem: { displayName: string; message: string; }) => {
		if(chatItem.displayName === 'Nightbot' || chatItem.displayName === 'nichtbot') return;

		const hearts = this.detectHeartUnicodeEmojies(chatItem.message);
		if(hearts) {
			this.addPower(chatItem.displayName, hearts[0], CommuniQiPowerSource.YouTubeChat);
		}
	}

	private static handleWebsiteChatMessage = (chatItem: { displayName: string; message: string; }) => {
		if(chatItem.displayName === 'Nightbot' || chatItem.displayName === 'nichtbot') return;

		const hearts = this.detectHeartUnicodeEmojies(chatItem.message);
		if(hearts) {
			this.addPower(chatItem.displayName, hearts[0], CommuniQiPowerSource.Regeneration);
		}
	}

	private static addPower = (userName: string, heart: string, source: CommuniQiPowerSource) => {
		if(this.communiQiPowerPool.length >= this.maxPowerPoolSize) {
			this.communiQiPowerPool = [];
			SocketServer.in('COMMUNI_QI').emit('COMMUNI_QI_POWER_POOL_EXPLODED');
		}

		if(heart === 'e' || heart === 'n' || heart === '<3' || YoutTubeHeartWaveCandidates.includes(heart) || TwitchHeartWaveCandidates.includes(heart)) {
			heart = CommonHeartWaveCandidates[Math.floor(Math.random() * CommonHeartWaveCandidates.length)];
		}

		const communiQiPower: CommuniQiPower = {
			userName,
			heart,
			source
		};

		this.communiQiPowerPool.push(communiQiPower);

		Log.debug(`Adding power from ${CommuniQiPowerSource[source]}: ${userName}`);

		SocketServer.in('COMMUNI_QI').emit('COMMUNI_QI_POWER_UP', communiQiPower);
	};

	public static usePower = (howMuch: number) => {
		if(this.communiQiPowerPool.length > 0) {
			for(let i = 0; i < howMuch; i++) {
				this.communiQiPowerPool.shift();
			}
			SocketServer.in('COMMUNI_QI').emit('COMMUNI_QI_POWER_DOWN');
		}
	}
}
