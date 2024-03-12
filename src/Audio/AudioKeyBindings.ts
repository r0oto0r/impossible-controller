import { Application } from "express";
import { AudioKeyBindingsModel } from "./AudioKeyBindingsModel";

export enum AudioCommand {
	C = 'C',
	C_SHARP = 'C#',
	D = 'D',
	D_SHARP = 'D#',
	E = 'E',
	F = 'F',
	F_SHARP = 'F#',
	G = 'G',
	G_SHARP = 'G#',
	A = 'A',
	A_SHARP = 'A#',
	B = 'B'
};

export interface AudioKeyBinding {
	command: AudioCommand;
	keyCode: string;
};

export class AudioKeyBindings {
	private static keyBindings: AudioKeyBinding[] = [];

	public static async init(app: Application) {
		app.get('/audio/key-bindings', async (_, res) => {
			res.json(await this.loadKeyBindings());
		});

		app.post('/audio/key-bindings', async (req, res) => {
			const { bindings } = req.body as { bindings: AudioKeyBinding[] };

			for(const binding of bindings) {
				const { command, keyCode } = binding;
				await AudioKeyBindingsModel.upsertKeyBinding(keyCode, command);
			}

			res.json(await this.loadKeyBindings());
		});

		app.delete('/audio/key-bindings/:command/:keyCode', async (req, res) => {
			const { command, keyCode } = req.params;

			await AudioKeyBindingsModel.deleteKeyBinding(command, keyCode);

			res.json(await this.loadKeyBindings());
		});

		app.delete('/audio/key-bindings', async (_, res) => {
			await AudioKeyBindingsModel.deleteAllKeyBindings();

			res.json(await this.loadKeyBindings());
		});

		app.get('/audio/audio-codes', async (_, res) => {
			res.json(Object.values(AudioCommand));
		});

		await this.loadKeyBindings();
	}

	private static async loadKeyBindings() {
		this.keyBindings = await AudioKeyBindingsModel.getKeyBindings();

		return this.keyBindings;
	}

	public static getBindings() {
		return this.keyBindings;
	}
}
