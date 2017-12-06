import PathNode from './path_node';
import isEqual from 'lodash/isEqual';

export default class PathFinder{
  constructor(grid){
    this.grid = grid;
    this.visitedCells = [];
  }

  unvisited(pos){
    return this.visitedCells.find((el)=> isEqual(el, pos)) === undefined;
  }

  newMoves(gridX, gridY){
    let moves = [];
    //top
    if (gridY > 0 && !this.grid.horiz[gridX][gridY-1]
      && this.unvisited([gridX, gridY-1])){
      moves.push([gridX, gridY-1,]);
    }
    //left
    if (gridX > 0 && !this.grid.vert[gridX-1][gridY]
        && this.unvisited([gridX - 1, gridY])){
      moves.push([gridX - 1, gridY]);
    }
    //bottom
    if (gridY < this.grid.vert.length-1 && !this.grid.horiz[gridX][gridY]
        && this.unvisited([gridX, gridY+1])){
      moves.push([gridX, gridY+1]);
    }
    //right
    if (gridX < this.grid.horiz.length-1 && !this.grid.vert[gridX][gridY]
      && this.unvisited([gridX+1, gridY])){
      moves.push([gridX+1, gridY]);
    }
    this.visitedCells = this.visitedCells.concat(moves);
    return moves;
  }

  getWaypoints(start,target){
    let endNode = this.findPath(start,target);
    let waypoints = [];
    let parent = endNode.parent;
    while (parent !== null){
      waypoints.unshift(parent.position);
      parent = parent.parent;
    }
    waypoints.push(target);
    return waypoints;
  }

  findPath(start, target){
    this.visitedCells.push(start);
    const root = new PathNode(null, start);
    let queue = [root];
    while (queue.length > 0){
      let curNode = queue.shift();
      let newMoves = this.newMoves(curNode.position[0], curNode.position[1]);
      for (let i = 0; i < newMoves.length; i++ ){
        let move = newMoves[i];
        console.log(move);
        let newNode = new PathNode(curNode, move);
        queue.push(newNode);
        if (move[0] === target[0] && move[1] === target[1]){
          return newNode;
        }
      }
    }
    return null;
  }
}
