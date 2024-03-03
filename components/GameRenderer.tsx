import React from 'react'
import ReactGodot from './Godot'

export const GameRenderer = React.memo(() => (
    <ReactGodot pck="game" script="game.js"></ReactGodot>
))

export default GameRenderer