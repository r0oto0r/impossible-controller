import React, { useEffect } from "react";
import './KeysPressedView.css';
import { SocketClient } from "../../socket/SocketClient";
import { useAppSelector, useAppDispatch } from "../../hooks/general";
import { getKeysPressed, setKeysPressed } from "../../slices/keysPressedSlice";

export const WebKeyCodeMap: { [key: string]: string } = {};
export const FrontendKeyMap: { [key: string]: string } = {};

WebKeyCodeMap['Digit0'] = 'Digit0';
WebKeyCodeMap['Digit1'] = 'Digit1';
WebKeyCodeMap['Digit2'] = 'Digit2';
WebKeyCodeMap['Digit3'] = 'Digit3';
WebKeyCodeMap['Digit4'] = 'Digit4';
WebKeyCodeMap['Digit5'] = 'Digit5';
WebKeyCodeMap['Digit6'] = 'Digit6';
WebKeyCodeMap['Digit7'] = 'Digit7';
WebKeyCodeMap['Digit8'] = 'Digit8';
WebKeyCodeMap['Digit9'] = 'Digit9';

WebKeyCodeMap['KeyA'] = 'KeyA';
WebKeyCodeMap['KeyB'] = 'KeyB';
WebKeyCodeMap['KeyC'] = 'KeyC';
WebKeyCodeMap['KeyD'] = 'KeyD';
WebKeyCodeMap['KeyE'] = 'KeyE';
WebKeyCodeMap['KeyF'] = 'KeyF';
WebKeyCodeMap['KeyG'] = 'KeyG';
WebKeyCodeMap['KeyH'] = 'KeyH';
WebKeyCodeMap['KeyI'] = 'KeyI';
WebKeyCodeMap['KeyJ'] = 'KeyJ';
WebKeyCodeMap['KeyK'] = 'KeyK';
WebKeyCodeMap['KeyL'] = 'KeyL';
WebKeyCodeMap['KeyM'] = 'KeyM';
WebKeyCodeMap['KeyN'] = 'KeyN';
WebKeyCodeMap['KeyO'] = 'KeyO';
WebKeyCodeMap['KeyP'] = 'KeyP';
WebKeyCodeMap['KeyQ'] = 'KeyQ';
WebKeyCodeMap['KeyR'] = 'KeyR';
WebKeyCodeMap['KeyS'] = 'KeyS';
WebKeyCodeMap['KeyT'] = 'KeyT';
WebKeyCodeMap['KeyU'] = 'KeyU';
WebKeyCodeMap['KeyV'] = 'KeyV';
WebKeyCodeMap['KeyW'] = 'KeyW';
WebKeyCodeMap['KeyX'] = 'KeyX';
WebKeyCodeMap['KeyY'] = 'KeyY';
WebKeyCodeMap['KeyZ'] = 'KeyZ';

WebKeyCodeMap['ArrowRight'] = 'ArrowRight';
WebKeyCodeMap['ArrowLeft'] = 'ArrowLeft';
WebKeyCodeMap['ArrowDown'] = 'ArrowDown';
WebKeyCodeMap['ArrowUp'] = 'ArrowUp';

WebKeyCodeMap['Enter'] = 'Enter';
WebKeyCodeMap['Escape'] = 'Escape';
WebKeyCodeMap['Backspace'] = 'Backspace';
WebKeyCodeMap['Tab'] = 'Tab';
WebKeyCodeMap['Space'] = 'Space';
WebKeyCodeMap['Comma'] = 'Comma';
WebKeyCodeMap['Period'] = 'Period';
WebKeyCodeMap['CapsLock'] = 'CapsLock';
WebKeyCodeMap['Slash'] = 'Slash';
WebKeyCodeMap['Minus'] = 'Minus';
WebKeyCodeMap['Backslash'] = 'Backslash';
WebKeyCodeMap['BracketRight'] = 'BracketRight';
WebKeyCodeMap['BracketLeft'] = 'BracketLeft';

WebKeyCodeMap['ControlLeft'] = 'ControlLeft';
WebKeyCodeMap['ShiftLeft'] = 'ShiftLeft';
WebKeyCodeMap['AltLeft'] = 'AltLeft';
WebKeyCodeMap['ControlRight'] = 'ControlRight';
WebKeyCodeMap['ShiftRight'] = 'ShiftRight';
WebKeyCodeMap['AltRight'] = 'AltRight';

FrontendKeyMap[WebKeyCodeMap.Digit0] = '0';
FrontendKeyMap[WebKeyCodeMap.Digit1] = '1';
FrontendKeyMap[WebKeyCodeMap.Digit2] = '2';
FrontendKeyMap[WebKeyCodeMap.Digit3] = '3';
FrontendKeyMap[WebKeyCodeMap.Digit4] = '4';
FrontendKeyMap[WebKeyCodeMap.Digit5] = '5';
FrontendKeyMap[WebKeyCodeMap.Digit6] = '6';
FrontendKeyMap[WebKeyCodeMap.Digit7] = '7';
FrontendKeyMap[WebKeyCodeMap.Digit8] = '8';
FrontendKeyMap[WebKeyCodeMap.Digit9] = '9';

FrontendKeyMap[WebKeyCodeMap.KeyA] = 'A';
FrontendKeyMap[WebKeyCodeMap.KeyB] = 'B';
FrontendKeyMap[WebKeyCodeMap.KeyC] = 'C';
FrontendKeyMap[WebKeyCodeMap.KeyD] = 'D';
FrontendKeyMap[WebKeyCodeMap.KeyE] = 'E';
FrontendKeyMap[WebKeyCodeMap.KeyF] = 'F';
FrontendKeyMap[WebKeyCodeMap.KeyG] = 'G';
FrontendKeyMap[WebKeyCodeMap.KeyH] = 'H';
FrontendKeyMap[WebKeyCodeMap.KeyI] = 'I';
FrontendKeyMap[WebKeyCodeMap.KeyJ] = 'J';
FrontendKeyMap[WebKeyCodeMap.KeyK] = 'K';
FrontendKeyMap[WebKeyCodeMap.KeyL] = 'L';
FrontendKeyMap[WebKeyCodeMap.KeyM] = 'M';
FrontendKeyMap[WebKeyCodeMap.KeyN] = 'N';
FrontendKeyMap[WebKeyCodeMap.KeyO] = 'O';
FrontendKeyMap[WebKeyCodeMap.KeyP] = 'P';
FrontendKeyMap[WebKeyCodeMap.KeyQ] = 'Q';
FrontendKeyMap[WebKeyCodeMap.KeyR] = 'R';
FrontendKeyMap[WebKeyCodeMap.KeyS] = 'S';
FrontendKeyMap[WebKeyCodeMap.KeyT] = 'T';
FrontendKeyMap[WebKeyCodeMap.KeyU] = 'U';
FrontendKeyMap[WebKeyCodeMap.KeyV] = 'V';
FrontendKeyMap[WebKeyCodeMap.KeyW] = 'W';
FrontendKeyMap[WebKeyCodeMap.KeyX] = 'X';
FrontendKeyMap[WebKeyCodeMap.KeyY] = 'Y';
FrontendKeyMap[WebKeyCodeMap.KeyZ] = 'Z';

FrontendKeyMap[WebKeyCodeMap.ArrowRight] = 't';
FrontendKeyMap[WebKeyCodeMap.ArrowLeft] = 's';
FrontendKeyMap[WebKeyCodeMap.ArrowDown] = 'r';
FrontendKeyMap[WebKeyCodeMap.ArrowUp] = 'q';

FrontendKeyMap[WebKeyCodeMap.Enter] = 'a';
FrontendKeyMap[WebKeyCodeMap.Escape] = 'm';
FrontendKeyMap[WebKeyCodeMap.Backspace] = 'h';
FrontendKeyMap[WebKeyCodeMap.Tab] = 'e';
FrontendKeyMap[WebKeyCodeMap.Space] = 'w';
FrontendKeyMap[WebKeyCodeMap.Comma] = ',';
FrontendKeyMap[WebKeyCodeMap.Period] = '.';
FrontendKeyMap[WebKeyCodeMap.CapsLock] = 'f';
FrontendKeyMap[WebKeyCodeMap.Slash] = '/';
FrontendKeyMap[WebKeyCodeMap.Minus] = ',';
FrontendKeyMap[WebKeyCodeMap.Backslash] = '\\';
FrontendKeyMap[WebKeyCodeMap.BracketRight] = ')';
FrontendKeyMap[WebKeyCodeMap.BracketLeft] = '(';

FrontendKeyMap[WebKeyCodeMap.ControlLeft] = 'c';
FrontendKeyMap[WebKeyCodeMap.ShiftLeft] = 'g';
FrontendKeyMap[WebKeyCodeMap.AltLeft] = 'b';
FrontendKeyMap[WebKeyCodeMap.ControlRight] = 'c';
FrontendKeyMap[WebKeyCodeMap.ShiftRight] = 'g';
FrontendKeyMap[WebKeyCodeMap.AltRight] = 'b';

function KeysPressedView(): JSX.Element {
	const dispatch = useAppDispatch();
	const { keysPressed } = useAppSelector((state) => getKeysPressed(state));

	useEffect(() => {
		function processKeysPressed(keysPressed: string[]) {
			dispatch(setKeysPressed(keysPressed));
		}

		SocketClient.on('connect', () => {
			SocketClient.emit('JOIN_ROOM', 'KEYBOARD');
			SocketClient.on('KEYS_PRESSED', processKeysPressed);
		});

		SocketClient.on('disconnect', () => {
			SocketClient.off('KEYS_PRESSED', processKeysPressed);
		});

		return () => {
			SocketClient.emit('LEAVE_ROOM', 'KEYBOARD');
			SocketClient.off('KEYS_PRESSED', processKeysPressed);
		};
	}, [ dispatch ]);

	return (
		<div className="w3-container w3-margin w3-center">
			<div className="keyspressed w3-center" >{keysPressed.map((keyPressed: string) => FrontendKeyMap[keyPressed])}</div>
		</div>
	);
}

export default KeysPressedView;
