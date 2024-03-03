import * as React from "react"

import { FunctionComponent, useEffect, useRef, useState } from "react"

import { useLoading } from "./AsyncLoading"
import { useSocket } from "@/context/SocketContext"

export type ReactEngineProps = {
    engine: Engine
    pck: string
    width?: number
    height?: number
    params?: any
    resize?: boolean
}

function toFailure(err: any) {
    var msg = err.message || err
    console.error({msg})
    return { msg, mode: "notice", initialized: true }
}

const ReactCanvas: FunctionComponent<ReactEngineProps> = ({
    engine,
    pck = null,
    width = 480,
    height = 300
}) => {
    const {setIsGodotReady} = useSocket()
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const isInitialized = useRef<any>(false)
    const [instance, setInstance] = useState<any>()
    const [loadingState, changeLoadingState] = useLoading()

    useEffect(() => {
        if (engine.isWebGLAvailable()) {
            changeLoadingState({ mode: "indeterminate" })
            const GODOT_CONFIG = { "args": [], "canvasResizePolicy": 2, "executable": pck?.replace('.pck', ''), "experimentalVK": false, "focusCanvas": true, "gdextensionLibs": [] };
            const instance$ = new engine(GODOT_CONFIG)
            setInstance(instance$)
        } else {
            changeLoadingState(toFailure("WebGL not available"))
        }
    }, [engine])

    useEffect(() => {
        if (!pck) return;
        if (instance && !isInitialized.current) {
            console.log('Poggers RENDERRRR');
            instance
                .init(pck)
            instance.startGame(pck)
                .then(() => {
                    changeLoadingState({ mode: "hidden", initialized: true })
                })
                .catch((err: any) => changeLoadingState(toFailure(err)))
            instance.config.onProgress = (current: any, total: any) => {
                if (total > 0) {
                    changeLoadingState({ mode: "progress", percent: current / total })
                } else {
                    changeLoadingState({ mode: "indeterminate" })
                }
            }
            isInitialized.current = true
        }
    }, [instance, pck, changeLoadingState])

    useEffect(() => {
        if (instance && !canvasRef.current) {
            instance.config.canvas = (canvasRef.current)
            console.log('canvas set.');
            
        }
    }, [instance, canvasRef.current])

    return (
        <canvas
            ref={canvasRef}
            id="canvas"
            width={width}
            height={height}
            style={{ display: loadingState.initializing ? "hidden" : "block" }}
        >
            HTML5 canvas appears to be unsupported in the current browser.
            <br />
            Please try updating or use a different browser.
        </canvas>
    )
}

export default ReactCanvas