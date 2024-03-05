import { GameMap } from "@/types/map.type"
import { Maps } from "./gameMapService"
import { Monster } from "@/types/monster.type"
import { AIMonster, MonsterList } from "../types/AIMonster"
import moment from "moment"
import { Server, Socket } from "socket.io"

export class MonsterSpawner {
    socket: Server
    mapsData: { [id: string]: GameMap } = {}
    mapsToSpawn: string[] = []
    mapMonsters: { [id: string]: AIMonster[] } = {}
    nextSpawnTimes: { [id: string]: string } = {}

    constructor(socket_: Server, _mapsToSpawn: string[] = []) {
        this.socket = socket_
        this.mapsToSpawn = _mapsToSpawn.slice()
        this.createMaps()
    }

    createMaps() {
        Maps.forEach((map: GameMap) => {
            this.mapsData[map.id] = map
            this.mapMonsters[map.id] = []
            this.nextSpawnTimes[map.id] = moment(Date.now()).toISOString()
        })
        console.log('Initialized spawner');
        setInterval(() => this.doJob(), 1000)
    }

    doJob() {
        this.mapsToSpawn?.forEach(mapId => {
            const map = this.mapsData[mapId]
            if (moment(this.nextSpawnTimes[mapId]).isBefore(Date.now()) && this.getMonsterCountOfMap(mapId) < map.max_alive_mobs) {
                this.spawnMobInMap(map)
            }
        })
    }

    spawnMobInMap(map: GameMap) {
        this.nextSpawnTimes[map.id] = moment(Date.now()).add(map.spawn_cooldown, "seconds").toISOString()
        console.log(`Next spawn for map ${map.id} is ${this.nextSpawnTimes[map.id]}`);
        const newMonster: Monster = this.pickRandomMonster(map.spawnable_mobs)
        newMonster.unique_id = Math.floor(Math.random() * 99999999).toString()
        newMonster.current_map = map.id
        const baseMonsters = Object.assign({}, newMonster)
        const newAIMonster = new AIMonster(baseMonsters, this.socket)
        this.mapMonsters[map.id].push(newAIMonster)
        this.socket.emit("spawn_mob", [newAIMonster.getMonster()])
        console.log(`Spawning mob in Map ${map.id}, with position ${newAIMonster.getPosition().x},${newAIMonster.getPosition().y}`);
    }


    pickRandomMonster(list: string[] = []): Monster {
        const l = list.length
        return MonsterList[Math.floor(Math.random() * l)]
    }

    getMonstersInMap(id: string) {
        return this.mapMonsters[id].map(m => m.getMonster()) || []
    }
    getMonsterCountOfMap(id: string) {
        return this.mapMonsters[id].length
    }

    hitMonster(mapId: string, playerId: string, monsterId: string) {
        const monsterIdx = this.mapMonsters[mapId].findIndex(a => a.getMonster().unique_id == monsterId)
        if (monsterIdx == -1) {
            console.log('Cannot find this monster in map.. probably dead');
            return
        }
        const mob = this.mapMonsters[mapId][monsterIdx]
        // will be dynamic and calculated according to player stats later
        const damage = 1
        if (mob) {
            mob.hit(damage, playerId)
            if (!mob.isAlive()) {
                // handle dead
                console.log('dead');
                this.mapMonsters[mapId].splice(monsterIdx, 1)
            }
            this.socket.emit('update_monster', mob.getMonster())
        }
    }

    getMonsterById(id: string, mapId: string) {
        const monsterIdx = this.mapMonsters[mapId].findIndex(a => a.getMonster().unique_id == id)
        if (monsterIdx == -1) {
            console.log('Cannot find this monster in map.. probably dead');
            return null
        }
        return this.mapMonsters[mapId][monsterIdx].getMonster()
    }
}