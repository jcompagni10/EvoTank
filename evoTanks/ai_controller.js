import {distance, randPoint, rand} from './util.js';
import merge from 'lodash/merge';
import PathFinder from './pathFinder/path_finder';
import TestBullet from './test_bullet';

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
    this.opTank = this.map.tanks[(tank.id+1)%2];
    this.fireInterval = 100;
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
      if (distance(...this.tank.center(), ...this.opTank.center()) > 100){
      this.waypoints = pf.getWaypoints(this.tankCell(this.tank),
        this.tankCell(this.opTank));
        console.log("to enemy");
      } else{
        let rp  = [rand(0,this.map.size), rand(this.map.size)];
        this.waypoints = pf.getWaypoints(this.tankCell(this.tank), rp);
        console.log("to rand");
      }
    }
    return "nextWP";
  }

  handler(){
    if (this.fireInterval < 100 ) this.fireInterval ++;
    merge(this.actions, {shoot: false });
    // console.log(this.state);
    switch(this.state){
    case "IDLE":
      let result = this.checkForTarget() || this.nextWaypoint();
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
    case "ROTATING_TO_FIRE":
      this.handleFire(this.enemyDir);
      break;
    default:
      debugger;

    }
  }

  calcRotationAmt(pX, pY){
    let [centerX, centerY] = this.tank.center();
    let xDist =  pX - centerX;
    let yDist =  pY - centerY;
    return Math.atan2(xDist,-yDist) * 180/Math.PI % 360;
  }

  shortestDir(ptA, ptB){
    let diff = Math.abs(ptA - ptB);
    diff = (diff > 180) ? 360 - diff : diff;
    if ((ptA + diff)%360 === ptB){
      return "right";
    }
    return "left";
  }
  rotate(){
    let targetDir = this.calcRotationAmt(this.targetX, this.targetY);
    if (targetDir < 0) {
      targetDir = 360 + targetDir;
    }


    this.rotDir = this.shortestDir(this.tank.dir, targetDir);
    merge(this.actions, {[this.rotDir]: true });
    this.state = "ROTATING";
    this.targetDir = targetDir;
  }

  executeRotation(){
    if (Math.abs(this.tank.dir-this.targetDir) <= 6){
      merge(this.actions, {[this.rotDir]: false });
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

  handleFire(enemyDir){
    if (Math.abs(enemyDir - this.tank.dir) <= 6){
      merge(this.actions, {shoot: true });
      this.fireInterval = 0;
      this.state = "IDLE";
      merge(this.actions, {[this.rotDir]: false });
    } else if (this.state === "PREP_TO_FIRE"){
      this.enemyDir = enemyDir;
      this.rotDir = this.shortestDir(this.tank.dir, enemyDir);
      merge(this.actions, {[this.rotDir]: true });
      this.state = "ROTATING_TO_FIRE";
    }
  }

  checkForTarget(){
    if (this.fireInterval === 100){
      let enemyDir = this.calcRotationAmt(...this.opTank.center());
      if (enemyDir < 0) enemyDir = 360 + enemyDir;
      let bullet = new TestBullet({
        xPos: this.tank.xPos,
        yPos: this.tank.yPos,
        dir: enemyDir,
        detectCollision: this.map.detectCollision.bind(this.map),
        tankId: this.tank.id
      });
      let length = 50;
      let result = bullet.test(length);
      bullet.destroy();
      if (result !== -1 ){
        this.state = "PREP_TO_FIRE";
        this.handleFire(enemyDir);
        return true;
      }
    } else{
      this.fireInterval ++;
    }
  }

}
