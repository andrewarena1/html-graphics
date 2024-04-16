var id;
var ctx;
var mode;

// Initialize the canvas!!
function init_canvas() {
    //get screen dimensions
    var screenWidth = window.screen.width;
    var screenHeight = window.screen.height;
    //create the canvas, set attributes
    var canvas = document.createElement('canvas');
    canvas.id = "nopilates"
    canvas.width = screenWidth;
    canvas.height = screenHeight;
    canvas.style = "border:1px solid #000000";
    //attach it to the body of the page and get ID
    var body = document.getElementsByTagName("body")[0];
    body.appendChild(canvas);
    //get ids
    id = document.getElementById("nopilates");
    ctx = id.getContext("2d");
    ctx.imageSmoothingEnabled = "false";
    var textid1 = document.getElementById("yespilates");

    //initialize button properties
    init_buttons();

    //initialize canvas listeners
    init_canvas_listeners();

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
    id.addEventListener("mousedown", (e) => {
        if (mode === "free-pen" || "line-pen") {
            isDrawing = true;
        }
    });

    id.addEventListener("mousemove", (e) => {
        if (isDrawing) {
            current_event = e;
            ev(ctx, current_event, previous_event);
            previous_event = e;
        }

    });

    id.addEventListener("mouseup", (e) => {
        if (isDrawing) {
            current_event = e;
            ev(ctx, current_event, previous_event);
            isDrawing = false;
            previous_event = null;
        }
    });

    id.addEventListener("mouseleave", (e) => {
        if (isDrawing) {
            current_event = e;
            ev(ctx, current_event, previous_event);
            isDrawing = false;
            previous_event = null;
        }

    });
}

//clear function
function clear() {
    ctx.clearRect(0, 0, id.width, id.height);
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
