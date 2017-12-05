import KeyboardController1 from './keyboard_controller1';
import KeyboardController2 from './keyboard_controller2';
import $ from 'jquery';

export default class Tank {
  constructor({id, speed, xPos, yPos, dir, detectCollision}){
    this.xPos = xPos;
    this.yPos = yPos;
    this.dir = dir;
    this.speed = speed;
    this.id = id;
    this.detectCollision = detectCollision;
    this.keysDown = [];
    this.size = 80;
    this.rotationAmount = 18;
    this.ref = $(`#tank${this.id}`);

    setInterval(this.move.bind(this), 50);
    if (id === '1'){
      const controller = new KeyboardController1(this.keysDown);
    }else{
      const controller = new KeyboardController2(this.keysDown);
    }
    this.placeTank();
  }

  placeTank(){
    const map = $("#map");
    map.append("<div id='tank1' class='tank red'></div>");
  }

  css(){
    return {
      left: this.xPos + "px",
      top: this.yPos + "px",
      transform: "rotate("+this.dir+"deg)"
    };
  }



  move(){
    let actions  = this.keysDown;
    let speed  = this.speed;
    let rad = this.dir * Math.PI / 180;
    // TODO: dry these up
    if (actions.up){
      let newX = this.xPos + Math.sin(rad)*this.speed;
      let newY = this.yPos - Math.cos(rad)*this.speed;
      this.updatePos(newX, newY);
    }
    if (actions.down){
      let newX = this.xPos - Math.sin(rad)*this.speed;
      let newY = this.yPos + Math.cos(rad)*this.speed;
      this.updatePos(newX, newY);
    }
    if (actions.left){
      this.dir = (this.dir - this.rotationAmount);
    }
    if (actions.right){
      this.dir = (this.dir + this.rotationAmount);
    }
    if(actions.shoot && this.ammo > 0){
      this.ammo --;
      this.props.generateBullet(this.xPos,
                                this.yPos,
                                this.dir, this.ammo);
    }
    this.render();
  }

  updatePos(newX, newY){
    let collision = this.detectCollision(newX, newY, this.size);
    if (collision){
      return false;
    }
    else{
      this.xPos = newX;
      this.yPos = newY;
    }
  }

  render(){
    this.ref.css(this.css());
  }
}
