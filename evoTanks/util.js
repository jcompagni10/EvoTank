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
