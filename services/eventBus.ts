import EventEmitter from "events";

enum AIMonsterEventTypes {
    MOVE = 'move',
    FREE_CELL = 'free_cell'
}

class AIMonsterEventBus extends EventEmitter {
    EventTypes

    constructor() {
        super()
        this.EventTypes = AIMonsterEventTypes
        console.log('Initializing AIMonsterEventBus');
        
    }

    bindEventListener(event: AIMonsterEventTypes, callback: any) {
        console.log('Binding event callback for ', event);
        
        this.on(event, callback)
    }

    removeEventListener(event: AIMonsterEventTypes, callback: any) {
        this.off(event, callback)
    }
}

export const AIMonsterBus = new AIMonsterEventBus()