const canvas = document.getElementById('pizarra');
const ctx = canvas.getContext('2d');
const myIdDisplay = document.getElementById('my-id');
const peerIdInput = document.getElementById('peer-id-input');
const connectBtn = document.getElementById('connect-btn');
const statusMsg = document.getElementById('connection-status');

// Configuración inicial del Canvas
canvas.width = window.innerWidth * 0.9;
canvas.height = window.innerHeight * 0.7;
ctx.lineCap = 'round';
ctx.lineJoin = 'round';

let drawing = false;
let peer;
let conn;

// 1. Inicializar PeerJS
peer = new Peer(); // PeerJS genera un ID automático

peer.on('open', (id) => {
    myIdDisplay.innerText = id;
});

// 2. Escuchar conexiones entrantes (Cuando Madrid llama a Barcelona)
peer.on('connection', (connection) => {
    conn = connection;
    setupConnection();
});

// 3. Función para conectar a otro (Cuando Barcelona llama a Madrid)
connectBtn.addEventListener('click', () => {
    const peerId = peerIdInput.value;
    conn = peer.connect(peerId);
    setupConnection();
});

function setupConnection() {
    conn.on('open', () => {
        statusMsg.innerText = "Estado: ¡CONECTADO!";
        statusMsg.style.color = "green";
    });

    // Recibir datos de dibujo
    conn.on('data', (data) => {
        if (data.type === 'draw') {
            remoteDraw(data);
        } else if (data.type === 'clear') {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    });
}

// 4. Lógica de Dibujo
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);

function startDrawing(e) {
    drawing = true;
    draw(e);
}

function stopDrawing() {
    drawing = false;
    ctx.beginPath();
}

function draw(e) {
    if (!drawing) return;

    const x = e.offsetX;
    const y = e.offsetY;
    const color = document.getElementById('color-picker').value;
    const size = document.getElementById('size-picker').value;

    ctx.lineWidth = size;
    ctx.strokeStyle = color;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);

    // Enviar coordenadas al otro usuario
    if (conn && conn.open) {
        conn.send({
            type: 'draw',
            x: x,
            y: y,
            color: color,
            size: size,
            isNewPath: false
        });
    }
}

function remoteDraw(data) {
    ctx.lineWidth = data.size;
    ctx.strokeStyle = data.color;
    ctx.lineTo(data.x, data.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(data.x, data.y);
}

// Limpiar pizarra
document.getElementById('clear-btn').addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (conn && conn.open) conn.send({ type: 'clear' });
});

// Guardar como imagen
document.getElementById('save-btn').addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'pizarra.png';
    link.href = canvas.toDataURL();
    link.click();
});
