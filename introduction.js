var canvas;
var ctx;
var mode;

function init_canvas() {
    console.log(window.devicePixelRatio);
    //get screen dimensions
    var canvasWidth = window.innerWidth;
    var canvasHeight = window.innerHeight;
    //create the canvas, set attributes
    canvas = document.createElement('canvas');
    canvas.id = "nopilates"
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    canvas.style = "border:1px solid #000000";
    //attach it to the body of the page and get ID
    var body = document.getElementsByTagName("body")[0];
    body.appendChild(canvas);
    //get ids
    ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = "false";
    var textid1 = document.getElementById("yespilates");

    //initialize button properties
    init_buttons();

    //initialize canvas listeners
    init_canvas_listeners();

    //window resize support
    window.onresize = window_resize;

}



function init_buttons() {
    //button listeners
    init_button_listeners(document.getElementById("free-pen"), drawLine);
    init_button_listeners(document.getElementById("line-pen"), lineSeg);
    init_button_listeners(document.getElementById("fountain-pen"));
    init_button_listeners(document.getElementById("clear"));
}

//set button hover colors event listeners
function init_button_listeners(menu_button, callback_function) {
    menu_button.addEventListener("mousedown", function () {
        if (menu_button.id === "clear") {
            clear();
        } else {
            mode = menu_button.id;
            ev = callback_function;
        }
    });
    menu_button.addEventListener("mouseover", function () {
        menu_button.style.backgroundColor = "gray";
        menu_button.style.borderColor = "black";
    });
    menu_button.addEventListener("mouseleave", function () {
        menu_button.style.backgroundColor = null;
        menu_button.style.borderColor = null;
    });
}

//init all the canvas listeners
function init_canvas_listeners() {
    var isDrawing = false;
    var current_event;
    var previous_event;
    //click Event Listeners
    canvas.addEventListener("mousedown", (e) => {
        if (mode === "free-pen" || "line-pen") {
            isDrawing = true;
        }
    });

    canvas.addEventListener("mousemove", (e) => {
        if (isDrawing) {
            current_event = e;
            ev(ctx, current_event, previous_event);
            previous_event = e;
        }

    });

    canvas.addEventListener("mouseup", (e) => {
        if (isDrawing) {
            current_event = e;
            ev(ctx, current_event, previous_event);
            isDrawing = false;
            previous_event = null;
        }
    });

    canvas.addEventListener("mouseleave", (e) => {
        if (isDrawing) {
            current_event = e;
            ev(ctx, current_event, previous_event);
            isDrawing = false;
            previous_event = null;
        }

    });
}

//window resize listener function
function window_resize() {
    var contents = ctx.getImageData(0, 0, canvas.width, canvas.height);
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.putImageData(contents, 0, 0);
}

//clear function
function clear() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

//ev functions
function drawLine(context, current_event, previous_event) {
    if (!previous_event) {
        return;
    }
    context.beginPath();
    context.strokeStyle = "black";
    context.lineCap = "round";
    context.lineWidth = 7;
    context.moveTo(previous_event.offsetX, previous_event.offsetY);
    context.lineTo(current_event.offsetX, current_event.offsetY);
    context.stroke();
    context.closePath();
};

function lineSeg(context, current_event, previous_event) {
    //to be filled
};
