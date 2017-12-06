import {distance} from './util.js';
import merge from 'lodash/merge';
import PathFinder from './pathFinder/path_finder';

export default class AIController{
  constructor(tank, actions, map){
    this.tank = tank;
    this.actions = actions;
    this.state = "IDLE";
    this.handlerInterval = setInterval(this.handler.bind(this), 20);
    this.resolution = map.resolution;
    this.grid = {horiz: map.horizWalls, vert: map.vertWalls};
    this.waypoints = [];
    this.map = map;
    this.opTank = this.map.tanks[1];
  }


  tankCell(tank){
    return [Math.floor(tank.xPos/this.resolution),
      Math.floor(tank.yPos/this.resolution)];
  }

  cellToCoords(cell){
    return cell.map((pt)=>(
      pt * this.resolution + this.resolution/2
    ));
  }

  nextWaypoint(){
    let curWaypoint = this.waypoints.shift();
    if (curWaypoint){
      let coords = this.cellToCoords(curWaypoint);
      this.targetX = coords[0];
      this.targetY = coords[1];
      this.rotate();
    }
    else{
      const pf = new PathFinder(this.grid);
      this.waypoints = pf.getWaypoints(this.tankCell(this.tank),
        this.tankCell(this.opTank));
    }
  }

  handler(){
    switch(this.state){
    case "IDLE":
      this.nextWaypoint();
      break;
    case "ROTATING":
      this.executeRotation();
      break;
    case "ROTATION_COMPLETE":
      this.forward();
      break;
    case "MOVING":
      this.executeForward();
      break;
    default:
      debugger;

    }
  }

  calcRotationAmt(pX, pY){
    let centerX = this.tank.xPos + this.tank.size/2;
    let centerY = this.tank.yPos + this.tank.size/2;
    let xDist =  pX - centerX;
    let yDist =  pY - centerY;
    return Math.atan2(xDist,-yDist) * 180/Math.PI % 360;
  }

  rotate(){
    let targetDir = this.calcRotationAmt(this.targetX, this.targetY);
    if (targetDir < 0) {
      targetDir = 360 + targetDir;
    }

    // TODO: rotate shortest direction
    let action = "left";
    if (targetDir > this.tank.dir && targetDir < (this.tank.dir+180)%360){
      action = "right";
    }
    merge(this.actions, {[action]: true });
    this.state = "ROTATING";
    this.targetDir = targetDir;
    this.action = action;
  }

  executeRotation(){
    if (Math.abs(this.tank.dir-this.targetDir) <= 6){
      merge(this.actions, {[this.action]: false });
      this.state = "ROTATION_COMPLETE";
      return true;
    }
  }

  forward(){
    merge(this.actions, {up: true});
    this.executeForward();
    this.state= "MOVING";
  }


  executeForward(){
    let targetDistance =  distance(
      this.tank.xPos + this.tank.size/2,
      this.tank.yPos + this.tank.size/2, this.targetX, this.targetY
    );
    if (targetDistance <= 30){
      merge(this.actions, {up: false });
      this.state = "IDLE";
    }
  }


}
