export function loadScreen(){
    document.querySelector('body').innerHTML = `
        <div class="container d-flex flex-column align-items-center justify-content-center" style="height: 100vh;">
        <div class="load">
            <div class="load2">

            </div>
        </div>
        <div class="mt-3 text" style="text-align: center;">
            <h1 class="h2 text-muted">Preparing your questions...</h1>
        </div>
    </div>

    <script>
        let messages = [
            "Were preparing your questions...",
            "We're almost there...",
            "Just a few more seconds...",
            "We're almost ready...",
        ]

        setInterval(() => {
            let message = messages[Math.floor(Math.random() * messages.length)];
            document.querySelector(".text h1").innerHTML = message;
        }, 5000);

    </script>
    `
}