import { GameMap } from "@/types/map.type";

export const Maps: GameMap[] = [
    {
        id: "0",
        current_alive_mobs: 0,
        max_alive_mobs: 1,
        spawnable_mobs: ["1"],
        blocked_zones: [[4, 4]],
        spawn_rect_x: [4, 16],
        spawn_rect_y: [4, 16],
        spawn_cooldown: 5
    }
]