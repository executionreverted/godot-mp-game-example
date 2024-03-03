import { players } from "@/services/playerService"
import { Server, Socket } from "socket.io"

export const emitPlayerList = (io: Server, socket: Socket) => {
    const player_wo_self = Object.keys(players).filter(p => p !== `${socket.id}`).map(id => [id, players[id]?.x || 0, players[id]?.y || 0])
    socket.emit('player_list', player_wo_self)
}