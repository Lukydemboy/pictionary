document.addEventListener('DOMContentLoaded', () => {
    getChats();
    getChatHeads();

    socket.on('message received', (message, senderID) => {
        if (!message || !senderID) return;

        const chatWrapper = document.getElementById(`chat-${senderID}`);

        if (!chatWrapper) {
            const friendWrapperAll = document.getElementsByClassName('friend');

            for (let i = 0; i < friendWrapperAll.length; i++) {
                const friendWrapper = friendWrapperAll[i];

                if (friendWrapper.dataset.userid === senderID) {
                    friendWrapper.dataset.messages = parseInt(friendWrapper.dataset.messages) + 1;
                    friendWrapper.classList.remove('hide-ribbon');
                    return;
                }

            }

        };

        const messageWrapper = chatWrapper.getElementsByClassName('chat-messages')[0];

        const receivedMsg = {
            msgBody: message,
            senderID: senderID
        }

        const receivedMsgHTML = makeMessage(receivedMsg);
        
        messageWrapper.appendChild(receivedMsgHTML);
        updatePrivateChatScroll(messageWrapper);

    });

});

function addActionsToBtns(chats) {
    for (let i = 0; i < chats.length; i++) {
        const chat = chats[i];

        if (!chat) return;

        const actionBtnsDOM = chat.getElementsByClassName('action-btn');

        for (let x = 0; x < actionBtnsDOM.length; x++) {
            const actionBtn = actionBtnsDOM[x];

            actionBtn.addEventListener('click', e => {
                const source = e.target.closest('.action-btn');

                if (!source) return;

                const action = source.dataset.action;
                const username = source.dataset.username;

                const chatWrapper = source.closest('.chat-wrapper');
                const friendID = chatWrapper.id.split('-')[1];

                switch(action) {
                    case 'minimize':
                        const chatHeadBubble = `
                            <div id="chathead-${username}" data-userid="${friendID}" style="background-image: url('assets/img/${username}.png');" data-username="${username}" class="msg-bubble"></div>
                        `;

                        const chatHeadDOM = document.getElementById('msgBar');

                        removeChatWrapper(source);

                        addChatHead(chatHeadBubble, chatHeadDOM, username);

                        break;

                    case 'close':
                        removeChatWrapper(source);

                        break;

                    default:
                        return;
                }

            });

        }

    }
}

function getChats() {
    const chats = document.getElementsByClassName('chat-wrapper');
    const chatForms = document.getElementsByClassName('friend-chat-form');

    if (!chats) return;

    addActionsToBtns(chats);
    addSendListener(chatForms);

    return chats;
}

function createChatWrapper(id, username) {
    
    const chatDOM = document.getElementById('allChatWrappers');

    if (!chatDOM) return;

    const existsChatWrapper = document.getElementById(`chat-${id}`)

    if (existsChatWrapper) return;

    const chatWrapperHTML = `
    <div id="chat-${id}" data-username="${username}" class="chat-wrapper">
            <div class="chat-action-bar">
                <div class="chat-user">
                    <div style="background-image: url('assets/img/${username}.png');" class="chat-avatar"></div>
                    <div class="chat-name">${username}</div>
                </div>
                <div class="action-btns">
                    <div data-username="${username}" data-action="minimize" class="action-btn minimize-btn">
                        <img src="assets/img/minimize.svg" alt="Minimize" class="chat-action-btn">
                    </div>
                    <div data-action="close" class="action-btn close-btn">
                        <img src="assets/img/closebutton.svg" alt="Close" class="chat-action-btn">
                    </div>
                </div>
            </div>
            <div class="chat-messages">
                <p class="start-conversation-msg">Start a conversation with <br>${username}</p>
            </div>
            <form class="friend-chat-form">
                <div class="chat-input-wrapper">
                    <input type="text" class="chat-input" placeholder="Aa">
                    <img class="send-icon" src="assets/img/send.svg" alt="Send...">
                    <input type="submit" value="" class="hide">
                </div>
            </form>
        </div>
    </div>`;

    chatDOM.insertAdjacentHTML('beforeend', chatWrapperHTML);
    getMessages(id);

    getChats();

    const newChatWrapper = document.getElementById(`chat-${id}`);

    focusChatInput(newChatWrapper);
    
    const friendWrapper = document.getElementById(`friend-${id}`);
    resetNewMessages(friendWrapper, id);

}

function removeChatWrapper(source) {
    const chatWrapper = source.closest('.chat-wrapper');
    const chatID = chatWrapper.id;

    const chatDOM = document.getElementById(chatID);

    if (!chatDOM) return;

    chatDOM.remove();
}

function getChatHeads() {
    const chatHeads = document.getElementsByClassName('msg-bubble');

    for (let i = 0; i < chatHeads.length; i++) {
        const chatHead = chatHeads[i]

        chatHead.addEventListener('click', e => {
            const source = e.target;

            const username = source.dataset.username;
            const id = source.dataset.userid;

            createChatWrapper(id, username);

            const chatHead = document.getElementById(`chathead-${username}`);

            removeChatHead(chatHead);

        });

    }

}

function addChatHead(html, node, username) {

    if (document.getElementById(`chathead-${username}`)) return;

    node.insertAdjacentHTML('beforeend', html);
    getChatHeads();
}

function removeChatHead(element) {
    element.remove();
}

function addSendListener(forms) {
    for (let i = 0; i < forms.length; i++) {
        const form = forms[i];
        const chatInput = form.getElementsByClassName('chat-input')[0];

        form.addEventListener('submit', e => {
            e.preventDefault();

            const chatWrapper = e.target.closest('.chat-wrapper');
            const messageWrapper = chatWrapper.getElementsByClassName('chat-messages')[0];

            if (!chatInput.value || chatInput.value === "") return;

            // Send message to DB
            const act = 'add'
            const senderID = user.userID;
            const type = 'Private Message';
            const recevierID = chatWrapper.id.split('-')[1];
            const receiverUsername = chatWrapper.dataset.username;
            const msg = chatInput.value

            const xhr = new XMLHttpRequest();
            const body = `act=${act}&senderid=${senderID}&type=${type}&recid=${recevierID}&msg=${msg}`;

            xhr.open('POST', 'admin/php/message.php', true);
            xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

            xhr.send(body);

            xhr.onload = function () {
                if (xhr.status == 200) {
                    // Add to chat wrapper (make function)
                    const message = {
                        senderID: senderID,
                        type: type,
                        recevierID: recevierID,
                        msgBody: msg
                    }

                    const msgHTML = makeMessage(message);
                    messageWrapper.appendChild(msgHTML);

                    chatInput.value = '';

                    updatePrivateChatScroll(messageWrapper);

                    socket.emit('send private message', senderID, receiverUsername, msg)

                } else {
                    notificate('warning', 'Your message could not be sent.')
                }
            };

            xhr.onerror = function () {
                notificate('warning', 'Your message could not be sent.')
            };

        });

    }
}

function getMessages(friendID) {
    const chatWrapper = document.getElementById(`chat-${friendID}`);
    const messagesWrapper = chatWrapper.getElementsByClassName('chat-messages')[0];

    const xhr = new XMLHttpRequest();

    xhr.open('POST', 'admin/php/message.php', true);
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

    const act = 'get';
    const userID = user.userID;
    const body = `act=${act}&friendid=${friendID}&userid=${userID}`;

    xhr.send(body);

    xhr.onload = function () {
        if (xhr.status === 200) {
            // Place all messages in HTML
            const messages = JSON.parse(xhr.response);
            
            fillChatWrapper(messages, messagesWrapper);

        } else {
            notificate('warning', 'Could not fetch the messages for this person!');
        }
    };

    xhr.onerror = () => {
        notificate('warning', 'Could not fetch the messages for this person!');
    };

}

function readMessages(friendID) {

    const act = 'readMessages';
    const userID = user.userID;
    const body = `act=${act}&userid=${userID}&friendid=${friendID}`;

    const xhr = new XMLHttpRequest();

    xhr.open('POST', 'admin/php/message.php');

    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

    xhr.send(body);

    xhr.onload = function () {
        if (xhr.status != 200) { 
            console.log('Error reading messages!');
        } 
    };

}

function fillChatWrapper(messages, node) {
    if (messages.length == 0) return;

    node.innerHTML = '';

    for (let i = 0; i < messages.length; i++) {
        const msg = messages[i];
        const msgWrapper = makeMessage(msg);
        node.appendChild(msgWrapper);
    }

    updatePrivateChatScroll(node);

}

function makeMessage(message) {
    const messageWrapper = document.createElement('div');
    messageWrapper.classList.add('message');

    if (message.senderID === user.userID) {
        messageWrapper.classList.add('sent');
    } else {
        messageWrapper.classList.add('received');
    }

    messageWrapper.innerHTML = message.msgBody;

    return messageWrapper;

}

function updatePrivateChatScroll(messageWrapper) {
    messageWrapper.scrollTop = messageWrapper.scrollHeight;

    // Get friendWrapper and UserID to mark the messages as read
    const chatWrapper = messageWrapper.closest('.chat-wrapper');
    const id = chatWrapper.id.split('-')[1];

    const friendWrapper = document.getElementById(`friend-${id}`);

    resetNewMessages(friendWrapper, id);
}

function focusChatInput(chatWrapper) {
    const chatInput = chatWrapper.getElementsByClassName('chat-input')[0];
    if (!chatInput) return;
    chatInput.focus();
}

function resetNewMessages(friendWrapper, friendID) {
    friendWrapper.dataset.messages = 0;
    friendWrapper.classList.add('hide-ribbon');
    readMessages(friendID);
}