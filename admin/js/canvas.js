// History
let drawHistory = [];
// let drawHistoryTemp = [];
let drawLineHistory = [];

document.addEventListener('DOMContentLoaded', e => {
     
    const canvas        = document.getElementById('canvas');
    const ctx           = canvas.getContext('2d');
    const clearDOM      = document.getElementById('clear');
    const widthDOM      = document.getElementById('pencilWidth');
    const undoBtn       = document.getElementById('undoBtn');

    let bounds = canvas.getBoundingClientRect();

    let pencilColor = '#000000';

    const colorPickers = document.getElementsByClassName('color');

    socket.on('draw', onDrawingEvent);

    resizeCanvas(canvas);

    let current = {
        color: '#000000',
        brushSize: 10
    };

    let painting = false;


    function drawLine(x0, y0, x1, y1, color, brushSize, emit, bounds) {

        if (user.playingRoom.drawingUser != user.username || !bounds) return;

        // Brush Settings
        ctx.strokeStyle = color;
        ctx.lineWidth = brushSize;
        ctx.lineCap = 'round';

        ctx.beginPath();
        ctx.moveTo(x0 - bounds.x, y0 - bounds.y);
        ctx.lineTo(x1 - bounds.x, y1 - bounds.y);
        ctx.stroke();
        ctx.closePath();

        if (!emit) { return; }

        socket.emit('draw', {
            x0: x0,
            y0: y0,
            x1: x1,
            y1: y1,
            color: color,
            brushSize: brushSize,
            bounds: bounds,
            room: sessionStorage.getItem('currentRoom')
        });
        
    }

    function autoDrawLine(x0, y0, x1, y1, color, brushSize, bounds) {
        // Brush Settings
        ctx.strokeStyle = color;
        ctx.lineWidth = brushSize;
        ctx.lineCap = 'round';

        ctx.beginPath();
        ctx.moveTo(x0 - bounds.x, y0 - bounds.y);
        ctx.lineTo(x1 - bounds.x, y1 - bounds.y);
        ctx.stroke();
        ctx.closePath();
    }

    function SomeoneDrawsLine(x0, y0, x1, y1, color, brushSize, bounds) {

        // Brush Settings
        ctx.strokeStyle = color;
        ctx.lineWidth   = brushSize;
        ctx.lineCap     = 'round';

        ctx.beginPath();
        ctx.moveTo(x0 - bounds.x , y0 - bounds.y);
        ctx.lineTo(x1 - bounds.x , y1 - bounds.y);
        ctx.stroke();
        ctx.closePath();

    }

    function undo(drawHistory) {
        
        drawHistory.pop();

        clearCanvas(ctx, canvas);

        drawHistory.forEach(el => {

            el.forEach(drawData => {
                drawLine(drawData.current.x, drawData.current.y, drawData.clientX, drawData.clientY,
                         drawData.current.color, drawData.current.brushSize, true, bounds);
            });

        });

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

        updateBounds();

        drawLine(current.x, current.y, e.clientX || e.touches[0].clientX, e.clientY || e.touches[0].clientY, current.color, true, bounds);

        const drawData = {
            e: {
                ...e
            },
            current: {
                ...current
            },
            clientX: e.clientX,
            clientY: e.clientY
        }

        drawLineHistory.push(drawData);

        (drawHistory.length > 0 ? drawHistory[drawHistory.length] = drawLineHistory : drawHistory[0] = drawLineHistory);

        drawLineHistory = [];

        painting = false;

    }

    function onMouseMove(e) {
        if (!painting) { return; }

        updateBounds();

        drawLine(current.x, current.y, e.clientX || e.touches[0].clientX, e.clientY || e.touches[0].clientY, current.color, current.brushSize, true, bounds);

        const drawData = {
            e: {
                ...e
            },
            current: {
                ...current
            },
            clientX: e.clientX,
            clientY: e.clientY
        }

        current.x = e.clientX || e.touches[0].clientX;
        current.y = e.clientY || e.touches[0].clientY;

        drawLineHistory.push(drawData);
    }

    // Clear canvas
    clearDOM.addEventListener('click', e => {
        clearCanvas(ctx, canvas);
        clearHistory();
    });

    // Get brushSize
    widthDOM.addEventListener('change', e => {
        current.brushSize = widthDOM.value;
    });

    undoBtn.addEventListener('click', e => {
        undo(drawHistory);
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
        updateBounds();
        if (data) SomeoneDrawsLine(data.x0, data.y0, data.x1, data.y1, data.color, data.brushSize, bounds);
    }

    socket.on('drawing received', drawData => {
        drawHistoryDrawing(drawData)
    });

    function drawHistoryDrawing(drawData) {
        updateBounds();
        painting = true;

        console.log(drawData);

        drawData.forEach(actionArray => {

            actionArray.forEach(el => {
                autoDrawLine(el.current.x, el.current.y, el.clientX, el.clientY, el.current.color, el.current.brushSize, bounds);
            });

        });

        painting = false;

    }

    window.addEventListener('resize', updateBounds);


    function updateBounds() {
        bounds = canvas.getBoundingClientRect();
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

