window.onload = ()=>{
  var width = window.innerWidth < 700 ? window.innerWidth : 700;
  var height = window.innerHeight >= width ? width : window.innerHeight;
  const cpgd = new CPGD(width, height, Phaser.AUTO, 'phaser_mount');
  cpgd.launch();
}
class CPGD extends Phaser.Game {
  constructor(width, height, render, container){
    super(width, height, render, container,null, true);
    this.state.add('Preload', PreloadState);
    this.state.add('Level', LevelState);
  }
  launch(){
    this.state.start('Preload');
  }
}
//========PRELOAD STATE==========//
class PreloadState extends Phaser.State{
  preload(){
    console.log('preloading');
  }
  create(){
    this.game.state.start('Level');
  }
}
//========LEVEL STATE==========//
class LevelState extends Phaser.State{
  preload(){
    console.log('adding assets');
  }
  create(){
    console.log('Here we go!');
    this.world.setBounds(0,0, this.game.width, this.game.height);
    this.game.physics.startSystem(Phaser.Physics.P2JS);
    this.game.physics.startSystem(Phaser.Physics.ARCADE);
      //groups
    this.backgroundGroup = this.game.add.group();
    this.midgroupGroup = this.game.add.group();
    this.itemsGroup = this.game.add.group();
    this.entitiesGroup = this.game.add.group();
    this.playerGroup = this.game.add.group();
    this.effectsGroup = this.game.add.group();
    this.HUDGroup = this.game.add.group();
    this.renderGroup = this.game.add.group();

    //add player
    var playerDefaults = {
      walkSpeed: 70,
      dashSpeed: 120,
      attack: 1,
      defense: 0,
      hp: 10,
      mp: 0
    }
    this.player = this.addPlayer(this.game.width/2, this.game.height/2, playerDefaults);
    this.playerGroup.add(this.player);

    //collect groupsthis.backgroundGroup
    this.renderGroup.add(this.midgroupGroup);
    this.renderGroup.add(this.itemsGroup);
    this.renderGroup.add(this.entitiesGroup);
    this.renderGroup.add(this.playerGroup);
    this.renderGroup.add(this.effectsGroup);
    this.renderGroup.add(this.HUDGroup);

  }
  addPlayer(x, y, settings=false){
    let p = new Player(this.game, x, y, 'player', settings);
    return p;
  }
}
//========CLASSES==========//
class Player extends Phaser.Sprite{
  constructor(game, x, y, sprite, settings=false){
    super(game, x, y, sprite);
    this.settings = settings || {
      walkSpeed: 10,
      dashSpeed: 20,
      attack: 1,
      defense: 1,
      hp:1,
      mp: 0
    };

    this.width=30;
    this.height=30;
    this.anchor.setTo(0.5);

    this.cursor = this.game.input.keyboard.createCursorKeys();
    this.game.input.keyboard.addKeyCapture(Phaser.Keyboard.CONTROL);
    this.cursor.attack = this.game.input.keyboard.addKey(Phaser.Keyboard.CONTROL);

    this.game.physics.arcade.enable(this);

    //test Weapon
    this.weapon = new Weapon(this.game, this, this.x, this.y, 'weapon', 1, .5);
  }

  update(){

    let movementVector = this.movePlayer();
    this.body.velocity.x = movementVector[0];
    this.body.velocity.y = movementVector[1];

    if(this.game.input.activePointer.isDown || this.cursor.attack.isDown){
      this.weapon.useWeapon();
    }
  }

  movePlayer(){
    var movementVector = [0,0]
    if(this.cursor.left.isDown){
       movementVector[0] = this.dashing ? -1 * this.settings.dashSpeed : -1 * this.settings.walkSpeed;
    }
    if(this.cursor.right.isDown){
       movementVector[0] = this.dashing ? this.settings.dashSpeed : this.settings.walkSpeed;
    }
    if(this.cursor.up.isDown){
       movementVector[1] = this.dashing ? -1 * this.settings.dashSpeed : -1 * this.settings.walkSpeed;
    }
    if(this.cursor.down.isDown){
       movementVector[1] = this.dashing ? this.settings.dashSpeed : this.settings.walkSpeed;
    }

    return movementVector;
  }
}


/*/----WEAPONS --------------/*/
class Weapon extends Phaser.Sprite{
  constructor(game, player, x,y,sprite,attack,speed){
     super(game, x, y, sprite);
     this.player = player;
     this.attack = attack;
     this.attackDelay = 1000 * speed;
     this.attackTime = 0;
  }
  useWeapon(){
    if(this.game.time.now < this.attackTime) return false;

    this.attackTime = this.game.time.now + this.attackDelay;
    console.log('woosh!');
  }
}
