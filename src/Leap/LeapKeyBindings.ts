import { Application } from "express";
import { LeapKeyBindingsModel } from "./LeapKeyBindingsModel";

export enum LeapCommand {
	LeftHandClosed = 'LeftHandClosed',
	RightHandClosed = 'RightHandClosed',
	HandsTouch = 'HandsTouch',
	BarTouchedLeft = 'BarTouchedLeft',
	BarTouchedRight = 'BarTouchedRight',
	LeftHandAboveBar = 'LeftHandAboveBar',
	RightHandAboveBar = 'RightHandAboveBar'
};

export interface LeapKeyBinding {
	command: LeapCommand;
	keyCode: string;
};

export class LeapKeyBindings {
	private static keyBindings: LeapKeyBinding[] = [];

	public static async init(app: Application) {
		app.get('/leap/key-bindings', async (_, res) => {
			res.json(await this.loadKeyBindings());
		});

		app.post('/leap/key-bindings', async (req, res) => {
			const { bindings } = req.body as { bindings: LeapKeyBinding[] };

			for(const binding of bindings) {
				const { command, keyCode } = binding;

				await LeapKeyBindingsModel.upsertKeyBinding(keyCode, command);
			}

			res.json(await this.loadKeyBindings());
		});

		app.delete('/leap/key-bindings/:command/:keyCode', async (req, res) => {
			const { command, keyCode } = req.params;

			await LeapKeyBindingsModel.deleteKeyBinding(command, keyCode);

			res.json(await this.loadKeyBindings());
		});

		app.delete('/leap/key-bindings', async (_, res) => {
			await LeapKeyBindingsModel.deleteAllKeyBindings();

			res.json(await this.loadKeyBindings());
		});

		app.get('/leap/leap-codes', async (_, res) => {
			res.json(Object.values(LeapCommand));
		});

		await this.loadKeyBindings();
	}

	private static async loadKeyBindings() {
		this.keyBindings = await LeapKeyBindingsModel.getKeyBindings();

		return this.keyBindings;
	}

	public static getBindings() {
		return this.keyBindings;
	}
}
