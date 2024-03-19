import { Application } from "express";
import { Log } from "../common/Log";
import { SocketClient } from "../common/SocketClient";
import { Keyboard } from "../common/Keyboard";

const IDS_ADDRESS = 'http://localhost:9090';
const SUBEVENT_KEYCODE = 'Minus';

export enum SocketActionEvents {
	Subscription = "subscription",
	Burst = "burst",
	SubscriptionGift = "subscriptionGift"
};

export class SubEventReceiver {
	private static currentKeyPressTimeout: NodeJS.Timeout;
	private static socketClient: SocketClient;

	public static init(app: Application) {
		Log.info("Initializing Sub Event Receiver");

		app.post('/sub-event/start', async (req, res) => {
			this.startWebsiteChat();
			res.status(200).send();
		});
		
		app.post('/sub-event/stop', async (_, res) => {
			this.stopWebsiteChat();
			res.status(200).send();
		});

		this.socketClient = new SocketClient(IDS_ADDRESS);
	}

	public static startWebsiteChat = () => {
		if(this.socketClient.isConnected) {
			this.socketClient.disconnectFromServer();
		}
		Log.info(`Starting website chat`);
		this.socketClient.connectToServer();

		this.socketClient.on(SocketActionEvents.Subscription, this.onSubEvent);
		this.socketClient.on(SocketActionEvents.Burst, this.onSubEvent);
		this.socketClient.on(SocketActionEvents.SubscriptionGift, this.onSubEvent);

		this.socketClient.on('connect', () => {
			this.socketClient.emit('join', 'action');
		});
	}

	private static onSubEvent = (data: { duration: number }) => {
		if(this.currentKeyPressTimeout) {
			clearTimeout(this.currentKeyPressTimeout);
			Keyboard.release([SUBEVENT_KEYCODE]);
		}

		Log.info(`Received sub event`);
		Keyboard.press([SUBEVENT_KEYCODE]);
		this.currentKeyPressTimeout = setTimeout(() => {
			Keyboard.release([SUBEVENT_KEYCODE]);
		}, data.duration);
	};

	public static stopWebsiteChat = () => {
		Log.info(`Stopping website chat`);
		if(this.currentKeyPressTimeout) {
			clearTimeout(this.currentKeyPressTimeout);
			Keyboard.release([SUBEVENT_KEYCODE]);
		}
		this.socketClient.disconnectFromServer();
	}
}
