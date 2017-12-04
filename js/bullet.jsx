import React from 'react';

class Bullet extends React.Component{
  constructor({x_pos, y_pos, dir, tank_ammo, life}){
    super();
    this.tank_ammo = tank_ammo;
    this.radius = 10;
    this.state = { speed: 15, x_pos, y_pos, dir, life, class: ''};
    this.interval = window.setInterval(this.move.bind(this), 50);

  }

  css(){
    return {
      left: this.state.x_pos + "px",
      top: this.state.y_pos + "px",
    };
  }


  move(){
    this.state.life -= 50;
    if (this.state.life <= 0 ){
      window.clearInterval(this.interval);
      this.setState({class: "hidden"})
    }
    let rad = this.state.dir * Math.PI / 180;
    let newX = this.state.x_pos + Math.sin(rad)*this.state.speed;
    let newY = this.state.y_pos - Math.cos(rad)*this.state.speed;
    if (newX < 0 || newX > 600 - this.radius ){
      this.bounceX();
    }
    if (newY < 0 || newY > 600 - this.radius ){
      this.bounceY();
    }
    this.setState({x_pos: newX });
    this.setState({y_pos: newY });
  }
  bounceX(){
    this.setState({dir: 360 - this.state.dir});
  }

  bounceY(){
    this.setState({dir: 180 - this.state.dir});
  }

  destroy(){

  }

  render(){
    return(
      <div className={"bullet " + this.state.class} data-life ={this.state.life} style = {this.css()}></div>
    );
  }
}

export default Bullet;
