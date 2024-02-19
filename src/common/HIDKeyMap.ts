import { HIDKeys } from "./HIDKeys";

export const CLEAR_ALL = `${HIDKeys.KEY_NONE}${HIDKeys.KEY_NONE}${HIDKeys.KEY_NONE}${HIDKeys.KEY_NONE}${HIDKeys.KEY_NONE}${HIDKeys.KEY_NONE}${HIDKeys.KEY_NONE}${HIDKeys.KEY_NONE}`;

export const WebKeyCodeMap: any = {};
export const HIDKeyMap: any = {};
export const HIDModKeyMap: any = {};

export const MAX_HID_MESSAGE_LENGTH = 8;
export const MAX_HID_MESSAGE_LENGTH_WITHOUT_HEADER = MAX_HID_MESSAGE_LENGTH - 2; // modifier and reserved 0 value

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

// all numbers
HIDKeyMap[WebKeyCodeMap.Digit0] = HIDKeys.KEY_0;
HIDKeyMap[WebKeyCodeMap.Digit1] = HIDKeys.KEY_1;
HIDKeyMap[WebKeyCodeMap.Digit2] = HIDKeys.KEY_2;
HIDKeyMap[WebKeyCodeMap.Digit3] = HIDKeys.KEY_3;
HIDKeyMap[WebKeyCodeMap.Digit4] = HIDKeys.KEY_4;
HIDKeyMap[WebKeyCodeMap.Digit5] = HIDKeys.KEY_5;
HIDKeyMap[WebKeyCodeMap.Digit6] = HIDKeys.KEY_6;
HIDKeyMap[WebKeyCodeMap.Digit7] = HIDKeys.KEY_7;
HIDKeyMap[WebKeyCodeMap.Digit8] = HIDKeys.KEY_8;
HIDKeyMap[WebKeyCodeMap.Digit9] = HIDKeys.KEY_9;

// all chars
HIDKeyMap[WebKeyCodeMap.KeyA] = HIDKeys.KEY_A;
HIDKeyMap[WebKeyCodeMap.KeyB] = HIDKeys.KEY_B;
HIDKeyMap[WebKeyCodeMap.KeyC] = HIDKeys.KEY_C;
HIDKeyMap[WebKeyCodeMap.KeyD] = HIDKeys.KEY_D;
HIDKeyMap[WebKeyCodeMap.KeyE] = HIDKeys.KEY_E;
HIDKeyMap[WebKeyCodeMap.KeyF] = HIDKeys.KEY_F;
HIDKeyMap[WebKeyCodeMap.KeyG] = HIDKeys.KEY_G;
HIDKeyMap[WebKeyCodeMap.KeyH] = HIDKeys.KEY_H;
HIDKeyMap[WebKeyCodeMap.KeyI] = HIDKeys.KEY_I;
HIDKeyMap[WebKeyCodeMap.KeyJ] = HIDKeys.KEY_J;
HIDKeyMap[WebKeyCodeMap.KeyK] = HIDKeys.KEY_K;
HIDKeyMap[WebKeyCodeMap.KeyL] = HIDKeys.KEY_L;
HIDKeyMap[WebKeyCodeMap.KeyM] = HIDKeys.KEY_M;
HIDKeyMap[WebKeyCodeMap.KeyN] = HIDKeys.KEY_N;
HIDKeyMap[WebKeyCodeMap.KeyO] = HIDKeys.KEY_O;
HIDKeyMap[WebKeyCodeMap.KeyP] = HIDKeys.KEY_P;
HIDKeyMap[WebKeyCodeMap.KeyQ] = HIDKeys.KEY_Q;
HIDKeyMap[WebKeyCodeMap.KeyR] = HIDKeys.KEY_R;
HIDKeyMap[WebKeyCodeMap.KeyS] = HIDKeys.KEY_S;
HIDKeyMap[WebKeyCodeMap.KeyT] = HIDKeys.KEY_T;
HIDKeyMap[WebKeyCodeMap.KeyU] = HIDKeys.KEY_U;
HIDKeyMap[WebKeyCodeMap.KeyV] = HIDKeys.KEY_V;
HIDKeyMap[WebKeyCodeMap.KeyW] = HIDKeys.KEY_W;
HIDKeyMap[WebKeyCodeMap.KeyX] = HIDKeys.KEY_X;
HIDKeyMap[WebKeyCodeMap.KeyY] = HIDKeys.KEY_Y;
HIDKeyMap[WebKeyCodeMap.KeyZ] = HIDKeys.KEY_Z;

// ARROW KEYS
HIDKeyMap[WebKeyCodeMap.ArrowRight] = HIDKeys.KEY_RIGHT;
HIDKeyMap[WebKeyCodeMap.ArrowLeft] = HIDKeys.KEY_LEFT;
HIDKeyMap[WebKeyCodeMap.ArrowDown] = HIDKeys.KEY_DOWN;
HIDKeyMap[WebKeyCodeMap.ArrowUp] = HIDKeys.KEY_UP;

// OTHER KEYS
HIDKeyMap[WebKeyCodeMap.Enter] = HIDKeys.KEY_ENTER;
HIDKeyMap[WebKeyCodeMap.Escape] = HIDKeys.KEY_ESC;
HIDKeyMap[WebKeyCodeMap.Backspace] = HIDKeys.KEY_BACKSPACE;
HIDKeyMap[WebKeyCodeMap.Tab] = HIDKeys.KEY_TAB;
HIDKeyMap[WebKeyCodeMap.Space] = HIDKeys.KEY_SPACE;
HIDKeyMap[WebKeyCodeMap.Comma] = HIDKeys.KEY_COMMA;
HIDKeyMap[WebKeyCodeMap.Period] = HIDKeys.KEY_DOT;
HIDKeyMap[WebKeyCodeMap.CapsLock] = HIDKeys.KEY_CAPSLOCK;
HIDKeyMap[WebKeyCodeMap.Slash] = HIDKeys.KEY_SLASH;
HIDKeyMap[WebKeyCodeMap.Minus] = HIDKeys.KEY_MINUS;
HIDKeyMap[WebKeyCodeMap.Backslash] = HIDKeys.KEY_BACKSLASH;
HIDKeyMap[WebKeyCodeMap.BracketRight] = HIDKeys.KEY_RIGHTBRACE;
HIDKeyMap[WebKeyCodeMap.BracketLeft] = HIDKeys.KEY_LEFTBRACE;

// MOD KEYS
HIDModKeyMap[WebKeyCodeMap.ControlLeft] = HIDKeys.KEY_MOD_LCTRL;
HIDModKeyMap[WebKeyCodeMap.ShiftLeft] = HIDKeys.KEY_MOD_LSHIFT;
HIDModKeyMap[WebKeyCodeMap.AltLeft] = HIDKeys.KEY_MOD_LALT;
HIDModKeyMap[WebKeyCodeMap.ControlRight] = HIDKeys.KEY_MOD_RCTRL;
HIDModKeyMap[WebKeyCodeMap.ShiftRight] = HIDKeys.KEY_MOD_RSHIFT;
HIDModKeyMap[WebKeyCodeMap.AltRight] = HIDKeys.KEY_MOD_RALT;
