document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const showRegisterBtn = document.getElementById('showRegister');
    const showLoginBtn = document.getElementById('showLogin');
    const authContainer = document.getElementById('authContainer');
    const userProfile = document.getElementById('userProfile');
    const logoutBtn = document.getElementById('logoutBtn');
    const usernameDisplay = document.getElementById('usernameDisplay');

    // --- CONFIGURACIÓN DE API ---
    // Detectar si estamos en local (Live Server o archivo) pero no en el puerto del backend (4000)
    const isLocalDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const isBackendPort = window.location.port === '4000';

    const API_BASE = (window.location.protocol === 'file:' || (isLocalDev && !isBackendPort))
        ? 'http://localhost:4000'
        : '';
    // ----------------------------

    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
        showProfile();
    } else {
        showAuth();
    }

    // Toggle forms
    showRegisterBtn.addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
    });

    showLoginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        registerForm.style.display = 'none';
        loginForm.style.display = 'block';
    });

    // Login Logic
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = loginForm.username.value.trim();
        const password = loginForm.password.value.trim();

        try {
            const res = await fetch(`${API_BASE}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await res.json();

            if (res.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('username', data.username);
                localStorage.setItem('role', data.role); // GUARDAR ROL
                showProfile();
            } else {
                alert(data.error);
            }
        } catch (err) {
            console.error(err);
            alert('Error al conectar con el servidor');
        }
    });

    // Register Logic
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = registerForm.username.value.trim();
        const password = registerForm.password.value.trim();

        try {
            const res = await fetch(`${API_BASE}/api/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await res.json();

            if (res.ok) {
                alert('Usuario creado con éxito. Por favor, inicia sesión.');
                registerForm.style.display = 'none';
                loginForm.style.display = 'block';
            } else {
                alert(data.error);
            }
        } catch (err) {
            console.error(err);
            alert('Error al conectar con el servidor');
        }
    });

    // Logout Logic
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('role'); // LIMPIAR ROL
        showAuth();
        // Limpiar boton de admin si existe
        const adminBtn = document.getElementById('adminPanelBtn');
        if (adminBtn) adminBtn.remove();
    });

    async function showProfile() {
        authContainer.style.display = 'none';
        userProfile.style.display = 'block';
        usernameDisplay.textContent = localStorage.getItem('username');

        // BOTON ADMIN
        let role = localStorage.getItem('role');

        // Si no hay rol guardado, intentar verificarlo
        const currentToken = localStorage.getItem('token');
        if (!role && currentToken) {
            try {
                const checkRes = await fetch(`${API_BASE}/api/verify-admin`, {
                    headers: { 'Authorization': `Bearer ${currentToken}` }
                });
                if (checkRes.ok) {
                    role = 'admin';
                    localStorage.setItem('role', 'admin');
                }
            } catch (e) {
                console.log("No es admin o error de red");
            }
        }

        const existingBtn = document.getElementById('adminPanelBtn');

        if (role === 'admin' && !existingBtn) {
            const btn = document.createElement('a');
            btn.id = 'adminPanelBtn';
            btn.href = '../index.html'; // RUTA RELATIVA: sube un nivel desde paginaEsdib/
            btn.textContent = 'Acceder al Panel de Administración';
            btn.style.display = 'block';
            btn.style.marginTop = '15px';
            btn.style.padding = '12px';
            btn.style.backgroundColor = '#d9534f';
            btn.style.color = 'white';
            btn.style.textAlign = 'center';
            btn.style.textDecoration = 'none';
            btn.style.borderRadius = '10px';
            btn.style.fontWeight = 'bold';
            btn.style.transition = 'background 0.3s';
            btn.onmouseover = () => btn.style.backgroundColor = '#c9302c';
            btn.onmouseout = () => btn.style.backgroundColor = '#d9534f';

            // Insertar después del saludo
            usernameDisplay.insertAdjacentElement('afterend', btn);
        }

        // Cargar Favoritos
        const favContainer = document.getElementById('favoritesContainer');
        if (favContainer) {
            favContainer.innerHTML = '<p style="color: #777; font-size: 14px;">Cargando favoritos...</p>';

            try {
                const [petsRes, favsRes] = await Promise.all([
                    fetch(`${API_BASE}/api/pets`),
                    fetch(`${API_BASE}/api/favorites`, {
                        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                    })
                ]);

                const pets = await petsRes.json();
                let favIds = [];
                if (favsRes.ok) {
                    const favData = await favsRes.json();
                    favIds = favData.favorites || [];
                }

                favContainer.innerHTML = '';
                let hasFavs = false;

                pets.forEach(pet => {
                    if (favIds.includes(pet._id)) {
                        hasFavs = true;
                        const div = document.createElement('a');
                        div.href = `adopciones.html#modal-${pet._id}`;
                        div.className = 'fav-card';
                        div.innerHTML = `
              <img src="${API_BASE}/api/image/${pet.imageId}" alt="${pet.nombre}">
              <div class="fav-info">
                <h4>${pet.nombre}</h4>
              </div>
            `;
                        favContainer.appendChild(div);
                    }
                });

                if (!hasFavs) {
                    favContainer.innerHTML = '<p style="color: #777; font-size: 14px;">Aún no tienes favoritos guardados en tu cuenta.</p>';
                }

            } catch (err) {
                console.error(err);
                favContainer.innerHTML = '<p style="color: red; font-size: 14px;">Error al cargar favoritos.</p>';
            }
        }
    }

    function showAuth() {
        authContainer.style.display = 'block';
        userProfile.style.display = 'none';
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
        loginForm.reset();
        registerForm.reset();
    }
});
