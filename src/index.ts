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
import { FluteAudioReceiver } from './Audio/FluteAudioReceiver';
import { Mouse } from './common/Mouse';
import { LeapKeyBindings } from './Leap/LeapKeyBindings';
import { LeapReceiver } from './Leap/LeapReceiver';
import { DrumAudioReceiver } from './Audio/DrumAudioReceiver';
import { YoutubeChatHandler } from './common/YoutubeChatHandler';
import { TwitchChatHandler } from './common/TwitchChatHandler';
import { CommuniQi } from './CommuniQi/CommuniQi';

(async () => {
    try {
		Log.info(`Booting Impossible Version ${process.env.npm_package_version} ${process.env.PROD ? 'PROD' : 'DEV'}`);

		await Database.init();

		const app =	ExpressServer.init();
		const httpServer = http.createServer(app);
		const port = 9090;

		await Keyboard.init();
		await Mouse.init();

		await YoutubeChatHandler.init(app);
		await TwitchChatHandler.init(app);

		await LiveLinkKeyBindings.init(app);
		LiveLinkReceiver.init();

		await AudioKeyBindings.init(app);
		FluteAudioReceiver.init();
		DrumAudioReceiver.init();

		await LeapKeyBindings.init(app);
		LeapReceiver.init();

		await CommuniQi.init(app);

		SocketServer.init(httpServer);

		httpServer.listen(port, (): void => {
            Log.info(`HTTP Server accepting connections on port ${port}`);
        });

		app.use(express.static(path.join(__dirname, '../frontend/build')));
		app.get('*', (_, res) => {
			res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
		});
    } catch (error: any) {
        Log.error(`Error occured: ${error}`);
    }
})();
