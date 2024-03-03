'use client'

import { useSocket } from "@/context/SocketContext";
import { useEffect, useRef, useState } from "react";
import { useAccount, useConnect } from "wagmi";
import { injected as Injected } from 'wagmi/connectors'

declare global {
    interface Window {
        web3_connect: any;
        set_user_address: any,
        create_player: any
        update_player: any
        destroy_player: any
        update_player_pos: any
        log_all_players: any
        load_monster: any
        hit_monster: any
        update_monster: any
    }
}

function is_godot_initialized(): boolean {
    return typeof window !== "undefined" && window.update_player
}

let my_last_pos = { x: 0, y: 0 };

export default function useInjectMethods() {
    const injected = useRef(false)
    const [retry, setRetry] = useState(0)
    const { connect, connectors } = useConnect()
    const { address, isConnected, } = useAccount()
    const { socket, setIsGodotReady, isGodotReady } = useSocket()
    const godotState = useRef<any>({
        address: null
    })

    useEffect(
        () => {

            if (!isConnected) {
                connect({ connector: connectors[0] })
            }

            if (!isGodotReady) return
            if (socket) {
                injected.current = true;
                console.log('Set godot methods "update_player_pos"');
                window.update_player_pos = (x: any, y: any) => {
                    if (x == my_last_pos.x && y == my_last_pos.y) {
                        console.log('Position is same');
                        return;
                    }
                    console.log('emitting position,', [x, y]);
                    socket.emit('update_pos', [x, y])
                    my_last_pos = { x, y }
                }

                window.hit_monster = (monsterId: string) => {
                    console.log('Client send hit to ', monsterId);
                    socket.emit('hit_monster', monsterId)
                }

                window.web3_connect = () => {
                    connect({ connector: Injected() })
                }

                return
            }





        },
        [socket, isGodotReady]
    )

    // Hook for initializing wallet in GodotApp
    useEffect(() => {
        // if (godotState.current['address'] == address) return
        if (is_godot_initialized()) {
            // window.set_user_address("address")
            // godotState.current.address = "address"
            setIsGodotReady(true)
        } else {
            console.log("Checking godot...")
            setTimeout(() => {
                setRetry(p => p + 1)
            }, 200);
        }
    }, [retry])

    return injected.current
}