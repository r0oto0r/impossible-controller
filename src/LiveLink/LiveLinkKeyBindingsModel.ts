import { Database } from "../common/Database";
import { Log } from "../common/Log";

export const LIVE_LINK_KEY_BINDINGS_TABLE_NAME = 'live_link_key_bindings';

export class LiveLinkKeyBindingsModel {
	public static async init() {
		Log.info(`Setting up key bindings db`);

		await this.createTables();

		Log.info(`Done setting up key bindings db`);
	}

	private static async createTables() {
		if(!(await Database.knex.schema.hasTable(LIVE_LINK_KEY_BINDINGS_TABLE_NAME))) {
			Log.info(`No key bindings table found. Creating it.`);

			await Database.knex.schema.createTable(LIVE_LINK_KEY_BINDINGS_TABLE_NAME, (table) => {
				table.string('faceBlendShape').notNullable();
				table.string('keyCode').notNullable();
				table.float('maxThreshold').notNullable().defaultTo(1);
				table.float('minThreshold').notNullable().defaultTo(-1);
				table.primary(['faceBlendShape', 'keyCode']);
			});
		}
	}

	public static async upsertKeyBinding(faceBlendShape: string, keyCode: string, maxThreshold: number = 1, minThreshold: number = -1) {
		await Database.knex.raw(`
			INSERT INTO ${LIVE_LINK_KEY_BINDINGS_TABLE_NAME} (faceBlendShape, keyCode, maxThreshold, minThreshold) VALUES (?, ?, ?, ?)
			ON CONFLICT (faceBlendShape, keyCode) DO UPDATE SET maxThreshold = ?, minThreshold = ?
		`, [faceBlendShape, keyCode, maxThreshold, minThreshold, maxThreshold, minThreshold]);
	}

	public static async getKeyBindings() {
		return await Database.knex(LIVE_LINK_KEY_BINDINGS_TABLE_NAME).select();
	}

	public static async deleteKeyBinding(faceBlendShape: string, keyCode: string) {
		await Database.knex(LIVE_LINK_KEY_BINDINGS_TABLE_NAME).where({ faceBlendShape, keyCode }).delete();
	}

	public static async deleteAllKeyBindings() {
		await Database.knex(LIVE_LINK_KEY_BINDINGS_TABLE_NAME).delete();
	}
}
