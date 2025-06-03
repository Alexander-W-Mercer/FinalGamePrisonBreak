class Platformer extends Phaser.Scene {
    constructor() {
        super("platformerScene");

        document.addEventListener('keydown', (event) => { //Template for key press action taken from online
            if (event.key === 'm') {
                if (this.WONGAME) {
                    console.log("Restarting Game");
                    this.WONGAME = false;
                    this.FROZENX = 0;
                    this.FROZENY = 0;
                    my.sprite.player.x = 400;
                    my.sprite.player.y = 1200;
                    this.winText.alpha = 0;
                    this.restartText.alpha = 0;

                }
            }
        });
    }

    preload() {
        this.load.scenePlugin('AnimatedTiles', './lib/AnimatedTiles.js', 'animatedTiles', 'animatedTiles');
        this.load.audio('coin', 'assets/coin.wav');
        this.load.audio('walk', 'assets/walk.wav');
        this.load.audio('hurt', 'assets/hurt.wav');
        this.load.audio('gravitySwap', 'assets/gravitySwap.wav');
        this.load.audio('jump', 'assets/jump.wav');
    }

    init() {
        // variables and settings
        this.WALKTIME = 0;
        this.FROZENX = 0;
        this.FROZENY = 0;
        this.ACCELERATION = 800;
        this.DRAG = 1000;    // DRAG < ACCELERATION = icy slide
        this.physics.world.gravity.y = 1500;
        this.JUMP_VELOCITY = -800;
        this.PARTICLE_VELOCITY = 50;
        this.SCALE = 0.75;
        this.MAX_SPEED = 1500;
        console.log(this)
        this.TOUCHING = false;
        this.CHANGEDGRAV = false
        this.GRAVITYDIRECTION = 0;
        this.WONGAME = false;
        //console.log("made it here!")
    }

    create() {
        this.coinSound = this.sound.add('coin');
        this.walkSound = this.sound.add('walk');
        this.jumpSound = this.sound.add('jump');
        this.gravitySound = this.sound.add('gravitySwap');
        this.hurtSound = this.sound.add('hurt');
        this.worldrightsideUp()
        // Create a new tilemap game object which uses 18x18 pixel tiles, and is
        // 45 tiles wide and 25 tiles tall.
        this.map = this.add.tilemap("Newplatformertiles", 16, 16, 50, 28);

        // Add a tileset to the map
        // First parameter: name we gave the tileset in Tiled
        // Second parameter: key for the tilesheet (from this.load.image in Load.js)
        this.tileset = this.map.addTilesetImage("KennyFullPlatformTiles", "tilemap_tiles");

        // Create a layer
        this.groundLayer = this.map.createLayer("ground", this.tileset, 0, 0);
        this.detailsLayer = this.map.createLayer("details", this.tileset, 0, 0);
        this.winconditionLayer = this.map.createLayer("wincondition", this.tileset, 0, 0);
        this.gravityChangersLayer = this.map.createLayer("gravityChangers", this.tileset, 0, 0);
        this.hazardsLayer = this.map.createLayer("hazards", this.tileset, 0, 0);
        //this.hazardsLayer.tilemap.flipY = false;

        //this.animatedTiles.init(this.map);

        // Make it collidable
        this.groundLayer.setCollisionByProperty({
            collides: true
        });
        this.hazardsLayer.setCollisionByProperty({
            collides: true
        });
        this.gravityChangersLayer.setCollisionByProperty({
            gravity: true
        });
        this.winconditionLayer.setCollisionByProperty({
            collides: true
        });
        

        // Create coins from Objects layer in tilemap
        this.coins = this.map.createFromObjects("coins", {
            name: "coin",
            key: "tilemap_sheet",
            frame: 141
        });

        this.anims.create({
            key: 'coinAnim',
            frames: [
                { key: 'tilemap_sheet', frame: 141 }, // First frame
                { key: 'tilemap_sheet', frame: 159 }  // Second frame
            ],
            frameRate: 2,
            repeat: -1
        });
        
        this.anims.play('coinAnim', this.coins);

        this.physics.world.enable(this.coins, Phaser.Physics.Arcade.STATIC_BODY);

        // Create a Phaser group out of the array this.coins
        // This will be used for collision detection below.
        this.coinGroup = this.add.group(this.coins);

        let oneWayPlatform = (obj1, obj2) => {
        }

        let oneWayCollisionProcess = (obj1, obj2) => {
            //console.log("running")
            if (obj2.properties.gravity) {
                this.TOUCHING = true;
                console.log("touching somethingggggggggggggggggggggggggggggggggggggggggggggggggggggggg")
            }

            if (this.TOUCHING == true) {
                console.log("FLIP THE GRAVITY IT IS TOUCHING")
                console.log("this.CHANGEDGRAV:")
                console.log(this.CHANGEDGRAV)
                if (this.CHANGEDGRAV == false) { // has it not been flipped yet?
                    if (this.GRAVITYDIRECTION == 0) { //flip gravity
                        this.GRAVITYDIRECTION = 1;
                        this.gravitySound.play();
                    } else {
                        this.GRAVITYDIRECTION = 0;
                        this.gravitySound.play();
                    }
                    this.CHANGEDGRAV = true; // it has been flipped
                }
            } else {
                this.CHANGEDGRAV = false;
            }

            if (obj2.properties.gravity) {
                //console.log("upwards")             
                return false;
            } else {
                return true;
            }
            /*
            if (this.TOUCHING == false) {
                if (obj2.properties.gravity) {
                    //console.log("switch")    
                    this.TOUCHING = true;            
                    if (this.GRAVITYDIRECTION == 0) {
                        this.GRAVITYDIRECTION = 1;
                        this.groundLayer.toggleFlipY()
                        //console.log(this.groundLayer.flipY)
                        //console.log("////////////////////////////////////////////////////////////////")
                    } else {
                        this.GRAVITYDIRECTION = 0;
                        this.groundLayer.toggleFlipY()
                        //console.log(this.groundLayer.flipY)
                        //console.log("////////////////////////////////////////////////////////////////")
                    }
                }
            }

            if (obj2.properties.gravity) {
                //console.log("upwards")    
                this.TOUCHING = true;            
                return false;
            } else {
                this.TOUCHING = false;
                return true;
            }*/
        }

        let propertyCollider = (obj1, obj2) => {
            //console.log(obj1)
            //console.log(obj2.properties)
            if (obj2.properties.danger) {
                my.sprite.player.x = 400;
                my.sprite.player.y = 1200;
                this.hurtSound.play();
                this.worldrightsideUp()
                console.log("back to right side up")
                //console.log(this.GRAVITYDIRECTION)
                //console.log("dangerrrrrrrrrrrr");
            }
            if (obj2.properties.win) {
                this.FROZENX = my.sprite.player.x
                this.FROZENY = my.sprite.player.y
                console.log("GAME WON ----------------------------")
                this.WONGAME = true;
                //console.log("switch gravity");
            }
            //if (obj2.properties.collides) {
            //    console.log("collision!");
            //}
        }

        // Find water tiles
        this.waterTiles = this.groundLayer.filterTiles(tile => {
            return tile.properties.water == true;
        });

        ////////////////////
        // TODO: put water bubble particle effect here
        // It's OK to have it start running
        ////////////////////
        
        my.vfx.water = this.add.particles(0, 0, "kenny-particles", {
            frame: ['circle_02.png'],
            //x: {},
            //y: {},
            // TODO: Try: add random: true
            //random: true,
            scale: (Math.random() * 0.002 + 0.002) * 0.5,
            // TODO: Try: maxAliveParticles: 8,
            //maxAliveParticles: 1,
            lifespan: 350,
            // TODO: Try: gravityY: -400,
            gravityY: -20,
            alpha: {start: 1, end: 0.1}, 
        });
        //console.log(this.waterTiles[Math.floor(Math.random() * this.waterTiles.length)])
        my.vfx.water.startFollow(this.waterTiles[Math.floor(Math.random() * this.waterTiles.length)], 0, 0, false);
        //console.log(my.vfx.water)
        my.vfx.water.scale = 18.5

        // set up player avatar
        my.sprite.player = this.physics.add.sprite(400, 1200, "platformer_characters", "tile_0000.png");
        my.sprite.player.setCollideWorldBounds(false);
        my.sprite.player.setScale(3)
        //console.log(my.sprite.player.body)
        my.sprite.player.body.setSize(14,24)
        my.sprite.player.setFlip(false, true);
        //my.sprite.player.body.width

        this.winText = this.add.text(15, 10, 'You Won!', {fontFamily: 'MS Sans Serif',fontSize: '160px', fill: '#3F2631'})
        this.restartText = this.add.text(15, 10, 'Press m to restart', {fontFamily: 'MS Sans Serif',fontSize: '50px', fill: '#3F2631'})
        this.winText.alpha = 0;
        this.restartText.alpha = 0;


        // Enable collision handling
        this.physics.add.collider(my.sprite.player, this.groundLayer, propertyCollider, oneWayCollisionProcess); //this.hazardsLayer,
        this.physics.add.collider(my.sprite.player, this.hazardsLayer, propertyCollider);
        this.physics.add.collider(my.sprite.player, this.winconditionLayer, propertyCollider);
        this.physics.add.collider(my.sprite.player, this.gravityChangers, propertyCollider, oneWayCollisionProcess);
        //////////////////////////////////////////////////////////////////////////////////////////////////////////////
        //console.log(this.physics)

        // TODO: create coin collect particle effect here
        // Important: make sure it's not running

        my.vfx.coin = this.add.particles(0, 0, "kenny-particles", {
            frame: ['star_09.png'],
            // TODO: Try: add random: true
            //random: true,
            scale: {start: 0.1, end: 0.3},
            // TODO: Try: maxAliveParticles: 8,
            //maxAliveParticles: 1,
            lifespan: 350,
            stopAfter: 1,
            // TODO: Try: gravityY: -400,
            gravityY: -400,
            alpha: {start: 1, end: 0.1}, 
        });

        my.vfx.coin.stop();


        // Coin collision handler
        this.physics.add.overlap(my.sprite.player, this.coinGroup, (obj1, obj2) => {

            my.vfx.coin.startFollow(obj2, 0, 0, false);
            my.vfx.coin.start();
            this.coinSound.play();

            //my.vfx.coin.setParticleSpeed(this.PARTICLE_VELOCITY, 0);
            ////////////////////
            // TODO: start the coin collect particle effect here
            ////////////////////
            //console.log("overlap")
            obj2.destroy(); // remove coin on overlap
            //console.log("overlap complete")
            //my.vfx.coin.stop();

        });

        // set up Phaser-provided cursor key input
        cursors = this.input.keyboard.createCursorKeys();

        this.rKey = this.input.keyboard.addKey('R');

        // debug key listener (assigned to D key)
        this.input.keyboard.on('keydown-D', () => {
            this.physics.world.drawDebug = this.physics.world.drawDebug ? false : true
            //console.log("reaches here")
            this.physics.world.debugGraphic.clear()
        }, this);

        // TODO: Add movement vfx here
        my.vfx.walking = this.add.particles(0, 0, "kenny-particles", {
            frame: ['smoke_01.png','smoke_02.png','smoke_03.png','smoke_04.png','smoke_05.png','smoke_06.png','smoke_07.png','smoke_08.png', 'smoke_09.png'],
            // TODO: Try: add random: true
            random: true,
            scale: {start: 0.03, end: 0.1},
            maxAliveParticles: 3,
            lifespan: 150,
            // TODO: Try: gravityY: -400,
            gravityY: -200,
            alpha: {start: 1, end: 0.1}, 
        });

        my.vfx.jumping = this.add.particles(0, 0, "kenny-particles", {
            frame: ['circle_03.png'],
            // TODO: Try: add random: true
            random: true,
            scale: {start: 0.05, end: 0.2},
            maxAliveParticles: 1,
            lifespan: 150,
            // TODO: Try: gravityY: -400,
            gravityY: 0,
            alpha: {start: 1, end: 0.1}, 
        });

        my.vfx.walking.stop();
        my.vfx.jumping.stop();
        

        // Simple camera to follow player
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.startFollow(my.sprite.player, true, 0.25, 0.25); // (target, [,roundPixels][,lerpX][,lerpY])
        this.cameras.main.setDeadzone(50, 50);
        this.cameras.main.setZoom(this.SCALE);
        this.cameras.main.rotation = 0
        console.log(this.cameras.main)
        

        this.animatedTiles.init(this.map);
    }

    worldupsideDown() {
        this.GRAVITYDIRECTION = 1;
        this.physics.world.gravity.y = -1500;
        this.JUMP_VELOCITY = 800;
        this.cameras.main.rotation = 3.14159265359

    }

    worldrightsideUp() {
        this.GRAVITYDIRECTION = 0;
        this.physics.world.gravity.y = 1500;
        this.JUMP_VELOCITY = -800;
        this.cameras.main.rotation = 0
    }

    update() {

        console.log("////////////////////////////////")
        console.log(my.sprite.player)
        console.log(my.sprite.player.body.blocked.down)
        if(my.sprite.player.body.blocked.up && this.GRAVITYDIRECTION && (my.sprite.player.body.velocity.x != 0)) {
            this.WALKTIME++;
            console.log(this.WALKTIME)
            console.log("walkinggggggggggggggggggggggggggg")
        } else if (my.sprite.player.body.blocked.down && !this.GRAVITYDIRECTION && (my.sprite.player.body.velocity.x != 0)) {
            this.WALKTIME++;
        }

        console.log(my.sprite.player.body.velocity.x)
        if (this.WALKTIME > 10 - (Math.abs(my.sprite.player.body.velocity.x) / 200)) {
            this.walkSound.play();
            this.WALKTIME = 0; //test
        }
        console.log(my.sprite.player)
        
        if (this.WONGAME) {
            my.sprite.player.x = this.FROZENX;
            my.sprite.player.y = this.FROZENY;
            this.winText.alpha = 1;
            this.restartText.alpha = 1;
        }
        this.winText.x = my.sprite.player.x - 650;
        this.winText.y = my.sprite.player.y - 100;
        this.restartText.x = my.sprite.player.x - 500;
        this.restartText.y = my.sprite.player.y + 150;
        
        my.vfx.jumping.stop();
        console.log("---\n")
        console.log("TOUCHING:")
        if (this.TOUCHING == false) {
            this.CHANGEDGRAV = false;
        }
        console.log(this.TOUCHING)
        console.log("CHANGEDGRAV:")
        console.log(this.CHANGEDGRAV)
        this.TOUCHING = false;
        //console.log(this.TOUCHING)
        //console.log(this.GRAVITYDIRECTION)
        //this.worldupsideDown()
        //this.worldrightsideUp()
        if (this.GRAVITYDIRECTION == 1) {
            this.worldupsideDown()
        } else {
            this.worldrightsideUp()
        }
        my.vfx.water.startFollow(this.waterTiles[Math.floor(Math.random() * this.waterTiles.length)], 0, 0, false);
        if((cursors.left.isDown && !this.GRAVITYDIRECTION) || (cursors.right.isDown && this.GRAVITYDIRECTION)) {
            if (my.sprite.player.body.velocity.x > 0) {
                my.sprite.player.setAccelerationX(-this.ACCELERATION - this.DRAG);
            } else {
                my.sprite.player.setAccelerationX(-this.ACCELERATION);
            }
            my.sprite.player.setFlip(false, this.GRAVITYDIRECTION);
            my.sprite.player.anims.play('walk', true);
            //this.walkSound.play();
            // TODO: add particle following code here

            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2-5 - (60 * this.GRAVITYDIRECTION), false);

            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);

            // Only play smoke effect if touching the ground

            if(!my.sprite.player.body.blocked.down && this.GRAVITYDIRECTION) {
                my.vfx.walking.start();
            } else if (!my.sprite.player.body.blocked.up && !this.GRAVITYDIRECTION) {
                my.vfx.walking.start();
            }

        } else if((cursors.right.isDown && !this.GRAVITYDIRECTION) || (cursors.left.isDown && this.GRAVITYDIRECTION)) {
            //this.worldFlip();
            if (my.sprite.player.body.velocity.x < 0) {
                my.sprite.player.setAccelerationX(this.ACCELERATION + this.DRAG);
            } else {
                my.sprite.player.setAccelerationX(this.ACCELERATION);
            }
            my.sprite.player.setFlip(true, this.GRAVITYDIRECTION);
            my.sprite.player.anims.play('walk', true);
            //this.walkSound.play();
            // TODO: add particle following code here

            my.vfx.walking.startFollow(my.sprite.player, -my.sprite.player.displayWidth/2+10, my.sprite.player.displayHeight/2-5 - (60 * this.GRAVITYDIRECTION), false);

            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);

            // Only play smoke effect if touching the ground

            if(!my.sprite.player.body.blocked.down && this.GRAVITYDIRECTION) {
                my.vfx.walking.start();
            } else if (!my.sprite.player.body.blocked.up && !this.GRAVITYDIRECTION) {
                my.vfx.walking.start();
            }

        } else {
            // Set acceleration to 0 and have DRAG take over
            my.sprite.player.setAccelerationX(0);
            my.sprite.player.setDragX(this.DRAG);
            my.sprite.player.anims.play('idle');
            // TODO: have the vfx stop playing

            my.vfx.walking.stop();


        }

        // player jump
        // note that we need body.blocked rather than body.touching b/c the former applies to tilemap tiles and the latter to the "ground"
        if(!my.sprite.player.body.blocked.down && !this.GRAVITYDIRECTION) {
            my.sprite.player.anims.play('jump');
        } else if (!my.sprite.player.body.blocked.up && this.GRAVITYDIRECTION) {
            my.sprite.player.anims.play('jump');
        }
        if(my.sprite.player.body.blocked.down && Phaser.Input.Keyboard.JustDown(cursors.up) && !this.GRAVITYDIRECTION) {
            this.jumpSound.play();

            my.vfx.jumping.startFollow(my.sprite.player, 0, my.sprite.player.displayHeight/2-5 - (60 * this.GRAVITYDIRECTION), false);
            my.vfx.jumping.setParticleSpeed(this.PARTICLE_VELOCITY, 0);
            if(!my.sprite.player.body.blocked.down && this.GRAVITYDIRECTION) {
                my.vfx.jumping.start();
            } else if (!my.sprite.player.body.blocked.up && !this.GRAVITYDIRECTION) {
                my.vfx.jumping.start();
            }
            my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);
            //my.vfx.jumping.stop();

        } else if (my.sprite.player.body.blocked.up && Phaser.Input.Keyboard.JustDown(cursors.up) && this.GRAVITYDIRECTION) {
            this.jumpSound.play();

            my.vfx.jumping.startFollow(my.sprite.player, 0, my.sprite.player.displayHeight/2-5 - (60 * this.GRAVITYDIRECTION), false);
            my.vfx.jumping.setParticleSpeed(this.PARTICLE_VELOCITY, 0);
            if(!my.sprite.player.body.blocked.down && this.GRAVITYDIRECTION) {
                my.vfx.jumping.start();
            } else if (!my.sprite.player.body.blocked.up && !this.GRAVITYDIRECTION) {
                my.vfx.jumping.start();
            }
            my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);
            //my.vfx.jumping.stop();
        }

        if(Phaser.Input.Keyboard.JustDown(this.rKey)) {
            this.scene.restart();
        }
    }
}