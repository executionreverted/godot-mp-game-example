import { players } from "@/services/playerService"
import { Server, Socket } from "socket.io"

export const handleDisconnect = (io: Server, socket: Socket) => {
    socket.on("disconnect", async () => {
        socket.broadcast.emit('player_disconnect', [`${socket.id}`])
        delete players[socket.id]
    })
}