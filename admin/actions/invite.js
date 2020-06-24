// Declared at createRoon.js
copyURLDOM.addEventListener('click', copyURL)

// Copy the lobby url
function copyURL(e) {
    const source = e.target.closest('.copy-url');

    if (!source) return;

    const inviteURL = source.dataset.url;

    navigator.clipboard.writeText(inviteURL).then(() => {
        notificate('success', 'The lobby URL is copied to your clipboard!');
    }, () => {
        notificate('warning', 'Could not copy the URL to your clipboard!');
    });
}