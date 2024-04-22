class CustomQueue {
    constructor(maxLength) {
        this.maxlen = maxLength;
        this.items = new Array(new ImageData(mcanv.width || 0, mcanv.height || 0));
    }
    /* incPointer() { //methods affecting the pointer
         if ((this.pointer < this.length - 1) && (this.items[this.pointer] != null)) {
             this.pointer++;
             return true;
         }
         return false;
     }
     resetPointer() {
         this.pointer = 0;
     }
     setPointer(index) {
         this.pointer = index;
     }
     pointerPeek() {
         return this.items[this.pointer];
     } */
    queue(newitem) { //shifts elements, adds new element to index 0, returns element that is shifted out.
        this.items.unshift(newitem);
        if (this.items.length > 10) {
            return this.items.pop();
        }

    }
    dequeue() {
        console.log("yes: " + this.items);
        if (this.items.length === 1) {
            return;
        } else {
            return this.items.shift();
        }

    }
}

var mcanv;
var tcanv;
var ctx;
var currentmode = {};
var dpr = window.devicePixelRatio;
var mcanv_data;
var state_history;
// Initialize the mcanv!!
function init_canvas() {
    //get body
    var body = document.getElementsByTagName("body")[0];
    //create the mcanv, set attributes
    mcanv = document.createElement('canvas');
    tcanv = document.createElement('canvas');
    const dpr = window.devicePixelRatio;
    //mcanv init
    mcanv.id = "mcanv"
    mcanv.width = window.innerWidth * dpr;
    mcanv.height = window.innerHeight * dpr;
    mcanv.style = "border:1px solid #000000";
    body.appendChild(mcanv);
    mcanv.style.width = `${window.innerWidth}px`;
    mcanv.style.height = `${window.innerHeight}px`;
    //tcanv init
    tcanv.id = "tcanv";
    tcanv.width = window.innerWidth * dpr;
    tcanv.width = window.innerHeight * dpr;
    tcanv.style.width = `${window.innerWidth}px`;
    tcanv.style.height = `${window.innerHeight}px`;
    //mcanv context init
    ctx = mcanv.getContext("2d", { alpha: false });
    ctx.scale(dpr, dpr);
    ctx.imageSmoothingEnabled = "false";
    //state history init
    state_history = new CustomQueue(10);

    //initialize button properties
    init_buttons();

    //initialize mcanv listeners
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
                drawLine(ctx, this.current_event, this.previous_event)
                this.previous_event = e;
            }

        },
        mouseup: function (e) {
            if (this.isDrawing) {
                this.current_event = e;
                drawLine(ctx, this.current_event, this.previous_event);
                this.previous_event = null;
                this.isDrawing = false
            }

        }
    });

    init_button_listeners(document.getElementById("line-pen"), {
        mousedown: function (e) {
            this.isDrawing = true;
            this.previous_event = e;
            mcanv_data = ctx.getImageData(0, 0, mcanv.width, mcanv.height);
            requestAnimationFrame(rubberLine);
        },
        mousemove: function (e) {
            this.current_event = e;
        },
        mouseup: function (e) {
            if (this.isDrawing) {
                this.current_event = e;
                this.previous_event = null;
                this.isDrawing = false;
            }

        }
    });
    init_button_listeners(document.getElementById("rect-tool"), {
        mousedown: function (e) {
            this.isDrawing = true;
            this.previous_event = e;
            mcanv_data = ctx.getImageData(0, 0, mcanv.width, mcanv.height);
            requestAnimationFrame(rubberRect);
        },
        mousemove: function (e) {
            this.current_event = e;
        },
        mouseup: function (e) {
            if (this.isDrawing) {
                this.current_event = e;
                this.previous_event = null;
                this.isDrawing = false;
            }

        }

    });
    init_button_listeners(document.getElementById("circle-tool"), {
        mousedown: function (e) {
            this.isDrawing = true;
            this.previous_event = e;
            mcanv_data = ctx.getImageData(0, 0, mcanv.width, mcanv.height);
            requestAnimationFrame(rubberCirc);
        },
        mousemove: function (e) {
            this.current_event = e;
        },
        mouseup: function (e) {
            if (this.isDrawing) {
                this.current_event = e;
                this.previous_event = null;
                this.isDrawing = false;
            }

        }

    });
    init_button_listeners(document.getElementById("clear"), {});
}

//set button hover colors event listeners
function init_button_listeners(menu_button, functionality) {
    menu_button.addEventListener("mousedown", function () {
        if (menu_button.id === "clear") {
            clear();
        } else {
            currentmode = functionality;
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
    ctx.lineWidth = 7;
    ctx.strokeStyle = "black";
    ctx.fillStyle = "black";
    //click Event Listeners
    mcanv.addEventListener("mousedown", ev_current);

    mcanv.addEventListener("mousemove", ev_current);

    mcanv.addEventListener("mouseup", ev_current);

    mcanv.addEventListener("mouseleave", ev_current);
}
//keyboard listener 
var map = {};
onkeydown = onkeyup = function (e) {
    map[e.key] = e.type == 'keydown';
    if (map["z"] && e.ctrlKey) {
        undoCanvas();
    }
}
function ev_current(e) {
    var func = currentmode[e.type];
    if (func) {
        func(e);
        if (e.type === "mouseup") {
            const thing = ctx.getImageData(0, 0, mcanv.width, mcanv.height);
            state_history.queue(thing);
            console.log(state_history.items);
        }
    }

}

//window resize listener function
function window_resize() {
    mcanv.style.width = `${window.innerWidth}px`;
    mcanv.style.height = `${window.innerHeight}px`;
    ctx.setTransform(mcanv.width / window.innerWidth, 0, 0, mcanv.height / window.innerHeight, 0, 0);
}

//clear function
function clear() {
    ctx.clearRect(0, 0, mcanv.width, mcanv.height);
}

//ev functions
function drawLine(context, current_event, previous_event) {
    if (!previous_event) {
        return;
    }
    context.beginPath();
    context.strokeStyle = "black";
    context.lineCap = "round";
    context.lineJoin = "round";
    context.lineWidth = 7;
    context.moveTo(previous_event.offsetX, previous_event.offsetY);
    context.lineTo(current_event.offsetX, current_event.offsetY);
    context.stroke();
    context.closePath();
};

function drawRect(context, current_event, previous_event) {
    if (!previous_event) {
        return;
    }
    const width = current_event.offsetX - previous_event.offsetX;
    const height = current_event.offsetY - previous_event.offsetY;
    context.beginPath();
    context.strokeStyle = "black";
    context.lineCap = "square";
    context.lineJoin = "square";
    context.lineWidth = 7;
    context.rect(previous_event.offsetX, previous_event.offsetY, width, height);
    context.stroke();
    context.fill();
    context.closePath();
};

function drawCirc(context, current_event, previous_event) {
    if (!previous_event) {
        return;
    }
    const width = current_event.offsetX - previous_event.offsetX;
    const height = current_event.offsetY - previous_event.offsetY;
    const diameter = euclidean_distance(current_event, previous_event);
    context.beginPath();
    context.strokeStyle = "black";
    context.lineCap = "square";
    context.lineJoin = "square";
    context.lineWidth = 7;
    context.arc(previous_event.offsetX + width / 2, previous_event.offsetY + height / 2, diameter / 2, 0, 2 * Math.PI);
    context.stroke();
    context.fill();
    context.closePath();
};


function euclidean_distance(event1, event2) {
    return Math.sqrt(Math.pow(event1.offsetX - event2.offsetX, 2) + Math.pow(event1.offsetY - event2.offsetY, 2));
}

function normalize(vector) {
    var returnvector = vector;
    var sum = vector[0] * vector[0] + vector[1] * vector[1];
    var inverse_sqrt_sum = 1 / (Math.sqrt(sum))
    returnvector[0] = inverse_sqrt_sum * returnvector[0];
    returnvector[1] = inverse_sqrt_sum * returnvector[1];
    return returnvector;
}

function dotproduct(vector1, vector2) {
    return vector1[0] * vector2[0] + vector1[1] * vector2[1];
}

function rubberLine() {
    if (isDrawing) {
        ctx.putImageData(mcanv_data, 0, 0);
        drawLine(ctx, this.current_event, this.previous_event);
        requestAnimationFrame(rubberLine);
    }

}
function rubberRect() {
    if (isDrawing) {
        ctx.putImageData(mcanv_data, 0, 0);
        drawRect(ctx, this.current_event, this.previous_event);
        requestAnimationFrame(rubberRect);
    }

}
function rubberCirc() {
    if (isDrawing) {
        ctx.putImageData(mcanv_data, 0, 0);
        drawCirc(ctx, this.current_event, this.previous_event);
        requestAnimationFrame(rubberCirc);
    }

}

function undoCanvas() {
    const data = state_history.dequeue();
    console.log(data);
    ctx.putImageData(data, 0, 0);
}


