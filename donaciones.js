document.addEventListener('DOMContentLoaded', () => {
    const donationForm = document.getElementById('donationForm');
    const amountButtons = document.querySelectorAll('#amountSelector button[data-amount]');
    const customAmountBtn = document.getElementById('customAmountBtn');
    const customAmountInput = document.getElementById('customAmountInput');
    const paymentModal = document.getElementById('paymentModal');
    const closePaymentModal = document.getElementById('closePaymentModal');
    const totalDonationDisplay = document.getElementById('totalDonationDisplay');
    const confirmPaymentBtn = document.getElementById('confirmPaymentBtn');

    let selectedAmount = 0;

    // Manejar selección de cantidades predefinidas
    amountButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Quitar clase activa de todos
            amountButtons.forEach(b => b.classList.remove('active'));
            customAmountBtn.classList.remove('active');
            customAmountInput.style.display = 'none';

            // Activar actual
            btn.classList.add('active');
            selectedAmount = parseInt(btn.getAttribute('data-amount'));
        });
    });

    // Manejar botón "Otro"
    customAmountBtn.addEventListener('click', () => {
        amountButtons.forEach(b => b.classList.remove('active'));
        customAmountBtn.classList.add('active');
        customAmountInput.style.display = 'block';
        customAmountInput.focus();
        selectedAmount = 0; // Se usará el valor del input
    });

    // Validar y abrir modal de pago
    donationForm.addEventListener('submit', (e) => {
        e.preventDefault();

        let finalAmount = selectedAmount;
        if (customAmountBtn.classList.contains('active')) {
            finalAmount = parseInt(customAmountInput.value);
        }

        if (!finalAmount || finalAmount <= 0) {
            alert('Por favor, selecciona o introduce una cantidad válida para donar.');
            return;
        }

        // Mostrar cantidad en el modal
        totalDonationDisplay.textContent = `${finalAmount}€`;
        paymentModal.classList.add('active');
    });

    // Cerrar modal
    closePaymentModal.addEventListener('click', (e) => {
        e.preventDefault();
        paymentModal.classList.remove('active');
    });

    // Simular pago final
    confirmPaymentBtn.addEventListener('click', () => {
        confirmPaymentBtn.disabled = true;
        confirmPaymentBtn.textContent = 'Procesando...';

        setTimeout(() => {
            alert('¡Muchas gracias por tu donación! Tu ayuda es fundamental para seguir cuidando de nuestros peluditos ❤️');
            paymentModal.classList.remove('active');
            donationForm.reset();

            // Resetear UI
            amountButtons.forEach(b => b.classList.remove('active'));
            customAmountBtn.classList.remove('active');
            customAmountInput.style.display = 'none';
            confirmPaymentBtn.disabled = false;
            confirmPaymentBtn.textContent = 'Realizar Pago Seguro';
            selectedAmount = 0;
        }, 2000);
    });
});
