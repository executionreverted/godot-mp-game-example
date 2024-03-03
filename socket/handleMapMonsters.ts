import { MonsterSpawner } from "@/services/monsterSpawner";
import { Server, Socket } from "socket.io";

export const handleMapMonsters = (io: Server, socket: Socket, spawner: MonsterSpawner) => {
    socket.on('get_monsters_in_map', async (data) => {
        if(typeof data !== "string") return
        socket.broadcast.emit('map_monsters', spawner.getMonstersInMap(data))
    })
}