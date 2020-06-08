document.addEventListener('DOMContentLoaded', e => {
    const canvas    = document.getElementById('canvas');
    const ctx       = canvas.getContext('2d');
    const clearDOM  = document.getElementById('clear');
    const widthDOM  = document.getElementById('pencilWidth');
    
    let pencilColor = '#000000';

    const colorPickers = document.getElementsByClassName('color');

    socket.on('draw', onDrawingEvent);

    resizeCanvas(canvas);

    const canvasOffsetHeight    = canvas.offsetHeight;
    const canvasOffsetWidth     = canvas.offsetWidth;

    var current = {
        color: '#000000',
        brushSize: 10
    };

    let painting = false;


    function drawLine(x0, y0, x1, y1, color, brushSize, emit) {

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
        const w = canvas.width;
        const h = canvas.height;

        socket.emit('draw', {
            x0: x0 / w,
            y0: y0 / h,
            x1: x1 / w,
            y1: y1 / h,
            color: color,
            brushSize: brushSize,
            room: sessionStorage.getItem('currentRoom')
        });
        
        console.log(`You are drawing something in ${sessionStorage.getItem('currentRoom')}`);

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
        painting = true;
        current.x = e.clientX || e.touches[0].clientX;
        current.y = e.clientY || e.touches[0].clientY;
    }

    function onMouseUp(e) {
        if (!painting) { return; }
        painting = false;
        drawLine(current.x, current.y, e.clientX || e.touches[0].clientX, e.clientY || e.touches[0].clientY, current.color, true);
    }

    function onMouseMove(e) {
        if (!painting) { return; }
        drawLine(current.x, current.y, e.clientX || e.touches[0].clientX, e.clientY || e.touches[0].clientY, current.color, current.brushSize, true);
        current.x = e.clientX || e.touches[0].clientX;
        current.y = e.clientY || e.touches[0].clientY;
    }

    // Clear canvas
    clearDOM.addEventListener('click', e => {
        clearCanvas(ctx, canvas);
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
        console.log(data);

        const w = canvas.width;
        const h = canvas.height;

        // var bounds = e.target.getBoundingClientRect();

        SomeoneDrawsLine(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color, data.brushSize);
    }

})

// Resize
function resizeCanvas(canvas) {
    canvas.height = window.innerHeight;
    canvas.width = window.innerWidth;

    canvas.style.width = '100%';
    canvas.style.height = '100%';
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
