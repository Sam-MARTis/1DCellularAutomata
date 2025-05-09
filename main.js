"use strict";
const canvas = document.getElementById("projectCanvas");
canvas.width = window.innerWidth * devicePixelRatio;
canvas.height = window.innerHeight * devicePixelRatio;
const ctx = canvas.getContext("2d");
if (!ctx) {
    throw Error("Context unable to be found");
}
// const MAXVAL = 20;
const radius = 1;
const rule = 18; //for r = 1, rule 90 and 150 are non-trivial
const ruleArray = ("0".repeat(2 ** (2 * radius + 1) - rule.toString(2).length) + rule.toString(2))
    .split("")
    .reverse()
    .map((a) => Boolean(a == "1"));
if (ruleArray.length != 2 ** (2 * radius + 1)) {
    throw Error("Rule array not properly formed");
}
console.log(ruleArray);
// console.log("34333" + "0".repeat(0))
const cellCount = 200;
const VPOS = 0.95;
const POS = 0.8; // Percentage of screen :)
let scaleSize = canvas.width * POS / (cellCount);
let MAXVAL = canvas.height * VPOS / scaleSize;
class Automata {
    constructor(width) {
        this.initializeCells = (startingSequence = undefined) => {
            if (startingSequence == undefined) {
                for (let i = 0; i < this.w; i++) {
                    // this.cellArray[i] = Number(Math.random() > 0.5);
                    this.cellArray[i] = 0;
                }
                console.log("Initializing default");
                this.cellArray[Math.round(this.w / 2) + 1] = 1;
            }
            else {
                startingSequence =
                    startingSequence + "0".repeat(this.w - startingSequence.length);
                for (let i = 0; i < this.w; i++) {
                    this.cellArray[i] = Number(startingSequence[i] == "1");
                }
            }
            this.oldStates.push(this.cellArray.slice());
            if (this.oldStates.length > MAXVAL) {
                this.oldStates.shift(); // Removes the oldest (first) element
            }
        };
        this.step = () => {
            for (let i = 0; i < radius; i++) {
                let cellvalue = 0;
                for (let j = -radius; j <= radius; j++) {
                    if (i + j >= 0) {
                        cellvalue += this.cellArray[i + j] * 2 ** (radius - j);
                    }
                    else {
                        cellvalue += this.bcl[radius + (i + j)] * 2 ** (radius - j);
                        if (Number.isNaN(cellvalue)) {
                            console.log("Getting nan cellvalue at i+j = ", i + j);
                        }
                    }
                }
                this.cellArrayBuffer[i] = Number(ruleArray[cellvalue]);
                //   console.log("getting value: ", ruleArray[cellvalue], "cellvalue: ", cellvalue)
            }
            for (let i = radius; i < this.w - radius; i++) {
                let cellvalue = 0;
                for (let j = -radius; j <= radius; j++) {
                    cellvalue += this.cellArray[i + j] * 2 ** (radius - j);
                }
                this.cellArrayBuffer[i] = Number(ruleArray[cellvalue]);
            }
            for (let i = this.w - radius; i < this.w; i++) {
                let cellvalue = 0;
                const width = this.w;
                for (let j = -radius; j <= radius; j++) {
                    if (i + j < width) {
                        cellvalue += this.cellArray[i + j] * 2 ** (radius - j);
                    }
                    else {
                        cellvalue += this.bcr[(i + j) - width] * 2 ** (radius - j);
                    }
                }
                this.cellArrayBuffer[i] = Number(ruleArray[cellvalue]);
            }
            if (this.oldStates.length > MAXVAL) {
                this.oldStates.shift(); // Removes the oldest (first) element
            }
        };
        this.syncBuffer = () => {
            for (let i = 0; i < this.w; i++) {
                this.cellArray[i] = this.cellArrayBuffer[i];
            }
            this.oldStates.push(this.cellArray.slice());
        };
        this.drawSelf = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const startPosX = canvas.width * (1 - POS) / 2;
            const startPosY = (1 - VPOS) * 0.5 * canvas.height;
            for (let j = 0; j < this.oldStates.length; j++) {
                ctx.save();
                // console.log(this.oldStates.length)
                ctx.translate(0, scaleSize * (MAXVAL - j));
                // ctx.beginPath()
                for (let i = 0; i < this.w; i++) {
                    // this.ctx.strokeStyle= this.cellArray[i]==1 ? "white" : "black";
                    this.ctx.fillStyle = this.oldStates[j][i] == 1 ? "white" : "black";
                    this.ctx.fillRect(startPosX + i * scaleSize, startPosY, scaleSize, scaleSize);
                }
                ctx.restore();
            }
        };
        this.w = width;
        this.cellArray = new Int32Array(width).fill(1);
        this.cellArrayBuffer = this.cellArray.slice();
        this.bcl = new Int32Array(radius).fill(0);
        this.bcr = new Int32Array(radius).fill(0);
        this.oldStates = [];
        this.ctx = ctx;
    }
}
const auto1 = new Automata(cellCount);
auto1.initializeCells();
// // console.log(auto1.cellArray)
// auto1.drawSelf(0)
// auto1.step();
// auto1.drawSelf(1)
// console.log(auto1.cellArray)
// let i = 0
// setInterval(()=>{
//     auto1.drawSelf(i)
//     i++
//     auto1.step()
// }, 20)
const ITERS_PER_RENDER = 3;
const main = () => {
    auto1.drawSelf();
    for (let i = 0; i < ITERS_PER_RENDER; i++) {
        auto1.step();
        auto1.syncBuffer();
    }
    requestAnimationFrame(main);
};
main();
