import { players } from "@/services/playerService";
import { Server, Socket } from "socket.io";

export const handleUpdatePos = (io: Server, socket: Socket) => {
    socket.on('update_pos', async (data) => {
        players[socket.id] = {
            x: data[0],
            y: data[1]
        }
        socket.broadcast.emit('player_update_pos', [`${socket.id}`, ...data])
    })
}