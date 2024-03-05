import { MonsterSpawner } from "@/services/monsterSpawner";
import { players } from "@/services/playerService";
import { distanceBetweenPoints } from "@/utils/geometry";
import { Server, Socket } from "socket.io";

export const handleAttackMonster = (io: Server, socket: Socket, spawner: MonsterSpawner) => {
    socket.on('hit_monster', (monsterId: string) => {
        if (!monsterId) {
            console.log("Invalid mob id provided");
            return;
        }
        const playerPos = players[socket.id]
        const mapId = "0"
        const mob = spawner.getMonsterById(monsterId, mapId)
        if (!mob) {
            console.log('Cannot find this monster');
            return
        }
        const dist = distanceBetweenPoints(
            { x: Math.floor(playerPos.x) / 16, y: Math.floor(playerPos.y / 16) },
            { x: mob.x, y: mob.y }
        )
        console.log(dist);
        
        if (
            dist <= 1.85
        ) { // make dynamic later
            spawner.hitMonster(mapId, socket.id, monsterId)
        } else {
            console.log('Out of range');
        }
    })
}