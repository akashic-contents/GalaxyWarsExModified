import { Global } from "./Global";
import { GameCore } from "./GameCore";
import { GameOverLogo } from "./GameOverLogo";
import { createGameStickEntity } from "./gameUi";

//
// ゲームシーン生成
//
export function createGameScene(): g.Scene {
    const scene = new g.Scene({ game: g.game });

    scene.onLoad.add(() => {

        Global.gameCore = new GameCore(scene);

        // player input
        let clicked = false;
        scene.onPointDownCapture.add(() => {
            clicked = true;
        });
        scene.onPointMoveCapture.add((ev) => {
            if (!clicked) {
                return;
            }
            Global.gameCore.player.move(ev.prevDelta.x, ev.prevDelta.y);
        });
        scene.onPointUpCapture.add(() => {
            clicked = false;
        });
        // 自機操作方法としてバーチャルスティックも追加
        const gameStickBackSize = 100;
        const gameStickSize = 72;
        const gameStick = createGameStickEntity(
            scene,
            Global.gameCore.scene.asset.getImageById("gameStick"),
            { x: g.game.width - gameStickBackSize - 12, y: g.game.height - gameStickBackSize - 12, width: gameStickBackSize, height: gameStickBackSize },
            { width: gameStickSize, height: gameStickSize },
            (offset) => {
                const speed = Global.gameCore.player.getSpeed();
                let dx = Math.round(offset.x * speed);
                let dy = Math.round(offset.y * speed);
                // バーチャルスティックが使われている時は既存の入力法を使わないように
                if (dx !== 0 || dy !== 0) {
                    clicked = false;
                }
                Global.gameCore.player.move(dx, dy);
            }
        );
        scene.append(gameStick);

        const timeGaugeWidth = g.game.width;
        const timeGauge = new g.FilledRect({
            scene: scene,
            width: timeGaugeWidth,
            height: 4,
            cssColor: "green"
        });
        scene.append(timeGauge);

        // 残り時間表示ラベル
        const timeLabel = new g.Label({
            scene: Global.gameCore.scene,
            text: "",
            font: Global.bmpFont,
            fontSize: 16,
            x: g.game.width - (16 * 9 + 4), y: 4
        });
        scene.append(timeLabel);

        // ステージBGM再生
        let stageBgm = scene.asset.getAudioById("bgm_normal");
        stageBgm.play();

        // game loop
        let showResultUI = false;
        let startCountDownBgm = false; // BGM変更用フラグ
        scene.onUpdate.add(() => {
            Global.gameCore.update();

            g.game.vars.gameState.score = Global.gameCore.player.score;

            const maxPlayTimeInFPS = GameCore.MAX_PLAYTIME * g.game.fps;
            const remainTimeRate = Math.max(maxPlayTimeInFPS - Global.gameCore.cntr, 0) / maxPlayTimeInFPS;
            const remainTime = Math.floor(GameCore.MAX_PLAYTIME - Global.gameCore.cntr / g.game.fps);
            // 残り時間によってバーやラベルの色を変えてプレイヤーの危機感を煽るように
            if (remainTime <= 10) {
                timeGauge.cssColor = "red";
                timeLabel.textColor = "red";
                // 残り時間が少なくなったらBGMを変える
                if (Global.gameCore.player.hp > 0 && !startCountDownBgm) {
                    startCountDownBgm = true;
                    stageBgm.stop();
                    stageBgm = scene.asset.getAudioById("bgm_near_timeout");
                    stageBgm.play();
                }
            } else if (remainTime <= 30) {
                timeGauge.cssColor = "yellow";
            }
            timeGauge.width = timeGaugeWidth * remainTimeRate;
            timeGauge.modified();
            timeLabel.text = `TIME: ${remainTime > 0 ? remainTime : 0}`;
            timeLabel.invalidate();

            if (!showResultUI && Global.gameCore.player.hp <= 0) {
                // ゲームオーバー処理なのでここでゲームオーバー用BGM(ループなし)を鳴らす
                stageBgm.stop();
                g.game.scene().asset.getAudioById("bgm_gameover").play();

                scene.onPointDownCapture.removeAll();
                scene.onPointMoveCapture.removeAll();
                scene.onPointUpCapture.removeAll();

                scene.setTimeout(() => {
                    const logoEntity = new GameOverLogo();
                    Global.gameCore.entities.push(logoEntity);
                }, 1000);
                showResultUI = true;

                g.game.vars.gameState.isFinished = true;
            }

            if (Global.gameCore.cntr === maxPlayTimeInFPS + g.game.fps * 6) {
                console.log("👍 done with " + JSON.stringify(g.game.vars.gameState));
            }
        });

        Global.gameCore.start();
    });

    return scene;
}
