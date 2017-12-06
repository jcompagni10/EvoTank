import KeyboardController1 from './keyboard_controller1';
import KeyboardController2 from './keyboard_controller2';
import AIController from './ai_controller';
import PathFinder from './pathFinder/path_finder';

import $ from 'jquery';


export default class Tank {
  constructor({id, speed, xPos, yPos, dir, detectCollision, generateBullet, map}){
    this.xPos = xPos;
    this.yPos = yPos;
    this.dir = dir;
    this.speed = 4;
    this.id = id;
    this.actions = {};
    this.size = 80;
    this.rotationAmount = 6;
    this.ammo = 1000;
    this.ref = $(`#tank${this.id}`);
    this.detectCollision = detectCollision;
    this.generateBullet = generateBullet;
    this.fireInterval = 0;
    this.map = map;


  //ensure initialize bebfore AI setup
    if (this.id === 0){
      setTimeout(()=>{
        const controller = new AIController(this, this.actions, this.map);
      }, 1000);
    }else{
      const controller = new KeyboardController2(this.actions);
    }
    const pf = new PathFinder(this.grid);
    window.pf = pf;
  }

  rad(){
    return this.dir * Math.PI / 180;
  }

  css(){
    return {
      left: this.xPos + "px",
      top: this.yPos + "px",
      transform: "rotate("+this.dir+"deg)"
    };
  }


  nextFrame(){
    this.move();
    this.handleShoot();
    this.render();

  }

  center(){
    return [this.xPos + this.size/2,
      this.yPos + this.size/2];
  }

  handleShoot(){
    if(this.fireInterval === 0 && this.actions.shoot && this.ammo > 0){
      this.ammo --;
      this.fireInterval = 10;
      let turretX = this.xPos + this.size/2  + Math.sin(this.rad()) * this.size;
      let turretY = this.yPos + this.size/2 - Math.cos(this.rad()) * this.size;
      $(".dot").css({top: turretY+"px", left: turretX + "px"});

      this.generateBullet(turretX, turretY, this.dir, this.id);
    }
    if (this.fireInterval > 0){
      this.fireInterval --;
    }
  }

  move(){
    // TODO: dry these up
    const rad = this.rad();
    if (this.actions.up){
      let newX = this.xPos + Math.sin(rad)*this.speed;
      let newY = this.yPos - Math.cos(rad)*this.speed;
      this.updatePos(newX, newY);
    }
    if (this.actions.down){
      let newX = this.xPos - Math.sin(rad)*this.speed;
      let newY = this.yPos + Math.cos(rad)*this.speed;
      this.updatePos(newX, newY);
    }
    if (this.actions.left){
      this.dir = (this.dir - this.rotationAmount);
      if (this.dir < 0){
        this.dir = 360 + this.dir;
      }
    }
    if (this.actions.right){
      this.dir = (this.dir + this.rotationAmount);
    }
    if (this.dir >= 360){
      this.dir = this.dir%360;
    }
  }

  updatePos(newX, newY){
    let collision = this.detectCollision(...this.center(), this.size);
    if (collision){
      return false;
    }
    else{
      this.xPos = newX;
      this.yPos = newY;
    }
  }

  render(){
    this.ref.css(this.css());
  }
}
