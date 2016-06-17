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
    this.projectilesGroup = this.game.add.group();
    this.fireballs = this.game.add.group();
    this.effectsGroup = this.game.add.group();
    this.HUDGroup = this.game.add.group();
    this.renderGroup = this.game.add.group();

    this.fireballTimer = this.game.time.now + 2000;

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

    for(let i of Array(20).keys()){
      var testP = new Projectile(this.game, Math.random() * this.game.width, Math.random() * this.game.height, 'fireball', {x:this.player.x, y:this.player.y});
      testP.kill();
      this.fireballs.add(testP);
    }


    //collect groupsthis.backgroundGroup
    this.renderGroup.add(this.midgroupGroup);
    this.renderGroup.add(this.itemsGroup);
    this.renderGroup.add(this.entitiesGroup);
    this.renderGroup.add(this.playerGroup);
    this.renderGroup.add(this.projectilesGroup);
    this.renderGroup.add(this.fireballs); //demo
    this.renderGroup.add(this.effectsGroup);
    this.renderGroup.add(this.HUDGroup);

  }
  addPlayer(x, y, settings=false){
    let p = new Player(this.game, x, y, 'player', settings);
    return p;
  }
  update(){
    this.doCollisions();
    if(this.game.time.now > this.fireballTimer) this.launchFireball();
    //camera
    this.camera.focusOnXY(this.player.x, this.player.y);
  }
  launchFireball(){
    this.fireballTimer = this.game.time.now + 3000;
    let f = this.fireballs.getFirstExists(false);
    f.target = {x:this.player.x, y:this.player.y};
    f.killOn = this.game.time.now + 5000;
    f.reset(Math.random() * this.game.width, Math.random() * this.game.height);
    f.launchStraight();
  }
  doCollisions(){
    this.game.physics.arcade.collide(this.player.shield, this.fireballs, (shield, projectile)=>{
      projectile.kill();
    }, null);
    this.game.physics.arcade.collide(this.player, this.fireballs, (player, projectile)=>{
      projectile.kill();
      console.log('ouch!')
    }, null)
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

    this.width=15;
    this.height=15;
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
    this.weapon = new Weapon(this.game, this, 0, 5, 'weapon', 1, .3);
    this.weapons.add(this.weapon);
    this.weapons.add(this.reticle);

    //test Shield
    this.shield = new Shield(this.game, this, this.width*0.8, 0);
    this.weapons.add(this.shield);

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

    this.movementVector = this.movePlayer();

    let angleToPointer = this.game.physics.arcade.angleToPointer(this);
    if(!this.weapon.usingWeapon) this.weapons.rotation = this.rotatePlayer(angleToPointer);
    let moveSpeed = this.getAngleDirection(angleToPointer) ? 1 : 0.7;

    this.body.velocity.x = this.movementVector[0] * this.settings.walkSpeed * moveSpeed;
    this.body.velocity.y = this.movementVector[1] * this.settings.walkSpeed * moveSpeed;

    if(this.cursor.attack.isDown || this.game.input.activePointer.isDown){
      if(!this.charging){
        this.charging = true;
        this.chargeTime = this.game.time.now;
      }
    }

    if(this.weapon.usingWeapon && !this.shield.usingWeapon){
      this.shield.beAggressive();
    }
    if(!this.weapon.usingWeapon && this.shield.usingWeapon){
      this.shield.beDefensive();
    }

    this.weapons.x = this.x;
    this.weapons.y = this.y;
  }

  getAngleDirection(angle){
    //from top
    const directions = {
      "negativeLeft": -3.1,
      "upLeft": -2.4,
      "up": -1.6,
      "upRight": -0.75,
      "right": 0,
      "downRight":0.75,
      "down":1.5,
      "downLeft":2.4,
      "left": 3.1
    }
    let ad = "left";
    for(var i in directions){
      if(angle < directions[i] + 0.2){
        ad = i;
        break;
      }
    }
    if(ad == "negativeLeft") ad = "left"
    let vector = this.translateMovementVector();
    return (ad == vector);
  }
  translateMovementVector(){
      if(!this.movementVector) return false;
      var v = "";
      if(this.movementVector[1] > 0) v += "down";
      if(this.movementVector[1] < 0) v += "up";
      if(this.movementVector[0] < 0) v = v.length? v + "Left" : "left";
      if(this.movementVector[0] > 0) v = v.length? v + "Right" : "right";
      return v.length ? v : false;

  }
  rotatePlayer(angle){
    var cr = this.weapons.rotation;
    var direction;
    if(cr > 0 && angle > 0) direction = angle > cr ? 1 : -1;
    if(cr < 0 && angle < 0) direction = angle < cr ? -1 : 1;
    if(cr >= 0 && angle < 0) direction = Math.abs(angle) > cr ? 1 : -1;
    if(cr < 0 && angle >= 0) direction = angle < Math.abs(cr) ? 1 : -1;

    let diff = Math.abs(angle) - Math.abs(cr);
    let signEq = Math.sign(angle) === Math.sign(cr);
    if(diff <= .1  ) return angle;
    return cr + (direction * 0.1);
  }
  movePlayer(){
    var movementVector = [0,0]
    if(this.cursor.left.isDown){
       movementVector[0] = -1;
    }
    if(this.cursor.right.isDown){
       movementVector[0] = 1;
    }
    if(this.cursor.up.isDown){
       movementVector[1] = -1;
    }
    if(this.cursor.down.isDown){
       movementVector[1] = 1;
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
     this.anchor.setTo(0, 0);
     this.usingWeapon = false;

     this.defaultWidth = 5;
     this.width = this.defaultWidth;
     this.height = 8;
     this.swingWidth = 15;

     this.game.physics.arcade.enable(this);
     this.body.immovable = true;

     this.usingWeapon = false;

     this.chargeTimes = {
       'swing':400
     }

     this.attackDuration = 200;
     this.attackRecovery = 100;
  }
  useWeapon(charge = 0){
    if(this.game.time.now < this.attackTime) return false;

    this.usingWeapon = true;
    if(charge >= this.chargeTimes.swing){
        this.attackTime = this.game.time.now + this.attackDelay + this.attackDuration + this.attackRecovery;
      this.swing();
    }else{
        this.attackTime = this.game.time.now + 100 + this.attackDuration + this.attackRecovery;
      this.thrust();
    }
  }
  thrust(){
    let t = this.game.add.tween(this).to({x:this.swingWidth / 2, width:this.swingWidth}, this.attackDuration, Phaser.Easing.Linear.NONE, true, 5);
    t.onComplete.add(()=>{
      this.game.add.tween(this).to({x:0, width:this.defaultWidth}, this.attackRecovery, Phaser.Easing.Linear.NONE, true, 5);
      this.usingWeapon = false;
    });
  }
  swing(){
    let s = this.game.add.tween(this).to({rotation: 1.4, x:this.swingWidth/3, y:this.swingWidth/2, width:this.swingWidth}, 100, Phaser.Easing.Linear.NONE, true, 5 );
    s.onComplete.add(this.arc, this)

  }
  arc(){
    let ss = this.game.add.tween(this).to({rotation: -0.3, x:this.swingWidth * 0.8, y:-(this.swingWidth/3), width:this.swingWidth}, this.attackDuration * 0.8, Phaser.Easing.Linear.NONE, true, 5 );
    ss.onComplete.add(()=>{
        this.game.add.tween(this).to({rotation:0, x:this.defaultX, y:this.defaultY, width:this.defaultWidth}, 50, Phaser.Easing.Linear.NONE, true, 5);
        this.usingWeapon = false;
      });
  }

}

class Shield extends Phaser.Sprite{
  constructor(game, player, x, y){
    super(game, x, y, 'shield');
    this.player = player;

    this.defaultX = x;
    this.defaultY = y;

    this.width = 5;
    this.height = 18;
    this.anchor.setTo(0.4, 0.6);

    this.usingWeapon = false;

    this.game.physics.arcade.enable(this);
    this.body.immovable = true;
  }
  beAggressive(){
    this.usingWeapon = true;
    this.game.add.tween(this).to({rotation:-1, y:this.defaultY - 7, x:this.defaultX - 7}, 100, Phaser.Easing.Linear.NONE, true, 5);
  }
  beDefensive(){
    this.usingWeapon=false;
    this.game.add.tween(this).to({rotation:0, y:this.defaultY, x:this.defaultX}, 50, Phaser.Easing.Linear.NONE, true, 5);
  }
}

class Projectile extends Phaser.Sprite{
  constructor(game, x, y, sprite, target={x:0, y:0}, speed=200){
    super(game, x, y, sprite);

    this.width = 5;
    this.height = 5;
    this.game.physics.arcade.enable(this);
    this.body.collideWorldBounds = true;

    this.target = target;
    this.speed = speed;
    this.killOn = 0;
    this.seeking = false;
  }
  launchStraight(){
    this.game.physics.arcade.moveToXY(this, this.target.x, this.target.y, this.speed)
  }
  update(){
    if(this.alive && this.game.time.now > this.killOn) this.kill();
  }
}
