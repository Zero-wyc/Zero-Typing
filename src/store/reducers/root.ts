/*
 * @Author: zhaoxuanzi
 * @Date: 2020-12-07 20:12:31
 * @LastEditors: zhaoxuanzi
 * @LastEditTime: 2021-01-28 19:00:25
 */
import { Word } from '@/words';
import storage from '@/utils/storage';

const UI_SCALE = 'UI_SCALE';
const UI_THEME = 'UI_THEME';
const WORDS_MODE = 'WORDS_MODE';
const COUNTDOWN_TIME = 'COUNTDOWN_TIME';
const CUSTOMER_WORDS = 'CUSTOMER_WORDS';
const BACK_IMG_URL = 'BACK_IMG_URL';
const BACK_IMG_BLUR = 'BACK_IMG_BLUR';
const BACK_IMG_OPACITY = 'BACK_IMG_OPACITY';
const BACK_IMG_POSITION_X = 'BACK_IMG_POSITION_X';
const BACK_IMG_POSITION_Y = 'BACK_IMG_POSITION_Y';
const BACK_IMG_SCALE = 'BACK_IMG_SCALE';
const BACK_IMG_ROTATION = 'BACK_IMG_ROTATION';

const _state = {
    uiScale: storage.local.get<string>(UI_SCALE) || 's',
    uiTheme: storage.local.get<string>(UI_THEME) || '',
    wordsMode: storage.local.get<string>(WORDS_MODE) || '1',
    countdownTime: storage.local.get<string>(COUNTDOWN_TIME) || '60',
    customerWords: storage.local.get<Word[]>(CUSTOMER_WORDS) || [],
    backImgUrl: storage.local.get<string>(BACK_IMG_URL) || '',
    backImgBlur: storage.local.get<number>(BACK_IMG_BLUR) || 0,
    backImgOpacity: storage.local.get<number>(BACK_IMG_OPACITY) || 1,
    backImgPositionX: storage.local.get<number>(BACK_IMG_POSITION_X) || 50,
    backImgPositionY: storage.local.get<number>(BACK_IMG_POSITION_Y) || 50,
    backImgScale: storage.local.get<number>(BACK_IMG_SCALE) || 100,
    backImgRotation: storage.local.get<number>(BACK_IMG_ROTATION) || 0,
};
type State = typeof _state;

const reducer = {
    setUiScale: (state: State, payload: State['uiScale']): Partial<State> => {
        storage.local.set(UI_SCALE, payload);
        return { uiScale: payload };
    },
    setUiTheme: (state: State, payload: State['uiScale']): Partial<State> => {
        storage.local.set(UI_THEME, payload);
        return { uiTheme: payload };
    },
    setWordsMode: (state: State, payload: State['wordsMode']): Partial<State> => {
        storage.local.set(WORDS_MODE, payload);
        return { wordsMode: payload };
    },
    setCountdownTime: (state: State, payload: State['countdownTime']): Partial<State> => {
        storage.local.set(COUNTDOWN_TIME, payload);
        return { countdownTime: payload };
    },
    saveCustomerWords: (state: State, payload: State['customerWords']): Partial<State> => {
        storage.local.set(CUSTOMER_WORDS, payload);
        return { customerWords: payload };
    },
    setBackImgUrl: (state: State, payload: State['backImgUrl']): Partial<State> => {
        storage.local.set(BACK_IMG_URL, payload);
        return { backImgUrl: payload };
    },
    setBackImgBlur: (state: State, payload: State['backImgBlur']): Partial<State> => {
        storage.local.set(BACK_IMG_BLUR, payload);
        return { backImgBlur: payload };
    },
    setBackImgOpacity: (state: State, payload: State['backImgOpacity']): Partial<State> => {
        storage.local.set(BACK_IMG_OPACITY, payload);
        return { backImgOpacity: payload };
    },
    setBackImgPositionX: (state: State, payload: State['backImgPositionX']): Partial<State> => {
        storage.local.set(BACK_IMG_POSITION_X, payload);
        return { backImgPositionX: payload };
    },
    setBackImgPositionY: (state: State, payload: State['backImgPositionY']): Partial<State> => {
        storage.local.set(BACK_IMG_POSITION_Y, payload);
        return { backImgPositionY: payload };
    },
    setBackImgScale: (state: State, payload: State['backImgScale']): Partial<State> => {
        storage.local.set(BACK_IMG_SCALE, payload);
        return { backImgScale: payload };
    },
    setBackImgRotation: (state: State, payload: State['backImgRotation']): Partial<State> => {
        storage.local.set(BACK_IMG_ROTATION, payload);
        return { backImgRotation: payload };
    },
};

export default {
    state: _state,
    reducer,
};
