const canvas = document.getElementById('pizarra');
const ctx = canvas.getContext('2d');
const myIdDisplay = document.getElementById('my-id');
const peerIdInput = document.getElementById('peer-id-input');
const connectBtn = document.getElementById('connect-btn');
const statusMsg = document.getElementById('connection-status');

// AJUSTE CRÍTICO: Tamaño real sin estiramientos
function resizeCanvas() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

let drawing = false;
let lastX = 0;
let lastY = 0;
let peer = new Peer();
let conn;

peer.on('open', (id) => myIdDisplay.innerText = id);

peer.on('connection', (connection) => {
    conn = connection;
    setupConnection();
});

connectBtn.addEventListener('click', () => {
    conn = peer.connect(peerIdInput.value);
    setupConnection();
});

function setupConnection() {
    conn.on('open', () => {
        statusMsg.innerText = "Estado: ¡CONECTADO!";
        statusMsg.style.color = "#28a745";
    });
    conn.on('data', (data) => {
        if (data.type === 'draw') remoteDraw(data);
        if (data.type === 'clear') ctx.clearRect(0, 0, canvas.width, canvas.height);
    });
}

// LÓGICA DE DIBUJO REFINADA
canvas.addEventListener('mousedown', (e) => {
    drawing = true;
    [lastX, lastY] = [e.offsetX, e.offsetY];
});

canvas.addEventListener('mousemove', (e) => {
    if (!drawing) return;

    const x = e.offsetX;
    const y = e.offsetY;
    const color = document.getElementById('color-picker').value;
    const size = document.getElementById('size-picker').value;

    localDraw(lastX, lastY, x, y, color, size);

    if (conn && conn.open) {
        conn.send({
            type: 'draw',
            x1: lastX, y1: lastY,
            x2: x, y2: y,
            color: color,
            size: size
        });
    }
    [lastX, lastY] = [x, y];
});

canvas.addEventListener('mouseup', () => drawing = false);
canvas.addEventListener('mouseout', () => drawing = false);

function localDraw(x1, y1, x2, y2, color, size) {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = size;
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.closePath();
}

function remoteDraw(d) {
    localDraw(d.x1, d.y1, d.x2, d.y2, d.color, d.size);
}

document.getElementById('clear-btn').addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (conn && conn.open) conn.send({ type: 'clear' });
});

document.getElementById('save-btn').addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'pizarra-p2paint.png';
    link.href = canvas.toDataURL();
    link.click();
});
