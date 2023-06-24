const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
let tools = document.querySelectorAll(".tool");
let saveImg = document.querySelector("#save-img");
let clearButton = document.querySelector(".clear-canvas");
let fillColor = document.querySelector("#fill-color"); 
let sizeSlider = document.querySelector("#size-slider"); 
let colorBtns = document.querySelectorAll(".colors");
let colorPicker = document.querySelector("#color-picker");
let colorIdentifier = document.querySelector("#selected-color");
let fillBackground = document.querySelector("#fillBackground");

let isDrawing = false;
let selectedTool = "brush";
let MouseX; // variable declared, we will use later to return the x-coordinate of our mouse when a mouse event occurs
let MouseY; // variable declared, we will use later to return the y-coordinate of our mouse when a mouse event occurs
let brushWidth = 5;
let selectedColor = "black";
const undoStack = [];
const redoStack = [];

const whiteBackground = () => {
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = selectedColor; // * clara
}

//This is used to ensure the canvas element scales correctly. Without it, sometimes you create lines/shapes on a different spot from where you clicked.
window.addEventListener("load", () => {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    whiteBackground();
})

//When we click each tool button, the below happens...
tools.forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelector(".btns-container .active").classList.remove("active"); // removes 'active' class from current active button
        btn.classList.add("active") // adds 'active' class to the button that you click
        selectedTool = btn.id; // the id of the button you click becomes selectedTool
        console.log(selectedTool); // just to see which tool we have chosen on the console
    });
});

//When "mousedown" occurs, this function executes:
const startDrawing = (e) => {
    isDrawing = true;
    MouseX = e.offsetX;
    MouseY = e.offsetY; // setting these 2 variables to become the coordinates of our mouse when "mousedown" event fires
    ctx.beginPath();
    ctx.lineWidth = brushWidth;
    ctx.strokeStyle = selectedColor;
    ctx.fillStyle = selectedColor;
    snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height); // copying canvas data to avoid dragging for rectangles
}

//When we drag our mouse, this function executes
const drawing = (e) => {
    if (!isDrawing) return; // below code will not run if isDrawing === false
    ctx.putImageData(snapshot, 0, 0);

    if (selectedTool === "brush" || selectedTool === "eraser") {
        ctx.strokeStyle = selectedTool === "eraser" ? "#fff" : selectedColor;
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
    } else if (selectedTool === "rectangle") {
        drawRect(e);
    } else if (selectedTool === "line") {
        drawLine(e);
    } else if (selectedTool === "curvedLine") {
        drawCurvedLine(e);
    } else if (selectedTool === "triangle"){   
        drawTriangle(e);
    } else if (selectedTool === "circle"){
        drawCricle(e)
    }
}

const stopDrawing = () => {
    isDrawing = false; // when we lift our mouse, isDrawing becomes false to stop the canvas from further drawing
    snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    undoStack.push(snapshot); // taking a a snapshot of the shape you just drew and pushing to undoStack array in case it needs to be removed
}

//Drawing Rectangle
const drawRect = (e) => {
    if(!fillColor.checked) {
    return ctx.strokeRect(e.offsetX, e.offsetY, MouseX - e.offsetX, MouseY - e.offsetY);
    }   
    ctx.fillRect(e.offsetX, e.offsetY, MouseX - e.offsetX, MouseY - e.offsetY);
}

//Drawing Triangle
const drawTriangle = (e) => {
    ctx.beginPath();
    ctx.moveTo(MouseX, MouseY);
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.lineTo(MouseX*2 - e.offsetX, e.offsetY)
    ctx.closePath()
    ctx.stroke()
    fillColor.checked ? ctx.fill() : ctx.stroke(); // if fillColor is checked fill triangle
}

//Drawing Circle
const drawCricle = (e) => {
    //formula to calculate distance between initial and final cursor coordinates to calculate radius//
    let radius = Math.sqrt(Math.pow((MouseX - e.offsetX),2) + Math.pow(MouseY - e.offsetY,2)); // Pythagorean theorem, a^2 + b^2 = c^2
    ctx.beginPath()
    ctx.arc(MouseX,MouseY, radius, 0, 2*Math.PI );  //the calculated radius is put here in the parameters//
    fillColor.checked ? ctx.fill() : ctx.stroke();
}

//Drawing Line
const drawLine = (e) => {
    ctx.beginPath()
    ctx.moveTo(MouseX,MouseY);
    ctx.lineTo(e.offsetX,e.offsetY);
    ctx.stroke();
}

//Draw Curved Line
const drawCurvedLine = (e) => {
    ctx.beginPath();
    ctx.moveTo(MouseX,MouseY);
    ctx.bezierCurveTo(e.offsetX*2,e.offsetY/2,e.offsetX*2,e.offsetY/2,e.offsetX+100,e.offsetY+100);
    ctx.stroke();
}

let promptCounter = 0;

fillBackground.addEventListener("click", () => {
  if (promptCounter === 0) {
    let userInput = window.prompt(
      "WARNING: This will erase any shapes you have drawn on the canvas. You can press undo to reverse the change. Click 'OK' or press enter to continue",
      "OK"
    );
    promptCounter++;
    if (userInput === "OK") {
      ctx.closePath();
      ctx.beginPath();
      ctx.fillStyle = selectedColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
      undoStack.push(snapshot);
    }
  } else {
    ctx.closePath();
    ctx.beginPath();
    ctx.fillStyle = selectedColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    undoStack.push(snapshot);
  }
});

const undo = () => {
    redoStack.push(undoStack.pop()); // removes last snapshot from undo stack
    ctx.clearRect(0, 0, canvas.width, canvas.height) // clears the canvas
    undoStack.forEach(snapshot => {
        console.log("put imagedata");
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

saveImg.addEventListener("click", (e) => {
  const link = document.createElement("a");
  link.download = "My awesome drawing.jpg";
  link.href = canvas.toDataURL("image/jpg");
  link.click();
});

clearButton.addEventListener("click", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    whiteBackground();
});

sizeSlider.addEventListener("change", () => brushWidth = sizeSlider.value);


//* trying to get the below function work *//

colorBtns.forEach(btn => {
    btn.addEventListener("click", () => { // adding click event to all color button//
      document.querySelector(".container .selected").classList.remove("selected"); 
      btn.classList.add("selected");// adds 'selected' class to the color that you click
      // passing selected btn background color as selectedColor value
      selectedColor = window.getComputedStyle(btn).getPropertyValue("background-color");
      selectedColor = colors.id;// the id of the color you click becomes selectedColor//
      console.log(selectedColor);// just to see which color we have chosen on the console//
      colorIdentifier.style.background = selectedColor; // changes color of the big circle to match selected color
    });

  });
  
  
  colorPicker.addEventListener("input", () => {
    // passing picked color value from color picker to last color btn background
    colorPicker.parentElement.style.background = colorPicker.value;
    colorPicker.parentElement.click();
  })



