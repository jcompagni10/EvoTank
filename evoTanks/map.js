import {rand, distance, randPoint, clamp, wallRect, resolution} from "./util";
import $ from 'jquery';
import Tank from './tank';
import Bullet from './bullet';
import KeyboardController1 from './keyboard_controller1';
import KeyboardController2 from './keyboard_controller2';
import AIBuilder from './ai_builder';

const TANKCOLORS = ["red", "blue"];


export default class Map{
  constructor(size){
    this.size = size;
    this.resolution = 560/size;
    this.map = $("#map");
    this.tanks = [];
    this.bullets = new Set;
    this.AIBuilder = new AIBuilder(this);
    this.resetMap();
    this.scores = [0,0];
    window.addDot = this.addDot;
    this.bulletId = 0;
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
    this.createTank("Player", true);
    this.createTank("AI", true);
    clearInterval(this.timer);
    this.timer = setInterval(this.handleFrame.bind(this), 20);

  }

  addDot(x,y){
    let dot = $("<div class='dot'></dot");
    dot.css({left: x + "px", top: y+"px"});
    $("#map").append(dot);
  }

  createTank(type, dodge){
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
      generateBullet: this.generateBullet.bind(this),
    });
    let controller;
    if (type === "AI"){
      controller = this.AIBuilder.randAI(tank);
      window.controller = controller;
      tank.controller = controller;
    }else{
      // controller = new AIController(tank, this, true);
      // window.controller = this.controller;
      // tank.controller = controller;

      controller = new KeyboardController2(tank.actions);
    }
    this.tanks.push(tank);
  }


  generateBullet(xPos, yPos, dir, tankId){
    let id = this.bulletId;
    this.bulletId ++;
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
    let result = (id === 1) ? "WIN" : "LOSS";
    this.AIBuilder.alertResult(result);
    this.scores[id]++;
    $("#score"+id).html(this.scores[id]);
  }

  detectCollision(x, y, size, type){
    //center x and y
    // if (type === "AI") return;
    if(x < 0) return ["VERT_COLLISION", -x];
    if(y < 0) return ["HORIZ_COLLISION", -y];
    x = x + size/2;
    y = y + size/2;

    let gridX = Math.floor(x/this.resolution);

    let gridY = Math.floor(y/this.resolution);

    let topLeft = [
      [gridX, gridY-1],
      [gridX-1, gridY],
      [gridX-1, gridY-1],
      [gridX-1, gridY-1],
    ];

    let topRight = [
      [gridX, gridY-1],
      [gridX, gridY],
      [gridX+1, gridY-1],
      [gridX, gridY-1],
    ];

    let bottomRight = [
      [gridX, gridY],
      [gridX, gridY],
      [gridX+1, gridY],
      [gridX, gridY+1],
    ];

    let bottomLeft = [
      [gridX, gridY],
      [gridX-1, gridY],
      [gridX-1, gridY],
      [gridX-1, gridY+1],
    ];

    let quadStr = (resolution/2 > y%resolution) ? 'top' : 'bottom';
    quadStr += (resolution/2 > x%resolution) ? 'Left' : 'Right';
    let quad = eval(quadStr);

    let collision;

    for (let i = 0; i < 4; i++){
      let [curX, curY] = quad[i];
      let walls, wallType;
      if (i % 2 === 0) {
        walls = this.horizWalls;
        wallType = "HORIZ";
      } else{
        walls = this.vertWalls;
        wallType = "VERT";
      }
      let collisionType = (i === 0 || i === 3) ? "HORIZ_COLLISION" : "VERT_COLLISION";
      try{
        if (walls[curX][curY]){
          let rect = wallRect(wallType, curX, curY);
          let collisionResult = this.checkRectCollision(x,y, size, rect);
          if (collision && (collisionResult || collisionResult === 0 )){
            if (collision[0] === collisionType ){
              console.log("DUB COLLISION");
              return "DUB_COLlISION";
            }
          }
          collision = (collisionResult || collisionResult === 0 ) ? [collisionType, collisionResult] : collision;
        }
      }
      catch(e){
        console.log(e);
      }
    }


    if ((type === "BULLET" ||
      type === "TEST_BULLET") && !collision){
        collision = this.checkTankCollision(x,y,size,type);
      }
    return collision || false;
  }

  checkRectCollision(x,y,size, rect){
    let [left, right, top, bottom] = rect;
    let closestX = clamp(x, left, right);
    let closestY = clamp(y, top, bottom);
    let distX = x - closestX;
    let distY = y - closestY;
    // let distSq = distX ** 2 + distY ** 2;
    let dist = distance(x, y, closestX, closestY);
    return (dist < size/2) ? dist : false;
  }


  checkTankCollision(x,y,size, type){
    for(let i = 0; i < this.tanks.length; i++){
      let tank = this.tanks[i];
      let tankPos = tank.center();
      let dist = distance(x, y, tankPos[0], tankPos[1]);
      if (dist < (size + tank.size)/2){
          if (type === "BULLET"){
            this.updateScores((tank.id + 1 )%2);
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
