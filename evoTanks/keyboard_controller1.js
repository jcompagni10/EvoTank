import $ from 'jquery';

export default class KeyboardController1 {
  constructor(keys){
    this.keys = keys;
    $(window).keydown(this.handleKeyDown.bind(this));
    $(window).keyup(this.handleKeyUp.bind(this));
  }
  //maybe block simultaneous up/down left/right
  handleKeyDown(e){
    let key = e.which;
    switch(key){
      case 87:
      $.extend(this.keys, {up: true, down: false});
        break;
      case 68:
      $.extend(this.keys, {right: true});
        break;
      case 65:
      $.extend(this.keys, {left: true});
        break;
      case 83:
      $.extend(this.keys, {down: true, up: false});
        break;
      case 84:
      $.extend(this.keys, {shoot: true});
        break;
    }
  }

  handleKeyUp(e){
    let key = e.which;
    switch(key){
      case 87:
      $.extend(this.keys, {up: false});
        break;
      case 68:
      $.extend(this.keys, {right: false});
        break;
      case 65:
      $.extend(this.keys, {left: false});
        break;
      case 83:
      $.extend(this.keys, {down: false});
        break;
      case 84:
      $.extend(this.keys, {shoot: false});
        break;
    }
  }
}
