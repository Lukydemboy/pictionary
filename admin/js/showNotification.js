function notificate(type, message) {

    // Add html for notification
    const notificationDOM        = document.getElementById('notification');
    const notificationContentDOM = document.getElementById('notification__content');

    notificationContentDOM.innerHTML = `<p>${message}</p>`;

    notificationDOM.classList.add(type);

    notificationDOM.style.display = 'block';

    notificationDOM.classList.add('notification-show');

    setTimeout(function () {
        notificationDOM.classList.remove('notification-show');
        notificationDOM.classList.add('notification-hide');
    }, 5000);

    setTimeout(function () {
        notificationDOM.style.display = 'none';
        notificationDOM.classList.remove('notification-hide');
        notificationContentDOM.innerHTML = '';
    }, 5500);   

}