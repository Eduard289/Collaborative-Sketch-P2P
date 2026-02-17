// --- CONFIGURACIÓN DE ELEMENTOS ---
const canvas = document.getElementById('pizarra');
const ctx = canvas.getContext('2d');
const usernameInput = document.getElementById('username-input');
const saveUserBtn = document.getElementById('save-username-btn');
const myIdDisplay = document.getElementById('my-id');
const peerIdInput = document.getElementById('peer-id-input');
const connectBtn = document.getElementById('connect-btn');
const statusMsg = document.getElementById('connection-status');
const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const sendChatBtn = document.getElementById('send-chat');

// --- GESTIÓN DE USUARIO Y LOCALSTORAGE ---
let myName = localStorage.getItem('p2p_username') || "Usuario Anónimo";
usernameInput.value = myName;

saveUserBtn.addEventListener('click', () => {
    myName = usernameInput.value.trim() || "Usuario Anónimo";
    localStorage.setItem('p2p_username', myName);
    alert("Perfil actualizado: " + myName);
});

// --- CONFIGURACIÓN DEL LIENZO (CANVAS) ---
function resizeCanvas() {
    // Ajustar tamaño visual al tamaño real de la ventana
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    // Mantener estilos de línea tras el redimensionado
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// --- LÓGICA DE CONEXIÓN P2P (PEERJS) ---
let drawing = false;
let lastX = 0, lastY = 0;
let conn;
const peer = new Peer(); // Genera un ID aleatorio único

// Mostrar mi ID cuando PeerJS esté listo
peer.on('open', (id) => {
    myIdDisplay.innerText = id;
});

// ESCUCHAR: Cuando alguien se conecta a MI ID (Servidor/Host)
peer.on('connection', (c) => {
    conn = c;
    setupConnection();
});

// CONECTAR: Cuando yo me conecto al ID de OTRO (Cliente)
connectBtn.addEventListener('click', () => {
    const targetId = peerIdInput.value.trim();
    if (!targetId) return alert("Introduce un ID válido");
    
    conn = peer.connect(targetId);
    setupConnection();
});

// --- GESTIÓN DE DATOS ENTRANTES (DIBUJO Y CHAT) ---
function setupConnection() {
    conn.on('open', () => {
        statusMsg.innerText = "Estado: CONECTADO";
        statusMsg.style.color = "#27ae60";
        addChatMessage("Sistema", "¡Conexión establecida con éxito!");
    });

    conn.on('data', (data) => {
        if (data.type === 'draw') {
            remoteDraw(data);
        } else if (data.type === 'chat') {
            addChatMessage(data.user, data.msg, false);
        } else if (data.type === 'clear') {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    });

    conn.on('close', () => {
        statusMsg.innerText = "Estado: DESCONECTADO";
        statusMsg.style.color = "#e74c3c";
        addChatMessage("Sistema", "El compañero se ha ido.");
    });
}

// --- LÓGICA DE DIBUJO ---
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

    // Dibujo local
    localDraw(lastX, lastY, x, y, color, size);

    // Enviar a través de la red
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

// --- LÓGICA DEL CHAT ---
function sendMsg() {
    const msg = chatInput.value.trim();
    if (!msg) return;

    if (conn && conn.open) {
        conn.send({
            type: 'chat',
            msg: msg,
            user: myName
        });
        addChatMessage(myName, msg, true);
        chatInput.value = "";
    } else {
        addChatMessage("Sistema", "Error: No hay conexión activa.");
    }
}

sendChatBtn.addEventListener('click', sendMsg);
chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMsg();
});

function addChatMessage(author, msg, isMe = false) {
    const div = document.createElement('div');
    div.classList.add('msg');
    if (isMe) div.classList.add('me');
    div.innerHTML = `<strong>${author}:</strong> ${msg}`;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight; // Auto-scroll al final
}

// --- BOTONES DE ACCIÓN ---
document.getElementById('clear-btn').addEventListener('click', () => {
    if (confirm("¿Limpiar toda la pizarra?")) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (conn && conn.open) conn.send({ type: 'clear' });
    }
});

document.getElementById('save-btn').addEventListener('click', () => {
    const link = document.createElement('a');
    const date = new Date().toISOString().slice(0,10);
    link.download = `pizarra-asenjo-${date}.png`;
    link.href = canvas.toDataURL();
    link.click();
});
