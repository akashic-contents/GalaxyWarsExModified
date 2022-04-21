import { GameCore } from "./GameCore";

//
// グローバル変数
//
export const Global: IGlobal = {
    gameCore: null,
    bmpFont:  null,
    hiScore: 0,
    params: {}
};

interface IGlobal  {
    gameCore: GameCore | null;
    bmpFont: g.BitmapFont | null;
    hiScore: number;
    params: any;
}