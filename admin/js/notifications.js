document.addEventListener('DOMContentLoaded', e => {

    const notifBtn = document.getElementById('notifBtn');
    const notificationsBodyDOM = document.getElementsByClassName('notifications-body')[0];

    if (!notifBtn) return;

    getNotifications();

    notifBtn.addEventListener('click', e => {
        const src = e.target;

        getNotifications();

        // Add active class to parent
        const notifationsWrapper = src.closest('.notifications');

        if (notifationsWrapper) {
            notifationsWrapper.classList.toggle('active');
        }

    });

    
    function getNotifications() {
        // Get Notifications from DB
        let xhr = new XMLHttpRequest();

        xhr.open('POST', 'admin/php/getNotifications.php', true);

        xhr.send();

        xhr.onload = () => {
            if (xhr.status == 200) {
                const data = JSON.parse(xhr.response);

                notificationsBodyDOM.innerHTML = '';

                let unseenNotifications = 0;
                for (let i = 0; i < data.length; i++) {
                    const currentNotification = data[i];
                    if (currentNotification.seen == 0) {
                        unseenNotifications += 1;
                    }
                    createNotificationHTML(currentNotification.id, currentNotification.body, currentNotification.seen, notificationsBodyDOM);
                }

                // If no notifications are returned, set no msg
                if (data.length === 0) {
                    notificationsBodyDOM.innerHTML = 'You have no notifications.';
                }

                // Set unseen notifications circle
                if (unseenNotifications === 0) {
                    notifBtn.classList.add('hide-ribbon');
                } else {
                    notifBtn.classList.remove('hide-ribbon');
                    notifBtn.dataset.notcount = unseenNotifications;
                }

                
                // Get all notifications to add eventListener to add 'seen' state
                const notificationsAll = document.getElementsByClassName('notification-wrapper');

                for (let i = 0; i < notificationsAll.length; i++) {
                    const currNotification = notificationsAll[i];

                    currNotification.addEventListener('mouseover', seeNotification);
                }

                // Add eventListeners to Notification Request buttons
                const notificationReqBtnsAll = document.getElementsByClassName('notification-response-btn');

                for (let i = 0; i < notificationReqBtnsAll.length; i++) {
                    const friendReqBtn = notificationReqBtnsAll[i];

                    friendReqBtn.addEventListener('click', handleNotificationRequests);
                }

                // Add eventListeners to Friend Request buttons
                const friendReqBtnsAll = document.getElementsByClassName('friend-response-btn');

                for (let i = 0; i < friendReqBtnsAll.length; i++) {
                    const friendReqBtn = friendReqBtnsAll[i];

                    friendReqBtn.addEventListener('click', handleFriendRequests);
                }

            }
        };

        xhr.onprogress = function (event) {
            notificationsBodyDOM.innerHTML = '<img class="loading-icon" src="assets/img/loading.svg" alt="Loading...">';
        };

        xhr.onerror = function () {
            console.log(`Couldn't fetch notifications from server.`);
        };
    }

    function seeNotification(event) {
        const source = event.target.closest('.notification-wrapper');
        const id = event.target.dataset.id;

        // Add seen state to hovered notification
        let xhr = new XMLHttpRequest();

        const params = `notificationID=${id}`;

        xhr.open('POST', 'admin/php/seenNotification.php', true);

        xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

        xhr.onload = () => {
            if (xhr.status == 200) { // show the result
                source.classList.add('seen');
            }
        };

        xhr.send(params);

    }

    socket.on('friend request received', username => {
        if (user.username === username) {
            getNotifications();
            notificate('info', 'You have received a friend request!');
        }
    });

    socket.on('notification received', username => {
        console.log('invite');
        if (user.username === username) {
            getNotifications();
            notificate('info', 'You have received a notification!');
        }
    });

});

function createNotificationHTML(id, data, state, node) {
    const wrapper = document.createElement('div');

    if (state == 1) {
        wrapper.classList.add('seen');
    }
    wrapper.classList.add('notification-wrapper');
    wrapper.dataset.id = id;

    wrapper.insertAdjacentHTML('beforeEnd', data);

    node.appendChild(wrapper);

} 

function handleFriendRequests(e) {
    const source = e.target;

    const friendReqID = source.dataset.id;
    const status = source.dataset.action;

    if (!friendReqID) return;

    const body = `friendReqID=${friendReqID}&status=${status}&act=upd`;
    const xhr = new XMLHttpRequest();

    xhr.open('POST', 'admin/php/friends.php', true);

    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

    xhr.send(body);

    xhr.onload = () => {
        if (xhr.status == 200) {
            const data = xhr.response;

            const notificationWrapper = source.closest('.notification-wrapper');

            if (!notificationWrapper) return;

            const buttonWrapper = notificationWrapper.getElementsByClassName('button__wrapper')[0];
            const notificationTitle = notificationWrapper.getElementsByClassName('notification-title')[0];

            buttonWrapper.remove();
            notificationTitle.remove();

            if (data === "accept") {
                notificationWrapper.insertAdjacentHTML('beforeend', `<p>Friend request accepted!</p>`)
                socket.emit('friend request accepted');
            } else {
                notificationWrapper.insertAdjacentHTML('beforeend', `<p>Friend request denied!</p>`)
            }

            setTimeout(() => {
                const notificationID = notificationWrapper.dataset.id;

                const xhrDelete = new XMLHttpRequest();

                xhrDelete.open('POST', 'admin/php/deleteNotifications.php', true);

                xhrDelete.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

                xhrDelete.send(`notificationID=${notificationID}`);
                xhrDelete.onload = () => {
                    if (xhrDelete.status == 200) {
                        notificationWrapper.remove();
                    }
                }

            }, 1000);

        }
    };

}

function handleNotificationRequests(e) {
    const source = e.target;

    const userID = source.dataset.id;
    const action = source.dataset.action;
    const type   = source.dataset.type;

    if (!userID) return;

    const notificationWrapper = source.closest('.notification-wrapper');

    if (!notificationWrapper) return;

    const buttonWrapper = notificationWrapper.getElementsByClassName('button__wrapper')[0];
    const notificationTitle = notificationWrapper.getElementsByClassName('notification-title')[0];

    buttonWrapper.remove();
    notificationTitle.remove();

    if (action === "accept") {
        notificationWrapper.insertAdjacentHTML('beforeend', `<p>Request accepted!</p>`)
        socket.emit('friend request accepted');

        switch (type) {
            case 'Invite':
                const roomName = source.dataset.roomname;

                if (!roomName) return;

                socket.emit('join room', roomName, user);

                break;
        }

    } else {
        notificationWrapper.insertAdjacentHTML('beforeend', `<p>Request denied!</p>`)
    }

    setTimeout(() => {
        const notificationID = notificationWrapper.dataset.id;

        const xhrDelete = new XMLHttpRequest();

        xhrDelete.open('POST', 'admin/php/deleteNotifications.php', true);

        xhrDelete.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

        xhrDelete.send(`notificationID=${notificationID}`);
        xhrDelete.onload = () => {
            if (xhrDelete.status == 200) {
                notificationWrapper.remove();
            }
        }

    }, 1000);

}

