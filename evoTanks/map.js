import {rand, distance, randPoint, clamp} from "./util";
import $ from 'jquery';
import Tank from './tank';
import Bullet from './bullet';
const TANKCOLORS = ["red", "blue"];

export default class Map{
  constructor(size){
    this.size = size;
    this.resolution = 700/size;
    this.map = $("#map");
    this.tanks = [];
    this.bullets = new Set;
    this.resetMap();
    this.scores = [0,0];
    this.timer = setInterval(this.handleFrame.bind(this), 20);
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
    this.createTank("AI");
    this.createTank("AI");
  }

  createTank(type){
    let id = this.tanks.length;
    this.map.append(
      `<div id='tank${id}' class='tank ${TANKCOLORS[id]}'></div>`
    );
    let startingPt = randPoint(this.size, this.resolution);
    let tank = new Tank({
      id,
      speed: 7,
      xPos: startingPt[0],
      yPos: startingPt[1],
      dir: rand(0,360),
      map: this,
      type,
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
    let bin = rand(0,2);
    if ((h === v && bin) || v < h  ){
      let wall = rand(aX, bX);
      let gap1 = rand(aY, bY*1);
      let gap2 = rand(aY, bY*2);
      for (let i = aY; i <= bY; i++){
        if (i=== gap1 || i === gap2){
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
  updateScores(id){
    this.scores[id]++;
    $("#score"+id).html(this.scores[id]);
  }
  detectCollision(x,y,size, type){
    if(x < 0) return "VERT_COLLISION";
    if(y < 0) return "HORIZ_COLLISION";

    let xGridPos = [
      Math.floor(x/this.resolution),
      Math.floor((x+size)/this.resolution)
    ];
    let yGridPos = [
     Math.floor(y/this.resolution),
     Math.floor((y+size)/this.resolution)
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
    if ((type === "BULLET" ||
      type === "TEST_BULLET") && !collision){
        collision = this.checkTankCollision(x,y,size,type);
      }
    return collision;
  }

  checkWallCollision(gridX, gridY, x, y, size){
    try{
      if (this.vertWalls[gridX][gridY]){
        let wall = this.resolution * (gridX+1);
        if ((x+size) > (wall-6) && x < wall){
          return "VERT_COLLISION";
        }
      }
      if (this.horizWalls[gridX][gridY]){
        let wall = this.resolution * (gridY + 1);
        if ((y+size) > (wall-6) && y < wall){
            return "HORIZ_COLLISION";
          }
      }
    }
    catch(e){
      // maybe delete bullet
    }
  }

  checkTankCollision(x,y,size, type){
    for(let i = 0; i < 2; i++){
      let tank = this.tanks[i];
      let tankPos = tank.center();
      let dist = distance(x,y, tankPos[0], tankPos[1]);
      if (dist < (size + tank.size)/2){
          if (type === "BULLET"){
            this.updateScores((tank.id + 1 )%2);
            console.log("COLLISION", tank.id);
            this.resetMap();
          }
          return "TANK_COLLISION" + tank.id;
        }
    }
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
