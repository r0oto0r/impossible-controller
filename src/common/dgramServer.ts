import { Log } from './Log';
import dgram from 'node:dgram';

export class dgramServer {
	private static socket: dgram.Socket;

	public static init() {
		Log.info("Initializing dgram Server");

		this.socket = dgram.createSocket('udp4');

		this.socket.bind(5000, null, () => {
			Log.info(`UDP Server listening on port ${5000}`);
		});

		return this.socket;
	}
}
