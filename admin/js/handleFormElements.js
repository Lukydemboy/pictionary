document.addEventListener('DOMContentLoaded', e => {

    const sliders = document.getElementsByClassName('slider');

    for (let i = 0; i < sliders.length; i++) {
        const slider = sliders[i];

        slider.addEventListener('click', toggleSlider);
    }

    function toggleSlider(e) {
        const source = e.target.closest('.slider__wrapper');
        const sliderInput = source.getElementsByClassName('slider-input')[0];
        sliderInput.checked = !sliderInput.checked;
    }

});