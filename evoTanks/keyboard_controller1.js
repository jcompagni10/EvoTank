import merge from 'lodash/merge';

export default class KeyboardController1 {
  constructor(actions){
    this.actions = actions;
    $(window).keydown(this.handleKeyDown.bind(this));
    $(window).keyup(this.handleKeyUp.bind(this));
  }
  //maybe block simultaneous up/down left/right
  handleKeyDown(e){
    let key = e.which;
    switch(key){
      case 87:
      merge(this.actions, {up: true, down: false});
        break;
      case 68:
      merge(this.actions, {right: true});
        break;
      case 65:
      merge(this.actions, {left: true});
        break;
      case 83:
      merge(this.actions, {down: true, up: false});
        break;
      case 84:
      merge(this.actions, {shoot: true});
        break;
    }
  }

  handleKeyUp(e){
    let key = e.which;
    switch(key){
      case 87:
      merge(this.actions, {up: false});
        break;
      case 68:
      merge(this.actions, {right: false});
        break;
      case 65:
      merge(this.actions, {left: false});
        break;
      case 83:
      merge(this.actions, {down: false});
        break;
      case 84:
      merge(this.actions, {shoot: false});
        break;
    }
  }
}
