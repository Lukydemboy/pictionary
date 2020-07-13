document.addEventListener('DOMContentLoaded', e => {
    const registerEmailInputDOM = document.getElementById('registerEmailInput');
    const loginRegisterDOM = document.getElementById('loginRegister');
    const registerEmailDOM = document.getElementById('registerEmail');
    const submitButtonDOM = document.getElementById('submitButton');
    const otherChoiceDOM = document.getElementById('otherChoice');
    const actInputDOM = document.getElementById('actInput');
    const formDOM = document.getElementById('form');

    let registerState = false;

    loginRegisterDOM.addEventListener('click', e => {
        e.preventDefault();

        if (registerState === false) {
            registerEmailDOM.classList.remove('hidden');
            registerEmailInputDOM.setAttribute('required', 'required');

            submitButtonDOM.value = "Register";
            otherChoiceDOM.innerHTML = 'Already have an account?';
            registerState = true;
            formDOM.action = 'handleLogin.php?act=register';
            actInputDOM.value = 'register';
        } else {     
            deleteErrorMsg();
            registerEmailInputDOM.removeAttribute('required');
            registerEmailDOM.classList.add('hidden');
            submitButtonDOM.value = "Log in";
            otherChoiceDOM.innerHTML = 'Or make an account';
            registerState = false;
            formDOM.action = 'handleLogin.php?act=login';
            actInputDOM.value = 'login';
        }

    });

    if (!msg) return;

    // If there is a register error
    if (msg === 'emailUsernameUsed' || msg === 'usernameUsed' || msg === 'emailUsed') {
        registerEmailDOM.classList.remove('hidden');
        submitButtonDOM.value = "Register";
        otherChoiceDOM.innerHTML = 'Already have an account?';
        registerState = true;
        formDOM.action = 'handleLogin.php?act=register';
        actInputDOM.value = 'register';
    }


});


function deleteErrorMsg() {
    const errorMsgs = document.getElementsByClassName('input-errormsg');
    const takenDOMALL = document.getElementsByClassName('taken');

    console.log(errorMsgs);
    console.log(takenDOMALL);

    for (let i = 0; i < errorMsgs.length; i++) {
        console.log(i);
        const errorMsg = errorMsgs[i];

        errorMsg.remove();
    }

    for (let i = 0; i < takenDOMALL.length; i++) {
        console.log('Deleting class');
        const takenEl = takenDOMALL[i];

        takenEl.classList.remove('taken');
    }

}