document.addEventListener('DOMContentLoaded', e => {

    const friendsListDOM = document.getElementById('friendListBody');

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