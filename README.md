# EvoTank

[Live Link](https://jcompagni10.github.io/EvoTank/)
## Overview

evoTanks is a cross between a 2d tank shooter game and a genetics simulation. At its core it allows a human player to face off against a constantly improving AI. At its core it supports a 2d map with tanks that can navigate the map and shoot bullets at one another.

## Features

 + Tank movement and bullet physics in 2d map
 + collision detection
 + support for human keyboard input
 + Random Map Generation (recusive division algorithm) 
 + Basic tank AI / Genetics
   + Path finding
   + Enemy Targeting
   + Agressiveness 
   + Defensiveness (bullet path prediction)
 + Tank genetic "mating"
 
 ![screenshot](https://raw.githubusercontent.com/jcompagni10/EvoTank/master/assets/img/game.png)
 
  ### AI
  At its base the Tanki's AI is built with path-finding(breadth first search), targeting, and bullet avoidance logic. On top of this, the AI also has a number of adjustable traits wich modulate its agressiveness, sensitivity to incoming bullets, and targeting range. For the first 10 rounds the game generates AI with randomly selected traits. After a base population has been established winning AI are allowed to pass on their genes sucessssive generations through a genetic inheritance algorithm. Overtime the AI i able to effectively adapt its behvaviour to a given style of play.
  
  ### The Map
  To insure an enjoyable user experience and to prevent the AI from stagnating at a local optimum, a new map is randomly generated for each round. Maps are randomly generated using a recusrive division algorithm.
  
## Technologies and Architecture
 + Game Logic & physics written in vanilla JS
 + DOM manipulation with jquery  
 + Webpack to handle bundling 
 
 `map.js` Handles all game logic, frame by frame movement and collision detection
 `tank.js` handles all tank physics and movement
 `bullet.js` handle bullet movement
 `tankAIController.js` handles actual control of the tank based on given genetic traits
 `tankUserController.js` class to allow user control of tank
 `AIBuilder.js` handles evolution logic for tanks
 
## Possible Future Features

 + More intelligent bullet avoidance for AI
 + More versatile targeting algorithm for AI 
 + Graph AI performance over time
 
 
 

 
 
