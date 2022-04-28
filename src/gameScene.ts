import { Global } from "./Global";
import { GameCore } from "./GameCore";
import { GameOverLogo } from "./GameOverLogo";

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

        const timeGaugeWidth = g.game.width;
        const timeGauge = new g.FilledRect({
            scene: scene,
            width: timeGaugeWidth,
            height: 4,
            cssColor: "Red"
        });
        scene.append(timeGauge);

        // game loop
        let showResultUI = false;
        scene.onUpdate.add(() => {
            Global.gameCore.update();

            g.game.vars.gameState.score = Global.gameCore.player.score;

            const maxPlayTimeInFPS = GameCore.MAX_PLAYTIME * g.game.fps;
            const remainTimeRate = Math.max(maxPlayTimeInFPS - Global.gameCore.cntr, 0) / maxPlayTimeInFPS;
            timeGauge.width = timeGaugeWidth * remainTimeRate;
            timeGauge.modified();

            if (!showResultUI && Global.gameCore.player.hp <= 0) {
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
