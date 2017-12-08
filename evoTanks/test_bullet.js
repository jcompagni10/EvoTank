import Bullet from "./bullet";

export default class TestBullet extends Bullet{
  constructor(params){
    super(params);
    this.hit = false;
    this.speed = 7;
    this.size = 20;
  }

  render(){
    // let dot = $("<div class='dot'></dot");
    // dot.css({top: this.yPos+"px", left: this.xPos + "px"});
    // $("#map").append(dot);
  }

  test(length){
    for (let i = 0; i < length; i++){
    this.nextFrame();
      if (this.hit){
        return i;
      }
    }
    return -1;
  }
  nextFrame(){
    this.life --;
    let collision = this.detectCollision(
      this.xPos,
      this.yPos,
      this.size,
      "TEST_BULLET"
    );
    if (collision[0] === "VERT_COLLISION"){
      this.bounceX();
    }
    if (collision[0] === "HORIZ_COLLISION"){
      this.bounceY();
    }
    if (collision === "TANK_COLLISION" + (this.tankId+1)%2){
      this.hit = true;
    }
    this.move();
    this.render();
  }
}
