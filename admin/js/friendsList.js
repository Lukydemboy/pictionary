document.addEventListener('DOMContentLoaded', e => {

    const friendsListDOM = document.getElementById('friendListBody');
    const friendsListHideDOM = document.getElementsByClassName('friends-list--slide')[0];
    const friendListHideIconDOM = document.getElementById('friendListSlideIcon');

    const friendContextMenuDOM = document.getElementById('friendCtxMenu');
    const friendCtxMenuItemsAll = document.getElementsByClassName('friend-context-menu__items--item');
    const friendCtxMenuHeader = document.getElementById('friendCtxMenuHeader');
    const friendCtxMenuInvite = document.getElementById('friendCtxMenuInvite');
    const friendCtxMenuDelete = document.getElementById('friendCtxMenuDelete');

    // Show or hide friendslist
    friendsListHideDOM.addEventListener('click', e => {
        const source = e.target.closest('.friends-list');
        
        if (source.classList.contains('hidden')) {
            friendListHideIconDOM.src = 'assets/img/hide.svg';
            source.classList.remove('hidden');
        } else {
            friendListHideIconDOM.src = 'assets/img/show.svg';
            source.classList.add('hidden');
        }

    });

    // Get friends on load
    getFriendsList(friendsListDOM);
    
    socket.on('friend request accepted', () => {
        getFriendsList(friendsListDOM);
    });

    socket.on('user has come online', () => {
        getFriendsList(friendsListDOM);
    });

    socket.on('user has gone offline', () => {
        getFriendsList(friendsListDOM);
    });

    socket.on('friend deleted', e => {
        getFriendsList(friendsListDOM);
    });

    addContextMenuEventListeners(friendCtxMenuItemsAll);

    // Add eventListener to open ctxMenu
    document.addEventListener('contextmenu', e => {
        const friend = e.target.closest('.friend');
        if (friend) {
            e.preventDefault();

            // Username
            friendCtxMenuHeader.innerHTML = friend.dataset.username;

            // Invite
            friendCtxMenuInvite.dataset.userid = friend.dataset.userid;
            friendCtxMenuInvite.dataset.username = friend.dataset.username;

            // Delete
            friendCtxMenuDelete.dataset.userid = friend.dataset.userid;
            friendCtxMenuDelete.dataset.username = friend.dataset.username;

            // Show first to get the info
            friendContextMenuDOM.classList.remove('hide');

            const ctxMenuInfo = friendContextMenuDOM.getBoundingClientRect();

            // Handle ctxMenu out of screen
            const left = ( ((e.pageX + ctxMenuInfo.width) > window.innerWidth) ? (window.innerWidth - ctxMenuInfo.width) : e.pageX);
            const top = (((e.pageY + ctxMenuInfo.height) > window.innerHeight) ? (window.innerHeight - ctxMenuInfo.hieght) : e.pageY);

            friendContextMenuDOM.style.left = `${left}px`;
            friendContextMenuDOM.style.top = `${top}px`;

        }
    }, false);

    // Add eventListener to close ctxMenu
    window.addEventListener("click", e => {
        if (!friendContextMenuDOM.classList.contains('hide')) friendContextMenuDOM.classList.add('hide');
    });

    socket.on('invite sent', (username) => {
        io.emit('imvite received', username);
    });

});

function getFriendsList(node) {
    // Get friends from DB
    const xhr = new XMLHttpRequest();

    xhr.open('POST', 'admin/php/getFriends.php', true);

    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

    xhr.send();

    xhr.onload = () => {
        if (xhr.status == 200) {

            if (xhr.response === '') return;

            const friends = JSON.parse(xhr.response);

            node.innerHTML = '';

            const friendsArr = [];
            for (let i = 0; i < friends.length; i++) {
                const friend = friends[i];

                if (!friendsArr.includes(friend.username)) {
                    createFriendsList(friend, node);
                }

                friendsArr.push(friend.username);

            }

            // Add clickevents to start the chats
            const friendsAllDOM = document.getElementsByClassName('friend');


            for (let i = 0; i < friendsAllDOM.length; i++) {
                const friend = friendsAllDOM[i];

                friend.addEventListener('click', e => {
                    const source = e.target.closest('.friend');

                    const username = source.dataset.username;
                    const id = source.dataset.userid;

                    createChatWrapper(id, username);
                });
            }

        }
    };
}

function createFriendsList(friend, node) {

    const friendWrapper = document.createElement('div');
    friendWrapper.classList.add('friend');
    friendWrapper.dataset.username  = friend.username;
    friendWrapper.dataset.userid    = friend.userID;
    friendWrapper.id                = `friend-${friend.userID}`;
    
    // Get messgs from db (to get unread messages per friend)
    getUnreadMessagesCount(friend.userID, friendWrapper);

    const avatar = document.createElement('div');
    avatar.classList.add('friend-avatar');
    avatar.innerHTML = 'Avatar';

    const name = document.createElement('div');
    name.classList.add('friend-name');
    name.innerHTML = friend.username;

    const online = document.createElement('div');
    online.classList.add('friend-online');

    const onlineIcon = document.createElement('img');
    onlineIcon.src = `assets/img/${friend.onlineState == 1 ? 'online' : 'offline'}.svg`;
    onlineIcon.alt = "Offline";
    onlineIcon.classList.add('friend-online--icon');

    online.appendChild(onlineIcon);

    friendWrapper.appendChild(avatar);
    friendWrapper.appendChild(name);
    friendWrapper.appendChild(online);

    node.appendChild(friendWrapper);

}

function getUnreadMessagesCount(friendID, friendWrapper) {
    
    let unreadMsgs;

    const act = 'getUnread';
    const body = `act=${act}&friendid=${friendID}`;

    const xhr = new XMLHttpRequest();

    xhr.open('POST', 'admin/php/message.php');
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

    xhr.send(body);

    xhr.onload = () => {
        if (xhr.status == 200) {
            friendWrapper.dataset.messages = xhr.response;

            if (xhr.response == 0) { 
                friendWrapper.classList.add('hide-ribbon');
            }

        }
    };

}

function addContextMenuEventListeners(ctxMenuItems) {

    for (let i = 0; i < ctxMenuItems.length; i++) {
        const ctxItem = ctxMenuItems[i];

        ctxItem.addEventListener('click', e => {
            const source = e.target.closest('.friend-context-menu__items--item');

            const action = source.dataset.action;

            const userInfo = {
                id: source.dataset.userid,
                username: source.dataset.username
            }

            contextActions(action, userInfo);
        });

    }

}

function contextActions(action, userInfo) {
    switch (action) {
        case 'invite':
            if (!socket) return;

            const roomName = user.currentRoom.name;

            if (!roomName) {
                notificate('warning', 'You have to be in a room to invite someone!');
                return;
            }

            const xhr = new XMLHttpRequest();

            xhr.open('POST', 'admin/php/notifications.php');

            xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

            const act = 'add';
            const type = 'Invite';
            const senderID = user.userID;
            const senderUsername = user.username;

            const body = `act=${act}&roomName=${roomName}&type=${type}&receivingUserID=${userInfo.id}&senderID=${senderID}&senderUsername=${senderUsername}`;

            xhr.send(body);

            xhr.onload = function () {
                if (xhr.status == 200) { 
                    notificate('success', `Invite to ${userInfo.username} is sent.`);
                } else {
                    notificate('error', 'Invite could not be sent.');
                }
            };

            socket.emit('invite sent', userInfo.username);

            break;

        case 'delete':
            
            const friendID = userInfo.id;
            const userid = user.userID;

            const delBody = `act=del&friendid=${friendID}&userid=${userid}`;

            const delXhr = new XMLHttpRequest();

            delXhr.open('POST', 'admin/php/friends.php');

            delXhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

            delXhr.send(delBody);

            delXhr.onload = function () {
                if (delXhr.status != 200) { 
                    notificate('error', 'Could not delete your friend, try again later!')
                } else {
                    const friendsListDOM = document.getElementById('friendListBody');

                    getFriendsList(friendsListDOM);

                    socket.emit('friend deleted');
                    
                }
            };

            break;
    }
}