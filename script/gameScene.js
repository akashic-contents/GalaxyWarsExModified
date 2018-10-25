var Global = require("./Global");
var math = require("./Math");
var EntityType = require("./EntityType");
var createTitleScene = require("./titleScene");
var GameCore = require("./GameCore");
var GameOverLogo = require("./GameOverLogo");

var game = g.game;

//
// ゲームシーン生成
//
function createGameScene() {
    var scene = new g.Scene({ game: game });

    scene.loaded.handle(function() {

        Global.gameCore = new GameCore(scene);

        // player input
        var clicked = false;
        scene.pointDownCapture.handle(function() {
            clicked = true;
        });
        scene.pointMoveCapture.handle(function(ev) {
            if (!clicked) {
                return;
            }
            Global.gameCore.player.move(ev.prevDelta.x, ev.prevDelta.y);
        });
        scene.pointUpCapture.handle(function() {
            clicked = false;
        });

        var timeGaugeWidth = game.width;
        var timeGauge = new g.FilledRect({
            scene: scene,
            width: timeGaugeWidth,
            height: 4,
            cssColor: "Red"
        });
        scene.append(timeGauge);

        // game loop
        var showResultUI = false;
        scene.update.handle(function() {
            Global.gameCore.update();

            game.vars.gameState.score = Global.gameCore.player.score;

            var maxPlayTimeInFPS = GameCore.MAX_PLAYTIME * game.fps;
            var remainTimeRate = Math.max(maxPlayTimeInFPS - Global.gameCore.cntr, 0) / maxPlayTimeInFPS;
            timeGauge.width = timeGaugeWidth * remainTimeRate;
            timeGauge.modified();

            if (!showResultUI && Global.gameCore.player.hp <= 0) {
                scene.pointDownCapture.removeAll();
                scene.pointMoveCapture.removeAll();
                scene.pointUpCapture.removeAll();

                scene.setTimeout(1000, function() {
                    var logoEntity = new GameOverLogo();
                    Global.gameCore.entities.push(logoEntity);
                });
                showResultUI = true;

                game.vars.gameState.isFinished = true;
            }

            if (Global.gameCore.cntr === maxPlayTimeInFPS + game.fps * 6) {
                console.log("👍 done with " + JSON.stringify(game.vars.gameState));;
            }
        });

        Global.gameCore.start();
    });

    return scene;
}

module.exports = createGameScene;
