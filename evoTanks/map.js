import {rand, distance} from "./util";
import $ from 'jquery';
import Tank from './tank';
import Bullet from './bullet';

const TANKCOLORS = ["red", "blue"];

export default class Map{
  constructor(size){
    this.size = size;
    this.resolution = 140;
    this.map = $("#map");
    this.tanks = [];
    this.bullets = new Set;
    this.resetMap();
    this.scores = [];
    this.timer = setInterval(this.handleFrame.bind(this), 20);
    this.map.append("<div class='dot'></dot");
  }

  resetMap(){
    this.horizWalls = [...Array(this.size).keys()].map(i => Array(this.size));
    this.vertWalls = [...Array(this.size).keys()].map(i => Array(this.size));
    this.grid = {horiz: this.horizWalls, vert: this.vertWalls};
    this.bullets.clear();
    this.tanks = [];
    this.mapGen(0,0,this.size-1, this.size-1);
    this.drawMap();
    for(let i = 0; i < this.size; i++){
      this.vertWalls[this.size-1][i] = true;
      this.horizWalls[i][this.size-1] = true;
    }
    this.createTank();
    this.createTank();
  }

  createTank(){
    let id = this.tanks.length;
    this.map.append(
      `<div id='tank${id}' class='tank ${TANKCOLORS[id]}'></div>`
    );
    let tank = new Tank({
      id,
      speed: 7,
      xPos:20,
      yPos: 20,
      dir: 0,
      map: this,
      detectCollision: this.detectCollision.bind(this),
      generateBullet: this.generateBullet.bind(this)
    });
    this.tanks.push(tank);
  }

  generateBullet(xPos, yPos, dir, tankId){
    let id = this.bullets.size;
    this.map.append(`<div id='bullet${id}' class='bullet'></div>`);
    let bullet = new Bullet({
      xPos,
      yPos,
      dir,
      detectCollision: this.detectCollision.bind(this),
      id,
      tankId
    });
    this.bullets.add(bullet);
  }

  handleFrame(){
    this.bullets.forEach(bullet=>{
      if (bullet.life<= 0 ){
        let tank = this.tanks[bullet.tankId];
        tank.ammo ++;
        bullet.destroy();
        this.bullets.delete(bullet);
      } else{
        bullet.nextFrame();
      }
    });
    this.tanks.forEach(tank=> tank.nextFrame());
  }
  // maybe makes too many recursive calls?
  mapGen(aX, aY, bX, bY){
    const h = bX  - aX;
    const v = bY - aY;
    if (h < 1 & v < 1){
      return;
    }
    //make vertical wall
    if (h >= v){
      let wall = rand(aX, bX);
      let gap = rand(aY, bY);
      for (let i = aY; i <= bY; i++){
        if (i=== gap){
          continue;
        }
        this.vertWalls[wall][i] = true;
      }
      this.mapGen(aX, aY, wall, bY);
      this.mapGen(wall+1, aY , bX, bY);
    // make horizantal wall
    } else {
      let wall = rand(aY, bY);
      let gap = rand(aX, bX);

      for (let i = aX; i <= bX; i++){
        if (i=== gap){
          continue;
        }
        this.horizWalls[i][wall] = true;
      }
      this.mapGen(aX, aY, bX, wall);
      this.mapGen(aX, wall+1, bX, bY);
    }
  }


  detectCollision(x,y,size, isBullet){
    if(x < 0) return "VERT_COLLISION";
    if(y < 0) return "HORIZ_COLLISION";

    let xGridPos = [
      Math.floor(x/this.resolution),
      Math.floor((x+size/2)/this.resolution)
    ];
    let yGridPos = [
     Math.floor(y/this.resolution),
     Math.floor((y+size/2)/this.resolution)
    ];
    let collision;
    for(let i = 0; i < 2 && !collision; i++ ){
      for(let j = 0; j < 2 && !collision; j++ ){
        collision = this.checkWallCollision(
          xGridPos[i],
          yGridPos[j],
          x,
          y,
          size
        );
      }
    }
    if (isBullet) this.checkTankCollision(x,y,size);
    return collision;
  }

  checkWallCollision(gridX, gridY, x, y, size){
    try{
      if (this.vertWalls[gridX][gridY]){
        let wall = this.resolution * (gridX+1);
        console.log(wall-x)
        if ((wall-x) < size/2 && (x-wall) < size/2){
          return "VERT_COLLISION";
        }
      }
      // if (this.horizWalls[gridX][gridY]){
      //   let wall = this.resolution * (gridY + 1);
      //   if ((y+size) > (wall-2) && y < wall){
      //       return "HORIZ_COLLISION";
      //     }
      // }
    }
    catch(e){
      // maybe delete bullet
    }
  }

  checkTankCollision(x,y,size){
    this.tanks.forEach(tank=>{
      if (tank.xPos < (x+size) && (tank.xPos + tank.size) > x
        && tank.yPos < (y+size) && (tank.yPos + tank.size) > y ){
          this.scores[tank.id]++;
          console.log("COLLISION", tank.id);
          debugger
          this.resetMap();
        }
    });
  }

  drawMap(){
    this.map.empty();
    for (var y = 0; y < this.size; y++) {
      for (var x = 0; x < this.size; x++) {
        let cellClass= "cell";
        if (this.horizWalls[x][y]){
          cellClass = cellClass.concat(" horiz");
        }
        if (this.vertWalls[x][y]){
          cellClass = cellClass.concat(" vert");
        }
        this.map.append(`<div class='${cellClass}' />`);
      }
    }
  }
}
