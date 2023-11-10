import knex, { Knex } from 'knex';
import { Log } from "./Log";
import { FaceLinkKeyBindingsModel } from './FaceLinkKeyBindingsModel';

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

		await FaceLinkKeyBindingsModel.init();

		Log.info(`Done setting up Database`);
	}

	public static get knex() {
		if(!this.knexInstance) {
			Log.error(`Database not initialized yet`);
		}

		return this.knexInstance;
	}
};
