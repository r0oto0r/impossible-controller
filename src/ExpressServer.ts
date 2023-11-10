import express, { Application } from "express";
import { Log } from './Log';
import cors from 'cors';

export class ExpressServer {
	private static app: Application;

	public static init() {
		this.app = express();
		this.app.use(cors());
		this.app.use(express.json({ limit: '50mb' }));
		this.app.use(express.urlencoded({ extended: true }));

		Log.info('Initializing express server');

		return this.app;
	}
}
