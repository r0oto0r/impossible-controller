import { Application } from "express";
import { FaceLinkKeyBindingsModel } from "./FaceLinkKeyBindingsModel";
import { FaceBlendShape } from "./FaceLinkReceiver";
import { WebKeyCodeMap } from "./HIDKeyMap";

export interface KeyBinding {
	faceBlendShape: string;
	webKeyCode: string;
	maxThreshold: number;
	minThreshold: number;
};

export class FaceLinkKeyBindings {
	private static keyBindings: KeyBinding[] = [];

	public static async init(app: Application) {
		app.get('/key-bindings', async (_, res) => {
			res.json(await this.loadKeyBindings());
		});

		app.post('/key-bindings', async (req, res) => {
			const { bindings } = req.body as { bindings: KeyBinding[] };

			for(const binding of bindings) {
				const { faceBlendShape, webKeyCode, maxThreshold, minThreshold } = binding;

				await FaceLinkKeyBindingsModel.upsertKeyBinding(faceBlendShape, webKeyCode, maxThreshold, minThreshold);
			}

			res.json(await this.loadKeyBindings());
		});

		app.delete('/key-bindings/:faceBlendShape/:webKeyCode', async (req, res) => {
			const { faceBlendShape, webKeyCode } = req.params;

			await FaceLinkKeyBindingsModel.deleteKeyBinding(faceBlendShape, webKeyCode);

			res.json(await this.loadKeyBindings());
		});

		app.delete('/key-bindings', async (req, res) => {
			await FaceLinkKeyBindingsModel.deleteAllKeyBindings();

			res.json(await this.loadKeyBindings());
		});

		app.get('/blend-shapes', async (req, res) => {
			res.json(Object.values(FaceBlendShape).filter(value => typeof value === 'string') as string[]);
		});

		app.get('/web-key-codes', async (req, res) => {
			res.json(Object.values(WebKeyCodeMap));
		});

		await this.loadKeyBindings();
	}

	private static async loadKeyBindings() {
		this.keyBindings = await FaceLinkKeyBindingsModel.getKeyBindings();

		return this.keyBindings;
	}

	public static getBindings() {
		return this.keyBindings;
	}
}
