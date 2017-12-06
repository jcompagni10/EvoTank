export default class PathNode{
  constructor(parent, position){
     this.children = [];
     this.parent = parent;
     this.position = position;
  }

  addChild(child){
    this.children.push(child);
  }
}
