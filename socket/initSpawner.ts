import { Maps } from "@/services/gameMapService"
import { MonsterSpawner } from "@/services/monsterSpawner"
import { Server } from "socket.io"


export const initSpawner = (socket: Server): MonsterSpawner => {
    return new MonsterSpawner(
        socket, [
        Maps[0].id
    ])
}