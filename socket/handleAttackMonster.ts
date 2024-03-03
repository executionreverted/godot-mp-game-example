import { MonsterSpawner } from "@/services/monsterSpawner";
import { players } from "@/services/playerService";
import { Server, Socket } from "socket.io";

export const handleAttackMonster = (io: Server, socket: Socket, spawner: MonsterSpawner) => {
    socket.on('hit_monster', async (monsterId: string) => {
        if (!monsterId) {
            console.log("Invalid mob id provided");
            return;
        }
        // make dynamic later
        const mapId = "0"
        spawner.hitMonster(mapId, socket.id, monsterId)
    })
}