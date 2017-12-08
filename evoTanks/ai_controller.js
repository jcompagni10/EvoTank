import {distance, randPoint, rand} from './util.js';
import merge from 'lodash/merge';
import PathFinder from './pathFinder/path_finder';
import TestBullet from './test_bullet';
import {resolution} from './util';

export default class AIController{
  constructor(tank, map,
    {fireInterval, bulletAwareness, targetAwareness }){
    //adjustable traits
    this.fireInterval = fireInterval; //5 - 20
    this.bulletAwareness = bulletAwareness; //10-200
    this.targetAwareness = targetAwareness; //10-200
    this.wpInterval = 5000;

    this.tank = tank;
    this.actions = tank.actions;
    this.state = "IDLE";
    this.grid = {horiz: map.horizWalls, vert: map.vertWalls};
    this.waypoints = [];
    this.map = map;

    this.lastShot = this.fireInterval;
    this.lastWP = 0;
  }


  tankCell(tank){
    return [Math.floor(tank.xPos/resolution),
      Math.floor(tank.yPos/resolution)];
  }

  cellToCoords(cell){
    return cell.map((pt)=>(
      pt * resolution + resolution/2
    ));
  }
  opTank(){
    let ownId = this.tank.id;
    return this.map.tanks[(ownId+1)%2];
  }

  setNewWayPoints(includeFirst){
    const pf = new PathFinder(this.grid);
    if (distance(...this.tank.center(), ...this.opTank().center()) > 100){
    this.waypoints = pf.getWaypoints(this.tankCell(this.tank),
      this.tankCell(this.opTank()));
    } else{
      let randCell  = [rand(0,this.map.size), rand(this.map.size)];
      this.waypoints = pf.getWaypoints(this.tankCell(this.tank), randCell);
    }
    if (!includeFirst){
      this.waypoints.shift();
    }
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
      this.setNewWayPoints();
    }
    return "nextWP";
  }

  handleWayPoints(){
    if (this.lastWP === 0 ){
      this.setNewWayPoints();
      this.lastWP = this.wpInterval;
    } else{
      this.lastWP --;
    }
  }
  handler(){
    merge(this.actions, {shoot: false });
    // console.log(this.state);
    this.handleWayPoints();
    switch(this.state){
    case "IDLE":
    this.checkForBullets() ||
      this.checkForTarget() || this.nextWaypoint();
      break;
    case "AVOIDING":
      this.checkForBullets();
      break;
    case "ROTATING":
      this.checkForBullets() ||this.executeRotation();
      break;
    case "ROTATION_COMPLETE":
      this.checkForBullets() ||  this.forward();
      break;
    case "MOVING":
      this.checkForBullets() || this.executeForward();
      break;
    case "ROTATING_TO_FIRE":
      this.checkForBullets() || this.handleFire(this.enemyDir);
      break;
    default:
      debugger;

    }
  }

  checkForBullets(){
    // if( !this.dodge) return false;
    let dangerousBullets = [];
    this.map.bullets.forEach(bullet => {
      let bulletPos = bullet.center();
      if (Math.abs(bulletPos[0] - this.tank.center()[0]) < this.bulletAwareness
        && Math.abs(bulletPos[1] - this.tank.center()[1]) < this.bulletAwareness){
          dangerousBullets.push(bullet);
        }
    });
    if (dangerousBullets.length > 0 ){
      merge(this.actions, {down: true });
      merge(this.actions, {up: false });
      merge(this.actions, {[this.rotDir]: false });
      this.state = "AVOIDING";
      return true;
    } else{
      if (this.state === "AVOIDING"){
        merge(this.actions, {down: false });
        this.setNewWayPoints(true);
        this.state = "IDLE";
        return true;
      }
      return false;
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
    if (Math.abs(this.tank.dir-this.targetDir) <= 7){
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
    if (Math.abs(enemyDir - this.tank.dir) <= 7){
      merge(this.actions, {shoot: true });
      this.lastShot = 0;
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
    if (this.lastShot === this.fireInterval){
      let enemyDir = this.calcRotationAmt(...this.opTank().center());
      if (enemyDir < 0) enemyDir = 360 + enemyDir;
      let bullet = new TestBullet({
        xPos: this.tank.xPos,
        yPos: this.tank.yPos,
        dir: enemyDir,
        detectCollision: this.map.detectCollision.bind(this.map),
        tankId: this.tank.id
      });
      let result = bullet.test(this.targetAwareness);
      bullet.destroy();
      if (result !== -1 ){
        this.state = "PREP_TO_FIRE";
        this.handleFire(enemyDir);
        return true;
      }
    } else{
      this.lastShot ++;
    }
  }

}
