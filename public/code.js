const socket = io("https://heyhommie.onrender.com");


const loginScreen = document.getElementById('login-screen');
const chatScreen = document.getElementById('chat-screen');
const usernameInput = document.getElementById('username-input');
const roomInput = document.getElementById('room-input');
const startChatBtn = document.getElementById('start-chat-btn');

const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const chatMessages = document.getElementById('chat-messages');
const roomNameDisplay = document.getElementById('room-name');

let username = "";
let room = "";

// Start Chat Button - Single Correct Listener
startChatBtn.addEventListener('click', () => {
  username = usernameInput.value.trim();
  room = roomInput.value.trim();
  if (username !== "" && room !== "") {
    socket.emit('join-room', { name: username, room }, () => {
      loginScreen.style.display = "none";
      chatScreen.style.display = "flex";
      roomNameDisplay.innerText = room;
    });
  }
});

// Send Message
sendBtn.addEventListener('click', () => {
  const message = messageInput.value.trim();
  if (message !== "") {
    appendMessage(`You: ${message}`, 'right');
    socket.emit('send', message);
    messageInput.value = "";
  }
});

// Append message to chat
function appendMessage(message, position) {
  const msgDiv = document.createElement('div');
  msgDiv.classList.add(position); // 'left', 'right', or 'center'
  msgDiv.classList.add('message');
  msgDiv.innerText = message;
  chatMessages.appendChild(msgDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Emoji support
const emojiBtn = document.getElementById('emoji-btn');
const emojiPicker = document.getElementById('emoji-picker');

emojiBtn.addEventListener('click', () => {
  emojiPicker.style.display = emojiPicker.style.display === 'none' ? 'block' : 'none';
});

emojiPicker.addEventListener('emoji-click', event => {
  messageInput.value += event.detail.unicode;
  emojiPicker.style.display = 'none';
});

// Socket Listeners
socket.on('user-joined', name => {
  appendMessage(`${name} joined the conversation`, 'center');
});

socket.on('receive', data => {
  appendMessage(`${data.name}: ${data.message}`, 'left');
});

socket.on('user-left', name => {
  appendMessage(`${name} left the conversation`, 'center');
});
