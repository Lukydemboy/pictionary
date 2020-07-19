document.addEventListener('DOMContentLoaded', e => {
    let bounds;
     
    const canvas    = document.getElementById('canvas');
    const ctx       = canvas.getContext('2d');
    const clearDOM  = document.getElementById('clear');
    const widthDOM = document.getElementById('pencilWidth');
    const historyBtn = document.getElementById('historyDraw');
    const drawHistory = [];
    
    let pencilColor = '#000000';

    const colorPickers = document.getElementsByClassName('color');

    socket.on('draw', onDrawingEvent);

    resizeCanvas(canvas);

    var current = {
        color: '#000000',
        brushSize: 10
    };

    let painting = false;


    function drawLine(x0, y0, x1, y1, color, brushSize, emit, bounds) {

        if (user.playingRoom.drawingUser != user.username) return;

        // Brush Settings
        ctx.strokeStyle = color;
        ctx.lineWidth = brushSize;
        ctx.lineCap = 'round';

        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.stroke();
        ctx.closePath();

        if (!emit) { return; }

        socket.emit('draw', {
            x0: bounds ? x0 + bounds.x : x0,
            y0: bounds ? y0 + bounds.y : y0,
            x1: bounds ? x1 + bounds.x : x1,
            y1: bounds ? y1 + bounds.y : y1,
            color: color,
            brushSize: brushSize,
            bounds: bounds,
            room: sessionStorage.getItem('currentRoom')
        });
        
    }

    function SomeoneDrawsLine(x0, y0, x1, y1, color, brushSize, emit) {

        // Brush Settings
        ctx.strokeStyle = color;
        ctx.lineWidth   = brushSize;
        ctx.lineCap     = 'round';

        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.stroke();
        ctx.closePath();

    }

    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('mouseout', onMouseUp);
    canvas.addEventListener('mousemove', throttle(onMouseMove, 10));


    // Mouse events
    function onMouseDown(e) {
        bounds = e.target.getBoundingClientRect();

        painting = true;
        current.x = e.clientX - bounds.x || e.touches[0].clientX;
        current.y = e.clientY - bounds.y|| e.touches[0].clientY;


        console.log(bounds);
    }

    function onMouseUp(e) {
        if (!painting) { return; }
        bounds = e.target.getBoundingClientRect();

        painting = false;
        drawLine(current.x, current.y, e.clientX - bounds.x || e.touches[0].clientX, e.clientY - bounds.y || e.touches[0].clientY, current.color, true, bounds);
    }

    function onMouseMove(e) {
        if (!painting) { return; }
        bounds = e.target.getBoundingClientRect();
        console.log(`data.x0: ${e.clientX}`);
        console.log(`externalBounds: ${bounds.x}`);
        console.log(e.clientX - bounds.x);

        const drawData = {
            e: e,
            current: current
        }

        drawLine(current.x, current.y, e.clientX - bounds.x || e.touches[0].clientX, e.clientY - bounds.y || e.touches[0].clientY, current.color, current.brushSize, true, bounds);
        current.x = e.clientX - bounds.x || e.touches[0].clientX;
        current.y = e.clientY - bounds.y || e.touches[0].clientY;

        

        drawHistory.push(drawData);
    }

    // Clear canvas
    clearDOM.addEventListener('click', e => {
        clearCanvas(ctx, canvas);
        clearHistory();
    });

    historyBtn.addEventListener('click', e => {
        bounds = canvas.getBoundingClientRect();
        console.log(drawHistory);
        drawHistory.forEach(el => {
            console.log('bounds.X:', bounds.x);
            console.log('current.X:', el.current.x);
            drawLine(el.current.x, el.current.y, el.e.clientX - bounds.x || el.e.touches[0].clientX, el.e.clientY - bounds.y || el.e.touches[0].clientY,
                     el.current.color, el.current.brushSize, true, bounds);            
        });
    });

    // Get brushSize
    widthDOM.addEventListener('change', e => {
        current.brushSize = widthDOM.value;
    });

    for (let i = 0; i < colorPickers.length; i++) {
        const colorPicker = colorPickers[i];
        const color = colorPicker.dataset.color;

        colorPicker.style.backgroundColor = color;

        colorPicker.addEventListener('click', e => {
            current.color = color;
        });

    }

    socket.on('clear canvas', () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    });

    function onDrawingEvent(data) {
        if (data.bounds) SomeoneDrawsLine(data.x0 - data.bounds.x, data.y0 - data.bounds.y, data.x1 - data.bounds.x, data.y1 - data.bounds.y, data.color, data.brushSize, data.bounds);
    }

})

// Resize
function resizeCanvas(canvas) {
    canvas.height = '600';
    canvas.width = '800';
}

function clearCanvas(ctx, canvas) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    socket.emit('clear', user.playingRoom);
}

// limit the number of events per second
function throttle(callback, delay) {
    var previousCall = new Date().getTime();
    return function () {
        var time = new Date().getTime();

        if ((time - previousCall) >= delay) {
            previousCall = time;
            callback.apply(null, arguments);
        }
    };
}

function clearHistory() {
    drawHistory = [];
}
