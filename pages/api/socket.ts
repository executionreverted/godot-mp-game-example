import { PORT } from "@/config"
import { handleDisconnect } from "@/socket/handleDisconnect"
import { emitPlayerList } from "@/socket/emitPlayerList"
import { handleUpdatePos } from "@/socket/handleUpdatePos"
import type { Server as HTTPServer } from "http"
import type { Socket as NetSocket } from "net"
import type { NextApiRequest, NextApiResponse } from "next"
import type { Server as IOServer, Socket } from "socket.io"
import { Server } from "socket.io"
import { players } from "@/services/playerService"
import { initSpawner } from "@/socket/initSpawner"
import { handleMapMonsters } from "@/socket/handleMapMonsters"



export const config = {
    api: {
        bodyParser: false,
    },
}

interface SocketServer extends HTTPServer {
    io?: IOServer | undefined
}

interface SocketWithIO extends NetSocket {
    server: SocketServer
}

interface NextApiResponseWithSocket extends NextApiResponse {
    socket: SocketWithIO
}
export default function SocketHandler(_req: NextApiRequest, res: NextApiResponseWithSocket) {
    if (res.socket.server.io) {
        res.status(200).json({ success: true, message: "Socket is already running", socket: `:${PORT + 1}` })
        return
    }

    console.log("Starting Socket.IO server on port:", PORT + 1)
    const io: Server = new Server({ path: "/api/socket", addTrailingSlash: false, cors: { origin: "*" } }).listen(PORT + 1)
    let spawner = initSpawner(io)
    console.log('SPAWNER INITIALIZED');
    io.on("connect", (socket: Socket) => {
        players[socket.id] = {
            x: 0,
            y: 0
        }
        socket.broadcast.emit('player_connect', [`${socket.id}`, players[socket.id].x, players[socket.id].y])
        // todo, get player map first and use here
        socket.timeout(1000).emit('map_monsters', spawner.getMonstersInMap("0"))
        handleMapMonsters(io, socket, spawner)
        emitPlayerList(io, socket)
        handleUpdatePos(io, socket)
        handleDisconnect(io, socket)
    })

    res.socket.server.io = io
    res.status(201).json({ success: true, message: "Socket is started", socket: `:${PORT + 1}` })
}