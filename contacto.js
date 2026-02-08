// Manejo del formulario de contacto
document.getElementById('contactForm').addEventListener('submit', function (e) {
    e.preventDefault();

    // Aquí puedes agregar la lógica para enviar el formulario
    // Por ejemplo, usando fetch para enviar a un endpoint del servidor

    // Por ahora, solo mostramos un mensaje de confirmación
    alert('¡Gracias por tu mensaje! Te responderemos pronto.');

    // Limpiar el formulario
    this.reset();
});
