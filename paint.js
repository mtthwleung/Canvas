const canvas = document.querySelector("canvas");
tools = document.querySelectorAll(".tool");
ctx = canvas.getContext("2d");

let isDrawing = false;
let selectedTool = "brush";
let MouseX; // variable declared, we will use later to return the x-coordinate of our mouse when a mouse event occurs
let MouseY; // variable declared, we will use later to return the y-coordinate of our mouse when a mouse event occurs
let brushWidth = 5;
const undoStack = [];
const redoStack = [];

//This is used to ensure the canvas element scales correctly. Without it, sometimes you create lines/shapes on a different spot from where you clicked.
window.addEventListener("load", () => {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
})

//When we click each tool button, the below happens...
tools.forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelector(".btns-container .active").classList.remove("active"); // removes 'active' class from current active button
        btn.classList.add("active") // adds 'active' class to the button that you click
        selectedTool = btn.id; // the id of the button you click becomes selectedTool
        console.log(selectedTool); // just to see which tool we have chosen on the console
    })
})

//When "mousedown" occurs, this function executes:
const startDrawing = (e) => {
    isDrawing = true;
    MouseX = e.offsetX;
    MouseY = e.offsetY; // setting these 2 variables to become the coordinates of our mouse when "mousedown" event fires
    ctx.beginPath();
    ctx.lineWidth = brushWidth;
    snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height); // copying canvas data to avoid dragging for rectangles
}

//When we drag our mouse, this function executes
const drawing = (e) => {
    if (!isDrawing) return; // below code will not run if isDrawing === false
    ctx.putImageData(snapshot, 0, 0);
    if (selectedTool === "brush") {
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
    } else if (selectedTool === "rectangle") {
        drawRect(e);
    } else if (selectedTool === "line") {
        drawLine(e);
    } else if (selectedTool === "curvedLine") {
        drawCurvedLine(e);
    }
}

const stopDrawing = () => {
    isDrawing = false; // when we lift our mouse, isDrawing becomes false to stop the canvas from further drawing
    snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    undoStack.push(snapshot); // taking a a snapshot of the shape you just drew and pushing to undoStack array in case it needs to be removed
}

const drawRect = (e) => {
    ctx.strokeRect(e.offsetX, e.offsetY, MouseX - e.offsetX, MouseY - e.offsetY);
}

const drawLine = (e) => {

}

const drawCurvedLine = (e) => {

}

const undo = () => {
    redoStack.push(undoStack.pop()); // removes last snapshot from undo stack
    ctx.clearRect(0, 0, canvas.width, canvas.height) // clears the canvas
    undoStack.forEach(snapshot => {
        ctx.putImageData(snapshot, 0, 0);
    })
}

const redo = () => {
    const snapshot = redoStack.pop();
    undoStack.push(snapshot);
    ctx.putImageData(snapshot, 0, 0);

    // undoStack.push(redoStack.shift());
    // undoStack.forEach(snapshot => {
    //     ctx.putImageData(snapshot, 0, 0);
    // })
};

canvas.addEventListener("mousedown", startDrawing);
canvas.addEventListener("mousemove", drawing);
canvas.addEventListener("mouseup", stopDrawing);

document.querySelector("#undo").addEventListener("click", undo);
document.querySelector("#redo").addEventListener("click", redo);
