import { Global } from "./Global";
import * as math from "./Math";
import { EntityType } from "./EntityType";
import { Particle } from "./Particle";
import { Enemy } from "./Enemy";

const BULLET_WIDTH = 8;
const BULLET_HEIGHT = 8;

export interface BulletParameterObject {
    type: EntityType;
    obstacles: number[];
    pos: g.CommonOffset;
    vel: g.CommonOffset;
    hp: number;
    homing: boolean;
    imageAsset: g.ImageAsset;
    life?: number;
    th?: number;
}

export class Bullet {
    private obstacles: number[];
    private pos: g.CommonOffset;
    private prevPos;
    private vel: g.CommonOffset;
    private homing: boolean;
    private th: number;
    private life: number;
    private spr: g.E;
    hp: number;
    type: EntityType;

    constructor(params: BulletParameterObject) {
        this.type = params.type;
        this.obstacles = params.obstacles;
        this.pos = { x: params.pos.x, y: params.pos.y };
        this.prevPos = { x: params.pos.x, y: params.pos.y };
        this.vel = { x: params.vel.x, y: params.vel.y };
        this.hp = params.hp;
        this.homing = params.homing;
        this.th = params.th ? params.th : 0;
        this.life = params.life;

        this.pos.x -= BULLET_WIDTH / 2;
        this.spr = new g.E({
            scene: Global.gameCore.scene,
            width: BULLET_WIDTH,
            height: BULLET_HEIGHT,
            x: this.pos.x,
            y: this.pos.y
        });
        this.spr.append(new g.Sprite({
            scene: Global.gameCore.scene,
            src: params.imageAsset,
            x: (BULLET_WIDTH - params.imageAsset.width) / 2
        }));

        Global.gameCore.gameLayer.append(this.spr);
    }

    /**
     * 状態更新
     */
    update(): boolean {
        if (this.hp <= 0) {
            return false;
        }

        this.prevPos.x = this.pos.x;
        this.prevPos.y = this.pos.y;
        if (!this.homing) {
            this.pos.x += this.vel.x;
            this.pos.y += this.vel.y;
        } else {
            const e = this.type === EntityType.PLAYER_BULLET ? Global.gameCore.findEnemy() : Global.gameCore.player;
            if (e && e.hp > 0) {
                const dx = e.pos.x + e.spr.width / 2 - this.pos.x;
                const dy = e.pos.y + e.spr.height / 2 - this.pos.y;
                const th = Math.atan2(-dy, dx) - Math.PI / 2;
                let dth = th - this.th;
                while (dth > Math.PI) dth -= Math.PI * 2;
                while (dth < -Math.PI) dth += Math.PI * 2;
                const limit = Math.PI * (5 / 180);
                dth = Math.max(-limit, Math.min(limit, dth));
                this.th += dth;
            }
            const spd = Math.sqrt(this.vel.x * this.vel.x + this.vel.y * this.vel.y);
            const c = Math.cos(this.th);
            const s = Math.sin(this.th);
            this.pos.x += -s * spd;
            this.pos.y -= c * spd;
            if (this.life <= 0) {
                this.homing = false;
                this.vel.x = -s * spd * 2.5;
                this.vel.y = -c * spd * 2.5;
            }
        }

        this.spr.x = this.pos.x;
        this.spr.y = this.pos.y;
        this.spr.angle = -this.th / Math.PI * 180;
        this.spr.modified();

        this.life--;

        return !(this.pos.x < -this.spr.width || this.pos.x > g.game.width || this.pos.y < -this.spr.height || this.pos.y > g.game.height);
    }

    /**
     * 衝突イベントハンドラ
     */
    onCollision(e: Enemy): void {
        this.hp--;
        e.hp--;
        let dir = null;
        if (e.hp > 0) {
            dir = { x: this.pos.x - this.prevPos.x, y: this.pos.y - this.prevPos.y };
        }
        Global.gameCore.entities.push(new HitEffectEmitter(e, dir));

        if (e.hp === 0 && e.point) {
            Global.gameCore.player.score += e.point;
            if (Global.hiScore < Global.gameCore.player.score) {
                Global.hiScore = Global.gameCore.player.score;
            }
        }
    }

    destroy(): void {
        this.spr.destroy();
    }
}

//
// 被弾エフェクト（小）エミッタコンストラクタ
//
class HitEffectEmitter {
    private entity: Enemy;
    private dir: g.CommonOffset;
    private cntr: number;
    private life: number;

    constructor(entity: Enemy, dir: g.CommonOffset) {
        this.entity = entity;
        this.dir = dir;
        this.cntr = 0;
        this.life = 3;
    }

    /**
     * 状態更新
     */
    update(): boolean {
        for (let i = 0; i < 4; i++) {
            const spd = 100 + 200 * math.random();
            const th = math.random() * Math.PI * 2;
            let vel = null;
            if (this.dir) {
                const len = Math.sqrt(this.dir.x * this.dir.x + this.dir.y * this.dir.y);
                if (len > 0) {
                    const dx = this.dir.x / len;
                    const dy = this.dir.y / len;
                    const r = (math.random() + math.random() + math.random()) / 3;
                    const th = -Math.PI / 4 + Math.PI / 2 * r;
                    vel = {
                        x: (Math.cos(th) * dx - Math.sin(th) * dy) * spd,
                        y: (Math.sin(th) * dx + Math.cos(th) * dy) * spd
                    };
                }
            }
            vel = vel || { x: spd * Math.cos(th), y: spd * Math.sin(th) };
            const p = new Particle({
                pos: { x: this.entity.pos.x + this.entity.spr.width / 2, y: this.entity.pos.y + this.entity.spr.height / 2 },
                vel: vel,
                drag: 0,
                grav: 0,
                life: g.game.fps,
                cssColor: math.random() < 0.33 ? "Yellow" : (math.random() < 0.5 ? "Red" : "White"),
                width: 2,
                height: 4,
                onUpdate: (p) => {
                    const remain = p.life - p.cntr;
                    if (remain < 8) {
                        p.spr.opacity = 0.7 * remain / 8;
                    }
                    p.spr.angle += 180 / g.game.fps;
                    p.spr.modified();
                }
            });
            p.spr.angle = math.random() * 180;
            p.spr.opacity = 0.7;
            Global.gameCore.entities.push(p);
        }

        this.cntr++;
        return this.cntr < this.life;
    }

    destroy(): void {
        // nothing to do.
    }
}
