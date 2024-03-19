import { Application } from "express";
import { LiveLinkKeyBindingsModel as LiveLinkKeyBindingsModel } from "./LiveLinkKeyBindingsModel";
import { FaceBlendShape } from "./LiveLinkReceiver";

export interface LiveLinkKeyBinding {
	faceBlendShape: string;
	keyCode: string;
	maxThreshold: number;
	minThreshold: number;
};

export class LiveLinkKeyBindings {
	private static keyBindings: LiveLinkKeyBinding[] = [];

	public static async init(app: Application) {
		app.get('/livelink/key-bindings', async (_, res) => {
			res.json(await this.loadKeyBindings());
		});

		app.post('/livelink/key-bindings', async (req, res) => {
			const { bindings } = req.body as { bindings: LiveLinkKeyBinding[] };

			for(const binding of bindings) {
				const { faceBlendShape, keyCode, maxThreshold, minThreshold } = binding;

				await LiveLinkKeyBindingsModel.upsertKeyBinding(faceBlendShape, keyCode, maxThreshold, minThreshold);
			}

			res.json(await this.loadKeyBindings());
		});

		app.delete('/livelink/key-bindings/:faceBlendShape/:keyCode', async (req, res) => {
			const { faceBlendShape, keyCode } = req.params;

			await LiveLinkKeyBindingsModel.deleteKeyBinding(faceBlendShape, keyCode);

			res.json(await this.loadKeyBindings());
		});

		app.delete('/livelink/key-bindings', async (_, res) => {
			await LiveLinkKeyBindingsModel.deleteAllKeyBindings();

			res.json(await this.loadKeyBindings());
		});

		app.get('/livelink/blend-shapes', async (_, res) => {
			res.json(Object.values(FaceBlendShape).filter(value => typeof value === 'string') as string[]);
		});

		await this.loadKeyBindings();
	}

	private static async loadKeyBindings() {
		this.keyBindings = await LiveLinkKeyBindingsModel.getKeyBindings();

		return this.keyBindings;
	}

	public static getBindings() {
		return this.keyBindings;
	}
}
