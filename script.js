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

let myName = localStorage.getItem('p2p_username') || "Usuario Anónimo";
usernameInput.value = myName;

saveUserBtn.addEventListener('click', () => {
    myName = usernameInput.value;
    localStorage.setItem('p2p_username', myName);
    alert("Nombre guardado: " + myName);
});

function resizeCanvas() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

let drawing = false;
let lastX = 0, lastY = 0;
let conn;
const peer = new Peer();

peer.on('open', (id) => myIdDisplay.innerText = id);
peer.on('connection', (c) => { conn = c; setupConnection(); });
connectBtn.addEventListener('click', () => { conn = peer.connect(peerIdInput.value); setupConnection(); });

function setupConnection() {
    conn.on('open', () => {
        statusMsg.innerText = "Estado: CONECTADO";
        statusMsg.style.color = "#27ae60";
        addChatMessage("Sistema", "Has entrado en la pizarra.");
    });
    conn.on('data', (data) => {
        if (data.type === 'draw') remoteDraw(data);
        if (data.type === 'clear') ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (data.type === 'chat') addChatMessage(data.user, data.msg);
    });
}

// DIBUJO
canvas.addEventListener('mousedown', (e) => { drawing = true; [lastX, lastY] = [e.offsetX, e.offsetY]; });
canvas.addEventListener('mousemove', (e) => {
    if (!drawing) return;
    const x = e.offsetX, y = e.offsetY;
    const color = document.getElementById('color-picker').value;
    const size = document.getElementById('size-picker').value;
    localDraw(lastX, lastY, x, y, color, size);
    if (conn && conn.open) {
        conn.send({ type: 'draw', x1: lastX, y1: lastY, x2: x, y2: y, color: color, size: size });
    }
    [lastX, lastY] = [x, y];
});
canvas.addEventListener('mouseup', () => drawing = false);

function localDraw(x1, y1, x2, y2, color, size) {
    ctx.beginPath(); ctx.strokeStyle = color; ctx.lineWidth = size;
    ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
}
function remoteDraw(d) { localDraw(d.x1, d.y1, d.x2, d.y2, d.color, d.size); }

// CHAT CON NOMBRES
function sendMsg() {
    const msg = chatInput.value;
    if (!msg || !conn || !conn.open) return;
    conn.send({ type: 'chat', msg: msg, user: myName });
    addChatMessage(myName, msg, true);
    chatInput.value = "";
}
sendChatBtn.addEventListener('click', sendMsg);
chatInput.addEventListener('keypress', (e) => { if(e.key === 'Enter') sendMsg(); });

function addChatMessage(author, msg, isMe = false) {
    const div = document.createElement('div');
    div.classList.add('msg');
    if (isMe) div.classList.add('me');
    div.innerHTML = `<strong>${author}:</strong> ${msg}`;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

document.getElementById('clear-btn').addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (conn && conn.open) conn.send({ type: 'clear' });
});

document.getElementById('save-btn').addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = `pizarra-asenjo-${new Date().toLocaleDateString()}.png`;
    link.href = canvas.toDataURL();
    link.click();
});
