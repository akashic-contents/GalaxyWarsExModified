//
// Entity識別子定義
//
export const EntityType = {
    PLAYER: 0,
    ENEMY: 1,
    PLAYER_BULLET: 2,
    ENEMY_BULLET: 3,
    EFFECT: 4,
    ITEM: 5,
    OBSTACLE: 6
} as const;

export type EntityType = typeof EntityType[keyof typeof EntityType];
