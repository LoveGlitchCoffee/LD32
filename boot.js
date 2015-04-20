var boot = function(game){};

var isoGroup,cursorPos, cursor, nukeButton, explosion;
var tileSize = 38;

boot.prototype = {
    preload: function()
    {
        this.game.load.image('tile', 'Assets/Art/CrackedRoadSingle.png');
	//for now load characters here

	this.game.load.spritesheet('enemy', 'Assets/Art/programmer.png', 48, 60);

	this.game.load.image('button', 'Assets/Art/touch.png');
	
	this.game.load.spritesheet('player', 'Assets/Art/programmer.png', 48, 60);

	this.game.load.spritesheet('explosion', 'Assets/Art/explosion.png', 64, 64);
				   
        this.game.time.advancedTiming = true;

	this.game.load.audio('explodeSound', 'Assets/Sound/Explosion.wav');
	this.game.load.audio('theme', 'Assets/Sound/theme.wav');
	
        this.game.plugins.add(new Phaser.Plugin.Isometric(this.game));
	this.game.physics.startSystem(Phaser.Plugin.Isometric.ISOARCADE);
        this.game.iso.anchor.setTo(0.5, 0.2);

    },
    
    create: function()
    {
	isoGroup = this.game.add.group();
	isoGroup.enableBody = true;

	this.game.sound.play('theme', true);

	this.spawnTiles();

	nukeButton = this.game.add.button(15, 15, 'button');

	explosion = this.game.add.isoSprite(0,0,2, 'explosion', 11);
	explosion.anchor.set(0.5,0.5);
	explosion.animations.add('explode', [0,1,2,3,4,5,6,7,8,9,10,11], 10);
	
	cursorPos = new Phaser.Plugin.Isometric.Point3();

	this.game.state.start('Gameplay', false, false,isoGroup, cursorPos, tileSize, nukeButton, explosion);
    },
    
   
    render: function()
    {
	//nothing now
    },

    spawnTiles: function()
    {
	var tile;

	for (var x = 0; x < 6; x ++)
	{
	    for (var y = 0; y < 6; y ++)
	    {
		//isoSprite is new, x, y, and z (start 0)
		tile = this.game.add.isoSprite(x * tileSize, y * tileSize, 0, 'tile', 0, isoGroup);
		tile.xPos = x;
		tile.yPos = y;
		tile.body.immovable = true;
		tile.anchor.set(0.5,0);
	    }
	}
    }    
};
