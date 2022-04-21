//
// アイテム識別子定義
//
export const ItemType = {
    SHIELD: 0,
    HOMING: 1,
    RAPIDFIRE: 2,
    BULLETSPEED: 3,
    PIERCING: 4,
    RECOVER: 5
} as const;

export type ItemType = typeof ItemType[keyof typeof ItemType];
