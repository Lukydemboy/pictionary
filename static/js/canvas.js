document.addEventListener('DOMContentLoaded', e => {
    const canvas    = document.getElementById('canvas');
    const ctx       = canvas.getContext('2d');
    const clearDOM  = document.getElementById('clear');
    const widthDOM  = document.getElementById('pencilWidth');
    
    let pencilColor = '#000000';

    const colorPickers = document.getElementsByClassName('color');

    resizeCanvas(canvas);

    let painting = false;

    function startPosition(e) {
        painting = true;
        draw(e);
    }

    function finishedPosition() {
        painting = false;
        ctx.beginPath();
    }

    function draw(e) {
        if(!painting) return;

        ctx.lineWidth = widthDOM.value;
        ctx.lineCap = "round";
        ctx.strokeStyle = pencilColor;

        ctx.lineTo(e.clientX, e.clientY);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(e.clientX, e.clientY);

    }

    canvas.addEventListener('mousedown', startPosition);
    canvas.addEventListener('mouseup', finishedPosition);
    canvas.addEventListener('mousemove', draw);

    // Clear canvas
    clearDOM.addEventListener('click', e => {
        clearCanvas(ctx, canvas);
    })

    for (let i = 0; i < colorPickers.length; i++) {
        const colorPicker = colorPickers[i];
        const color = colorPicker.dataset.color;

        colorPicker.style.backgroundColor = color;

        colorPicker.addEventListener('click', e => {
            pencilColor = color;
        });

    }

})

// Resize
function resizeCanvas(canvas) {
    canvas.height = window.innerHeight - 150;
    canvas.width = window.innerWidth - 50;
}

function clearCanvas(ctx, canvas) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}
