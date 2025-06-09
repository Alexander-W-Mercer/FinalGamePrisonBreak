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

        console.log("loaded tilemap as a spritesheet")

        // Oooh, fancy. A multi atlas is a texture atlas which has the textures spread
        // across multiple png files, so as to keep their size small for use with
        // lower resource devices (like mobile phones).
        // kenny-particles.json internally has a list of the png files
        // The multiatlas was created using TexturePacker and the Kenny
        // Particle Pack asset pack.
        this.load.multiatlas("kenny-particles", "kenny-particles.json");

        this.load.scenePlugin('AnimatedTiles', './lib/AnimatedTiles.js', 'animatedTiles', 'animatedTiles');
        console.log("another test")

    }

    create() {
        // this.anims.create({
        //     key: 'walk',
        //     frames: this.anims.generateFrameNames('PrisonBreak_characters', {
        //         prefix: "tile_",
        //         start: 0,
        //         end: 1,
        //         suffix: ".png",
        //         zeroPad: 4
        //     }),
        //     frameRate: 15,
        //     repeat: -1
        // });

        // this.anims.create({
        //     key: 'idle',
        //     defaultTextureKey: "PrisonBreak_characters",
        //     frames: [
        //         { frame: "tile_0000.png" }
        //     ],
        //     repeat: -1
        // });

        // this.anims.create({
        //     key: 'jump',
        //     defaultTextureKey: "PrisonBreak_characters",
        //     frames: [
        //         { frame: "tile_0001.png" }
        //     ],
        // });

         // ...and pass to the next Scene
         console.log("starting scene")
         this.scene.start("PrisonBreakScene");
         console.log("did that work?")
    }

    // Never get here since a new scene is started in create()
    update() {
    }
}