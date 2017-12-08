export default class Bullet{
  constructor({xPos, yPos, dir, detectCollision, id, tankId}){
    this.size = 7;
    this.speed = 5;
    this.tankId = tankId;
    this.xPos = xPos - this.size/2;
    this.yPos= yPos - this.size/2;
    this.dir = dir;
    this.life = 500;
    this.detectCollision = detectCollision;
    this.id = id;
    this.ref = $(`#bullet${this.id}`);
    this.render();
  }

  center(){
    return [this.xPos + this.size/2, this.yPos + this.size/2];
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
    let rad = this.dir * Math.PI / 180;
    let newX = this.xPos + Math.sin(rad)*this.speed;
    let newY = this.yPos - Math.cos(rad)*this.speed;

    let collision = this.detectCollision(
      newX,
      newY,
      this.size,
      "BULLET"
    );
    if (collision[0] === "VERT_COLLISION"){
      if (this.dir > 180){
        this.xPos += (collision[1]+1);
      } else{
        this.xPos -=( collision[1]+1);
      }
      this.bounceX();
      this.nextFrame();
    }
    else if (collision[0] === "HORIZ_COLLISION"){
      if (this.dir > 270 && this.dir < 90){
        this.xPos -= collision[1];
      } else{
        this.xPos += collision[1];
      }
      this.bounceY();
      this.nextFrame();

    }
    else if (collision === "DUB_COLlISION"){
      // this.xPos += 8;
      // this.yPos += 8;
      this.bounceY();
      this.bounceX();
      this.nextFrame();

    } else{
      this.xPos = newX;
      this.yPos = newY;
    }
    // this.move();
    this.render();
  }

  bounceX(){
    this.dir = 360 - this.dir;
    if (this.dir < 0){
      this.dir = 360 + this.dir;
    }
  }

  bounceY(){
    this.dir =180 - this.dir;
    if (this.dir < 0){
      this.dir = 360 + this.dir;
    }
  }

  render(){
    this.ref.css(this.css());
  }

  destroy(){
    this.ref.remove();
  }
}
