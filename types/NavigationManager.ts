import { AIMonsterBus } from "@/services/eventBus";
import { Vec2 } from "@/utils/geometry";

class NavigationManager {
    occupiedGrid: { [x: number]: { [y: number]: boolean } } = {};
    occupiedBy: { [x: number]: { [y: number]: string } } = {};

    constructor() {
        console.log('Initializing NavManager');

        AIMonsterBus.bindEventListener(
            AIMonsterBus.EventTypes.MOVE,
            (pos: Vec2) => {
                this.markOccupied(pos.x, pos.y)
            }
        )

        AIMonsterBus.bindEventListener(
            AIMonsterBus.EventTypes.FREE_CELL,
            (pos: Vec2) => {
                this.freeCell(pos.x, pos.y)
            }
        )
    }

    markOccupied(x: number, y: number, occupier = 'mob') {
        if (!this.occupiedGrid[x]) {
            this.occupiedGrid[x] = {};
            this.occupiedBy[x] = {};
        }
        // console.log('Occupy Cell ', x, ' ', y, ' Occupied by ', occupier);
        this.occupiedGrid[x][y] = true;
        this.occupiedBy[x][y] = occupier;
    }

    freeCell(x: number, y: number) {
        if (!this.occupiedGrid[x]) {
            this.occupiedGrid[x] = {};
            this.occupiedBy[x] = {};
        }
        // console.log('Free grid ', x, ' ', y);
        this.occupiedGrid[x][y] = false;
        this.occupiedBy[x][y] = "";
    }

    isOccupied(x: number, y: number): boolean {
        return !!this.occupiedGrid[x]?.[y];
    }

    getOccupierType(x: number, y: number): string {
        return this.occupiedBy[x][y]
    }

    scanRadius(centerX: number, centerY: number, radius: number): string {
        let closestPlayer: string = "";
        let closestDistanceSq = Number.MAX_SAFE_INTEGER;

        for (let x = centerX - radius; x <= centerX + radius; x++) {
            for (let y = centerY - radius; y <= centerY + radius; y++) {
                if (!this.occupiedGrid[x]) {
                    this.occupiedGrid[x] = {};
                    this.occupiedBy[x] = {};
                }
                const occType = this.getOccupierType(x, y)
                if (this.isOccupied(x, y) && occType !== 'mob') {
                    const distanceSq = (x - centerX) ** 2 + (y - centerY) ** 2;
                    if (distanceSq < closestDistanceSq) {
                        closestDistanceSq = distanceSq;
                        closestPlayer = occType;
                    }
                }
            }
        }
        
        return closestPlayer;
    }
}

export const NavManager = new NavigationManager()