var Global = require("./Global");
var createTitleScene = require("./titleScene");

//
// エントリーポイント
//
module.exports = function() {
    Global.bmpFont = new g.BitmapFont({
        src: g.game.assets["font16"],
        map: JSON.parse(g.game.assets["glyph_area"].data),
        defaultGlyphWidth: 16,
        defaultGlyphHeight: 16
    });

    var scene = createTitleScene();

    scene.message.handle(function(e) {
        if (e.data.type === "start") {
            console.log("param: " + JSON.stringify(e.data.parameters));
            Global.params = e.data.parameters; // 起動パラメータ保存
        }
    });

    g.game.vars.gameState = {
        score: 0,
        isFinished: false
    };

    return scene;
}
