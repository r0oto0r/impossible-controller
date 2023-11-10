import { Database } from "./Database";
import { Log } from "./Log";

export const FACE_LINK_KEY_BINDINGS_TABLE_NAME = 'key_bindings';

export class FaceLinkKeyBindingsModel {
	public static async init() {
		Log.info(`Setting up key bindings db`);

		await this.createTables();

		Log.info(`Done setting up key bindings db`);
	}

	private static async createTables() {
		if(!(await Database.knex.schema.hasTable(FACE_LINK_KEY_BINDINGS_TABLE_NAME))) {
			Log.info(`No key bindings table found. Creating it.`);

			await Database.knex.schema.createTable(FACE_LINK_KEY_BINDINGS_TABLE_NAME, (table) => {
				table.string('faceBlendShape').notNullable();
				table.string('webKeyCode').notNullable();
				table.float('maxThreshold').notNullable().defaultTo(1);
				table.float('minThreshold').notNullable().defaultTo(-1);
				table.primary(['faceBlendShape', 'webKeyCode']);
			});
		}
	}

	public static async upsertKeyBinding(faceBlendShape: string, webKeyCode: string, maxThreshold: number = 1, minThreshold: number = -1) {
		await Database.knex.raw(`
			INSERT INTO ${FACE_LINK_KEY_BINDINGS_TABLE_NAME} (faceBlendShape, webKeyCode, maxThreshold, minThreshold) VALUES (?, ?, ?, ?)
			ON CONFLICT (faceBlendShape, webKeyCode) DO UPDATE SET maxThreshold = ?, minThreshold = ?
		`, [faceBlendShape, webKeyCode, maxThreshold, minThreshold, maxThreshold, minThreshold]);
	}

	public static async getKeyBindings() {
		return await Database.knex(FACE_LINK_KEY_BINDINGS_TABLE_NAME).select();
	}

	public static async deleteKeyBinding(faceBlendShape: string, webKeyCode: string) {
		await Database.knex(FACE_LINK_KEY_BINDINGS_TABLE_NAME).where({ faceBlendShape, webKeyCode }).delete();
	}

	public static async deleteAllKeyBindings() {
		await Database.knex(FACE_LINK_KEY_BINDINGS_TABLE_NAME).delete();
	}
}
