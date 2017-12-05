export function rand(lower, upper = null){
  if( upper === null) {
    upper = lower;
    lower = 0;
  }
  return Math.floor(Math.random() * (upper-lower)) + lower;
}
