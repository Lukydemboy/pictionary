document.addEventListener('DOMContentLoaded', e => {

    const navItemsAll = document.getElementsByClassName('navigation__list--item');

    for (let i = 0; i < navItemsAll.length; i++) {
        const navItem = navItemsAll[i];
        const page = navItem.dataset.page;

        let currentPage = location.href.split('/');

        currentPage = currentPage[currentPage.length - 1];
        currentPage = currentPage.split('.')[0];

        if (currentPage === page) {
            navItem.classList.add('active');
            return;
        }

    }

});