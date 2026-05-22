/**
 * StayHuila — Lógica de pantallas de resultado de pago
 * - Polling de estado para pagos pendientes
 * - Animación de confetti para pagos exitosos
 * - Copiar ID de transacción al portapapeles
 * - Cancelación voluntaria de reservas
 */

document.addEventListener('DOMContentLoaded', function () {

    const resultado = document.getElementById('pr-resultado')?.dataset?.resultado;
    const reservaId = document.getElementById('pr-resultado')?.dataset?.reservaId;

    // ── Confetti para pago exitoso ───────────────────────────────────────────
    if (resultado === 'exito') {
        lanzarConfetti();
        // Mostrar toast de bienvenida
        if (typeof showToast === 'function') {
            setTimeout(() => {
                showToast('¡Tu reserva ha sido confirmada! 🎉', 'success');
            }, 600);
        }
    }

    // ── Polling para pago pendiente ──────────────────────────────────────────
    if (resultado === 'pendiente' && reservaId) {
        let intentos = 0;
        const maxIntentos = 60; // Máximo 5 minutos (cada 5 segundos)

        const intervalId = setInterval(async () => {
            intentos++;
            if (intentos > maxIntentos) {
                clearInterval(intervalId);
                actualizarPollingBadge('⏱ Verificación automática detenida. Recarga la página.', false);
                return;
            }

            try {
                const resp = await fetch(`/api/pago/estado/${reservaId}`);
                if (!resp.ok) return;
                const data = await resp.json();

                if (!data.success) return;

                if (data.estado_reserva === 'confirmada' || data.estado_pago === 'approved') {
                    clearInterval(intervalId);
                    // ¡Pago confirmado! Redirigir a pantalla de éxito
                    const newUrl = `/pago/exito?external_reference=${reservaId}`;
                    actualizarPollingBadge('✅ ¡Pago confirmado! Redirigiendo...', true);
                    setTimeout(() => { window.location.href = newUrl; }, 1500);

                } else if (data.estado_pago === 'rejected') {
                    clearInterval(intervalId);
                    actualizarPollingBadge('❌ Pago rechazado. Redirigiendo...', false);
                    setTimeout(() => {
                        window.location.href = `/pago/fallo?external_reference=${reservaId}`;
                    }, 1500);

                } else if (data.estado_reserva === 'cancelada') {
                    clearInterval(intervalId);
                    window.location.href = '/mis-reservas';
                }

            } catch (err) {
                // Silenciar errores de red — el polling continuará
            }
        }, 5000); // Cada 5 segundos
    }

    // ── Copiar ID de transacción ─────────────────────────────────────────────
    document.querySelectorAll('.pr-detail-value.id-tx').forEach(el => {
        el.addEventListener('click', function () {
            const txt = this.textContent.trim();
            navigator.clipboard.writeText(txt).then(() => {
                const original = this.textContent;
                this.textContent = '✅ Copiado!';
                this.style.color = '#16a34a';
                setTimeout(() => {
                    this.textContent = original;
                    this.style.color = '';
                }, 1500);
            });
        });
    });

    // ── Cancelar reserva voluntariamente ────────────────────────────────────
    const btnCancelar = document.getElementById('btn-cancelar-reserva');
    if (btnCancelar && reservaId) {
        btnCancelar.addEventListener('click', async function () {
            if (!confirm('¿Estás seguro de que deseas cancelar esta reserva?\n\nEsta acción no se puede deshacer.')) return;

            btnCancelar.disabled = true;
            btnCancelar.textContent = 'Cancelando...';

            try {
                const resp = await fetch(`/api/pago/cancelar/${reservaId}`, { method: 'POST' });
                const data = await resp.json();

                if (data.success) {
                    if (typeof showToast === 'function') {
                        showToast('Reserva cancelada correctamente', 'info');
                    }
                    setTimeout(() => { window.location.href = '/mis-reservas'; }, 1200);
                } else {
                    alert('Error al cancelar: ' + (data.error || 'Error desconocido'));
                    btnCancelar.disabled = false;
                    btnCancelar.textContent = '✕ Cancelar reserva';
                }
            } catch (e) {
                alert('Error de conexión. Intenta nuevamente.');
                btnCancelar.disabled = false;
                btnCancelar.textContent = '✕ Cancelar reserva';
            }
        });
    }
});


/**
 * Actualiza el badge de polling con un mensaje y estado
 */
function actualizarPollingBadge(mensaje, exito) {
    const badge = document.getElementById('polling-badge');
    if (!badge) return;
    badge.innerHTML = mensaje;
    badge.style.background = exito ? '#f0fdf4' : '#fef2f2';
    badge.style.color = exito ? '#166534' : '#991b1b';
}


/**
 * Genera animación de confetti para celebrar el pago exitoso
 */
function lanzarConfetti() {
    const container = document.createElement('div');
    container.className = 'confetti-container';
    document.body.appendChild(container);

    const colores = [
        '#2C4A3B', '#4a8c63', '#16a34a', '#f59e0b',
        '#3b82f6', '#8b5cf6', '#ec4899', '#10b981'
    ];

    const totalPiezas = 80;

    for (let i = 0; i < totalPiezas; i++) {
        const pieza = document.createElement('div');
        pieza.className = 'confetti-piece';

        const color = colores[Math.floor(Math.random() * colores.length)];
        const left = Math.random() * 100;
        const delay = Math.random() * 2.5;
        const duration = 2.5 + Math.random() * 2;
        const rotation = Math.random() * 360;
        const scale = 0.5 + Math.random() * 0.8;

        pieza.style.cssText = `
            left: ${left}%;
            background: ${color};
            animation-delay: ${delay}s;
            animation-duration: ${duration}s;
            transform: rotate(${rotation}deg) scale(${scale});
            border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
        `;

        container.appendChild(pieza);
    }

    // Limpiar el confetti después de 6 segundos
    setTimeout(() => {
        container.remove();
    }, 6000);
}
