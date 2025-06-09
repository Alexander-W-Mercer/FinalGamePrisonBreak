// Alexander Mercer with template code and help from Jim Whitehead
// Created: 6/3/2025
// Phaser: 3.70.0
//
// Prison Break Game
//
// A simple game about breaking free from a simply drawn prison.
//

// debug with extreme prejudice
"use strict"

// game config
let config = {
    parent: 'phaser-game',
    type: Phaser.CANVAS,
    render: {
        pixelArt: false  // prevent pixel art from getting blurred when scaled
    },
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            tileBias: 30,
            gravity: {
                x: 0,
                y: 0
            }
        }
    },
    width: 1440,
    height: 600,
    backgroundColor: '#80bbc2',
    scene: [Load, PrisonBreak]
}

var cursors;
const SCALE = 2.0;
var my = {sprite: {}, text: {}, vfx: {}};

const game = new Phaser.Game(config);