import {distance} from './util.js';
import merge from 'lodash/merge';

export default class AIController{
  constructor(tank, actions, grid){
    this.tank = tank;
    this.actions = actions;
    this.state = "idle";
    this.grid = grid;
    this.handlerInterval = setInterval(this.handler.bind(this), 20);
  }

  handler(){
    let goto= [2,2];
    if (this.state === "idle"){

    }
  }

  calcRotationAmt(pX, pY){
    let centerX = this.tank.xPos + this.tank.size/2;
    let centerY = this.tank.yPos + this.tank.size/2;
    let xDist =  pX - centerX;
    let yDist =  pY - centerY;
    return Math.atan2(xDist,-yDist) * 180/Math.PI % 360;
  }

  rotateTo(pX, pY){
    let targetDir = this.calcRotationAmt(pX, pY);
    if (targetDir < 0) {
      targetDir = 360 + targetDir;
    }
    let action = "right";
    if (this.tank.dir > targetDir){
      action = "right";
    }
    merge(this.actions, {[action]: true });
    return this.executeRotation(targetDir, action);
  }

  executeRotation(targetDir, action){
    if (Math.abs(this.tank.dir-targetDir) > 6){
      return false;
    } else{
      merge(this.actions, {[action]: false });
      this.moving = false;
      return true;
    }
  }

  forward(pX, pY){
    merge(this.actions, {up: true});
    this.executeForward(pX, pY);
    this.moving= true;
  }


  executeForward(pX, pY){
    let targetDistance =  distance(
      this.tank.xPos + this.tank.size/2,
      this.tank.yPos + this.tank.size/2, pX, pY);
      console.log(targetDistance);
      if (targetDistance > 30){
      setTimeout( ()=>this.executeForward(pX, pY), 10);
    } else{
      merge(this.actions, {up: false });
      this.moving = false;
    }
  }


}
