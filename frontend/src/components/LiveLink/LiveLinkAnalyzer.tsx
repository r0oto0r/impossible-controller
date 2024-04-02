import React, { useCallback, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/general";
import { LiveLinkData, getLiveLinkData, setAvatar, setLiveLinkData, setSelectedBlendShape, setFollowLocalMouse, setMouseMode, setTrigger, setFreeLook } from "../../slices/liveLinkDataSlice";
import { SocketClient } from "../../socket/SocketClient";
import './LiveLinkAnalyzer.css';
import { getSettings } from "../../slices/settingsSlice";

export enum FaceBlendShape {
	EyeBlinkLeft = 0,
	EyeLookDownLeft = 1,
	EyeLookInLeft = 2,
	EyeLookOutLeft = 3,
	EyeLookUpLeft = 4,
	EyeSquintLeft = 5,
	EyeWideLeft = 6,
	EyeBlinkRight = 7,
	EyeLookDownRight = 8,
	EyeLookInRight = 9,
	EyeLookOutRight = 10,
	EyeLookUpRight = 11,
	EyeSquintRight = 12,
	EyeWideRight = 13,
	JawForward = 14,
	JawLeft = 15,
	JawRight = 16,
	JawOpen = 17,
	MouthClose = 18,
	MouthFunnel = 19,
	MouthPucker = 20,
	MouthLeft = 21,
	MouthRight = 22,
	MouthSmileLeft = 23,
	MouthSmileRight = 24,
	MouthFrownLeft = 25,
	MouthFrownRight = 26,
	MouthDimpleLeft = 27,
	MouthDimpleRight = 28,
	MouthStretchLeft = 29,
	MouthStretchRight = 30,
	MouthRollLower = 31,
	MouthRollUpper = 32,
	MouthShrugLower = 33,
	MouthShrugUpper = 34,
	MouthPressLeft = 35,
	MouthPressRight = 36,
	MouthLowerDownLeft = 37,
	MouthLowerDownRight = 38,
	MouthUpperUpLeft = 39,
	MouthUpperUpRight = 40,
	BrowDownLeft = 41,
	BrowDownRight = 42,
	BrowInnerUp = 43,
	BrowOuterUpLeft = 44,
	BrowOuterUpRight = 45,
	CheekPuff = 46,
	CheekSquintLeft = 47,
	CheekSquintRight = 48,
	NoseSneerLeft = 49,
	NoseSneerRight = 50,
	TongueOut = 51,
	HeadYaw = 52,
	HeadPitch = 53,
	HeadRoll = 54,
	LeftEyeYaw = 55,
	LeftEyePitch = 56,
	LeftEyeRoll = 57,
	RightEyeYaw = 58,
	RightEyePitch = 59,
	RightEyeRoll = 60
};

function LiveLinkAnalyzer(): JSX.Element {
	const { extraMenusHidden } = useAppSelector((state) => getSettings(state));
	const { liveLinkData, selectedBlendShape, avatar, followLocalMouse, freeLook, mouseMode } = useAppSelector((state) => getLiveLinkData(state));
	const dispatch = useAppDispatch();

	useEffect(() => {
		const processLiveLinkData = (liveLinkData: LiveLinkData) => {
			dispatch(setLiveLinkData(liveLinkData));
			dispatch(setTrigger({
				leftTrigger: liveLinkData.blendShapes[FaceBlendShape.HeadYaw] < (freeLook ? -0.02 : -0.2),
				rightTrigger: liveLinkData.blendShapes[FaceBlendShape.HeadYaw] > (freeLook ? 0.02 : 0.2),
				upTrigger: liveLinkData.blendShapes[FaceBlendShape.HeadPitch] < (freeLook ? -0.02 : -0.2),
				downTrigger: liveLinkData.blendShapes[FaceBlendShape.HeadPitch] > (freeLook ? 0.02 : 0.2)
			}));
		}

		const processFreeLook = (freeLook: boolean) => {
			dispatch(setFreeLook(freeLook));
		}

		const processMouseMode = (mouseMode: boolean) => {
			dispatch(setMouseMode(mouseMode));
		}

		SocketClient.on('connect', () => {
			SocketClient.emit('JOIN_ROOM', 'LIVE_LINK');
			SocketClient.on('LIVE_LINK_DATA', processLiveLinkData);
			SocketClient.on('LIVE_LINK_FREE_LOOK', processFreeLook);
			SocketClient.on('LIVE_LINK_MOUSE_MODE', processMouseMode);
		});

		SocketClient.on('disconnect', () => {
			SocketClient.off('LIVE_LINK_DATA', processLiveLinkData);
			SocketClient.off('LIVE_LINK_FREE_LOOK', processFreeLook);
			SocketClient.off('LIVE_LINK_MOUSE_MODE', processMouseMode);
			dispatch(setLiveLinkData(undefined));
		});

		return () => {
			SocketClient.emit('LEAVE_ROOM', 'LIVE_LINK');
			SocketClient.off('LIVE_LINK_DATA', processLiveLinkData);
			SocketClient.off('LIVE_LINK_FREE_LOOK', processFreeLook);
			SocketClient.off('LIVE_LINK_MOUSE_MODE', processMouseMode);
			dispatch(setLiveLinkData(undefined));
		};
	}, [ dispatch, freeLook, mouseMode ]);

	const toogleFreeLook = useCallback(() => {
		dispatch(setFreeLook(!freeLook));
		SocketClient.emit('LIVE_LINK_FREE_LOOK', !freeLook);
	}, [ dispatch, freeLook ]);

	const toogleMouseMode = useCallback(() => {
		dispatch(setMouseMode(!mouseMode));
		SocketClient.emit('LIVE_LINK_MOUSE_MODE', !mouseMode);
	}, [ dispatch, mouseMode ]);

	return (
		<div className="livelinkkeymapping" hidden={extraMenusHidden}>
			<div className="w3-container">	
				<div className="w3-row-padding">
					<div className="w3-half">
						<div className="w3-dropdown-hover">
							<button className="w3-button w3-black">{selectedBlendShape ? selectedBlendShape : 'BlendShape'}</button>
							<div className="w3-dropdown-content w3-bar-block w3-border">
								{(Object.values(FaceBlendShape).filter(blendShape => typeof blendShape === 'string') as Array<string>).map((blendShape: string) => {
									return (
										<button onClick={() => dispatch(setSelectedBlendShape(blendShape))} className="w3-bar-item w3-button">{blendShape}</button>
									);
								})}
							</div>
						</div>
					</div>
					<div className="w3-half">
						<input className="w3-input w3-border" readOnly type="number" placeholder="0" value={selectedBlendShape && liveLinkData ? liveLinkData.blendShapes[FaceBlendShape[selectedBlendShape as keyof typeof FaceBlendShape]] : '0'} />
					</div>
				</div>
				<div className="w3-row-padding">
					<div className="w3-half">
						<div className="w3-dropdown-hover">
							<button className="w3-button w3-black">{avatar}</button>
							<div className="w3-dropdown-content w3-bar-block w3-border">
								<button onClick={() => dispatch(setAvatar('default_male'))} className="w3-bar-item w3-button">default_male</button>
								<button onClick={() => dispatch(setAvatar('default_female'))} className="w3-bar-item w3-button">default_female</button>
							</div>
						</div>
					</div>
				</div>
				<div className="w3-row-padding">
					<div className="w3-half">
						<input className="w3-check" type="checkbox" checked={mouseMode} onChange={toogleMouseMode} />
						<label>Mouse Mode</label>
					</div>
				</div>
				<div className="w3-row-padding">
					<div className="w3-half">
						<input className="w3-check" type="checkbox" checked={followLocalMouse} onChange={(e) => dispatch(setFollowLocalMouse(e.target.checked))} />
						<label>Follow Mouse</label>
					</div>
				</div>
				<div className="w3-row-padding">
					<div className="w3-half">
						<input className="w3-check" type="checkbox" checked={freeLook} onChange={toogleFreeLook} />
						<label>Free Look</label>
					</div>
				</div>
			</div>
		</div>
	);
}

export default LiveLinkAnalyzer;
