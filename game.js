var gameplay = function(game){};

var enemy;
var player;
var isoGroup, cursorPos, tileSize, coders, nukeButton, sortingGroup, explosion;
var turn = 1;
var noOfCoders = 2; // can extend
var moved = false;
var canNuke = true;
var enemyMoveTiles;
var winText;

gameplay.prototype = {

    preload: function()
    {
    },

    init: function(iso, curPos, tlSize, nkBut, explo)
    {
	isoGroup = iso;
	cursorPos = curPos;
	tileSize = tlSize;
	nukeButton = nkBut;
	explosion = explo;
    },

    generateExplosion: function(xPos, yPos)
    {	
	explosion.isoX = xPos;
	explosion.isoY = yPos;

	explosion.animations.play('explode');
	
    },

    nuke: function(genExploFunction, sfx)
    {
	var genExplo = genExploFunction;
	sfx.play('explodeSound', 0.5);
	
	if (canNuke)
	{
	    var tileToNuke = isoGroup.getRandom();	    	   
	    
	    tileToNuke.events.onRemovedFromGroup.add(function(){
		
		genExplo(tileToNuke.isoX, tileToNuke.isoY);
		
	    }, this, genExplo);

	    
	    isoGroup.remove(tileToNuke, true);
	    //at some point some tiles doesn't even belong to group?
	    canNuke = false;
	    moved = true;
	    
	    
	    coders.forEach(function(coder){
		if (coder.xPos == tileToNuke.xPos && coder.yPos == tileToNuke.yPos){
		    
		    if (coder.turnID == 1)
		    {
			winText = "You lose";			
		    }
		    else
		    {
			winText = "You Win";			
		    }
		    
		    isoGroup.game.add.text(30, 100, winText, {fontSize : '50px', fill :' #FF0000'});
		    coder.kill();
		}
	    },this,tileToNuke);
	}

    },

    playerTurn: function()
    {
	canNuke = true;
	isoGroup.forEach(function(tile){

	    if (Math.abs(tile.xPos - player.xPos) <= 1 && Math.abs(tile.yPos - player.yPos) <= 1)
	    {
		
		tile.inputEnabled = true;		
		tile.events.onInputDown.addOnce(function(){player.playerMove(tile)});

	    }
	});

	nukeButton.visible = true;
	nukeButton.inputEnabled = true;
	nukeButton.onInputDown.addOnce(function(){nukeButton.activate()});    
    },


    enemyTurn: function()
    {
	
	
	var nuke = enemy.game.rnd.integerInRange(0,1);
	canNuke = true;
	
	if (nuke == 1)
	{
	    nukeButton.activate();
	}
	else
	{
	    
	    isoGroup.forEach(function(tile){

		if (Math.abs(tile.xPos - enemy.xPos) <= 1 && Math.abs(tile.yPos - enemy.yPos) <= 1)
		{
		    enemyMoveTiles.add(tile);
		}
	    });

	    console.log(enemyMoveTiles);
	    var tileMovedTo = enemyMoveTiles.getRandom();
	    enemy.xPos = tileMovedTo.xPos;
	    enemy.yPos = tileMovedTo.yPos;
	    //add back to movableTiles
	    enemyMoveTiles.forEach(function(tile){
		isoGroup.add(tile);
	    });
	    
	    enemy.game.add.tween(enemy).to({isoX : enemy.xPos * tileSize, isoY: enemy.yPos * tileSize}, 1000).start();
	  	 
	    moved = true;
	}
	
    },

    addPlayer: function(playerTurn)
    {
	player = this.game.add.isoSprite(3 * tileSize,4 * tileSize,1, 'player', 0, coders);
	player.anchor.set(0.5,0.65);
	player.xPos = 3;
	player.yPos = 4;
	player.turnID = 1;
	player.executeTurn = function(){
	    playerTurn();
	};

	player.playerMove = function(tile){
	    
	    player.xPos = tile.xPos;
	    player.yPos = tile.yPos;

	    
	    player.game.add.tween(player).to({isoX : player.xPos * tileSize, isoY : player.yPos * tileSize}, 1000).start();
	    moved = true;
	    

	};
    },

    addEnemy: function(enemyTurn)
    {
	enemy = this.game.add.isoSprite(0,0,1, 'enemy', 0, coders);

	enemy.anchor.set(0.5,0.65);
	enemy.xPos = 0;
	enemy.yPos = 0;
	enemy.tint = 0xFF0000;
	this.game.physics.isoArcade.enable(enemy);
	
	enemy.turnID = 2;
	enemy.executeTurn = function(){
	    enemyTurn();
	};
    },


    create: function()
    {

	var nuke = this.nuke;
	var enemyTurn = this.enemyTurn;
	var playerTurn = this.playerTurn;
	var genExplo = this.generateExplosion;

	var explodeSound = this.game.sound;
	
	//buttton's action
	nukeButton.activate = function(){
	    nuke(genExplo,explodeSound);
	};


	coders = this.game.add.group();

	sortingGroup = this.game.add.group();
	enemyMoveTiles = this.game.add.group();
	sortingGroup.add(isoGroup);
	sortingGroup.add(coders);
	sortingGroup.add(explosion);
	
	//add enemy
	this.addEnemy(enemyTurn);

	this.addPlayer(playerTurn);	
	
    },

    update: function()
    {
	this.updateTiles()

	for (var i = 0; i < coders.length; i++)
	{
	    if (coders.getAt(i).turnID == turn)
	    {
		var turner = coders.getAt(i);
		
		turner.executeTurn();		
	    }
	}

	if (moved == true)
	{	    
	    nukeButton.visible = false;
	    nukeButton.inputEnabled = false;
	    this.disableTiles();
	    
	    turn++;
	    
	    moved = !moved;	    	    
	    
	}

	if (turn > noOfCoders)
	{
	    turn = 1;
	}
	
    },


    disableTiles: function()
    {
	isoGroup.forEach(function(tile)
			 {
			     tile.inputEnabled = false;
			 });
    },

    updateTiles: function()
    {
	var game = this.game;
	//transform where cursor in 2d space to 3d space, (0,0)
	game.iso.unproject(this.game.input.activePointer.position, cursorPos);

	isoGroup.forEach(function(tile)
			 {
			     var inBounds = tile.isoBounds.containsXY(cursorPos.x, cursorPos.y);
			     
			     if (!tile.selected && inBounds){
				 tile.selected = true;
				 tile.tint = 0x86bfda;
				 game.add.tween(tile).to({isoZ : 4}, 200).start();
			     }
			     else if (tile.selected && !inBounds){
				 tile.selected = false;
				 tile.tint = 0xffffff;
				 game.add.tween(tile).to({isoZ : 0}, 200).start();
			     }


			 }, game);

    }
    
};
