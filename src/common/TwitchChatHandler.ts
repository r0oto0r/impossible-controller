import { Application } from "express";
import { Log } from "./Log";
import * as tmi from 'tmi.js';

export class TwitchChatHandler {
	private static client: tmi.Client;
	private static channel: string;

	public static async init(app: Application) {
		Log.info(`Initializing Twitch Chat Handler`);

		app.get('/twitch-chat/channel', async (_, res) => {
			res.json({ channel: this.channel });
		});

		app.post('/twitch-chat/start', async (req, res) => {
			const { channel } = req.body as { channel: string };
			await this.startTwitchChat(channel);
			res.json({ message: `Started twitch chat for channel: ${channel}` });
		});
	}

	public static startTwitchChat(channel: string) {
		this.stopTwitchChat();
		Log.info(`Starting twitch chat for channel: ${channel}`);
		this.channel = channel;
		this.client = new tmi.Client({
			connection: {
				reconnect: true,
				secure: true
			},
			channels: [channel]
		});

		this.client.connect();
	}

	public static stopTwitchChat() {
		if(this.client && this.client.readyState() === 'OPEN') {
			Log.info(`Stopping twitch chat for channel: ${this.channel}`);
			this.client.disconnect();
		}
	}

	public static getClient() {
		return this.client;
	}
}
