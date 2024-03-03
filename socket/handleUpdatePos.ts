import { players } from "@/services/playerService";
import { NavManager } from "@/types/NavigationManager";
import { Server, Socket } from "socket.io";

export const handleUpdatePos = (io: Server, socket: Socket) => {
    socket.on('update_pos', async (data) => {
        const oldPos = players[socket.id]
        NavManager.freeCell(Math.floor(oldPos.x / 16), Math.floor(oldPos.y / 16))

        players[socket.id] = {
            x: data[0],
            y: data[1]
        }
        NavManager.markOccupied(Math.floor(data[0] / 16), Math.floor(data[1] / 16), socket.id)
        socket.broadcast.emit('player_update_pos', [`${socket.id}`, ...data])
    })
}