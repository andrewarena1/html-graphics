
var mcanv;
var ocanv;
var ctx;
var mode;
var dpr = window.devicePixelRatio;
var mcanv_data;
var past_states = [];
var current_state;
var current_access;
var future_states = [];
var img_upload_data;

// Initialize the mcanv!!
function init_canvas() {
    //set attributes
    const dpr = window.devicePixelRatio;
    console.log(dpr);
    //mcanv init
    mcanv = document.getElementById("mcanv");
    mcanv.width = window.innerWidth * dpr;
    mcanv.height = window.innerHeight * dpr;
    mcanv.style = "border:1px solid #000000";
    mcanv.style.width = `${window.innerWidth}px`;
    mcanv.style.height = `${window.innerHeight}px`;
    //ctx init
    ctx = mcanv.getContext("2d", { alpha: false });
    ctx.scale(dpr, dpr);
    ctx.webkitImageSmoothingEnabled = "false";
    ctx.ImageSmoothingEnabled = "false";

    //draw a white rect
    ctx.fillStyle = "white";
    drawRect(ctx, { offsetX: mcanv.width, offsetY: mcanv.height }, { offsetX: 0, offsetY: 0 });
    current_state = ctx.getImageData(0, 0, mcanv.width, mcanv.height);
    //state history init

    //initialize button properties
    init_buttons();

    //initialize mcanv listeners
    init_canvas_listeners();

    //init color pickers 
    init_color_pickers();

    init_IO();
    //window resize support
    window.onresize = window_resize;
}


//all inits
function init_buttons() {
    var butts = document.getElementsByTagName("button");
    //button listeners
    const free_pen = init_button_listeners(document.getElementById("free-pen"), {
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

    const line_pen = init_button_listeners(document.getElementById("line-pen"), {
        mousedown: function (e) {
            this.isDrawing = true;
            this.previous_event = e;
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
    const rect_tool = init_button_listeners(document.getElementById("rect-tool"), {
        mousedown: function (e) {
            this.isDrawing = true;
            this.previous_event = e;
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
    const circle_tool = init_button_listeners(document.getElementById("circle-tool"), {
        mousedown: function (e) {
            this.isDrawing = true;
            this.previous_event = e;
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
    const fill_tool = init_button_listeners(document.getElementById("fill-tool"), {
        mousedown: function (e) {
            prepFill(ctx.fillStyle, e.offsetX, e.offsetY);
        },
        mousemove: function (e) {
            return;
        },
        mouseup: function (e) {
            return;
        }

    });
    const upload_tool = init_button_listeners(document.getElementById("upload-tool"), {
        button_click: function () {
            document.getElementById("upload-interface").click();
        },
        mousedown: function (e) {
            if (this.isMoving) {
                isMoving = false;
                ctx.putImageData(current_state, 0, 0);
                ctx.drawImage(img_upload_data, e.offsetX, e.offsetY);
                this.isResizing = true;
                this.previous_event = e;
                requestAnimationFrame(rubberUploadResize);
                for (let i = 0; i < butts.length; i++) {
                    butts[i].disabled = false;
                }
            }
        },
        mousemove: function (e) {
            this.current_event = e;
        },
        mouseup: function (e) {
            this.isResizing = false;

        }
    });
    const clear_tool = init_button_listeners(document.getElementById("clear"), {
        button_click: function () {
            clear();
        }
    });

}

function init_button_listeners(menu_button, functionality) {
    if (!mode) { //takes the first button initialized as the default mode on page load
        mode = functionality;
    }
    menu_button.addEventListener("mousedown", function () {
        if (functionality.button_click) {
            functionality.button_click();
        }
        if (functionality.mousedown) {
            mode = functionality;
        }


    });
}

function init_canvas_listeners() {
    var isDrawing = false;
    ctx.lineWidth = 7;
    ctx.strokeStyle = "black";
    ctx.fillStyle = "black";
    //click Event Listeners
    mcanv.addEventListener("mousedown", ev_current);

    mcanv.addEventListener("mousemove", ev_current);

    mcanv.addEventListener("mouseup", ev_current);

    mcanv.addEventListener("touchstart", (e) => {
        var touch = e.targetTouches[0];
        var menv = new MouseEvent("mousedown", {
            offsetX: touch.offsetX,
            offsetY: touch.offsetY,
        })
        mcanv.dispatchEvent(menv);
        e.preventDefault();
    });

    mcanv.addEventListener("touchmove", (e) => {
        var touch = e.targetTouches[0];
        var menv = new MouseEvent("mousemove", {
            offsetX: touch.offsetX,
            offsetY: touch.offsetY,
        })
        mcanv.dispatchEvent(menv);
        e.preventDefault();
    });

    mcanv.addEventListener("touchend", (e) => {
        var touch = e.targetTouches[0];
        var menv = new MouseEvent("mouseup", {
            offsetX: touch.clientX,
            offsetY: touch.clientY,
        })
        mcanv.dispatchEvent(menv);
        e.preventDefault();
    });

    mcanv.addEventListener("mouseleave", ev_current);
}

function init_color_pickers() {
    var colors = document.getElementById("colors");
    var palette = ["white", "yellow", "orange", "red", "magenta", "purple", "blue", "cyan", "black", "gray", "darkgray", "lightgray", "tan", "brown", "darkgreen", "green"];
    var children = colors.children;
    for (let i = 0; i < children.length; i++) {
        children[i].style.backgroundColor = palette[i];
        colors.children[i].addEventListener("mousedown", () => {
            ctx.strokeStyle = palette[i];
            console.log(ctx.strokeStyle);
            ctx.fillStyle = palette[i];
        })
    }
}

function init_IO() {
    var uploadid = document.getElementById("upload-interface");
    uploadid.addEventListener("change", (e) => {
        if (uploadid.files.length === 0) {
            window.alert("Please select a file.");
        } else {
            var data = createImageBitmap(uploadid.files[0]);
            data.then(
                function (value) {
                    img_upload_data = value;
                    this.isMoving = true;
                    requestAnimationFrame(rubberUpload);
                    for (let i = 0; i < butts.length; i++) {
                        butts[i].disabled = true;
                    }
                },
                function (error) { window.alert("sorry, error: " + error) }
            );
        }
        uploadid.value = ""; //make sure that the same file can be uploaded multiple times in a row
    })
}


/*  Keyboard Listener
    Current Keybinds: 
    Ctrl - z: undo, Ctrl - r: redo  */
var map = {};
onkeydown = onkeyup = function (e) {
    map[e.key] = e.type == 'keydown';
    if (map["z"] && e.ctrlKey) {
        this.setTimeout(undoCanvas(), 500);

    }
    if (map["r"] && e.ctrlKey) {
        redoCanvas();
    }
}

function ev_current(e) {
    var func = mode[e.type];
    if (func) {
        func(e);
        if (e.type === "mouseup") {
            const thing = ctx.getImageData(0, 0, mcanv.width, mcanv.height);
            stateChanged();
        }
    }

}

//window resize listener 
function window_resize() {
    mcanv.style.width = `${window.innerWidth}px`;
    mcanv.style.height = `${window.innerHeight}px`;
    ctx.setTransform(mcanv.width / window.innerWidth, 0, 0, mcanv.height / window.innerHeight, 0, 0);
}

//clear 
function clear() {
    ctx.save();
    ctx.fillStyle = "white";
    drawRect(ctx, { offsetX: mcanv.width, offsetY: mcanv.height }, { offsetX: 0, offsetY: 0 });
    ctx.restore();
    stateChanged();
}

//drawing 
function drawLine(context, cur, prev, width, cap, join) {
    if (!prev) {
        return;
    }
    context.beginPath();
    context.lineWidth = width || 7;
    context.lineCap = cap || "round";
    context.lineJoin = join || "round";
    context.moveTo(prev.offsetX, prev.offsetY);
    context.lineTo(cur.offsetX, cur.offsetY);
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
    context.rect(previous_event.offsetX, previous_event.offsetY, width, height);
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
    context.arc(previous_event.offsetX + width / 2, previous_event.offsetY + height / 2, diameter / 2, 0, 2 * Math.PI);
    context.fill();
    context.closePath();
};

//math functions. probably inefficient
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

//Rubber functions for UX
function rubberLine() {
    if (this.isDrawing) {
        ctx.putImageData(current_state, 0, 0);
        drawLine(ctx, this.current_event, this.previous_event);
        requestAnimationFrame(rubberLine);
    }
}


function rubberRect() {
    if (this.isDrawing) {
        ctx.putImageData(current_state, 0, 0);
        drawRect(ctx, this.current_event, this.previous_event);
        requestAnimationFrame(rubberRect);
    }

}
function rubberCirc() {
    if (this.isDrawing) {
        ctx.putImageData(current_state, 0, 0);
        drawCirc(ctx, this.current_event, this.previous_event);
        requestAnimationFrame(rubberCirc);
    }

}

function rubberUpload() {
    if (this.isMoving) {
        if (this.current_event) {
            ctx.putImageData(current_state, 0, 0);
            drawLine(ctx, { offsetX: this.current_event.offsetX, offsetY: 0 }, { offsetX: this.current_event.offsetX, offsetY: mcanv.height }, 2);
            drawLine(ctx, { offsetX: 0, offsetY: this.current_event.offsetY }, { offsetX: mcanv.width, offsetY: this.current_event.offsetY }, 2);
            ctx.drawImage(img_upload_data, this.current_event.offsetX, this.current_event.offsetY)
        }
        requestAnimationFrame(rubberUpload);
    }
}

function rubberUploadResize() {
    if (this.isResizing) {
        ctx.putImageData(current_state, 0, 0);
        ctx.drawImage(img_upload_data, this.previous_event.offsetX, this.previous_event.offsetY, this.current_event.offsetX - this.previous_event.offsetX, this.current_event.offsetY - this.previous_event.offsetY);
        requestAnimationFrame(rubberUploadResize);
    }
}

//functions relating to undo and redo
function stateChanged() {
    past_states.push(current_state);
    if (past_states.length > 10) {
        past_states.shift();
        /* note: this checks if there are more than 10 past_states. 
        if so, it shifts 1 to the left. since states are always added once per function call this should work.
        however, it may bug out if somehow 2 states are pushed before stateChanged is called. */
    }
    current_state = ctx.getImageData(0, 0, mcanv.width, mcanv.height);

}

function undoCanvas() {
    var past = past_states.pop();
    if (!past) {
        return;
    }
    ctx.putImageData(past, 0, 0);
    future_states.push(current_state);
    current_state = past;
    if (future_states.length > 10) {
        future_states.shift();
    }

}

function redoCanvas() {
    var future = future_states.pop(); //pop off of future
    if (!future) { //check if there was anything to pop
        return;
    }
    ctx.putImageData(future, 0, 0);
    past_states.push(current_state)
    current_state = future; //push future to the top of past_states
}


//fill functions

function prepFill(fill, initx, inity) {
    const dpr = window.devicePixelRatio;
    const x = initx * dpr;
    const y = inity * dpr;
    const imgArray = ctx.getImageData(0, 0, mcanv.width, mcanv.height);

    const pixelData = {
        width: imgArray.width,
        height: imgArray.height,
        data: new Uint32Array(imgArray.data.buffer), //convert uint8 pixel buffer into uint32 byte array to quarter number of pixel references
    }

    const chunked = [];
    const fill_butlessannoying = fill.substring(1);
    for (let i = 0; i < 3; i++) {
        chunked.push(fill_butlessannoying.substring(2 * i, 2 * (i + 1)))
    }
    const fillColor = parseInt("ff" + chunked.reverse().join(''), 16); //convert annoying #ffffff string into a number base 10 (and add transparency to match)
    const pixelColor = getPixel(pixelData, x, y);

    if (pixelColor != fillColor) {
        floodFill(fillColor, pixelColor, pixelData, x, y);
    }
    ctx.putImageData(imgArray, 0, 0);
}


function floodFill(fillColor, pixelColor, pixelData, x, y) {
    let s = [x, y];
    while (s.length != 0) {
        let y = s.pop();
        let x = s.pop();
        let currentColor = getPixel(pixelData, x, y);
        if (currentColor === pixelColor) {
            pixelData.data[y * pixelData.width + x] = fillColor;
            s.push(x - 1, y);
            s.push(x + 1, y);
            s.push(x, y + 1);
            s.push(x, y - 1);
        }
    }
}

function getPixel(pixelData, x, y) {
    if (x < 0 || y < 0 || x >= pixelData.width || y >= pixelData.height) {
        return -1;
    } else {
        return pixelData.data[y * pixelData.width + x];
    }
}
