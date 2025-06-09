class PrisonBreak extends Phaser.Scene {
    constructor() {
        super("PrisonBreakScene");

        // document.addEventListener('keydwn', (event) => { //Template for key press action taken from online
        //     if (event.key === 'm') {
        //         if (this.WONGAME) {
        //             console.log("Restarting Game");
        //             this.WONGAME = false;
        //             this.FROZENX = 0;
        //             this.FROZENY = 0;
        //             my.sprite.player.x = 400;
        //             my.sprite.player.y = 1200;
        //             this.winText.alpha = 0;
        //             this.restartText.alpha = 0;

        //         }
        //     }
        // });
    }

    preload() {
        this.load.image("green_character", "green_character.png")
        this.load.image("red_character", "red_character.png")
        //this.load.scenePlugin('AnimatedTiles', './lib/AnimatedTiles.js', 'animatedTiles', 'animatedTiles');
        // this.load.audio('coin', 'assets/coin.wav');
        // this.load.audio('walk', 'assets/walk.wav');
        // this.load.audio('hurt', 'assets/hurt.wav');
        // this.load.audio('gravitySwap', 'assets/gravitySwap.wav');
        // this.load.audio('jump', 'assets/jump.wav');
    }

    init() {
        
        // variables and settings
        this.WALKTIME = 0;
        this.FROZENX = 0;
        this.FROZENY = 0;
        this.ACCELERATION = 800;
        this.DRAG = 1000;    // DRAG < ACCELERATION = icy slide
        this.physics.world.gravity.y = 0;
        this.JUMP_VELOCITY = -800;
        this.PARTICLE_VELOCITY = 50;
        this.SCALE = 1.75;
        this.MAX_SPEED = 300;
        console.log(this)
        console.log("we've made it to init")
        this.TOUCHING = false;
        this.CHANGEDGRAV = false
        this.GRAVITYDIRECTION = 0;
        this.WONGAME = false;
        this.DEBUG = false;
        this.physics.world.setBounds(0, 0, 1920, 1920)
        this.TILESIZE = 32;
        //console.log("made it here!")
    }

    create() {
        // this.coinSound = this.sound.add('coin');
        // this.walkSound = this.sound.add('walk');
        // this.jumpSound = this.sound.add('jump');
        // this.gravitySound = this.sound.add('gravitySwap');
        // this.hurtSound = this.sound.add('hurt');
        // Create a new tilemap game object which uses 18x18 pixel tiles, and is
        // 45 tiles wide and 25 tiles tall.
        this.map = this.add.tilemap("PrisonBreak", this.TILESIZE, this.TILESIZE, 50, 28); //should this be 18 / 18 or 64 /64 ? maybe test that me idk

        // Add a tileset to the map
        // First parameter: name we gave the tileset in Tiled
        // Second parameter: key for the tilesheet (from this.load.image in Load.js)
        this.tileset = this.map.addTilesetImage("PaperTiles", "tilemap_tiles");

        // Create a layer
        this.groundLayer = this.map.createLayer("ground", this.tileset, 0, 0);
        this.detailLayer = this.map.createLayer("details", this.tileset, 0, 0);
        this.npcLayer = this.map.createLayer("NPCs", this.tileset, 0, 0);
        this.wallLayer = this.map.createLayer("walls", this.tileset, 0, 0);
        this.interactions = this.map.createLayer("interactions", this.tileset, 0, 0);
        this.walkablesLayer = this.map.createLayer("walkables", this.tileset, 0, 0);
        this.walkablesLayer.visible = false;
        //this.detailsLayer = this.map.createLayer("details", this.tileset, 0, 0);
        //this.winconditionLayer = this.map.createLayer("wincondition", this.tileset, 0, 0);
        //this.gravityChangersLayer = this.map.createLayer("gravityChangers", this.tileset, 0, 0);
        //this.hazardsLayer = this.map.createLayer("hazards", this.tileset, 0, 0);
        //this.hazardsLayer.tilemap.flipY = false;

        //this.animatedTiles.init(this.map);

        // Make it collidable
        this.wallLayer.setCollisionByProperty({
            collides: true
        });
        
        let prisonGrid = this.layersToGrid([this.walkables]);

        this.finder = new EasyStar.js();

        console.log("this is the layers:")
        console.log(this.map.layers)

        console.log(prisonGrid)
        this.finder.setGrid(prisonGrid);

        this.finder.setAcceptableTiles([446, 447, 448]);

        // Create coins from Objects layer in tilemap
        // this.coins = this.map.createFromObjects("coins", {
        //     name: "coin",
        //     key: "tilemap_sheet",
        //     frame: 141
        // });

        // this.anims.create({
        //     key: 'coinAnim',
        //     frames: [
        //         { key: 'tilemap_sheet', frame: 141 }, // First frame
        //         { key: 'tilemap_sheet', frame: 159 }  // Second frame
        //     ],
        //     frameRate: 2,
        //     repeat: -1
        // });
        
        // this.anims.play('coinAnim', this.coins);

        // this.physics.world.enable(this.coins, Phaser.Physics.Arcade.STATIC_BODY);

        // Create a Phaser group out of the array this.coins
        // This will be used for collision detection below.
        //this.coinGroup = this.add.group(this.coins);


        // let oneWayCollisionProcess = (obj1, obj2) => {
        //     //console.log("running")
        //     if (obj2.properties.gravity) {
        //         this.TOUCHING = true;
        //         console.log("touching somethingggggggggggggggggggggggggggggggggggggggggggggggggggggggg")
        //     }

        //     if (this.TOUCHING == true) {
        //         console.log("FLIP THE GRAVITY IT IS TOUCHING")
        //         console.log("this.CHANGEDGRAV:")
        //         console.log(this.CHANGEDGRAV)
        //         if (this.CHANGEDGRAV == false) { // has it not been flipped yet?
        //             if (this.GRAVITYDIRECTION == 0) { //flip gravity
        //                 this.GRAVITYDIRECTION = 1;
        //                 this.gravitySound.play();
        //             } else {
        //                 this.GRAVITYDIRECTION = 0;
        //                 this.gravitySound.play();
        //             }
        //             this.CHANGEDGRAV = true; // it has been flipped
        //         }
        //     } else {
        //         this.CHANGEDGRAV = false;
        //     }

        //     if (obj2.properties.gravity) {
        //         //console.log("upwards")             
        //         return false;
        //     } else {
        //         return true;
        //     }
        //     /*
        //     if (this.TOUCHING == false) {
        //         if (obj2.properties.gravity) {
        //             //console.log("switch")    
        //             this.TOUCHING = true;            
        //             if (this.GRAVITYDIRECTION == 0) {
        //                 this.GRAVITYDIRECTION = 1;
        //                 this.groundLayer.toggleFlipY()
        //                 //console.log(this.groundLayer.flipY)
        //                 //console.log("////////////////////////////////////////////////////////////////")
        //             } else {
        //                 this.GRAVITYDIRECTION = 0;
        //                 this.groundLayer.toggleFlipY()
        //                 //console.log(this.groundLayer.flipY)
        //                 //console.log("////////////////////////////////////////////////////////////////")
        //             }
        //         }
        //     }

        //     if (obj2.properties.gravity) {
        //         //console.log("upwards")    
        //         this.TOUCHING = true;            
        //         return false;
        //     } else {
        //         this.TOUCHING = false;
        //         return true;
        //     }*/
        // }

        let propertyCollider = (obj1, obj2) => {
            if (obj2.properties.collides) {
                //console.log("collision!");
            }
        }

        let propertyOverlap = (obj1, obj2) => {
            if (obj2.properties.collides) {
                //console.log("touchedwall")
                obj1.hitWall = true;
            }
        }

        let locationOverlap = (obj1, obj2) => {
            //console.log("this is working currently")
            //console.log(obj2.properties)
            if (obj2.properties.hallway) { //cafeteria, courtyard, gaurd quarters, solitary, showers, storage, visitors, wardens, lobby, outside, hallway
                this.locationtext.text = 'Location: Hallway';
            } else if (obj2.properties.cellblocks) { //cafeteria, courtyard, gaurd quarters, solitary, showers, storage, visitors, wardens, lobby, outside, hallway
                this.locationtext.text = 'Location: Cellblocks';
            } else if (obj2.properties.cafeteria) { //cafeteria, courtyard, gaurd quarters, solitary, showers, storage, visitors, wardens, lobby, outside, hallway
                this.locationtext.text = 'Location: Cafeteria';
            } else if (obj2.properties.courtyard) { //cafeteria, courtyard, gaurd quarters, solitary, showers, storage, visitors, wardens, lobby, outside, hallway
                this.locationtext.text = 'Location: Courtyard';
            } else if (obj2.properties.gaurdquarters) { //cafeteria, courtyard, gaurd quarters, solitary, showers, storage, visitors, wardens, lobby, outside, hallway
                this.locationtext.text = 'Location: Gaurd Quarters';
            } else if (obj2.properties.solitary) { //cafeteria, courtyard, gaurd quarters, solitary, showers, storage, visitors, wardens, lobby, outside, hallway
                this.locationtext.text = 'Location: Solitary Confinement';
            } else if (obj2.properties.showers) { //cafeteria, courtyard, gaurd quarters, solitary, showers, storage, visitors, wardens, lobby, outside, hallway
                this.locationtext.text = 'Location: Showers';
            } else if (obj2.properties.storage) { //cafeteria, courtyard, gaurd quarters, solitary, showers, storage, visitors, wardens, lobby, outside, hallway
                this.locationtext.text = 'Location: Storage';
            } else if (obj2.properties.visitors) { //cafeteria, courtyard, gaurd quarters, solitary, showers, storage, visitors, wardens, lobby, outside, hallway
                this.locationtext.text = 'Location: Visitors Booth';
            } else if (obj2.properties.wardens) { //cafeteria, courtyard, gaurd quarters, solitary, showers, storage, visitors, wardens, lobby, outside, hallway
                this.locationtext.text = 'Location: Wardens Office';
            } else if (obj2.properties.lobby) { //cafeteria, courtyard, gaurd quarters, solitary, showers, storage, visitors, wardens, lobby, outside, hallway
                this.locationtext.text = 'Location: Front Lobby';
            } else if (obj2.properties.outside) { //cafeteria, courtyard, gaurd quarters, solitary, showers, storage, visitors, wardens, lobby, outside, hallway
                this.locationtext.text = 'Location: Outside';
            }
        }

        let entityOverlap = (obj1, obj2) => {
            if (obj2 == my.sprite.player) { // If the player has been touched by the ray:
                obj1.stopFollow();
                //console.log("touching player")
                if (obj1.hitWall == false) { // If the ray hasn't touched a wall on the way here
                    obj1.seenTimer++
                    //console.log("the player has been seen")
                    //console.log("didn't touch wall")
                } else { // restart the timer if there's a wall in the way
                    obj1.seenTimer = 0;
                    //console.log("touched a wall I did.")
                }
                obj1.stopFollow();
                obj1.x = obj1.parent.x;
                obj1.y = obj1.parent.y;
                my.sprite.gaurds.group1.ray.startFollow({
                        from: 0,
                        to: 1,
                        delay: 0,
                        duration: 200,
                        repeat: 0,//-1
                        yoyo: false
                    });
                obj1.hitWall = false;
            }
        }

        console.log("reached here!!!!!1")
        my.sprite.gaurds = {};
        my.sprite.gaurds.group1 = {}
        //this.physics.add.overlap(my.sprite.gaurds.group1.ray, this.wallLayer, propertyOverlapper);

        // Find water tiles
        // this.waterTiles = this.groundLayer.filterTiles(tile => {
        //     return tile.properties.water == true;
        // });

        // // set up player avatar
        my.sprite.player = this.physics.add.sprite(160, 160, "green_character", "green_character.png");
        my.sprite.player.setCollideWorldBounds(true);
        my.sprite.gaurds.group1.gaurd = this.physics.add.sprite(350, 350, "red_character", "red_character.png");
        //my.sprite.gaurds.group1.setCollideWorldBounds(true);
        //Debug Lines
        my.sprite.line1 = this.add.line(20, 20, my.sprite.player.x, my.sprite.player.y, 200, 200, 0xff0000, 1); // WHY DOES THIS WORK??? I MESSED WITH THIS FOR LIKE 3 HOURS WHY DOES THIS WORK. THIS SHOULDN'T WORK.
        my.sprite.line1.visible = false;
        my.sprite.player.body.setSize(24,24)
        my.sprite.gaurds.group1.gaurd.body.setSize(24,24)

        //Ray paths
        this.path1 = new Phaser.Curves.Path(my.sprite.gaurds.group1.gaurd.x, my.sprite.gaurds.group1.gaurd.y); //my.sprite.gaurds.group1.x, my.sprite.gaurds.group1.y
        this.path1.lineTo(my.sprite.player.x, my.sprite.player.y);

        //Rays
        my.sprite.gaurds.group1.ray = this.add.follower(this.path1, 10, 10, "red_character");
        

        // this.restartText = this.add.text(15, 10, 'Press m to restart', {fontFamily: 'MS Sans Serif',fontSize: '50px', fill: '#3F2631'})
        // this.winText.alpha = 0;
        // this.restartText.alpha = 0;

        // Enable collision handling
        this.physics.add.collider(my.sprite.player, this.wallLayer, propertyCollider);
        this.physics.add.overlap(my.sprite.player, this.interactions, locationOverlap);

        for (const gaurd in my.sprite.gaurds) { // set up the ray casting
            this.physics.add.existing(my.sprite.gaurds[gaurd].ray);
            this.physics.add.overlap(my.sprite.gaurds[gaurd].ray, this.wallLayer, propertyOverlap);
            this.physics.add.overlap(my.sprite.gaurds[gaurd].ray, my.sprite.gaurds[gaurd], entityOverlap);
            this.physics.add.overlap(my.sprite.gaurds[gaurd].ray, my.sprite.player, entityOverlap);
            my.sprite.gaurds[gaurd].ray.hitWall = false;
            my.sprite.gaurds[gaurd].ray.parent = my.sprite.gaurds[gaurd];
            my.sprite.gaurds[gaurd].ray.body.setSize(24,24)
            my.sprite.gaurds[gaurd].ray.setScale(0.5)
            my.sprite.gaurds[gaurd].ray.visible = false;
            my.sprite.gaurds[gaurd].ray.x = my.sprite.gaurds[gaurd].x;
            my.sprite.gaurds[gaurd].ray.y = my.sprite.gaurds[gaurd].y;
            my.sprite.gaurds[gaurd].ray.seenTimer = 0

            // my.sprite.gaurds.group1.ray.startFollow({ //start the ray chasing the player
            //             from: 0,
            //             to: 1,
            //             delay: 0,
            //             duration: 100,
            //             repeat: 0,//-1
            //             yoyo: false
            //         });
        }

        //////////////////////////////////////////////////////////////////////////////////////////////////////////////
        //console.log(this.physics)

        // TODO: create coin collect particle effect here
        // Important: make sure it's not running

        // my.vfx.coin = this.add.particles(0, 0, "kenny-particles", {
        //     frame: ['star_09.png'],
        //     // TODO: Try: add random: true
        //     //random: true,
        //     scale: {start: 0.1, end: 0.3},
        //     // TODO: Try: maxAliveParticles: 8,
        //     //maxAliveParticles: 1,
        //     lifespan: 350,
        //     stopAfter: 1,
        //     // TODO: Try: gravityY: -400,
        //     gravityY: -400,
        //     alpha: {start: 1, end: 0.1}, 
        // });

        // my.vfx.coin.stop();


        // Coin collision handler
        // this.physics.add.overlap(my.sprite.player, this.coinGroup, (obj1, obj2) => {

        //     my.vfx.coin.startFollow(obj2, 0, 0, false);
        //     my.vfx.coin.start();
        //     this.coinSound.play();

        //     //my.vfx.coin.setParticleSpeed(this.PARTICLE_VELOCITY, 0);
        //     ////////////////////
        //     // TODO: start the coin collect particle effect here
        //     ////////////////////
        //     //console.log("overlap")
        //     obj2.destroy(); // remove coin on overlap
        //     //console.log("overlap complete")
        //     //my.vfx.coin.stop();

        // });

        // set up Phaser-provided cursor key input
        cursors = this.input.keyboard.createCursorKeys();

        this.rKey = this.input.keyboard.addKey('R');

        // debug key listener (assigned to D key)
        this.input.keyboard.on('keydown-D', () => {

            my.sprite.gaurds.group1.ray.startFollow({ //start the ray chasing the player
                        from: 0,
                        to: 1,
                        delay: 0,
                        duration: 100,
                        repeat: 0,//-1
                        yoyo: false
                    });

            // let toX = Math.floor(my.sprite.player.x/this.TILESIZE);
            // var toY = Math.floor(my.sprite.player.y/this.TILESIZE);
            // var fromX = Math.floor(my.sprite.gaurds.group1.x/this.TILESIZE);
            // var fromY = Math.floor(my.sprite.gaurds.group1.y/this.TILESIZE);
            // console.log('going from ('+fromX+','+fromY+') to ('+toX+','+toY+')');

            // console.log(my.sprite.gaurds.group1.x, my.sprite.gaurds.group1.y)
            // console.log(my.sprite.player.x, my.sprite.player.y)
            // //startX, startY, endX, endY
            // this.finder.findPath(fromX, fromY, toX, toY, (path) => { //this.finder.findPath(my.sprite.gaurds.group1.x, my.sprite.gaurds.group1.y, my.sprite.player.x, my.sprite.player.y, (path) => {
            //     if (path === null) {
            //         console.log("Path not found");
            //     } else {
            //         console.log("Path was found, and is in array path:");
            //         console.log(path);
            //         this.moveCharacter(path, my.sprite.gaurds.group1);
            //     }
            // });
            // this.finder.calculate();

            if (this.DEBUG == false) {
                this.physics.world.drawDebug = true;
                this.physics.world.debugGraphic = this.add.graphics();
                my.sprite.line1.visible = true;
                this.DEBUG = true;
                this.physics.world.drawDebug = true;
                console.log("------------------= Debug Active! =------------------")
            } else {
                this.physics.world.debugGraphic.clear();
                my.sprite.line1.visible = false;
                this.physics.world.drawDebug = false;
                this.DEBUG = false;
                console.log("------------------= Debug Disabled! =------------------")
            }

        }, this);


        // TODO: Add movement vfx here
        // my.vfx.walking = this.add.particles(0, 0, "kenny-particles", {
        //     frame: ['smoke_01.png','smoke_02.png','smoke_03.png','smoke_04.png','smoke_05.png','smoke_06.png','smoke_07.png','smoke_08.png', 'smoke_09.png'],
        //     // TODO: Try: add random: true
        //     random: true,
        //     scale: {start: 0.03, end: 0.1},
        //     maxAliveParticles: 3,
        //     lifespan: 150,
        //     // TODO: Try: gravityY: -400,
        //     gravityY: -200,
        //     alpha: {start: 1, end: 0.1}, 
        // });

        // my.vfx.jumping = this.add.particles(0, 0, "kenny-particles", {
        //     frame: ['circle_03.png'],
        //     // TODO: Try: add random: true
        //     random: true,
        //     scale: {start: 0.05, end: 0.2},
        //     maxAliveParticles: 1,
        //     lifespan: 150,
        //     // TODO: Try: gravityY: -400,
        //     gravityY: 0,
        //     alpha: {start: 1, end: 0.1}, 
        // });

        // my.vfx.walking.stop();
        // my.vfx.jumping.stop();
        

        // Simple camera to follow player
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.startFollow(my.sprite.player, true, 0.25, 0.25); // (target, [,roundPixels][,lerpX][,lerpY])
        this.cameras.main.setDeadzone(50, 50);
        this.cameras.main.setZoom(this.SCALE);
        this.cameras.main.rotation = 0
        console.log(this.cameras.main)

        //this.locationtext.startFollow(my.sprite.player, true, 0.25, 0.25); // (target, [,roundPixels][,lerpX][,lerpY])
        

        //this.animatedTiles.init(this.map);
        this.locationtext = this.add.text(0, 0, 'Location:', {fontFamily: 'Georgia',fontSize: '20px', fill: '#3F2631'})
    }

    // layersToGrid
    //
    // Uses the tile layer information in this.map and outputs
    // an array which contains the tile ids of the visible tiles on screen.
    // This array can then be given to Easystar for use in path finding.
    layersToGrid() {
        let grid = [];
        // Initialize grid as two-dimensional array
        // TODO: write initialization code

        let arrayOfWalkables = this.map.layers[5].data;

        // Loop over layers to find tile IDs, store in grid
        // TODO: write this loop

        //console.log("array of layers =====-=--=-=--=-=-")
        //console.log(arrayOfWalkables)

        let i = 0;
        let j = 0;

        for (const array in arrayOfWalkables) {
            //console.log(array)
            //console.log("grid row ", i, " =====================")
            j = 0;
            grid[i] = [];
            for (const tile in arrayOfWalkables[array]) {
                //console.log("space: ", j)
                grid[i][j] = arrayOfWalkables[array][tile].index;
                j++;
            }
            i++;
        }

        console.log("this is the grid: ====================")
        console.log(grid)


        return grid;
    }

    moveCharacter(path, character) { //TAKEN FROM WHITEHEADS PATHFINDING ASSIGNMENT
        // Sets up a list of tweens, one for each tile to walk, that will be chained by the timeline
        var tweens = [];
        for(var i = 0; i < path.length-1; i++){
            var ex = path[i+1].x;
            var ey = path[i+1].y;
            tweens.push({
                x: ex*this.map.tileWidth + this.TILESIZE/2,
                y: ey*this.map.tileHeight + this.TILESIZE/2,
                duration: 100
            });
        }
    
        this.tweens.chain({
            targets: character,
            tweens: tweens
        });

    }

    update() {
        console.log(my.sprite.gaurds)
        //my.sprite.gaurds.group1.gaurd.setAccelerationX(10);
        console.log("curve:", this.path1.curves[0].p0.x)
        console.log("Gaurd:", my.sprite.gaurds.group1.gaurd.x)
        console.log("rayx: ", my.sprite.gaurds.group1.ray.x)
        //console.log(my.sprite.player.x, my.sprite.player.y)
        //console.log(this.cameras.main._scrollX)
        //console.log(this.locationtext.x)
        this.locationtext.x = this.cameras.main._scrollX + 320
        this.locationtext.y = this.cameras.main._scrollY + 140 

        for (const gaurd in my.sprite.gaurds) {
            //console.log("seenTimer: ",my.sprite.gaurds[gaurd].ray.seenTimer)
            if (my.sprite.gaurds[gaurd].ray.seenTimer > 2) {
                console.log("YOU ARE BEING CHASED")
                 my.sprite.line1.strokeColor = 6157634
            } else if (my.sprite.gaurds[gaurd].ray.seenTimer > 0) {
                my.sprite.line1.strokeColor = 16104514
            } else {
                my.sprite.line1.strokeColor = 16711680
            }
            
        }
        console.log(this.path1.curves[0].p1.x)
        this.path1.curves[0].p0.x = my.sprite.gaurds.group1.gaurd.x
        this.path1.curves[0].p0.y = my.sprite.gaurds.group1.gaurd.y
        this.path1.curves[0].p1.x = my.sprite.player.x
        this.path1.curves[0].p1.y = my.sprite.player.y
        //console.log(this.path1.curves[0].p1.x)

        // console.log("////////////////////////////////")
        //console.log(my.sprite.gaurds.group1.ray.x)
        //console.log(my.sprite.gaurds.group1.ray.y)
        //console.log(this.path1)
        my.sprite.line1.geom.x1 = my.sprite.player.x
        my.sprite.line1.geom.y1 = my.sprite.player.y
        my.sprite.line1.geom.x2 = my.sprite.gaurds.group1.gaurd.x
        my.sprite.line1.geom.y2 = my.sprite.gaurds.group1.gaurd.y
        // console.log(my.sprite.player.body.blocked.down)
        // if(my.sprite.player.body.blocked.up && this.GRAVITYDIRECTION && (my.sprite.player.body.velocity.x != 0)) {
        //     this.WALKTIME++;
        //     console.log(this.WALKTIME)
        //     console.log("walkinggggggggggggggggggggggggggg")
        // } else if (my.sprite.player.body.blocked.down && !this.GRAVITYDIRECTION && (my.sprite.player.body.velocity.x != 0)) {
        //     this.WALKTIME++;
        // }

        // console.log(my.sprite.player.body.velocity.x)
        // if (this.WALKTIME > 10 - (Math.abs(my.sprite.player.body.velocity.x) / 200)) {
        //     this.walkSound.play();
        //     this.WALKTIME = 0; //test
        // }
        // console.log(my.sprite.player)
        
        // if (this.WONGAME) {
        //     my.sprite.player.x = this.FROZENX;
        //     my.sprite.player.y = this.FROZENY;
        //     this.winText.alpha = 1;
        //     this.restartText.alpha = 1;
        // }
        // this.winText.x = my.sprite.player.x - 650;
        // this.winText.y = my.sprite.player.y - 100;
        // this.restartText.x = my.sprite.player.x - 500;
        // this.restartText.y = my.sprite.player.y + 150;
        
        // my.vfx.jumping.stop();
        // console.log("---\n")
        // console.log("TOUCHING:")
        // if (this.TOUCHING == false) {
        //     this.CHANGEDGRAV = false;
        // }
        // console.log(this.TOUCHING)
        // console.log("CHANGEDGRAV:")
        // console.log(this.CHANGEDGRAV)
        // this.TOUCHING = false;
        // //console.log(this.TOUCHING)
        // //console.log(this.GRAVITYDIRECTION)
        // //this.worldupsideDown()
        // //this.worldrightsideUp()
        // if (this.GRAVITYDIRECTION == 1) {
        //     this.worldupsideDown()
        // } else {
        //     this.worldrightsideUp()
        // }
        // my.vfx.water.startFollow(this.waterTiles[Math.floor(Math.random() * this.waterTiles.length)], 0, 0, false);
        //console.log(my.sprite.player.body.velocity.x)
        if(cursors.left.isDown) {
            if (my.sprite.player.body.velocity.x < 0) {
                my.sprite.player.setAccelerationX(-this.ACCELERATION);
            } else {
                my.sprite.player.setAccelerationX(-this.ACCELERATION - this.DRAG); //if its moving other direction
            }
        } else if(cursors.right.isDown) {
            if (my.sprite.player.body.velocity.x > 0) {
                my.sprite.player.setAccelerationX(this.ACCELERATION);
            } else {
                my.sprite.player.setAccelerationX(this.ACCELERATION + this.DRAG); //if its moving other direction
            }
        } else { // If no keys are down
            my.sprite.player.setAccelerationX(0);
            my.sprite.player.setDragX(this.DRAG);
        }

        if(cursors.up.isDown) {
            if (my.sprite.player.body.velocity.y < 0) {
                my.sprite.player.setAccelerationY(-this.ACCELERATION);
            } else {
                my.sprite.player.setAccelerationY(-this.ACCELERATION - this.DRAG); //if its moving other direction
            }
        } else if(cursors.down.isDown) {
            if (my.sprite.player.body.velocity.y > 0) {
                my.sprite.player.setAccelerationY(this.ACCELERATION);
            } else {
                my.sprite.player.setAccelerationY(this.ACCELERATION + this.DRAG); //if its moving other direction
            }
        } else { // If no keys are down
            my.sprite.player.setAccelerationY(0);
            my.sprite.player.setDragY(this.DRAG);
        }
        my.sprite.player.setMaxVelocity(this.MAX_SPEED);
        //console.log("comment after movement code")
        //this.MAX_SPEED(800);
        //     // TODO: add particle following code here

        //     my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2-5 - (60 * this.GRAVITYDIRECTION), false);

        //     my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);

        //     // Only play smoke effect if touching the ground

        //     if(!my.sprite.player.body.blocked.down && this.GRAVITYDIRECTION) {
        //         my.vfx.walking.start();
        //     } else if (!my.sprite.player.body.blocked.up && !this.GRAVITYDIRECTION) {
        //         my.vfx.walking.start();
        //     }

        // } else if((cursors.right.isDown && !this.GRAVITYDIRECTION) || (cursors.left.isDown && this.GRAVITYDIRECTION)) {
        //     //this.worldFlip();
        //     if (my.sprite.player.body.velocity.x < 0) {
        //         my.sprite.player.setAccelerationX(this.ACCELERATION + this.DRAG);
        //     } else {
        //         my.sprite.player.setAccelerationX(this.ACCELERATION);
        //     }
        //     my.sprite.player.setFlip(true, this.GRAVITYDIRECTION);
        //     my.sprite.player.anims.play('walk', true);
        //     //this.walkSound.play();
        //     // TODO: add particle following code here

        //     my.vfx.walking.startFollow(my.sprite.player, -my.sprite.player.displayWidth/2+10, my.sprite.player.displayHeight/2-5 - (60 * this.GRAVITYDIRECTION), false);

        //     my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);

        //     // Only play smoke effect if touching the ground

        //     if(!my.sprite.player.body.blocked.down && this.GRAVITYDIRECTION) {
        //         my.vfx.walking.start();
        //     } else if (!my.sprite.player.body.blocked.up && !this.GRAVITYDIRECTION) {
        //         my.vfx.walking.start();
        //     }

        // } else {
        //     // Set acceleration to 0 and have DRAG take over
        //     my.sprite.player.setAccelerationX(0);
        //     my.sprite.player.setDragX(this.DRAG);
        //     my.sprite.player.anims.play('idle');
        //     // TODO: have the vfx stop playing

        //     my.vfx.walking.stop();


        // }

        // // player jump
        // // note that we need body.blocked rather than body.touching b/c the former applies to tilemap tiles and the latter to the "ground"
        // if(!my.sprite.player.body.blocked.down && !this.GRAVITYDIRECTION) {
        //     my.sprite.player.anims.play('jump');
        // } else if (!my.sprite.player.body.blocked.up && this.GRAVITYDIRECTION) {
        //     my.sprite.player.anims.play('jump');
        // }
        // if(my.sprite.player.body.blocked.down && Phaser.Input.Keyboard.JustDown(cursors.up) && !this.GRAVITYDIRECTION) {
        //     this.jumpSound.play();

        //     my.vfx.jumping.startFollow(my.sprite.player, 0, my.sprite.player.displayHeight/2-5 - (60 * this.GRAVITYDIRECTION), false);
        //     my.vfx.jumping.setParticleSpeed(this.PARTICLE_VELOCITY, 0);
        //     if(!my.sprite.player.body.blocked.down && this.GRAVITYDIRECTION) {
        //         my.vfx.jumping.start();
        //     } else if (!my.sprite.player.body.blocked.up && !this.GRAVITYDIRECTION) {
        //         my.vfx.jumping.start();
        //     }
        //     my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);
        //     //my.vfx.jumping.stop();

        // } else if (my.sprite.player.body.blocked.up && Phaser.Input.Keyboard.JustDown(cursors.up) && this.GRAVITYDIRECTION) {
        //     this.jumpSound.play();

        //     my.vfx.jumping.startFollow(my.sprite.player, 0, my.sprite.player.displayHeight/2-5 - (60 * this.GRAVITYDIRECTION), false);
        //     my.vfx.jumping.setParticleSpeed(this.PARTICLE_VELOCITY, 0);
        //     if(!my.sprite.player.body.blocked.down && this.GRAVITYDIRECTION) {
        //         my.vfx.jumping.start();
        //     } else if (!my.sprite.player.body.blocked.up && !this.GRAVITYDIRECTION) {
        //         my.vfx.jumping.start();
        //     }
        //     my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);
        //     //my.vfx.jumping.stop();
        // }

        // if(Phaser.Input.Keyboard.JustDown(this.rKey)) {
        //     this.scene.restart();
        // }
    }
}