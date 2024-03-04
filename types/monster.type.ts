export type Monster = {
    id: string,
    current_map: string,
    hp: number,
    x: number,
    y: number,
    spawn_cooldown: number
    unique_id: string,
    damage: number,
    attack_cooldown: number,
    aggro_radius: number
}