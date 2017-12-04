import React from 'react';
import Tank from './tank';
import Bullet from './bullet';
import ReactDOM from 'react-dom';


class Tanks extends React.Component{
  constructor(){
      super();
      let tankState = {speed: 10,
      x_pos: 400,
      y_pos: 400,
      dir: 90,
      ammo: 6};
      let tanks = [<Tank key = '1' id = "1" color="red" {...tankState} generateBullet = {this.generateBullet.bind(this)}/>,
    <Tank key = '2' id = "2" color="blue" {...tankState} generateBullet = {this.generateBullet.bind(this)}/>];
      this.state = {bullets: [], tanks: tanks, tankState};
      // this.interval = setInterval(this.renderAll.bind(this), 50);
  }


  renderAll(){
    let newBullets = [];
    this.state.bullets.forEach((bullet)=>{
      if (bullet.s.life > 0 ){
        newBullets.push(bullet);
      }
      this.setState({bullets: newBullets});
    });


  }
  generateBullet(x_pos, y_pos, dir){
    let props = {x_pos, y_pos, dir, life: 7000};
    this.state.bullets.push(<Bullet  {...props}  key={Math.floor(Math.random()*1000000000).toString() }/>);
    this.forceUpdate();
  }
  render(){

    return (
      <div id="map">
        {this.state.bullets.map((bullet)=> bullet)}
        {this.state.tanks}
      </div>
    );
  }
}
export default Tanks;
