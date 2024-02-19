import express from 'express';
import path from 'path';
import { Log } from './common/Log';
import http from "http";
import { SocketServer } from './common/SocketServer';
import { ExpressServer } from './common/ExpressServer';
import { Keyboard } from './common/Keyboard';
import { LiveLinkReceiver } from './LiveLink/LiveLinkReceiver';
import { Database } from './common/Database';
import { LiveLinkKeyBindings } from './LiveLink/LiveLinkKeyBindings';
import { AudioKeyBindings } from './Audio/AudioKeyBindings';
import { AudioReceiver } from './Audio/AudioReceiver';

(async () => {
    try {
		Log.info(`Booting Impossible Version ${process.env.npm_package_version} ${process.env.PROD ? 'PROD' : 'DEV'}`);

		await Database.init();

		const app =	ExpressServer.init();
		const httpServer = http.createServer(app);
		const port = 9090;

		await Keyboard.init();
		SocketServer.init(httpServer);

		httpServer.listen(port, (): void => {
            Log.info(`HTTP Server accepting connections on port ${port}`);
        });

		await LiveLinkKeyBindings.init(app);
		LiveLinkReceiver.init();

		await AudioKeyBindings.init(app);
		AudioReceiver.init();

		app.use('/', express.static(path.join(__dirname, '../frontend/build')));
    } catch (error: any) {
        Log.error(`Error occured: ${error}`);
    }
})();
