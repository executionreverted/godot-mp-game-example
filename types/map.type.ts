export type GameMap = {
    id: string,
    blocked_zones: number[][]
    spawnable_mobs: string[],
    max_alive_mobs: number
    current_alive_mobs: number
    spawn_rect_x: number[]
    spawn_rect_y: number[]
    spawn_cooldown : number
}