// -----------------------------------------------------
// BASE DE DATOS LOCAL (IndexedDB)
// -----------------------------------------------------

let db;
let request = indexedDB.open("ProyectoMovilDB", 1);

request.onupgradeneeded = function (e) {
    db = e.target.result;
    let store = db.createObjectStore("usuarios", { keyPath: "usuario" });
    store.add({ usuario: "admin", pass: "1234" });
};

request.onsuccess = function (e) {
    db = e.target.result;
};

request.onerror = function () {
    console.log("Error al cargar BD");
};

// -----------------------------------------------------
// LOGIN
// -----------------------------------------------------
function login() {
    let user = document.getElementById("user").value;
    let pass = document.getElementById("pass").value;

    let tx = db.transaction("usuarios", "readonly");
    let store = tx.objectStore("usuarios");
    let req = store.get(user);

    req.onsuccess = function () {
        if (req.result && req.result.pass === pass) {
            localStorage.setItem("login", "true");
            document.getElementById("loginContainer").style.display = "none";
            document.getElementById("content").style.display = "block";
        } else {
            document.getElementById("loginMsg").innerText = "Credenciales incorrectas";
        }
    };
}

function logout() {
    localStorage.removeItem("login");
    location.reload();
}

// Mantener sesión activa
window.onload = () => {
    if (localStorage.getItem("login") === "true") {
        document.getElementById("loginContainer").style.display = "none";
        document.getElementById("content").style.display = "block";
    }
};
