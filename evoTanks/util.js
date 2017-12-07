export function rand(lower, upper = null){
  if( upper === null) {
    upper = lower;
    lower = 0;
  }
  return Math.floor(Math.random() * (upper-lower)) + lower;
}

export function distance(ax, ay, bx, by){
  return Math.sqrt((ax - bx) ** 2 + (ay- by) ** 2)
}


export function randPoint(size, resolution){
  return [rand(0,size)*resolution + 10,
    rand(0,size)*resolution +10];
}

export function clamp(val, min, max){
  return Math.min(Math.max(val,min),max)
}

export function wallRect(type, gridX, gridY){
  if (type === "VERT"){
    let left = gridX * resolution + resolution - 6;
    let right = (gridX+1) * resolution;
    let topp = gridY * resolution
    let bottom = (gridY+1) * resolution;
    return [left,right,topp,bottom];
  } else{
    let left = gridX * resolution;
    let right =( gridX+1) * resolution;
    let topp = gridY * resolution + resolution - 6;
    let bottom = (gridY + 1) * resolution;
    return [left,right,topp,bottom];
  }
}

export const resolution = 100;
