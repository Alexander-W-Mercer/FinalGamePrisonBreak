class Load extends Phaser.Scene {
    constructor() {
        super("loadScene");
    }

    preload() {
        this.load.setPath("./assets/");

        // Load characters spritesheet
        //this.load.atlas("PrisonBreak_characters", "tilemap-characters-packed.png", "tilemap-characters-packed.json");
        this.load.image("green_character", "green_character.png")
        this.load.image("red_character", "red_character.png")
        this.load.image("purple_character", "purple_character.png")

        console.log("here we are at the start")
        // Load tilemap information
        this.load.image("tilemap_tiles", "tilesheet.png");                         // Packed tilemap
        this.load.tilemapTiledJSON("PrisonBreak", "PrisonBreak.tmj");   // Tilemap in JSON

        console.log("we've loaded the tiles")

        // Load the tilemap as a spritesheet
        this.load.spritesheet("tilemap_sheet", "tilesheet.png", {
            frameWidth: 64,
            frameHeight: 64
        });

        this.load.image("tilemap_tiles", "tilesheet.png");
        this.load.spritesheet("coin_sheet", "spritesheet-tiles-default.png", {
            frameWidth: 32,
            frameHeight: 32
        });

        //console.log("loaded tilemap as a spritesheet")
        this.load.multiatlas("kenny-particles", "kenny-particles.json");

        this.load.scenePlugin('AnimatedTiles', './lib/AnimatedTiles.js', 'animatedTiles', 'animatedTiles');
        console.log("another test")

    }

    create() {

         // Pass to the next Scene
         console.log("starting scene")
         this.scene.start("PrisonBreakScene");
         console.log("did that work?")
    }

    // Never get here since a new scene is started in create()
    update() {
    }
}