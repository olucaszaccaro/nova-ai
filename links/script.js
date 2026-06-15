document.addEventListener('DOMContentLoaded', () => {
    initShareButton();
    initCardGlowEffects();
    initAnalyticsTrackers();
});

function initShareButton() {
    const shareBtn = document.getElementById('shareBtn');
    if (!shareBtn) return;

    shareBtn.addEventListener('click', async () => {
        const shareData = {
            title: 'Start.AI | Links Oficiais',
            text: 'Conecte-se com a comunidade de IA e acesse o Curso Gratuito Start.AI',
            url: window.location.href
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                if (err.name !== 'AbortError') {
                    copyToClipboard(window.location.href);
                }
            }
        } else {
            copyToClipboard(window.location.href);
        }
    });
}

function copyToClipboard(text) {
    const toast = document.getElementById('toast');

    navigator.clipboard.writeText(text).then(() => {
        showToast(toast, 'Link copiado para a área de transferência! ✓');
    }).catch(() => {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.cssText = 'position:fixed;top:-999px;left:-999px;opacity:0;';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
            showToast(toast, 'Link copiado para a área de transferência! ✓');
        } catch (err) {
            showToast(toast, 'Não foi possível copiar o link.');
        }
        document.body.removeChild(textArea);
    });
}

function showToast(toast, message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

function initCardGlowEffects() {
    const cards = document.querySelectorAll('.link-card');

    cards.forEach(card => {
        const glow = card.querySelector('.card-glow');
        if (!glow) return;

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            glow.style.setProperty('--x', x + '%');
            glow.style.setProperty('--y', y + '%');
        });
    });
}

function initAnalyticsTrackers() {
    const courseLink = document.getElementById('courseLink');
    const whatsappLink = document.getElementById('whatsappLink');

    if (courseLink) {
        courseLink.addEventListener('click', () => {
            trackEvent('click', 'course_link', 'Curso gratuito Start.AI');
        });
    }

    if (whatsappLink) {
        whatsappLink.addEventListener('click', () => {
            trackEvent('click', 'whatsapp_link', 'Comunidade WhatsApp');
        });
    }
}

function trackEvent(action, category, label) {
    if (typeof gtag !== 'undefined') {
        gtag('event', action, { event_category: category, event_label: label });
    }
    if (typeof fbq !== 'undefined') {
        fbq('track', 'Lead', { content_name: label });
    }
}
