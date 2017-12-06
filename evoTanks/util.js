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
