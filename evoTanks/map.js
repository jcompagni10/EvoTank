import {rand} from "./util";
import $ from 'jquery';
import Tank from './tank';
import Bullet from './bullet';

export default class Map{
  constructor(size){
    this.size = size;
    this.horizWalls = [...Array(this.size).keys()].map(i => Array(this.size));
    this.vertWalls = [...Array(this.size).keys()].map(i => Array(this.size));
    this.size = size;
    this.resolution = 140;
    this.tanks = [];
    this.setupMap();
    this.createTank();
    this.bullets = [];
    this.map = $("#map");
    debugger
  }

  setupMap(){
    this.mapGen(0,0,this.size-1, this.size-1);
    this.drawMap();
    for(let i = 0; i < this.size; i++){
      this.vertWalls[this.size-1][i] = true;
      this.horizWalls[i][this.size-1] = true;
    }
    this.placeTank();
  }

  placeTank(id){
    this.map.append(`<div id='bullet${id}' class='tank red'></div>`);
  }

  createTank(){
    let tank = new Tank({
      id: 1,
      speed: 10,
      xPos:20,
      yPos: 20,
      dir: 90,
      detectCollision: this.detectCollision.bind(this)

    });
    this.tanks.push(tank);
  }

  createBullet(x, y, dir){
    let id = this.bullets.length;
    let bullet = new Bullet(x,
      y,
      dir,
      this.detectCollision.bind(this),
      id
    );
    this.map.append(`<div id='bullet${id}' class='tank red'></div>`);
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


  detectCollision(x,y,size){
    if(x < 0) return "HORIZ_COLLISION";
    if(y < 0) return "VERT_COLLISION";

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
        collision = this.checkCollision(
          xGridPos[i],
          yGridPos[j],
          x,
          y,
          size
        );
      }
    }
    return collision;
  }

  checkCollision(gridX, gridY, x, y, size){
    if (this.vertWalls[gridX][gridY]){
      let wall = this.resolution * (gridX+1);
      if (x < wall && (x+size) > wall){
        return "VERT_COLLISION";
      }
    }
    if (this.horizWalls[gridX][gridY]){
      let wall = this.resolution * (gridY + 1);
      if (y < wall && (y+size) > wall){
          return "HORIZ_COLLISION";
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
