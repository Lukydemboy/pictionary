document.addEventListener('DOMContentLoaded', e => {

    const friendsListDOM = document.getElementById('friendListBody');

    // Get friends on load
    getFriendsList(friendsListDOM);
    
    socket.on('friend request accepted', () => {
        getFriendsList(friendsListDOM)
    });

});

function getFriendsList(node) {
    console.log('Fetching friends...');
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

            for (let i = 0; i < friends.length; i++) {
                const friend = friends[i];

                createFriendsList(friend, node);
            }

        }
    };
}

function createFriendsList(friend, node) {

    const friendWrapper = document.createElement('div');
    friendWrapper.classList.add('friend');

    const avatar = document.createElement('div');
    avatar.classList.add('friend-avatar');
    avatar.innerHTML = 'Avatar';

    const name = document.createElement('div');
    name.classList.add('friend-name');
    name.innerHTML = friend.username;

    const online = document.createElement('div');
    online.classList.add('friend-online');
    
    const onlineIcon = document.createElement('img');
    onlineIcon.src = "assets/img/offline.svg";
    onlineIcon.alt = "Offline";
    onlineIcon.classList.add('friend-online--icon');

    online.appendChild(onlineIcon);

    friendWrapper.appendChild(avatar);
    friendWrapper.appendChild(name);
    friendWrapper.appendChild(online);

    node.appendChild(friendWrapper);

}