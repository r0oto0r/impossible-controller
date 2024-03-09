import knex, { Knex } from 'knex';
import { Log } from "./Log";
import { LiveLinkKeyBindingsModel } from '../LiveLink/LiveLinkKeyBindingsModel';
import { AudioKeyBindingsModel } from '../Audio/AudioKeyBindingsModel';
import { LeapKeyBindingsModel } from '../Leap/LeapKeyBindingsModel';

export const CACHE_DB_FILE = 'cache.db';

export class Database {
	private static knexInstance: Knex;

	public static async init() {
		Log.info(`Setting up Database`);

		this.knexInstance = knex({
			client: 'sqlite3',
			useNullAsDefault: true,
			connection: {
				filename: CACHE_DB_FILE
			}
		});

		await LiveLinkKeyBindingsModel.init();
		await AudioKeyBindingsModel.init();
		await LeapKeyBindingsModel.init();

		Log.info(`Done setting up Database`);
	}

	public static get knex() {
		if(!this.knexInstance) {
			Log.error(`Database not initialized yet`);
		}

		return this.knexInstance;
	}
};
