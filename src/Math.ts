//
// 矩形の交差判定
//
export function intersectArea(a: g.E, b: g.E): boolean {
    return a.x <= b.x + b.width && a.x + a.width >= b.x && a.y <= b.y + b.height && a.y + a.height >= b.y;
}

//
// 乱数
//
export function random(): number {
    return g.game.random.generate();
}
