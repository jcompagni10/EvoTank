import {rand, distance, randPoint, clamp, wallRect, resolution} from "./util";
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
    window.addDot = this.addDot;
  }

  resetMap(){
    this.horizWalls = [...Array(this.size).keys()].map(i => Array(this.size));
    this.vertWalls = [...Array(this.size).keys()].map(i => Array(this.size));
    this.horizWalls[-1] = false;
    this.vertWalls[-1] = false;
    this.horizWalls[this.size] = false;
    this.vertWalls[this.size] = false;
    this.grid = {horiz: this.horizWalls, vert: this.vertWalls};
    this.bullets.clear();
    this.tanks = [];
    this.mapGen(0,0,this.size-1, this.size-1);
    this.drawMap();
    for(let i = 0; i < this.size; i++){
      this.vertWalls[this.size-1][i] = true;
      this.horizWalls[i][this.size-1] = true;
    }
    this.createTank("player");
    // this.createTank("AI");
  }

  addDot(x,y){
    let dot = $("<div class='dot'></dot");
    dot.css({left: x + "px", top: y+"px"});
    $("#map").append(dot);
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

  detectCollision(x, y, size, type){
    //center x and y
    if(x < 0) return "VERT_COLLISION";
    if(y < 0) return "HORIZ_COLLISION";
    x = x + size/2;
    y = y + size/2;


    let gridX = Math.floor(x/this.resolution);

    let gridY = Math.floor(y/this.resolution);

    let topLeft = [
      [gridX-1, gridY-1],
      [gridX-1, gridY-1],
      [gridX, gridY-1],
      [gridX-1, gridY]
    ]

    let topRight = [
      [gridX+1, gridY-1],
      [gridX, gridY-1],
      [gridX, gridY-1],
      [gridX, gridY]
    ]

    let bottomRight = [
      [gridX+1, gridY],
      [gridX, gridY+1],
      [gridX, gridY],
      [gridX, gridY]
    ]

    let bottomLeft = [
      [gridX-1, gridY],
      [gridX-1, gridY+1],
      [gridX, gridY],
      [gridX-1, gridY]
    ]

    let quadStr = (resolution/2 > y%resolution) ? 'top' : 'bottom';
    quadStr += (resolution/2 > x%resolution) ? 'Left' : 'Right';
    let quad = eval(quadStr)

    let collision;

    for (let i = 0; i < 4 && !collision; i++){
      let [gridX, gridY] = quad[i];
      let walls, wallType;
      if (i % 2 == 0) {
        walls = this.horizWalls;
        wallType = "HORIZ";
      } else{
        walls = this.vertWalls;
        wallType = "VERT";
      }
      let collisionType = (i === 1 || i == 2) ? "HORIZ_COLLISION" : "VERT_COLLISION";

      if (walls[gridX][gridY]){
        let rect = wallRect(wallType, gridX, gridY);
        collision = this.checkRectCollision(x,y, size, rect) ? collisionType : null;
        debugger
      }
    }


    if ((type === "BULLET" ||
      type === "TEST_BULLET") && !collision){
        collision = this.checkTankCollision(x,y,size,type);
      }
    return collision;
  }

  checkRectCollision(x,y,size, rect){
    let [left, right, top, bottom] = rect;
    let closestX = clamp(x, left, right);
    let closestY = clamp(y, top, bottom);
    let distX = x - closestX;
    let distY = y - closestY;
    let distSq = distX ** 2 + distY ** 2;
    return (distSq < (size/2) ** 2);
  }


  checkTankCollision(x,y,size, type){
    for(let i = 0; i < this.tanks.length; i++){
      let tank = this.tanks[i];
      let tankPos = tank.center();
      let dist = distance(x, y, tankPos[0], tankPos[1]);
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
