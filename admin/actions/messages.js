document.addEventListener('DOMContentLoaded', e => {
    getChats();
    getChatHeads();
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

                switch(action) {
                    case 'minimize':
                        const chatHeadBubble = `
                            <div style="background-image: url('assets/img/${username}.png');" data-username="${username}" class="msg-bubble"></div>
                        `;

                        const chatHeadDOM = document.getElementById('msgBar');

                        removeChatWrapper(source);

                        addChatHead(chatHeadBubble, chatHeadDOM);

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

    if (!chats) return;

    addActionsToBtns(chats);

    return chats;
}

function createChatWrapper(username) {
    const chatDOM = document.getElementById('allChatWrappers');

    if (!chatDOM) return;

    const chatWrapperHTML = `
    <div id="chat-1" class="chat-wrapper">
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
            </div>
            <form>
                <div class="chat-input-wrapper">
                    <input type="text" class="chat-input" placeholder="Aa">
                    <img class="send-icon" src="assets/img/send.svg" alt="Send...">
                    <input type="submit" value="" class="hide">
                </div>
            </form>
        </div>
    </div>`;

    chatDOM.insertAdjacentHTML('beforeend', chatWrapperHTML);

    getChats();

}

function removeChatWrapper(source) {
    const chatWrapper = source.closest('.chat-wrapper');
    const chatID = chatWrapper.id;

    const chatDOM = document.getElementById(chatID);

    chatDOM.remove();
}

function getChatHeads() {
    const chatHeads = document.getElementsByClassName('msg-bubble');

    for (let i = 0; i < chatHeads.length; i++) {
        const chatHead = chatHeads[i]

        chatHead.addEventListener('click', e => {
            const source = e.target;

            const username = source.dataset.username;

            createChatWrapper(username);

            const chatHead = document.getElementById(`bubble-${username}`);

            removeChatHead(chatHead);

        });

    }

}

function addChatHead(html, node) {
    node.insertAdjacentHTML('beforeend', html);
}

function removeChatHead(element) {
    element.remove();
}



