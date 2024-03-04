import { Monster } from "@/types/monster.type";
import { Maps } from "../services/gameMapService";
import { GameMap } from "@/types/map.type";
import { Server } from "socket.io";
import { Vec2, distanceBetweenPoints } from "@/utils/geometry";
import { AIMonsterBus } from "@/services/eventBus";
import { NavManager } from "./NavigationManager";
import { players } from "@/services/playerService";

export const MonsterList: Monster[] = [
    {
        hp: 2,
        current_map: "0",
        id: "1",
        unique_id: "123",
        spawn_cooldown: 3,
        x: 0,
        y: 0,
        attack_cooldown: 3,
        damage: 1,
        aggro_radius: 4
    }
]

export class AIMonster {
    baseMonster: Monster;
    socket: Server
    targetPosition: Vec2 = { x: 0, y: 0 }
    movementHandler$: any
    movementEnabled: boolean = true
    chase: boolean = false
    chaseTarget: string = ""

    constructor(params: Monster, socket_: Server) {
        //  init socket
        this.socket = socket_

        this.baseMonster = params
        const { x, y } = this.randomSpawnPos(this.getMap())
        this.baseMonster.x = x
        this.baseMonster.y = y
        this.targetPosition.x = x
        this.targetPosition.y = y

        AIMonsterBus.emit(AIMonsterBus.EventTypes.MOVE, {
            x: this.baseMonster.x,
            y: this.baseMonster.y
        })

        this.movementHandler$ = setInterval(() => this.movementHandler(), 2000)
    }


    movementHandler() {
        if (!this.movementEnabled) return
        this.scanPlayers()
        if (this.chase) {
            if (this.chaseTarget) {
                var targetPlayer = players[this.chaseTarget]
                if (targetPlayer) {
                    console.log(`GOTTA CHASE YOU BASTARD `, this.chaseTarget);
                    var playerPos = players[this.chaseTarget]
                    if (playerPos) {
                        var normalized = {
                            x: Math.floor(playerPos.x / 16),
                            y: Math.floor(playerPos.y / 16)
                        }
                        var distance = distanceBetweenPoints(normalized, this.targetPosition)
                        if (distance > this.baseMonster.aggro_radius * 2) {
                            console.log('You are too far.. im going back');
                            this.chase = false
                            this.chaseTarget = ""
                        } else {
                            console.log("RUNNNN");
                            this.targetPosition = normalized
                        }
                    }
                }
            }
        }

        if (this.cantMove()) {
            // Roll a dice for random movement
            const shouldMove = this.diceRoll(20)
            if (shouldMove) {
                this.targetPosition = this.randomSpawnPos(this.getMap())
                console.log('I want to move to a new position! Im weirdoo!', this.targetPosition.x, this.targetPosition.y);
                this.nextMovementStep()
            } else {
                console.log("I'm too lazy to move brah");
            }
        } else {
            this.nextMovementStep()
        }
    }

    nextMovementStep() {
        const speed = 1; // Adjust the speed of movement
        const deltaX = this.targetPosition.x - this.baseMonster.x;
        const deltaY = this.targetPosition.y - this.baseMonster.y;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        if (distance > speed) {
            AIMonsterBus.emit(AIMonsterBus.EventTypes.FREE_CELL, {
                x: this.baseMonster.x,
                y: this.baseMonster.y
            })
            const directionX = Math.round(deltaX / distance);
            const directionY = Math.round(deltaY / distance);

            const newPos = {
                x: this.baseMonster.x + (directionX * speed),
                y: this.baseMonster.y + (directionY * speed)
            }

            if (NavManager.isOccupied(newPos.x, newPos.y)) {
                console.log('This next cell is occupied. I dont want to move anymore..');
                this.targetPosition.x = this.baseMonster.x
                this.targetPosition.y = this.baseMonster.y
                return
            }

            this.baseMonster.x = newPos.x;
            this.baseMonster.y = newPos.y;
            this.socket.emit('update_monster', this.getMonster())
            AIMonsterBus.emit(AIMonsterBus.EventTypes.MOVE, {
                x: this.baseMonster.x,
                y: this.baseMonster.y
            })
        }
    }

    scanPlayers() {
        const player = NavManager.scanRadius(this.baseMonster.x, this.baseMonster.y, this.baseMonster.aggro_radius)
        if (player) {
            this.chase = true
            this.chaseTarget = player
            console.log(`found ${player} around me.. gotta chase`);
        } else {
            this.chase = false
            this.chaseTarget = ""
            console.log(`nothing to chase today..`);
        }
    }

    cantMove(): boolean {
        return this.baseMonster.x == this.targetPosition.x && this.baseMonster.y == this.targetPosition.y
    }

    blockMovement() {
        console.log('Ohhh shit. i cant move what have you doneeee!!!');
        this.movementEnabled = false
    }

    public getMonster(): Monster {
        return this.baseMonster
    }

    public getPosition(): { x: number, y: number } {
        return {
            x: this.baseMonster.x, y: this.baseMonster.y
        }
    }

    getMap(): GameMap {
        const mapData = Maps[parseInt(this.baseMonster.current_map)]
        return mapData
    }

    public randomTarget() {
        return this.randomSpawnPos(this.getMap())
    }

    public hit(damage: number, from: string = '') {
        console.log(`I got hit from ${from}, bitch`);
        this.chase = true
        this.chaseTarget = from
        this.baseMonster.hp -= damage
        // this.blockMovement()
    }

    public isAlive(): boolean {
        return this.baseMonster.hp > 0
    }

    public scream() {
        console.log('I AM ALIVEEEEEEEEEEEEEEEE MY NAME IS', this.baseMonster.unique_id);
    }

    diceRoll(chance: number): boolean {
        return Math.floor(Math.random() * 100) <= chance;
    }

    randomSpawnPos(map: GameMap): { x: number, y: number } {
        let pos = this.calculateSpawnPos(map)
        while (NavManager.isOccupied(pos.x, pos.y)) {
            console.log('This position is occupied. I recalculate new one');

            pos = this.calculateSpawnPos(map)
        }
        return pos
    }

    calculateSpawnPos(map: GameMap) {

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
}