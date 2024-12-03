// ゲームUIに関するモジュールをこのファイルにまとめた

/**
 * バーチャルゲームパッドのエンティティを生成する関数
 */
export function createGameStickEntity(
    scene: g.Scene,
    image: g.ImageAsset,
    area: g.CommonArea,
    size: g.CommonSize,
    func:(point: g.CommonOffset) => void
): g.E {
    const width = area.width > size.width ? area.width : size.width;
    const height = area.height > size.height ? area.height : size.height;
    const entity = new g.E({
        scene,
        x: area.x,
        y: area.y,
        width,
        height
    });
    const gameStickInitialX = Math.round(width / 2);
    const gameStickInitialY = Math.round(height / 2);
    const gameStickBack = new g.Sprite({
        scene,
        src: image,
        x: gameStickInitialX,
        y: gameStickInitialY,
        scaleX: width / image.width,
        scaleY: height / image.height,
        anchorX: 0.5,
        anchorY: 0.5,
        opacity: 0.5
    });
    entity.append(gameStickBack);
    const gameStick = new g.Sprite({
        scene,
        src: image,
        x: gameStickInitialX,
        y: gameStickInitialY,
        scaleX: size.width / image.width,
        scaleY: size.height / image.height,
        anchorX: 0.5,
        anchorY: 0.5,
        touchable: true
    });
    gameStick.onPointMove.add(ev => {
        let dx = ev.prevDelta.x;
        let dy = ev.prevDelta.y;
        if (gameStick.x + dx < 0 || gameStick.x + dx > width) {
            dx = 0;
        }
        if (gameStick.y + dy < 0 || gameStick.y + dy > height) {
            dy = 0;
        }
        gameStick.moveBy(dx, dy);
        gameStick.modified();
    });
    gameStick.onPointUp.add(_ev => {
        gameStick.moveTo(gameStickInitialX, gameStickInitialY);
        gameStick.modified();
    });
    gameStick.onUpdate.add(_ev => {
        func({ x: (gameStick.x - gameStickInitialX) / (width / 2), y: (gameStick.y - gameStickInitialY) / (height / 2) });
    });
    entity.append(gameStick);
    return entity;
}
