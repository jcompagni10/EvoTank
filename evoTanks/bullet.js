import React from 'react';

class Bullet extends React.Component{
  constructor({xPos, yPos, dir, detectCollision, id}){
    this.radius = 10;
    this.speed = 15;
    this.xPos = xPos;
    this.yPos= yPos;
    this.dir = dir;
    this.interval = window.setInterval(this.move.bind(this), 50);
    this.detectCollision = detectCollision;
    this.id = id;
    this.ref = $(`#bullet${this.id}`);
  }



  css(){
    return {
      left: this.xPos + "px",
      top: this.yPos + "px",
    };
  }


  move(){
    // this.life -= 50;
    // if (this.life <= 0 ){
    //   window.clearInterval(this.interval);
    //   this.setState({class: "hidden"})
    // }
    let rad = this.dir * Math.PI / 180;
    let newX = this.xPos + Math.sin(rad)*this.speed;
    let newY = this.yPos - Math.cos(rad)*this.speed;
    let collision = this.detectCollision;
    if (collision === "VERT_COLLISION"){
      this.bounceX();
    }
    if (collision === "HORIZ_COLLISION"){
      this.bounceY();
    }
    this.setState({xPos: newX });
    this.setState({yPos: newY });
  }

  bounceX(){
    this.setState({dir: 360 - this.dir});
  }

  bounceY(){
    this.setState({dir: 180 - this.dir});
  }

  destroy(){

  }

  render(){
    this.ref.css(this.css());
  }
}

export default Bullet;
