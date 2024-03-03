'use client'

import { PORT } from '@/config';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextProps {
    children: React.ReactNode;
}
interface SocketContext { socket: Socket | null, isGodotReady: boolean, setIsGodotReady: any }

const SocketContext = createContext<SocketContext>({
    socket: null,
    isGodotReady: false,
    setIsGodotReady: (e: any) => { }
});

export const useSocket = (): SocketContext => {
    return useContext(SocketContext);
};

async function initPlayers(data: any[]) {
    console.log('init data');
    console.log(data);

    if (window.update_player) {
        for (let index = 0; index < data.length; index++) {
            await window.update_player(...data[index])
        }
        return
    }
    setTimeout(() => {
        return initPlayers(data)
    }, 250);
}

export const SocketProvider: React.FC<SocketContextProps> = ({ children }) => {
    const [isGodotReady, setIsGodotReady] = useState(false)
    const [socket, setSocket] = useState<any>()

    useEffect(() => {
        console.log({ isGodotReady });

        if (!isGodotReady || socket) return;
        var newSocket = io(`:${PORT + 1}`, {
            auth: {
                name: localStorage.getItem('username') || ""
            }, path: "/api/socket", addTrailingSlash: false
        })

        newSocket.on("connect", () => {
            console.log("Connected to socket io server")
        })

        newSocket.on('player_list', (data) => {
            initPlayers(data)
        })

        newSocket.on('player_connect', (data) => {
            console.log(data);
            if (window.update_player) {
                // console.log('Creating player in game, played socket id : ', data);
                window.update_player(...data)
                window.log_all_players()
            }
        })

        newSocket.on('player_update_pos', (data) => {
            if (window.update_player) {
                // console.log(`New position of player ${data[0]} is x:${data[1]} y:${data[2]}`);
                window.update_player(...data)
            }
        })

        newSocket.on('player_disconnect', (data) => {
            if (window.destroy_player) {
                window.destroy_player(...data)
            }
        })

        newSocket.on('spawn_mob', (data) => {
            if (!data) return
            data.forEach((mob: any) => {
                window.load_monster(mob)
            });
        })
        newSocket.on('update_monster', (data) => {
            if (!data) return
            window.update_monster(data)
        })


        newSocket.on('map_monsters', (data) => {
            if (!data) return
            console.log({ monsters: data });

            data.forEach((mob: any) => {
                window.load_monster(mob)
            });
        })

        newSocket.on("disconnect", (data) => {
            console.log("Disconnected")
        })

        newSocket.on("connect_error", async err => {
            console.log(`connect_error due to ${err.message}`)
            await fetch("/api/socket")
        })

        setSocket(newSocket);
        // Clean up the socket connection on unmount
        return () => {
            newSocket?.disconnect();
            setSocket(null)
        };
    }, [isGodotReady]);

    return (
        <SocketContext.Provider value={{ socket, setIsGodotReady, isGodotReady }}>
            {children}
        </SocketContext.Provider>
    );
};

export default SocketProvider