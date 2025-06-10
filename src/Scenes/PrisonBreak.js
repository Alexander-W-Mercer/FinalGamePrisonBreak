class PrisonBreak extends Phaser.Scene {
    constructor() {
        super("PrisonBreakScene");
    }

    preload() {
        this.load.image("green_character", "green_character.png")
        this.load.image("red_character", "red_character.png")
        this.load.image("purple_character", "purple_character.png")
        this.load.scenePlugin('AnimatedTiles', './lib/AnimatedTiles.js', 'animatedTiles', 'animatedTiles');
        this.load.audio('coin', 'assets/coin.wav');

        this.load.audio('walk1', 'assets/walk1.wav');
        this.load.audio('walk2', 'assets/walk2.wav');
        this.load.audio('walk3', 'assets/walk3.wav');
        this.load.audio('walk4', 'assets/walk4.wav');

        this.load.audio('altwalk1', 'assets/altwalk1.wav');
        this.load.audio('altwalk2', 'assets/altwalk2.wav');
        this.load.audio('altwalk3', 'assets/altwalk3.wav');
        this.load.audio('altwalk4', 'assets/altwalk4.wav');

        this.load.audio('grasswalk1', 'assets/grasswalk1.wav');
        this.load.audio('grasswalk2', 'assets/grasswalk2.wav');
        this.load.audio('grasswalk3', 'assets/grasswalk3.wav');
        this.load.audio('grasswalk4', 'assets/grasswalk4.wav');
        // this.load.audio('walk', 'assets/walk.wav');
        // this.load.audio('hurt', 'assets/hurt.wav');
    }

    init() {
        
        // variables and settings
        this.FROZENX = 0;
        this.FROZENY = 0;
        this.ACCELERATION = 800;
        this.DRAG = 1500;    // DRAG < ACCELERATION = icy slide
        this.physics.world.gravity.y = 0;
        this.JUMP_VELOCITY = -800;
        this.PARTICLE_VELOCITY = 50;
        this.SCALE = 1;
        this.MAX_SPEED = 300;
        console.log(this)
        console.log("we've made it to init")
        this.TOUCHING = false;
        this.CHANGEDGRAV = false
        this.GRAVITYDIRECTION = 0;
        this.WONGAME = false;
        this.DEBUG = false;
        this.physics.world.setBounds(0, 0, 1920, 2240)
        this.TILESIZE = 32;

        this.GAMEOVER = false;
        //console.log("made it here!")
    }

    create() {
        this.coinSound = this.sound.add('coin');
        this.walkSound = [this.sound.add('walk1'),this.sound.add('walk2'),this.sound.add('walk3'),this.sound.add('walk4'),this.sound.add('altwalk1'),this.sound.add('altwalk2'),this.sound.add('altwalk3'),this.sound.add('altwalk4'),this.sound.add('grasswalk1'),this.sound.add('grasswalk2'),this.sound.add('grasswalk3'),this.sound.add('grasswalk4')]
        // this.jumpSound = this.sound.add('jump');
        // this.gravitySound = this.sound.add('gravitySwap');
        // this.hurtSound = this.sound.add('hurt');
        // Create a new tilemap game object which uses 18x18 pixel tiles, and is
        // 45 tiles wide and 25 tiles tall.
        this.map = this.add.tilemap("PrisonBreak", this.TILESIZE, this.TILESIZE, 70, 60); //should this be 18 / 18 or 64 /64 ? maybe test that me idk

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

        this.animatedTiles.init(this.map);

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
        console.log("making objects from this.map...")
        this.coins = this.map.createFromObjects("coins", {
            name: "coin",
            key: "coin_sheet",
            frame: 141
        });
        console.log(this.coins)

        this.anims.create({
            key: 'coinAnim',
            frames: [
                { key: 'coin_sheet', frame: 141 }, // First frame
                { key: 'coin_sheet', frame: 159 }  // Second frame
            ],
            frameRate: 2,
            repeat: -1
        });
        
        this.anims.play('coinAnim', this.coins);

        this.physics.world.enable(this.coins, Phaser.Physics.Arcade.STATIC_BODY);

        // Create a Phaser group out of the array this.coins
        // This will be used for collision detection below.
        this.coinGroup = this.add.group(this.coins);

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
                this.LocationText.text = 'Location: Hallway';
            } else if (obj2.properties.cellblocks) { //cafeteria, courtyard, gaurd quarters, solitary, showers, storage, visitors, wardens, lobby, outside, hallway
                this.LocationText.text = 'Location: Cellblocks';
            } else if (obj2.properties.cafeteria) { //cafeteria, courtyard, gaurd quarters, solitary, showers, storage, visitors, wardens, lobby, outside, hallway
                this.LocationText.text = 'Location: Cafeteria';
            } else if (obj2.properties.courtyard) { //cafeteria, courtyard, gaurd quarters, solitary, showers, storage, visitors, wardens, lobby, outside, hallway
                this.LocationText.text = 'Location: Courtyard';
            } else if (obj2.properties.gaurdquarters) { //cafeteria, courtyard, gaurd quarters, solitary, showers, storage, visitors, wardens, lobby, outside, hallway
                this.LocationText.text = 'Location: Gaurd Quarters';
            } else if (obj2.properties.solitary) { //cafeteria, courtyard, gaurd quarters, solitary, showers, storage, visitors, wardens, lobby, outside, hallway
                this.LocationText.text = 'Location: Solitary Confinement';
            } else if (obj2.properties.showers) { //cafeteria, courtyard, gaurd quarters, solitary, showers, storage, visitors, wardens, lobby, outside, hallway
                this.LocationText.text = 'Location: Showers';
            } else if (obj2.properties.storage) { //cafeteria, courtyard, gaurd quarters, solitary, showers, storage, visitors, wardens, lobby, outside, hallway
                this.LocationText.text = 'Location: Storage';
            } else if (obj2.properties.visitors) { //cafeteria, courtyard, gaurd quarters, solitary, showers, storage, visitors, wardens, lobby, outside, hallway
                this.LocationText.text = 'Location: Visitors Booth';
            } else if (obj2.properties.wardens) { //cafeteria, courtyard, gaurd quarters, solitary, showers, storage, visitors, wardens, lobby, outside, hallway
                this.LocationText.text = 'Location: Wardens Office';
            } else if (obj2.properties.lobby) { //cafeteria, courtyard, gaurd quarters, solitary, showers, storage, visitors, wardens, lobby, outside, hallway
                this.LocationText.text = 'Location: Front Lobby';
            } else if (obj2.properties.outside) { //cafeteria, courtyard, gaurd quarters, solitary, showers, storage, visitors, wardens, lobby, outside, hallway
                this.LocationText.text = 'Location: Outside';
            } else if (obj2.properties.winGame) { //cafeteria, courtyard, gaurd quarters, solitary, showers, storage, visitors, wardens, lobby, outside, hallway
                this.LocationText.text = 'Location: Freedom!';
                this.winGame(); 
            }
        }

        let groundOverlap = (obj1, obj2) => {
            //console.log("this is working currently")
            //console.log(obj2.properties)
            //console.log("overlapping currently")
            if (obj2.properties.red) {
                my.sprite.player.floorMaterial = "solid";
                this.cameras.main.setBackgroundColor('#c49595');
            } else if (obj2.properties.green) {
                my.sprite.player.floorMaterial = "grass";
                this.cameras.main.setBackgroundColor('#86c280');
            } else if (obj2.properties.gray) {
                my.sprite.player.floorMaterial = "soft";
                this.cameras.main.setBackgroundColor('#c7a1cc');
            } else if (obj2.properties.blue) {
                my.sprite.player.floorMaterial = "soft";
                this.cameras.main.setBackgroundColor('#80bbc2');
            } else if (obj2.properties.brown) {
                my.sprite.player.floorMaterial = "solid";
                this.cameras.main.setBackgroundColor('#c2a380');
            }
        }

        let entityOverlap = (obj1, obj2) => {
            if (obj2 == obj1.parent.gaurd) {
                obj1.hitWall = false;
            }
            if (obj2 == my.sprite.player) { // If the player has been touched by the ray:
                obj1.stopFollow();
                // console.log("touching player")
                if (obj1.hitWall == false) { // If the ray hasn't touched a wall on the way here
                    // console.log("seen!")
                    obj1.seenTimer++
                    // console.log("the player has been seennnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn")
                    // console.log("didn't touch wall")
                } else { // restart the timer if there's a wall in the way
                    // console.log("reset")
                    obj1.seenTimer = 0;
                    // console.log("touched a wall I did.")
                }
                //obj1.stopFollow();
                console.log(obj1.parent.gaurd)
                obj1.x = obj1.parent.gaurd.x;
                obj1.y = obj1.parent.gaurd.y;
                obj1.startFollow({
                        from: 0,
                        to: 1,
                        delay: 0,
                        duration: 200, //200
                        repeat: 0,//-1
                        yoyo: false
                    });
            }
        }

        let enemyOverlap = (obj1, obj2) => {
            if (obj2 == my.sprite.player) { // If the player has been touched by the ray:
                console.log("hit enemy")
                if (this.GAMEOVER == false) {
                    this.lostGame()
                }
            }
            this.GAMEOVER = true;
        }

        console.log("reached here!!!!!1")
        my.sprite.gaurds = {};
        my.sprite.gaurds.group1 = {}
        my.sprite.gaurds.group2 = {}
        my.sprite.gaurds.group3 = {}
        my.sprite.gaurds.group4 = {}
        my.sprite.gaurds.group5 = {}
        my.sprite.gaurds.group6 = {}
        my.sprite.gaurds.group7 = {}
        my.sprite.gaurds.group8 = {}
        my.sprite.gaurds.group9 = {}
        //this.physics.add.overlap(my.sprite.gaurds.group1.ray, this.wallLayer, propertyOverlapper);

        // Find water tiles
        // this.waterTiles = this.groundLayer.filterTiles(tile => {
        //     return tile.properties.water == true;
        // });

        //Walking particles
        my.vfx.walking = this.add.particles(0, 0, "kenny-particles", {
            frame: ['smoke_01.png','smoke_02.png','smoke_03.png','smoke_04.png','smoke_05.png','smoke_06.png','smoke_07.png','smoke_08.png', 'smoke_09.png'],
            random: true,
            scale: {start: 0.06, end: 0.03},
            maxAliveParticles: 3,
            lifespan: 150,
            alpha: {start: 1, end: 0.1}, 
        });
        my.vfx.walking.stop();

        // // set up player avatar
        my.sprite.player = this.physics.add.sprite(160, 160, "green_character", "green_character.png");
        my.sprite.player.setCollideWorldBounds(true);
        my.sprite.player.coinCount = 0;
        my.sprite.player.footsteptimer = 0;

        //Gaurds
        my.sprite.gaurds.group1.gaurd = this.physics.add.sprite(9 * this.TILESIZE - (this.TILESIZE/2), 9 * this.TILESIZE - (this.TILESIZE/2), "red_character", "red_character.png");
        my.sprite.gaurds.group2.gaurd = this.physics.add.sprite(20 * this.TILESIZE - (this.TILESIZE/2), 4 * this.TILESIZE - (this.TILESIZE/2), "red_character", "red_character.png");
        my.sprite.gaurds.group3.gaurd = this.physics.add.sprite(46 * this.TILESIZE - (this.TILESIZE/2), 20 * this.TILESIZE - (this.TILESIZE/2), "red_character", "red_character.png");
        my.sprite.gaurds.group4.gaurd = this.physics.add.sprite(24 * this.TILESIZE - (this.TILESIZE/2), 24 * this.TILESIZE - (this.TILESIZE/2), "red_character", "red_character.png");
        my.sprite.gaurds.group5.gaurd = this.physics.add.sprite(45 * this.TILESIZE - (this.TILESIZE/2), 42 * this.TILESIZE - (this.TILESIZE/2), "red_character", "red_character.png");
        my.sprite.gaurds.group6.gaurd = this.physics.add.sprite(9 * this.TILESIZE - (this.TILESIZE/2), 40 * this.TILESIZE - (this.TILESIZE/2), "red_character", "red_character.png");
        my.sprite.gaurds.group7.gaurd = this.physics.add.sprite(6 * this.TILESIZE - (this.TILESIZE/2), 60 * this.TILESIZE - (this.TILESIZE/2), "red_character", "red_character.png");
        my.sprite.gaurds.group8.gaurd = this.physics.add.sprite(47 * this.TILESIZE - (this.TILESIZE/2), 30 * this.TILESIZE - (this.TILESIZE/2), "red_character", "red_character.png");
        my.sprite.gaurds.group9.gaurd = this.physics.add.sprite(20 * this.TILESIZE - (this.TILESIZE/2), 47 * this.TILESIZE - (this.TILESIZE/2), "purple_character", "purple_character.png");

        //Gaurd Routes
        my.sprite.gaurds.group1.gaurd.route = [[8,8], [11, 8], [8, 31], [11, 31]] //cellblock gaurd
        my.sprite.gaurds.group2.gaurd.route = [[19,3], [32, 3], [32, 15], [19, 15]] //cafeteria gaurd
        my.sprite.gaurds.group3.gaurd.route = [[45,19], [47, 4], [55, 6], [50, 20]] // gaurd quarters gaurd
        my.sprite.gaurds.group4.gaurd.route = [[23,23], [29, 25], [29, 33], [20, 35]] //courtyard gaurd
        my.sprite.gaurds.group5.gaurd.route = [[44,41], [36, 41], [36, 38], [44, 38]] // storage gaurd
        my.sprite.gaurds.group6.gaurd.route = [[8,39], [8, 47], [16, 47], [15, 39]] //visitors gaurd
        my.sprite.gaurds.group7.gaurd.route = [[5,59], [16, 60], [8, 67], [16, 66]] //outside gaurd
        my.sprite.gaurds.group8.gaurd.route = [[34,44], [46, 46], [52, 33], [36, 30], [35, 20], [47, 30]] //right side gaurd
        my.sprite.gaurds.group9.gaurd.route = [[25,44], [25, 47], [28, 47], [28, 44]] //warden

        my.sprite.player.body.setSize(24,24)

        for (const group in my.sprite.gaurds) { //set up the gaurds
            //Gaurd states
            my.sprite.gaurds[group].shocktext = this.add.text(0, 0, '!', {fontFamily: 'Georgia',fontSize: '30px', fill: '#3F2631'})
            my.sprite.gaurds[group].gaurd.boredom = 0; //boredom
            my.sprite.gaurds[group].gaurd.chasing = false;
            my.sprite.gaurds[group].gaurd.searching = false;
            my.sprite.gaurds[group].gaurd.currentRoute = 0;
            my.sprite.gaurds[group].gaurd.lastSeenPlayer = [];


            //Debug Lines
            my.sprite.gaurds[group].line = this.add.line(20, 20, my.sprite.player.x, my.sprite.player.y, 200, 200, 0xff0000, 1); // WHY DOES THIS WORK??? I MESSED WITH THIS FOR LIKE 3 HOURS WHY DOES THIS WORK. THIS SHOULDN'T WORK.
            my.sprite.gaurds[group].line.visible = false;

            //gaurd size
            my.sprite.gaurds[group].gaurd.body.setSize(24,24)

            //Ray paths
            my.sprite.gaurds[group].path = new Phaser.Curves.Path(my.sprite.gaurds[group].gaurd.x, my.sprite.gaurds[group].gaurd.y);
            my.sprite.gaurds[group].path.lineTo(my.sprite.player.x, my.sprite.player.y);

            //Rays
            my.sprite.gaurds[group].ray = this.add.follower(my.sprite.gaurds[group].path, 10, 10, "red_character");
            console.log("this is the follower:", my.sprite.gaurds[group].ray)
            my.sprite.gaurds[group].ray.x = 10;
            my.sprite.gaurds[group].ray.y = 10;
        }
        

        // Enable collision handling
        this.physics.add.collider(my.sprite.player, this.wallLayer, propertyCollider);
        this.physics.add.overlap(my.sprite.player, this.interactions, locationOverlap);
        this.physics.add.overlap(my.sprite.player, this.groundLayer, groundOverlap);

        for (const group in my.sprite.gaurds) { // set up the ray casting
            console.log(my.sprite.gaurds[group].ray)
            this.physics.add.existing(my.sprite.gaurds[group].ray);
            this.physics.add.overlap(my.sprite.gaurds[group].ray, this.wallLayer, propertyOverlap);
            this.physics.add.overlap(my.sprite.gaurds[group].ray, my.sprite.gaurds[group].gaurd, entityOverlap);
            this.physics.add.overlap(my.sprite.gaurds[group].ray, my.sprite.player, entityOverlap);
            this.physics.add.overlap(my.sprite.gaurds[group].gaurd, my.sprite.player, enemyOverlap);
            my.sprite.gaurds[group].ray.hitWall = false;
            my.sprite.gaurds[group].ray.parent = my.sprite.gaurds[group];
            my.sprite.gaurds[group].ray.body.setSize(24,24)
            my.sprite.gaurds[group].ray.setScale(0.5)
            my.sprite.gaurds[group].ray.visible = false;
            my.sprite.gaurds[group].ray.x = my.sprite.gaurds[group].gaurd.x;
            my.sprite.gaurds[group].ray.y = my.sprite.gaurds[group].gaurd.y;
            my.sprite.gaurds[group].ray.seenTimer = 0

            console.log("here we areeee")
            my.sprite.gaurds[group].ray.startFollow({ //start the ray chasing the player
                        from: 0,
                        to: 1,
                        delay: 0,
                        duration: 100,
                        repeat: 0,//-1
                        yoyo: false
                    });
            console.log("again")
        }

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

            obj2.destroy();
            my.sprite.player.coinCount++;

        });

        // set up Phaser-provided cursor key input
        cursors = this.input.keyboard.createCursorKeys();

        // debug key listener (assigned to D key)
        this.input.keyboard.on('keydown-D', () => {

            if (this.DEBUG == false) {
                this.physics.world.drawDebug = true;
                this.physics.world.debugGraphic = this.add.graphics();
                for (const group in my.sprite.gaurds) {
                    my.sprite.gaurds[group].line.visible = true;
                }
                this.DEBUG = true;
                this.physics.world.drawDebug = true;
                console.log("------------------= Debug Active! =------------------")
            } else {
                this.physics.world.debugGraphic.clear();
                for (const group in my.sprite.gaurds) {
                    my.sprite.gaurds[group].line.visible = false;
                }
                this.physics.world.drawDebug = false;
                this.DEBUG = false;
                console.log("------------------= Debug Disabled! =------------------")
            }

        }, this);


        //Restart Game
        this.input.keyboard.on('keydown-R', () => {
            this.scene.restart()
        }, this);

        //Start Game
        this.input.keyboard.on('keydown-S', () => {
            my.sprite.menuRectangle.alpha = 0;
            this.menuText.alpha = 0;
            this.menuText2.alpha = 0;
            this.explaintext1.alpha = 0;
            this.explaintext2.alpha = 0;
            this.explaintext3.alpha = 0;
            this.explaintext4.alpha = 0;
            console.log("starting game :)")
        }, this);
        

        // Simple camera to follow player
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.startFollow(my.sprite.player, true, 0.25, 0.25); // (target, [,roundPixels][,lerpX][,lerpY])
        this.cameras.main.setDeadzone(50, 50);
        this.cameras.main.setZoom(this.SCALE);
        this.cameras.main.rotation = 0
        console.log(this.cameras.main)


        for (const group in my.sprite.gaurds) {
            let toX = Math.floor(my.sprite.player.x/this.TILESIZE);
            var toY = Math.floor(my.sprite.player.y/this.TILESIZE);
            var fromX = Math.floor(my.sprite.gaurds[group].gaurd.x/this.TILESIZE);
            var fromY = Math.floor(my.sprite.gaurds[group].gaurd.y/this.TILESIZE);

            //startX, startY, endX, endY
            this.finder.findPath(fromX, fromY, toX, toY, (path) => { //this.finder.findPath(my.sprite.gaurds.group1.x, my.sprite.gaurds.group1.y, my.sprite.player.x, my.sprite.player.y, (path) => {
                if (path === null) {
                    console.log("Path not found");
                } else {
                    console.log("Path was found, and is in array path:");
                    console.log(path);
                    this.moveCharacter(path, my.sprite.gaurds[group].gaurd);
                    console.log(path)
                }
            });
            this.finder.calculate();
        }

        //text & screens
        my.sprite.deathRectangle = this.add.rectangle(750, 375, 1500, 750, 0x32a852, 1);
        this.coinText = this.add.text(0, 0, 'Coins Collected:', {fontFamily: 'Georgia',fontSize: '40px', fill: '#3F2631'})
        this.LocationText = this.add.text(0, 0, 'Location:', {fontFamily: 'Georgia',fontSize: '40px', fill: '#3F2631'})
        this.GameOverText = this.add.text(0, 0, 'You Have Been Caught.', {fontFamily: 'Georgia',fontSize: '120px', fill: '#3F2631'})
        this.restartText = this.add.text(0, 0, 'Press R to restart Game', {fontFamily: 'Georgia',fontSize: '40px', fill: '#3F2631'})
        this.EndStatusText = this.add.text(0, 0, 'Maybe try to get some coins next time', {fontFamily: 'Georgia',fontSize: '50px', fill: '#3F2631'})
        this.GameOverText.alpha = 0;
        this.restartText.alpha = 0;
        this.EndStatusText.alpha = 0;
        my.sprite.deathRectangle.alpha = 0;
        my.sprite.menuRectangle = this.add.rectangle(750, 375, 1500, 750, 0xad804c, 1);
        this.menuText = this.add.text(330, 80, 'Prison Break!', {fontFamily: 'Georgia',fontSize: '120px', fill: '#3F2631'})
        this.menuText2 = this.add.text(475, 200, 'Press S to Start!', {fontFamily: 'Georgia',fontSize: '60px', fill: '#3F2631'})
        this.explaintext1 = this.add.text(400, 300, 'Collect as many coins as you can,', {fontFamily: 'Georgia',fontSize: '40px', fill: '#3F2631'})
        this.explaintext2 = this.add.text(530, 350, 'avoid the gaurds,', {fontFamily: 'Georgia',fontSize: '40px', fill: '#3F2631'})
        this.explaintext3 = this.add.text(500, 400, 'and find the escape!', {fontFamily: 'Georgia',fontSize: '40px', fill: '#3F2631'})
        this.explaintext4 = this.add.text(90, 550, 'Credits: Author - Zander Mercer, Assets - Kenny Assets, Template Code - Professor Whitehead', {fontFamily: 'Georgia',fontSize: '30px', fill: '#3F2631'})

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

        //console.log("this is the grid: ====================")
        //console.log(grid)


        return grid;
    }

    moveCharacter(path, character) { //TAKEN (and heavily modified) FROM Professor WHITEHEADS PATHFINDING ASSIGNMENT
        let urgency = 100;

        if (character.chasing == true || character.searching == true) {
            urgency = 100;
        } else {
            urgency = 400;
        }

        if (ex = path[1]) { // just check that it exists
            var ex = path[1].x;
            var ey = path[1].y;

            character.targetX = ex*this.map.tileWidth + this.TILESIZE/2
            character.targetY = ey*this.map.tileHeight + this.TILESIZE/2
    
            //console.log(this.tweens.add)
            this.tweens.add({
                targets: character, // The object to tween
                x: character.targetX, // Target X coordinate
                y: character.targetY, // Target Y coordinate
                duration: urgency, // Tween duration in milliseconds
                ease: 'linear', // Easing function (ease in and out)
                yoyo: false, // Play back and forth
                repeat: 0, // Repeat indefinitely
            });
        }

    }

    nextstep(gaurd) {

        //console.log("got new step")
        //console.log(gaurd.chasing)
        if (gaurd.chasing == true) {
            var toX = Math.floor(my.sprite.player.x/this.TILESIZE);
            var toY = Math.floor(my.sprite.player.y/this.TILESIZE);
            var fromX = Math.floor(gaurd.x/this.TILESIZE);
            var fromY = Math.floor(gaurd.y/this.TILESIZE);
        } else if (gaurd.searching == false){
            // console.log("look here:")
            // console.log(gaurd)
            // console.log("boredom:", gaurd.boredom)
            // console.log("gaurdcurrentrouteNum:", gaurd.currentRoute)
            // console.log("gaurdcurrentroute:", gaurd.route[gaurd.currentRoute])
            // console.log("length:", gaurd.route.length)
            // console.log("x:", gaurd.route[gaurd.currentRoute][0])
            // console.log("y:", gaurd.route[gaurd.currentRoute][1])
            var toX = gaurd.route[gaurd.currentRoute][0];
            var toY = gaurd.route[gaurd.currentRoute][1];
            var fromX = Math.floor(gaurd.x/this.TILESIZE);
            var fromY = Math.floor(gaurd.y/this.TILESIZE);
        } else {
            var toX = gaurd.lastSeenPlayer[0];
            var toY = gaurd.lastSeenPlayer[1];
            var fromX = Math.floor(gaurd.x/this.TILESIZE);
            var fromY = Math.floor(gaurd.y/this.TILESIZE);
        }
            //console.log('going from ('+fromX+','+fromY+') to ('+toX+','+toY+')');

            //console.log(my.sprite.gaurds.group1.gaurd.x, my.sprite.gaurds.group1.gaurd.y)
            //console.log(my.sprite.player.x, my.sprite.player.y)
            //startX, startY, endX, endY
        this.finder.findPath(fromX, fromY, toX, toY, (path) => { //this.finder.findPath(my.sprite.gaurds.group1.x, my.sprite.gaurds.group1.y, my.sprite.player.x, my.sprite.player.y, (path) => {
            if (path === null) {
                console.log("Path not found");
            } else {
                //console.log("Path was found, and is in array path:");
                //console.log(path);
                this.moveCharacter(path, gaurd);
            }
        });
        this.finder.calculate();
    }

    lostGame() {
        this.GameOverText.x = this.cameras.main._scrollX + 80
        my.sprite.player.setAccelerationX(0);
        my.sprite.player.setAccelerationY(0);
        my.sprite.player.setMaxVelocity(0);
        this.GameOverText.alpha = 1;
        this.restartText.alpha = 1;
        console.log("game over text:", this.GameOverText, "------------------------------")
        my.sprite.deathRectangle.setFillStyle(0xa83e32, 1.0)
        my.sprite.deathRectangle.alpha = 1;
    }

    winGame() {
        console.log("game over text:", this.GameOverText, "------------------------------")
        this.GameOverText.text = "You have escaped!"
        this.GameOverText.x = this.cameras.main._scrollX + 240
        this.GameOverText.alpha = 1;
        this.restartText.alpha = 1;
        my.sprite.deathRectangle.alpha = 1;
        this.EndStatusText.alpha = 1;
        this.GAMEOVER = true;

        switch (my.sprite.player.coinCount) {
            case 0:
                this.EndStatusText.text = "Maybe try to get some coins next time."
                this.EndStatusText.x = this.cameras.main._scrollX + 300;
                this.EndStatusText.y = this.cameras.main._scrollY + 400;
                break;
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
                this.EndStatusText.text = my.sprite.player.coinCount + " coins isn't bad, but I wouldn't call it great either."
                this.EndStatusText.x = this.cameras.main._scrollX + 170;
                this.EndStatusText.y = this.cameras.main._scrollY + 400;
                break;
            case 6:
            case 7:
            case 8:
            case 9:
            case 10:
                this.EndStatusText.text = my.sprite.player.coinCount + " coins. Nice. That's a pretty good amount."
                this.EndStatusText.x = this.cameras.main._scrollX + 260;
                this.EndStatusText.y = this.cameras.main._scrollY + 400;
                break;
            case 11:
            case 12:
            case 13:
            case 14:
                this.EndStatusText.text = my.sprite.player.coinCount + " coins! Great job!"
                break;
            case 15:
                this.EndStatusText.text = my.sprite.player.coinCount + " coins! Congragulations! You got a perfect run!"
                this.EndStatusText.x = this.cameras.main._scrollX + 200;
                this.EndStatusText.y = this.cameras.main._scrollY + 400;
                break;
        }
    }


    update() {
        // console.log("ray status: ", my.sprite.gaurds.group1.ray.hitWall)
        // console.log("seenTimer for first gaurd: ", my.sprite.gaurds.group1.ray.seenTimer)
        //console.log("footstepTimer:", my.sprite.player.footsteptimer)
        //footstep particle & sound effects:
        //my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);
        //console.log(my.sprite.player.body.speed)
        if (my.sprite.player.body.speed == 0) {
            my.vfx.walking.stop();
        }
        //console.log("maxspeed:", this.MAX_SPEED)
        if (my.sprite.player.footsteptimer > 23 - (this.MAX_SPEED/300)*10) { //my.sprite.player.footsteptimer/2 > 250 - my.sprite.player.body.speed/1.5
            //console.log("reset")
            
            my.vfx.walking.startFollow(my.sprite.player, 0, 0, false);

            //console.log(my.vfx.walking.startFollow)

            my.vfx.walking.start();
            //console.log("reset footsteptimer")
            my.sprite.player.footsteptimer = 0;
            let playsound = 0;
            switch (my.sprite.player.floorMaterial) {
                case "solid":
                    playsound = Phaser.Math.RND.between(0,3);
                    break;
                case "soft":
                    playsound = Phaser.Math.RND.between(4,7);
                    break;
                case "grass":
                    playsound = Phaser.Math.RND.between(8,11);
                    break;

            }
            //console.log("speed:", my.sprite.player.body.speed) 
            if (my.sprite.player.body.speed > 200) {
                this.walkSound[playsound].play();
            }
        }

///////////////////////////////////////////////////////////////////////////////////////////////////////////////
        
        //Gaurd Pathfinding Logic
        for (const group in my.sprite.gaurds) {
            my.sprite.gaurds[group].shocktext.x = my.sprite.gaurds[group].gaurd.x - 5
            my.sprite.gaurds[group].shocktext.y = my.sprite.gaurds[group].gaurd.y - 15
            if (my.sprite.gaurds[group].gaurd.x == my.sprite.gaurds[group].gaurd.targetX && my.sprite.gaurds[group].gaurd.y == my.sprite.gaurds[group].gaurd.targetY) {
                if (my.sprite.gaurds[group].gaurd.boredom < 0) {
                    if (my.sprite.gaurds[group].gaurd.x == my.sprite.gaurds[group].gaurd.route[my.sprite.gaurds[group].gaurd.currentRoute][0] * this.TILESIZE + (this.TILESIZE/2) && my.sprite.gaurds[group].gaurd.y == my.sprite.gaurds[group].gaurd.route[my.sprite.gaurds[group].gaurd.currentRoute][1] * this.TILESIZE + (this.TILESIZE/2)) {
                        console.log("reached destination")
                        if (my.sprite.gaurds[group].gaurd.currentRoute >= my.sprite.gaurds[group].gaurd.route.length -1) {
                            my.sprite.gaurds[group].gaurd.currentRoute = 0;
                        } else {
                            my.sprite.gaurds[group].gaurd.currentRoute++;
                        }
                    }
                    my.sprite.gaurds[group].gaurd.searching = false;
                    my.sprite.gaurds[group].gaurd.boredom = Phaser.Math.RND.between(100,400);
                } else {
                    my.sprite.gaurds[group].gaurd.boredom--;
                }
                this.nextstep(my.sprite.gaurds[group].gaurd);

            }

            // update the ray cast path start and end points
            my.sprite.gaurds[group].path.startPoint.x = my.sprite.gaurds[group].gaurd.x
            my.sprite.gaurds[group].path.startPoint.y = my.sprite.gaurds[group].gaurd.y
            my.sprite.gaurds[group].path.curves[0].p0.x = my.sprite.gaurds[group].gaurd.x
            my.sprite.gaurds[group].path.curves[0].p0.y = my.sprite.gaurds[group].gaurd.y
            my.sprite.gaurds[group].path.curves[0].p1.x = my.sprite.player.x
            my.sprite.gaurds[group].path.curves[0].p1.y = my.sprite.player.y

            //Update debug line graphic
            my.sprite.gaurds[group].line.geom.x1 = my.sprite.player.x
            my.sprite.gaurds[group].line.geom.y1 = my.sprite.player.y
            my.sprite.gaurds[group].line.geom.x2 = my.sprite.gaurds[group].gaurd.x
            my.sprite.gaurds[group].line.geom.y2 = my.sprite.gaurds[group].gaurd.y

            //check if player is within sightline or not
            if (my.sprite.gaurds[group].ray.seenTimer > 2) {
                //console.log("YOU ARE BEING CHASED")
                //console.log(Math.sqrt([Math.pow(my.sprite.gaurds[group].gaurd.x - my.sprite.player.x, 2) + Math.pow(my.sprite.gaurds[group].gaurd.y - my.sprite.player.y, 2)]))
                if (Math.sqrt([Math.pow(my.sprite.gaurds[group].gaurd.x - my.sprite.player.x, 2) + Math.pow(my.sprite.gaurds[group].gaurd.y - my.sprite.player.y, 2)]) < 480) {
                    my.sprite.gaurds[group].gaurd.chasing = true;
                    my.sprite.gaurds[group].gaurd.searching = true;
                    my.sprite.gaurds[group].line.strokeColor = 6157634
                    my.sprite.gaurds[group].gaurd.lastSeenPlayer = [Math.floor(my.sprite.player.x/this.TILESIZE), Math.floor(my.sprite.player.y/this.TILESIZE)]
                    my.sprite.gaurds[group].shocktext.text = '!'
                }
            } else if (my.sprite.gaurds[group].ray.seenTimer > 0) {
                //my.sprite.gaurds[group].gaurd.boredom = Phaser.Math.RND.between(200,400);
                my.sprite.gaurds[group].line.strokeColor = 16104514
                my.sprite.gaurds[group].shocktext.text = '?'
                my.sprite.gaurds[group].shocktext.x = my.sprite.gaurds[group].shocktext.x - 2
            } else {
                my.sprite.gaurds[group].gaurd.chasing = false;
                my.sprite.gaurds[group].line.strokeColor = 16711680
                my.sprite.gaurds[group].shocktext.text = ''
            }
            
        }
        for (const i in this.tweens.tweens) { //for somereason the tween manager wasn't cleaning the completed tweens so I had to do it myself
            if (this.tweens.tweens[i].targets && this.tweens.tweens[i].targets[0].value == 1) {
                this.tweens.remove(this.tweens.tweens[i])
            }

        }

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        //Text & Death Screen tracking
        this.LocationText.x = this.cameras.main._scrollX + 20
        this.LocationText.y = this.cameras.main._scrollY + 20 
        this.coinText.x = this.cameras.main._scrollX + 1050
        this.coinText.y = this.cameras.main._scrollY + 20
        this.coinText.text = 'Coins Collected: ' + my.sprite.player.coinCount + '/15';

        if (this.GAMEOVER == false) {
            this.GameOverText.x = this.cameras.main._scrollX + 80
        } else {
            for (const group in my.sprite.gaurds) {
                my.sprite.gaurds[group].gaurd.x = 0;
                my.sprite.gaurds[group].gaurd.y = 0;
            }
        }
        this.GameOverText.y = this.cameras.main._scrollY + 120
        this.restartText.x = this.cameras.main._scrollX + 500
        this.restartText.y = this.cameras.main._scrollY + 240
        my.sprite.deathRectangle.x  = this.cameras.main._scrollX + 750
        my.sprite.deathRectangle.y  = this.cameras.main._scrollY + 375
        my.sprite.menuRectangle.x  = this.cameras.main._scrollX + 750
        my.sprite.menuRectangle.y  = this.cameras.main._scrollY + 375



        //Movement
        if (this.GAMEOVER == false) {

            if(my.sprite.player.body.speed > 55) {
                //console.log('speed:', my.sprite.player.body.speed )
                my.sprite.player.footsteptimer++;
            }

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

        }

        

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