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
    this.playerGroup.add(this.player.weapons);

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

    this.reticle = this.game.add.graphics(this.width, 0);
    this.reticle.beginFill(0x00FF00, 1);
    this.reticle.drawCircle(0,0,5);
    this.reticle.endFill();

    this.charging = false;
    this.chargeTime = 0;

    this.cursor = this.game.input.keyboard.createCursorKeys();
    this.game.input.keyboard.addKeyCapture(Phaser.Keyboard.CONTROL);
    this.cursor.attack = this.game.input.keyboard.addKey(Phaser.Keyboard.CONTROL);

    this.game.physics.arcade.enable(this);

    //test weapons
    this.weapons = this.game.add.group();
    this.weapon = new Weapon(this.game, this, 0, 0, 'weapon', 1, .3);
    this.weapons.add(this.weapon);
    this.weapons.add(this.reticle);

    //callbacks
    this.game.input.keyboard.onUpCallback = ((e)=>{
      let key = e.keyCode;
      if(key == this.cursor.attack.keyCode){
        let c= this.game.time.now - this.chargeTime;
        this.charging = false;
        this.chargeTime = 0;
        this.weapon.useWeapon(c);
      }
    });

    document.addEventListener('mouseup', (e)=>{
      if(e.which === 1){
        let c= this.game.time.now - this.chargeTime;
        this.charging = false;
        this.chargeTime = 0;
        this.weapon.useWeapon(c);
      }
    });

  }

  update(){

    let movementVector = this.movePlayer();
    this.body.velocity.x = movementVector[0];
    this.body.velocity.y = movementVector[1];

    if(this.cursor.attack.isDown || this.game.input.activePointer.isDown){
      if(!this.charging){
        this.charging = true;
        this.chargeTime = this.game.time.now;
      }
    }


    this.weapons.x = this.x;
    this.weapons.y = this.y;
    let angleToPointer = this.game.physics.arcade.angleToPointer(this);
    if(!this.weapon.usingWeapon) this.weapons.rotation = angleToPointer;
    console.log(angleToPointer)
  }

  getAngleDirection(angle){
    //from top
    var directions = {
      top: -1.6,
      topRight: -0.75,
      right: 0,
      bottomRight:0.75,
      bottom:1.5,
      bottomLeft:2.4,
      left: -3,
      topLeft: -2.4
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
     this.defaultX = x;
     this.defaultY = y;
     this.player = player;
     this.attack = attack;
     this.attackDelay = 1000 * speed;
     this.attackTime = 0;
     this.anchor.setTo(0.2, 0.1);
     this.usingWeapon = false;

     this.width = 30;
     this.height = 15;

     this.chargeTimes = {
       'swing':400
     }

     this.attackDuration = 200;
     this.attackRecovery = 100;
  }
  useWeapon(charge = 0){
    if(this.game.time.now < this.attackTime) return false;

    if(charge >= this.chargeTimes.swing){
        this.attackTime = this.game.time.now + this.attackDelay + this.attackDuration + this.attackRecovery;
      this.swing();
    }else{
        this.attackTime = this.game.time.now + 100 + this.attackDuration + this.attackRecovery;
      this.thrust();
    }
  }
  thrust(){
    this.usingWeapon = true;
    let t = this.game.add.tween(this).to({x:this.width / 2}, this.attackDuration, Phaser.Easing.Linear.NONE, true, 5);
    t.onComplete.add(()=>{
      this.game.add.tween(this).to({x:0}, this.attackRecovery, Phaser.Easing.Linear.NONE, true, 5);
      this.usingWeapon = false;
    });
  }
  swing(){
    this.usingWeapon = true;
    let s = this.game.add.tween(this).to({rotation: 1.4, x:this.width/3, y:this.width/2}, 100, Phaser.Easing.Linear.NONE, true, 5 );
    s.onComplete.add(this.arc, this)

  }
  arc(){
    let ss = this.game.add.tween(this).to({rotation: -0.1, x:this.width * 0.8, y:-(this.width/3)}, this.attackDuration * 0.8, Phaser.Easing.Linear.NONE, true, 5 );
    ss.onComplete.add(()=>{
        this.game.add.tween(this).to({rotation:0, x:this.defaultX, y:this.defaultY}, 50, Phaser.Easing.Linear.NONE, true, 5);
        this.usingWeapon = false;
      });
  }

}

class Shield extends Phaser.Sprite{
  constructor(game, player, x, y){
    super(game, x, y, '');
    this.player = player;
    this.game.physics.arcade.enable(this);
  }
}
