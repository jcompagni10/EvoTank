class KeyboardController2 {
  constructor(keys){
    this.keys = keys;
    $(window).keydown(this.handleKeyDown.bind(this));
    $(window).keyup(this.handleKeyUp.bind(this));
  }
  //maybe block simultaneous up/down left/right
  handleKeyDown(e){
    console.log(e.which);
    let key = e.which;
    switch(key){
      case 38:
        $.extend(this.keys, {up: true});
        break;
      case 39:
      $.extend(this.keys, {right: true});
        break;
      case 37:
      $.extend(this.keys, {left: true});
        break;
      case 40:
      $.extend(this.keys, {down: true});
        break;
      case 32:
      $.extend(this.keys, {shoot: true});
        break;
    }
  }

  handleKeyUp(e){
    let key = e.which;
    switch(key){
      case 38:
        $.extend(this.keys, {up: false});
        break;
      case 39:
      $.extend(this.keys, {right: false});
        break;
      case 37:
      $.extend(this.keys, {left: false});
        break;
      case 40:
      $.extend(this.keys, {down: false});
        break;
      case 32:
      $.extend(this.keys, {shoot: false});
        break;
    }
  }
}
export default KeyboardController2;
