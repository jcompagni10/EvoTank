import AIController from './ai_controller';
import {rand} from './util';

export default class AIBuilder {
  constructor(map){
    this.aiStore = [];
    this.winners = [[]];
    this.curGeneration = 0;
    this.map = map;
    this.count = 0;
    this.state= "random seeding";
    this.genSize= 2;
  }

  randTraits(){
    let traits = {};
    traits["fireInterval"] = rand(5, 20);
    traits["bulletAwareness"] = rand(10, 200);
    traits["targetAwareness"] = rand(10, 200);
    return traits;
  }
  alertResult(result){
    this.aiStore[this.count][1] = result;
    if (result === "WIN"){
      this.winners[this.curGeneration].push(this.aiStore[this.count]);
    }
    this.count ++;
  }
  randAI(tank){
    let traits = this.randTraits();
    this.aiStore.push([traits]);
    return new AIController(tank, this.map, traits);
  }

  nextGeneration(){
    this.curGeneration ++;
    console.log("ON TO GEN: " + this.curGeneration);
    this.winners[this.curGeneration] = [];
    if (this.state === "random seeding"){
      this.state = "generation " + this.curGeneration;
    }
  }

  newAI(tank){
    if (this.state === "random seeding"){
      if (this.winners[0].length <= this.genSize){
        return this.randAI(tank);
      } else{
        this.nextGeneration();
      }
    }
    if (this.winners[this.curGeneration].length > this.genSize){
      this.nextGeneration();
    }
    let rand1 = rand(this.genSize-1);
    let rand2 = rand(this.genSize-1);
    let trait1 = this.winners[this.curGeneration-1][rand1][0];
    let trait2 = this.winners[this.curGeneration-1][rand2][0];
    return this.breed(trait1, trait2, tank);
  }

  breed(traits1, traits2, tank){
    let fireIntervalRange = [traits1["fireInterval"], traits2["fireInterval"]];
    let bulletAwarenessRange = [traits1["bulletAwareness"], traits2["bulletAwareness"]];
    let targetAwarenessRange = [traits1["targetAwareness"], traits2["targetAwareness"]];
    let traitRange = [fireIntervalRange, bulletAwarenessRange, targetAwarenessRange].map(traits=>(
      traits.sort((a,b)=> (a - b))
    ));

    let newTraits = {
      fireInterval: rand(...traitRange[0]),
      bulletAwareness: rand(...traitRange[1]),
      targetAwareness: rand(...traitRange[2]),
    };
    this.aiStore.push([newTraits]);
    return new AIController(tank, this.map, newTraits);
  }
}
