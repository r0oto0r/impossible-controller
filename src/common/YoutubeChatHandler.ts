import { Application } from "express";
import { Log } from "./Log";
import { google, youtube_v3 } from 'googleapis';
import { EventEmitter }	from 'events';

export class YoutubeChatHandler {
	private static syncTimer: NodeJS.Timeout;
	private static youtube: youtube_v3.Youtube;
	private static liveId: string;
	private static nextPageToken: string;
	private static eventEmitter = new EventEmitter();

	public static async init(app: Application) {
		Log.info(`Initializing Youtube Chat Handler`);

		app.get('/youtube-chat/live-id', async (_, res) => {
			res.json({ liveId: this.liveId });
		});

		app.post('/youtube-chat/start', async (req, res) => {
			const { liveId } = req.body as { liveId: string };
			await this.startLiveChat(liveId);
			res.json({ message: `Started youtube chat for liveId: ${liveId}` });
		});

		this.youtube = google.youtube({
			version: 'v3',
			auth: 'AIzaSyCAh0nShKjvSTT4q_NAIry3uYXeeYEMmrc'
		});
	}

	public static async startLiveChat(videoId: string) {
		this.stopLiveChat();
		const videoResponse = await this.youtube.videos.list({
			part: ['liveStreamingDetails', 'snippet'],
			id: [ videoId ]
		});

		if(videoResponse.data.items?.length === 0) {
			Log.error(`Video with id ${videoId} not found`);
			return;
		}

		this.liveId = videoResponse.data.items[0].liveStreamingDetails?.activeLiveChatId;

		Log.info(`Starting youtube chat for live id: ${this.liveId} channel id: ${videoResponse.data.items[0].snippet?.channelId}`);

		this.syncTimer = setTimeout(this.syncChat, 5000);
	}

	public static async stopLiveChat() {
		if(this.syncTimer) {
			Log.info(`Stopping youtube chat for live id: ${this.liveId}`);
			clearInterval(this.syncTimer);
		}
	}

	private static sleep = (ms: number) => {
		return new Promise(resolve => setTimeout(resolve, ms));
	}

	private static syncChat = async () => {
		try {
			const response = await this.youtube.liveChatMessages.list({
				liveChatId: this.liveId,
				part: ['id', 'snippet', 'authorDetails'],
				pageToken: this.nextPageToken
			});
	
			const { data: { nextPageToken, items }} = response;
			let { pollingIntervalMillis } = response.data;
			Log.debug(`Youtube chat sync polling interval: ${pollingIntervalMillis}ms`);
			let totalDelay = 0;
			let timeOfLastMessage;
	
			if(!this.nextPageToken) {
				this.nextPageToken = nextPageToken;
			} else {
				Log.debug(`Youtube chat sync: ${items.length} messages`);
				for(let i = 0; i < items.length; i++) {
					if(items[i].authorDetails.displayName === 'Nightbot' || items[i].authorDetails.displayName === 'nightbot') {
						continue;
					}
	
					if(timeOfLastMessage !== undefined) {
						const delay = new Date(items[i].snippet.publishedAt).getTime() - timeOfLastMessage;
						totalDelay += delay;
						await this.sleep(delay);
					}
					timeOfLastMessage = new Date(items[i].snippet.publishedAt).getTime();
	
					this.eventEmitter.emit('chat', {
						displayName: items[i].authorDetails.displayName,
						message: items[i].snippet.displayMessage
					});
				}
				this.nextPageToken = nextPageToken;
			}
	
			Log.debug(`Youtube chat sync delay: ${pollingIntervalMillis - totalDelay}ms`);
			this.syncTimer = setTimeout(this.syncChat, pollingIntervalMillis - totalDelay);
		} catch (error) {
			Log.error(`Youtube chat sync error: ${error}`);
			this.syncTimer = setTimeout(this.syncChat, 5000);
		}
	}

	public static getLiveChat() {
		return this.eventEmitter;
	}
}
