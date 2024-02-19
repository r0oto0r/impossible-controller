import { Database } from "../common/Database";
import { Log } from "../common/Log";

export const AUDIO_KEY_BINDINGS_TABLE_NAME = 'audio_key_bindings';

export class AudioKeyBindingsModel {
	public static async init() {
		Log.info(`Setting up key bindings db`);

		await this.createTables();

		Log.info(`Done setting up key bindings db`);
	}

	private static async createTables() {
		if(!(await Database.knex.schema.hasTable(AUDIO_KEY_BINDINGS_TABLE_NAME))) {
			Log.info(`No key bindings table found. Creating it.`);

			await Database.knex.schema.createTable(AUDIO_KEY_BINDINGS_TABLE_NAME, (table) => {
				table.string('audioCommand').notNullable();
				table.string('keyCode').notNullable();
				table.primary(['audioCommand', 'keyCode']);
			});
		}
	}

	public static async upsertKeyBinding(keyCode: string, audioCommand: string) {
		await Database.knex.raw(`
			INSERT INTO ${AUDIO_KEY_BINDINGS_TABLE_NAME} (keyCode, audioCommand) VALUES (?, ?)
			ON CONFLICT (audioCommand, keyCode) DO NOTHING
		`, [keyCode, audioCommand]);
	}

	public static async getKeyBindings() {
		return await Database.knex(AUDIO_KEY_BINDINGS_TABLE_NAME).select();
	}

	public static async deleteKeyBinding(audioCommand: string, keyCode: string) {
		await Database.knex(AUDIO_KEY_BINDINGS_TABLE_NAME).where({ audioCommand, keyCode }).delete();
	}

	public static async deleteAllKeyBindings() {
		await Database.knex(AUDIO_KEY_BINDINGS_TABLE_NAME).delete();
	}
}
