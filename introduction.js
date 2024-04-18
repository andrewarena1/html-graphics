var canvas;
var ctx;
var currentmode = {};
// Initialize the canvas!!
function init_canvas() {
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
    init_button_listeners(document.getElementById("free-pen"), {
        mousedown: function (e) {
            this.isDrawing = true;
        },
        mousemove: function (e) {
            if (this.isDrawing) {
                this.current_event = e;
                drawLine(ctx, this.current_event, this.previous_event);
                this.previous_event = e;
            }

        },
        mouseup: function (e) {
            if (this.isDrawing) {
                this.current_event = e;
                drawLine(ctx, this.current_event, this.previous_event, 7, "butt");
                this.previous_event = null;
                this.isDrawing = false
            }

        }
    });

    init_button_listeners(document.getElementById("line-pen"), {
        mousedown: function (e) {
            this.isDrawing = true;
            this.previous_event = e;
        },
        mousemove: function (e) {
            return;
        },
        mouseup: function (e) {
            if (this.isDrawing) {
                this.current_event = e;
                drawLine(ctx, this.current_event, this.previous_event);
                this.previous_event = null;
                this.isDrawing = false;
            }

        }
    });
    init_button_listeners(document.getElementById("fountain-pen"), {
        mousedown: function (e) {
            this.isDrawing = true;
        },
        mousemove: function (e) {
            if (this.isDrawing) {
                this.current_event = e;
                this.current_time = Date.now();
                if (this.previous_event) {
                    this.velocity = euclidean_distance(this.current_event, this.previous_event) / (this.current_time - this.previous_time);
                    console.log(velocity);
                }
                width = getWidth(this.velocity, this.previous_velocity);
                drawLine(ctx, this.current_event, this.previous_event, width, "butt");
                this.previous_event = e;
                this.previous_time = this.current_time;
                this.previous_velocity = (5 * this.velocity + this.previous_velocity) / 6;
            }
        },
        mouseup: function (e) {
            if (this.isDrawing) {
                drawLine(ctx, this.current_event, this.previous_event);
                this.previous_event = null;
                this.isDrawing = false;
            }

        }
    });
    init_button_listeners(document.getElementById("clear"));
}

//set button hover colors event listeners
function init_button_listeners(menu_button, functionality) {
    menu_button.addEventListener("mousedown", function () {
        if (menu_button.id === "clear") {
            clear();
        } else {
            currentmode = functionality;
            console.log(currentmode);
        }
    });
    menu_button.addEventListener("mouseover", function () {
        if (!menu_button.toggle) {
            menu_button.style.backgroundColor = "gray";
            menu_button.style.borderColor = "black";
        }
    });
    menu_button.addEventListener("mouseleave", function () {
        if (!menu_button.toggle) {
            menu_button.style.backgroundColor = null;
            menu_button.style.borderColor = null;
        }
    });
}

//init all the canvas listeners
function init_canvas_listeners() {
    var isDrawing = false;
    var current_event;
    var previous_event;
    //click Event Listeners
    canvas.addEventListener("mousedown", ev_current);

    canvas.addEventListener("mousemove", ev_current);

    canvas.addEventListener("mouseup", ev_current);

    canvas.addEventListener("mouseleave", (e) => {
        if (isDrawing) {
            current_event = e;
            previous_event = null;
            ev(ctx, current_event, previous_event);
            isDrawing = false;
        }

    });
}

function ev_current(e) {
    var func = currentmode[e.type];
    if (func) {
        func(e);
    }
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
function drawLine(context, current_event, previous_event, width, cap) {
    if (!previous_event) {
        return;
    }
    context.beginPath();
    context.strokeStyle = "black";
    context.lineCap = cap || "round";
    context.lineWidth = width || 7;
    context.moveTo(previous_event.offsetX, previous_event.offsetY);
    context.lineTo(current_event.offsetX, current_event.offsetY);
    context.stroke();
    context.closePath();
};

function getWidth(velocity, previous_velocity) {
    return 7 - 2 * velocity;
}
function euclidean_distance(event1, event2) {
    return Math.sqrt(Math.pow(event1.offsetX - event2.offsetX, 2) + Math.pow(event1.offsetY - event2.offsetY, 2));
}

