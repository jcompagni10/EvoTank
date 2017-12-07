export default class Bullet{
  constructor({xPos, yPos, dir, detectCollision, id, tankId}){
    this.size = 7;
    this.speed = 6;
    this.tankId = tankId;
    this.xPos = xPos;
    this.yPos= yPos;
    this.dir = dir;
    this.life = 500;
    this.detectCollision = detectCollision;
    this.id = id;
    this.ref = $(`#bullet${this.id}`);
    this.render();
  }



  css(){
    return {
      left: this.xPos + "px",
      top: this.yPos + "px",
    };
  }

  move(){
    let rad = this.dir * Math.PI / 180;
    let newX = this.xPos + Math.sin(rad)*this.speed;
    let newY = this.yPos - Math.cos(rad)*this.speed;
    this.xPos = newX;
    this.yPos = newY;
  }

  nextFrame(){
    this.life --;
    let collision = this.detectCollision(
      this.xPos,
      this.yPos,
      this.size,
      "BULLET"
    );

    if (collision === "VERT_COLLISION"){
      this.bounceX();
    }
    if (collision === "HORIZ_COLLISION"){
      this.bounceY();
    }
    this.move();
    this.render();
  }

  bounceX(){
    this.dir = 360 - this.dir;
  }

  bounceY(){
    this.dir =180 - this.dir;
  }

  render(){
    this.ref.css(this.css());
  }

  destroy(){
    this.ref.remove();
  }
}
