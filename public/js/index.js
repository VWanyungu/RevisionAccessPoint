let loginBtn = document.getElementById("loginBtn")
let loginTxt = document.querySelector("#loginBtn h6")
let loadDiv = document.querySelector(".load")
let loginForm = document.getElementById("loginForm")
let seePassword = document.getElementById("seePass")
let passEl = document.getElementById("password")

loginForm.addEventListener("submit", login)

function login(){
    loginBtn.disabled = true;
    loginTxt.style.display = "none"
    loadDiv.style.display = "block"

    setTimeout(() => {
        loginBtn.removeAttribute('disabled');
        window.location.href = "/"
    },5000)

}

function seePass(){
    if(passEl.type === "password"){
        passEl.type = "text"
        seePassword.classList.remove("fa-eye-slash")
        seePassword.classList.add("fa-eye")
    }else{
        passEl.type = "password"
        seePassword.classList.remove("fa-eye")
        seePassword.classList.add("fa-eye-slash")
    }
}
