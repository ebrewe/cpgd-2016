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
    this.player = this.addPlayerAt(this.game.width/2, this.game.height/2);
    this.playerGroup.add(this.player);

    //collect groupsthis.backgroundGroup
    this.renderGroup.add(this.midgroupGroup);
    this.renderGroup.add(this.itemsGroup);
    this.renderGroup.add(this.entitiesGroup);
    this.renderGroup.add(this.playerGroup);
    this.renderGroup.add(this.effectsGroup);
    this.renderGroup.add(this.HUDGroup);

  }
  addPlayerAt(x, y){
    var p = new Player(this.game, x, y, 'player');
    return p;
  }
}
//========CLASSES==========//
class Player extends Phaser.Sprite{
  constructor(game, x, y, sprite, settings={}){
    super(game, x, y, sprite);
    this.settings = settings;

    this.width=30;
    this.height=30;
    this.anchor.setTo(0.5);

  }
}
