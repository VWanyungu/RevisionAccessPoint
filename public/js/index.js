let loginBtn = document.getElementById("loginBtn")
let continueGoogle = document.getElementById("continueGoogle")
let loginTxt = document.querySelector("#loginBtn h6")
let continueTxt = document.getElementById("googleLoginBtn")
let loadDiv = document.querySelector(".loadDiv")
let loadDivAlt = document.querySelector(".loadDivAlt")
let loginForm = document.getElementById("loginForm")
let seePassword = document.getElementById("seePass")
let passEl = document.getElementById("password")

loginForm.addEventListener("submit", login)

function login(){
    loginBtn.disabled = true;
    loginTxt.style.display = "none"
    loadDiv.style.display = "flex"

    setTimeout(() => {
        loginBtn.removeAttribute('disabled');
        window.location.href = "/"
    },5000)

}

function continueGoogleFn(){
    console.log("Google Login")
    continueTxt.style.display = "none"
    loadDivAlt.style.display = "flex"

    setTimeout(() => {
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
