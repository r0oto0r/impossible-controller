import { Log } from './Log';
import http from "http";
import { SocketServer } from './SocketServer';
import { ExpressServer } from './ExpressServer';
import { Keyboard } from './Keyboard';
import { FaceLinkReceiver } from './FaceLinkReceiver';
import { Database } from './Database';
import { FaceLinkKeyBindings } from './FaceLinkKeyBindings';

(async () => {
    try {
		Log.info(`Booting Impossible Version ${process.env.npm_package_version}`);

		await Database.init();

		const app =	ExpressServer.init();
		const httpServer = http.createServer(app);
		const port = 9090;

		await Keyboard.init();
		SocketServer.init(httpServer);

		httpServer.listen(port, (): void => {
            Log.info(`HTTP Server accepting connections on port ${port}`);
        });

		await FaceLinkKeyBindings.init(app);
		FaceLinkReceiver.init(app);
    } catch (error: any) {
        Log.error(`Error occured: ${error}`);
    }
})();
