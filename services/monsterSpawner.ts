import { GameMap } from "@/types/map.type"
import { Maps } from "./gameMapService"
import { Monster } from "@/types/monster.type"
import { MonsterList } from "./monsterService"
import moment from "moment"
import { Server, Socket } from "socket.io"

export class MonsterSpawner {
    socket: Server
    mapsData: { [id: string]: GameMap } = {}
    mapsToSpawn: string[] = []
    mapMonsters: { [id: string]: Monster[] } = {}
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
            if (moment(this.nextSpawnTimes[mapId]).isBefore(Date.now()) && map.current_alive_mobs < map.max_alive_mobs) {
                this.spawnMobInMap(map)
            }
        })
    }

    spawnMobInMap(map: GameMap) {
        this.nextSpawnTimes[map.id] = moment(Date.now()).add(map.spawn_cooldown, "seconds").toISOString()
        console.log(`Next spawn for map ${map.id} is ${this.nextSpawnTimes[map.id]}`);
        const newMonster: Monster = this.pickRandomMonster(map.spawnable_mobs)
        newMonster.unique_id = Math.floor(Math.random() * 99999999).toString()
        const { x, y } = this.randomSpawnPos(map)
        newMonster.x = x
        newMonster.y = y
        this.mapsData[map.id].current_alive_mobs++
        this.mapMonsters[map.id].push(Object.assign({}, newMonster))
        this.socket.emit("spawn_mob", [newMonster])
        console.log(`Spawning mob in Map ${map.id}, with position X: ${x} Y: ${y}`);
        console.log(newMonster);
        
    }

    randomSpawnPos(map: GameMap): { x: number, y: number } {
        const minX = map.spawn_rect_x[0]
        const maxX = map.spawn_rect_x[1]
        const minY = map.spawn_rect_y[0]
        const maxY = map.spawn_rect_y[1]

        const xDiff = maxX - minX
        const x = Math.floor(Math.random() * xDiff) + minX

        const yDiff = maxY - minY
        const y = Math.floor(Math.random() * yDiff) + minY

        return { x, y }
    }

    pickRandomMonster(list: string[] = []): Monster {
        const l = list.length
        return MonsterList[Math.floor(Math.random() * l)]
    }

    getMonstersInMap(id: string) {
        return this.mapMonsters[id] || []
    }
}