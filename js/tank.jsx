import React from 'react';
import KeyboardController1 from './keyboard_controller1';
import KeyboardController2 from './keyboard_controller2';

class Tank extends React.Component{
  constructor({id, generateBullet, speed, x_pos, y_pos, dir, ammo,}){
    super();
    this.state = {
                  speed,
                  x_pos,
                  y_pos,
                  dir,
                  ammo,
                  keysDown: {
                    up: false,
                    left: false,
                    right: false,
                    down: false,
                    shoot: false
                    }
                  };

    setInterval(this.move.bind(this), 50);
    if (id === '1'){
      const controller = new KeyboardController1(this.state.keysDown);
    }else{
      const controller = new KeyboardController2(this.state.keysDown);
    }

  }
  css(){
    return {
      left: this.state.x_pos + "px",
      top: this.state.y_pos + "px",
      transform: "rotate("+this.state.dir+"deg)"
    };
  }



  move(){
    const rotationAmount = 18;
    let actions  = this.state.keysDown;
    let speed  = this.state.speed;
    let rad = this.state.dir * Math.PI / 180;
    if (actions.up){
      let newX = this.state.x_pos + Math.sin(rad)*this.state.speed;
      let newY = this.state.y_pos - Math.cos(rad)*this.state.speed;
      if (this.inBounds(newX, newY)){
        this.setState({x_pos: newX });
        this.setState({y_pos: newY });
      }
    }
    if (actions.down){
      let newX = this.state.x_pos - Math.sin(rad)*this.state.speed;
      let newY = this.state.y_pos + Math.cos(rad)*this.state.speed;
      if (this.inBounds(newX, newY)){
        this.setState({x_pos: newX });
        this.setState({y_pos: newY });
      }
    }
    if (actions.left){
      this.setState({dir: this.state.dir - rotationAmount});
    }
    if (actions.right){
      this.setState({dir: this.state.dir + rotationAmount});
    }
    if(actions.shoot && this.state.ammo > 0){
      this.state.ammo --;
      this.props.generateBullet(this.state.x_pos,
                                this.state.y_pos,
                                this.state.dir, this.state.ammo);
    }
  }
  inBounds(x,y){
    return (x > 0 && x < 550 && y > 0 && y < 550);
  }

  render(){
    return (
      <div className={"tank "+this.props.color}
            id={"tank"+this.props.id}
            style= {this.css()}>
      </div>
    );
  }
}

export default Tank;
