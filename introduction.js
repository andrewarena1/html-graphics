
var mcanv;
var ctx;
var mode;
var dpr = window.devicePixelRatio;
var mcanv_data;
var past_states = [];
var current_x;
var current_y;
var current_state;
var clipboard;
var future_states = [];
var img_upload_data;
var butts;
// Initialize the mcanv!!
function init_canvas() {
    //set attributes
    const dpr = window.devicePixelRatio;
    mcanv = document.getElementById("mcanv");                       //mcanv init
    mcanv.width = window.innerWidth * dpr;
    mcanv.height = window.innerHeight * dpr;
    mcanv.style = "border:1px solid #000000";
    mcanv.style.width = `${window.innerWidth}px`;
    mcanv.style.height = `${window.innerHeight}px`;
    ctx = mcanv.getContext("2d", { alpha: false });                 //ctx init
    ctx.scale(dpr, dpr);
    ctx.webkitImageSmoothingEnabled = "false";
    ctx.ImageSmoothingEnabled = "false";

    let window_width = window.innerWidth; //here we calculate the width of the color gradient

    ctx.fillStyle = "white";                                        //draw a white rect
    drawRect(ctx, { offsetX: mcanv.width, offsetY: mcanv.height }, { offsetX: 0, offsetY: 0 });
    current_state = ctx.getImageData(0, 0, mcanv.width, mcanv.height);

    init_buttons();             //initialize button properties
    init_submenu();
    init_canvas_listeners();    //init canvas listeners 
    init_color_pickers();       //init color pickers 
    init_IO();                  //bad 
    window.onresize = window_resize;
}


//all inits
function init_buttons() {
    butts = document.getElementsByTagName("button");                         //BUTTONS!!!!!!!
    //button listeners
    const free_pen = {
        id: "free_pen",
        button_click: function (e) {
            //change submenu
        },
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
                this.previous_event = null;
                this.isDrawing = false
            }

        }
    };
    const line_pen = {
        id: "line_pen",
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
    };
    const rect_tool = {
        id: "rect_tool",
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

    };
    const circle_tool = {
        id: "circle_tool",
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

    };
    const fill_tool = {
        id: "fill_tool",
        mousedown: function (e) {
            prepFill(ctx.fillStyle, e.offsetX, e.offsetY);
        },
        mousemove: function (e) {
            return;
        },
        mouseup: function (e) {
            return;
        }

    };

    const select_tool = {
        id: "select_tool",
        mousedown: function (e) {
            this.isMoving = true;
            this.first_event = e;
        },
        mousemove: function (e) {
            this.current_event = e;
        },
        mouseup: function (e) {
            if (isMoving) {
                const width = this.current_event.offsetX - this.first_event.offsetX;
                const length = this.current_event.offsetY - this.first_event.offsetY;
                if (width != 0 && length != 0) {
                    clipboard = ctx.getImageData(this.first_event.offsetX, this.first_event.offsetY, width, length);
                }
            }


        }
    };
    const upload_tool = {
        id: "upload_tool",
        button_click: function () {
            this.isResizing = false;
            document.getElementById("u-image").click();
            ctx.save();
            ctx.setLineDash([5, 5]);
            ctx.strokeStyle = "black";
        },
        mousedown: function (e) {
            if (this.isMoving) {
                this.current_event = e;
                this.isMoving = false;
                ctx.putImageData(current_state, 0, 0);  //gets rid of dotted lines
                ctx.drawImage(img_upload_data, e.offsetX, e.offsetY); //draws image(will be replaced if mouse is moved)
                this.isResizing = true;
                requestAnimationFrame(rubberUploadResize);
                this.previous_event = e;
                for (let i = 0; i < butts.length; i++) {
                    butts[i].disabled = false;
                }
            }
        },
        mousemove: function (e) {
            this.current_event = e;
        },
        mouseup: function (e) {
            console.log(this.isResizing);
            if (this.isResizing) { //this check prevents Mouseleave listener from bugging out for this tool
                this.isResizing = false;
                this.previous_event = null;
                ctx.restore();
            }


        }
    };
    const pattern_tool = {
        id: "pattern_tool",
        button_click: function () {
            document.getElementById("u-pattern").click();
        }

    };
    const clear_tool = {
        id: "clear",
        button_click: function () {
            clear();
        }
    };
    init_button_listeners(free_pen);
    init_button_listeners(line_pen);
    init_button_listeners(rect_tool);
    init_button_listeners(circle_tool);
    init_button_listeners(fill_tool);
    //init_button_listeners(select_tool);
    init_button_listeners(upload_tool);
    init_button_listeners(pattern_tool);
    init_button_listeners(clear_tool);
}

function init_submenu() {
    var holder = document.createElement("div");
    holder.setAttribute("class", "sub-menu");
    var button1 = document.createElement("button");
    button1.setAttribute("class", "sub-tool");
    holder.appendChild(button1);
    //document.body.appendChild(holder);
}

function init_button_listeners(menu_button) {
    if (!mode) { //takes the first button initialized as the default mode on page load
        mode = menu_button;
    }
    document.getElementById(menu_button.id).addEventListener("mousedown", function () {
        if (menu_button.button_click) {
            menu_button.button_click();
        }
        if (menu_button.mousedown) {
            mode = menu_button;
        }
    });
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
            document.getElementById("current-color").style.backgroundColor = palette[i];
            document.getElementById("cool-gradient").style.backgroundImage = `linear-gradient(to right, rgb(255, 255, 255), ${palette[i]}, rgb(0, 0, 0, 255)`;

        })
    }
    var gradient = document.getElementById("cool-gradient");
    gradient.addEventListener("click", (e) => {
        let x = e.offsetX;
        let y = e.offsetY;
        let width = gradient.offsetWidth;
        let percentage = x / width;
        console.log(ctx.strokeStyle);
        let color = ctx.strokeStyle.substring(1);
        let arr = [];
        for (let i = 0; i < 3; i++) {
            arr.push(color.substring(2 * i, 2 * i + 2));
        }
        console.log(arr);
        console.log(ctx.strokeStyle);
    })
}

function init_IO() {
    var uploadid = document.getElementsByClassName("upload");
    console.log(uploadid);
    for (let i = 0; i < uploadid.length; i++) {
        let stink = uploadid[i];
        stink.addEventListener("change", (e) => {
            if (stink.files.length === 0) {
                window.alert("Please select a file.");
            } else {
                var data = createImageBitmap(stink.files[0]);
                data.then(
                    function (value) {
                        if (stink.id === "u-image") {                        //UPLOAD STUFF
                            img_upload_data = value;
                            this.isMoving = true;
                            requestAnimationFrame(rubberUpload);           //start the animation of the image moving around
                            for (let i = 0; i < butts.length; i++) {   //disable other buttons
                                butts[i].disabled = true;
                                document.getElementById("upload_tool").disabled = false;
                            }
                        } else if (stink.id === "u-pattern") {                      //PATTERN STUFF
                            const pattern = ctx.createPattern(value, "repeat");
                            ctx.fillStyle = pattern;
                            ctx.strokeStyle = pattern;
                            URL.createObjectURL(stink.files[0])
                            document.getElementById("cool-gradient").style.backgroundImage = "url('images/pattern.png')"
                        }
                        stink.value = "";   //prevent uploading same image twice causing error
                    },
                    function (error) { window.alert("sorry, error: " + error) }
                );
            }
            //make sure that the same file can be uploaded multiple times in a row
        })
    }
}
function init_canvas_listeners() {
    var isDrawing = false;
    ctx.lineWidth = 7;
    ctx.strokeStyle = "black";
    ctx.fillStyle = "black";
    mcanv.addEventListener("mousedown", ev_current);                    //click Event Listeners                    
    mcanv.addEventListener("mousemove", ev_current);
    mcanv.addEventListener("mouseup", ev_current);
    mcanv.addEventListener("mouseleave", (e) => {
        mode.mouseup(e);
    });
}

function ev_current(e) {
    current_x = e.offsetX;
    current_y = e.offsetY;
    var func = mode[e.type];
    if (func) {
        func(e);
        if (e.type === "mouseup") {
            stateChanged();         //This doesn't work just yet!!
        }
    }

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
        this.setTimeout(redoCanvas(), 500);
    }
    if (map["c"]) {
        let a = this.document.getElementById("color-menu")
        console.log(true); // i need a way to always have my mouse position! to ev_current we go
        a.style.left = `${current_x} px`;
        a.style.top = `${current_y} px`;
        a.style.display = "block";
        console.log(current_x);
        console.log(current_y);


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
        if (!(this.current_event.type === "mousedown")) { //this checks if the event is mousedown. if so, the image is not painted over. 
            ctx.putImageData(current_state, 0, 0);
        }
        ctx.drawImage(img_upload_data, this.previous_event.offsetX, this.previous_event.offsetY, this.current_event.offsetX - this.previous_event.offsetX, this.current_event.offsetY - this.previous_event.offsetY);
        requestAnimationFrame(rubberUploadResize);
    }
}

//functions relating to undo and redo
function stateChanged() {
    past_states.push(current_state);
    future_states = [];
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

    const fill_butlessannoying = fill.substring(1);
    var chunked = reverseHexByteOrder(fill_butlessannoying);
    const fillColor = parseInt("ff" + chunked, 16); //convert annoying #ffffff string into a number base 10 (and add transparency to match)
    const pixelColor = getPixelfromUInt32(pixelData, x, y);

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
        let currentColor = getPixelfromUInt32(pixelData, x, y);
        if (currentColor === pixelColor) {
            pixelData.data[y * pixelData.width + x] = fillColor;
            s.push(x - 1, y);
            s.push(x + 1, y);
            s.push(x, y + 1);
            s.push(x, y - 1);
        }
    }
}

function getPixelfromUInt32(pixelDataUInt32, x, y) {
    if (x < 0 || y < 0 || x >= pixelDataUInt32.width || y >= pixelDataUInt32.height) {
        return -1;
    } else {
        return pixelDataUInt32.data[y * pixelDataUInt32.width + x]; //reversed byte order!!
    }
}

function getPixelfromUInt8(pixelDataUInt8, x, y, dpr) {
    if (dpr) {
        x = x * dpr;
        y = y * dpr;
    }
    if (x < 0 || y < 0 || x >= pixelDataUInt8.width || y >= pixelDataUInt8.height) {
        return -1;
    } else {
        let thing = 0;
        for (let i = 3; i >= 0; i--) {
            thing += pixelDataUInt8.data[y * pixelDataUInt8.width * 4 + x * 4 + i] * Math.pow(2, 8 * i);
        }
        console.log(thing);
        return (thing);
    }
}

function invertColor(integerColorValue) {
    return 4294967295 - integerColorValue; //purewhite minus input
}

function colorValueToHexCode(integerColorValue) {
    let inverse_byte_hexcode = toString(integerColorValue, 16);
    return reverseHexByteOrder(inverse_byte_hexcode)
}

function hexCodeToColorValue(hexCode) {
    let s = hexCode.substring(1);
    for (let i = 0; i < 3; i++) {

    }

}

function reverseHexByteOrder(hexCode) {
    const chunked = [];
    for (let i = 0; i < hexCode.length; i += 2) {
        chunked.push(hexCode.substring(i, i + 2));
    }
    return chunked.reverse().join('');
}
