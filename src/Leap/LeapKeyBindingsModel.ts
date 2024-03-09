import { Database } from "../common/Database";
import { Log } from "../common/Log";

export const LEAP_KEY_BINDINGS_TABLE_NAME = 'leap_key_bindings';

export class LeapKeyBindingsModel {
	public static async init() {
		Log.info(`Setting up leap key bindings db`);

		await this.createTables();

		Log.info(`Done setting up leap key bindings db`);
	}

	private static async createTables() {
		if(!(await Database.knex.schema.hasTable(LEAP_KEY_BINDINGS_TABLE_NAME))) {
			Log.info(`No leap key bindings table found. Creating it.`);

			await Database.knex.schema.createTable(LEAP_KEY_BINDINGS_TABLE_NAME, (table) => {
				table.string('command').notNullable();
				table.string('keyCode').notNullable();
				table.primary(['command', 'keyCode']);
			});
		}
	}

	public static async upsertKeyBinding(keyCode: string, command: string) {
		await Database.knex.raw(`
			INSERT INTO ${LEAP_KEY_BINDINGS_TABLE_NAME} (keyCode, command) VALUES (?, ?)
			ON CONFLICT (command, keyCode) DO NOTHING
		`, [keyCode, command]);
	}

	public static async getKeyBindings() {
		return await Database.knex(LEAP_KEY_BINDINGS_TABLE_NAME).select();
	}

	public static async deleteKeyBinding(command: string, keyCode: string) {
		await Database.knex(LEAP_KEY_BINDINGS_TABLE_NAME).where({ command, keyCode }).delete();
	}

	public static async deleteAllKeyBindings() {
		await Database.knex(LEAP_KEY_BINDINGS_TABLE_NAME).delete();
	}
}
