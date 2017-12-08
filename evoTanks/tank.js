import PathFinder from './pathFinder/path_finder';

import $ from 'jquery';


export default class Tank {
  constructor({id, speed, xPos, yPos, dir, detectCollision, generateBullet, map, type}){
    this.xPos = xPos;
    this.yPos = yPos;
    this.dir = dir;
    this.speed = 4;
    this.id = id;
    this.actions = {};
    this.size = 35;
    this.rotationAmount = 6;
    this.ammo = 5;
    this.ref = $(`#tank${this.id}`);
    this.detectCollision = detectCollision;
    this.generateBullet = generateBullet;
    this.fireInterval = 0;
    this.map = map;
    this.type = type;
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
      let turretX = this.center()[0] + Math.sin(this.rad()) * this.size/1.6;
      let turretY = this.center()[1] - Math.cos(this.rad()) * this.size/1.6;
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
    let collision = this.detectCollision(newX, newY, this.size, this.type);
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
    if (this.type === "AI"){
      this.controller.handler();
    }
  }
}
