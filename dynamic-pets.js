document.addEventListener('DOMContentLoaded', async () => {
  // --- CONFIGURACIÓN DE API ---
  const isLocalDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const isBackendPort = window.location.port === '4000';
  const API_BASE = (window.location.protocol === 'file:' || (isLocalDev && !isBackendPort))
    ? 'http://localhost:4000'
    : '';
  // ----------------------------

  // 1. Manejar "Me gusta" para mascotas estáticas (ya en el HTML)
  const staticCheckboxes = document.querySelectorAll('.like-checkbox');
  staticCheckboxes.forEach(cb => {
    // Cargar estado guardado
    if (localStorage.getItem(cb.id) === 'true') {
      cb.checked = true;
    }
    // Guardar al cambiar
    cb.addEventListener('change', (e) => {
      localStorage.setItem(e.target.id, e.target.checked);
    });
  });

  // 2. Cargar mascotas del Backend
  const container = document.querySelector('.cards-container');

  try {
    const res = await fetch(`${API_BASE}/api/pets`);
    if (!res.ok) throw new Error('Error al obtener mascotas');
    const pets = await res.json();

    // OBTENER FAVORITOS DEL USUARIO (SI HAY TOKEN)
    const token = localStorage.getItem('token');
    let serverFavorites = [];
    if (token) {
      try {
        const favRes = await fetch(`${API_BASE}/api/favorites`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (favRes.ok) {
          const favData = await favRes.json();
          serverFavorites = favData.favorites;
        }
      } catch (err) {
        console.error("Error al cargar favoritos del servidor", err);
      }
    }

    pets.forEach(pet => {
      // Generar IDs únicos
      const modalId = `modal-${pet._id}`;
      const likeId = `like-${pet._id}`;
      const imageUrl = `${API_BASE}/api/image/${pet.imageId}`;

      // Verificar si ya le dimos like antes
      // Lógica híbrida: si hay token, mirar serverFavorites. Si no, mirar localStorage.
      let isLiked = false;
      if (token) {
        isLiked = serverFavorites.includes(pet._id);
      } else {
        isLiked = localStorage.getItem(likeId) === 'true';
      }
      const checkedStr = isLiked ? 'checked' : '';

      // Crear HTML de la tarjeta
      const card = document.createElement('div');
      card.className = 'pet-card';
      // Usamos un div o a con preventDefault para abrir
      card.innerHTML = `
        <a href="#" class="card-link" data-target="${modalId}"></a>
        <img src="${imageUrl}" alt="${pet.nombre}">
        <div class="info">
          <h3>${pet.nombre}</h3>
          <p class="breed">${pet.raza || 'Desconocida'}</p>
          <p class="details">${pet.genero || ''}, ${pet.edad || ''}</p>
        </div>
        <input type="checkbox" id="${likeId}" class="like-checkbox" ${checkedStr}>
        <label for="${likeId}" class="like-btn">♥</label>
      `;
      container.appendChild(card);

      // Añadir listener al checkbox recién creado
      const checkbox = card.querySelector(`#${likeId}`);
      checkbox.addEventListener('change', async (e) => {
        const isChecked = e.target.checked;

        if (token) {
          // Guardar en servidor
          try {
            await fetch(`${API_BASE}/api/favorites/${pet._id}`, {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${token}` }
            });
          } catch (err) {
            console.error("Error al guardar favorito en servidor", err);
          }
        } else {
          // Guardar en local (usuario no logueado)
          localStorage.setItem(likeId, isChecked);
        }
      });

      // Crear HTML del Modal
      const modal = document.createElement('div');
      modal.id = modalId;
      modal.className = 'modal';
      modal.innerHTML = `
        <div class="modal-box">
          <a href="#" class="close-btn">✕</a>
          <img src="${imageUrl}" class="modal-img" alt="${pet.nombre}">
          <div class="modal-content">
            <div class="modal-header">
              <h2>${pet.nombre}</h2>
            </div>
            <p class="pet-info">${pet.raza || ''} • ${pet.genero || ''} • ${pet.edad || ''}</p>
            <p class="modal-description">
              ${pet.descripcion || 'Sin descripción disponible.'}
            </p>
            <a href="formulario_adopciones.html" class="adopt-btn">ADOPTAR</a>
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      // ABRIR MODAL (Click en la tarjeta)
      const trigger = card.querySelector('.card-link');
      trigger.addEventListener('click', (e) => {
        e.preventDefault(); // Evitamos que ponga # en la URL
        modal.classList.add('active');
        // Opcional: Bloquear scroll del body
        // document.body.style.overflow = 'hidden';
      });

      // CERRAR MODAL (Click en X)
      const closeBtn = modal.querySelector('.close-btn');
      closeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        modal.classList.remove('active');
        // document.body.style.overflow = '';
      });
    });

    // 3. Lógica de Búsqueda
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const cards = document.querySelectorAll('.pet-card');

        cards.forEach(card => {
          const name = card.querySelector('h3').textContent.toLowerCase();
          const breed = card.querySelector('.breed').textContent.toLowerCase();

          if (name.includes(term) || breed.includes(term)) {
            card.style.display = 'block';
          } else {
            card.style.display = 'none';
          }
        });
      });
    }

    // 4. Manejar el hash de la URL (Deep Linking desde el Perfil)
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash) {
        try {
          const targetModal = document.querySelector(hash);
          if (targetModal && targetModal.classList.contains('modal')) {
            // Cerrar otros modales abiertos primero
            document.querySelectorAll('.modal.active').forEach(m => m.classList.remove('active'));
            // Abrir el modal objetivo
            targetModal.classList.add('active');
          }
        } catch (e) {
          console.error("Invalid hash selector:", hash);
        }
      }
    };

    // Ejecutar al cargar si hay hash
    handleHash();

    // También reaccionar a cambios de hash sin recargar la página
    window.addEventListener('hashchange', handleHash);

  } catch (error) {
    console.error('Error cargando mascotas dinámicas:', error);
  }
});
