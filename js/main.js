/**
 * SUZEN FOTOGRAFIA - Scripts Principais
 * Interatividade, Galeria com Lightbox, Filtros e Orçamento via WhatsApp
 */

document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================================================
       1. CONFIGURAÇÕES GERAIS
       ========================================================================== */
    // Número do WhatsApp da profissional (Aracaju - SE: DDD 79 + 99904-5142)
    const WHATSAPP_PHONE = '5579999045142';

    /* ==========================================================================
       2. CABEÇALHO & MENU MOBILE
       ========================================================================== */
    const header = document.getElementById('header');
    const mobileToggle = document.getElementById('mobile-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Efeito de sombra e blur no scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 40) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Abrir / Fechar menu mobile
    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', () => {
            const isOpen = navMenu.classList.toggle('open');
            mobileToggle.classList.toggle('active', isOpen);
            mobileToggle.setAttribute('aria-expanded', isOpen);
        });

        // Fechar ao clicar em qualquer link do menu
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('open');
                mobileToggle.classList.remove('active');
                mobileToggle.setAttribute('aria-expanded', 'false');
            });
        });

        // Fechar se clicar fora do menu
        document.addEventListener('click', (e) => {
            if (!navMenu.contains(e.target) && !mobileToggle.contains(e.target) && navMenu.classList.contains('open')) {
                navMenu.classList.remove('open');
                mobileToggle.classList.remove('active');
                mobileToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // Destaque do link ativo no scroll
    const sections = document.querySelectorAll('section[id], header[id]');
    window.addEventListener('scroll', () => {
        const scrollPos = window.scrollY + 120;
        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');
            if (scrollPos >= top && scrollPos < top + height) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    });

    /* ==========================================================================
       3. FILTROS DO PORTFÓLIO & EXPANSÃO DE GALERIA
       ========================================================================== */
    const filterButtons = document.querySelectorAll('.filter-btn');
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    const btnToggleGallery = document.getElementById('btn-toggle-gallery');
    let isGalleryExpanded = false;

    if (btnToggleGallery) {
        btnToggleGallery.addEventListener('click', () => {
            isGalleryExpanded = !isGalleryExpanded;
            const extraItems = document.querySelectorAll('.portfolio-item-extra');

            if (isGalleryExpanded) {
                extraItems.forEach(item => item.classList.remove('hidden-extra'));
                btnToggleGallery.innerHTML = '<i class="fa-solid fa-compress"></i> Mostrar Apenas Destaques';
            } else {
                extraItems.forEach(item => item.classList.add('hidden-extra'));
                btnToggleGallery.innerHTML = '<i class="fa-solid fa-layer-group"></i> Ver Galeria Completa (+32 Fotos)';
            }
            refreshGalleryData();
        });
    }

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Atualizar botão ativo
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const filterValue = button.getAttribute('data-filter');

            portfolioItems.forEach(item => {
                const itemCategory = item.getAttribute('data-category');
                const isExtra = item.classList.contains('portfolio-item-extra');

                if (filterValue === 'all') {
                    if (isExtra && !isGalleryExpanded) {
                        item.classList.add('hidden-extra');
                    } else {
                        item.classList.remove('hidden-extra');
                    }
                    item.style.display = 'block';
                } else if (itemCategory === filterValue) {
                    item.classList.remove('hidden-extra');
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });

            // Mostra/oculta botão de expandir conforme o filtro
            if (btnToggleGallery) {
                if (filterValue === 'all') {
                    btnToggleGallery.parentElement.style.display = 'block';
                } else {
                    btnToggleGallery.parentElement.style.display = 'none';
                }
            }

            refreshGalleryData();
        });
    });

    /* ==========================================================================
       4. LIGHTBOX MODAL (VISUALIZADOR EM TELA CHEIA)
       ========================================================================== */
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxTag = document.getElementById('lightbox-tag');
    const lightboxTitle = document.getElementById('lightbox-title');
    const lightboxDesc = document.getElementById('lightbox-desc');
    const lightboxClose = document.getElementById('lightbox-close');
    const lightboxOverlay = document.getElementById('lightbox-overlay');
    const lightboxPrev = document.getElementById('lightbox-prev');
    const lightboxNext = document.getElementById('lightbox-next');

    // Coleta dados dos itens da galeria
    let galleryData = [];
    let currentImageIndex = 0;

    function refreshGalleryData() {
        galleryData = [];
        portfolioItems.forEach((item, index) => {
            const img = item.querySelector('img');
            const badge = item.querySelector('.category-badge');
            const title = item.querySelector('.portfolio-item-title');
            const location = item.querySelector('.portfolio-item-location');

            galleryData.push({
                src: img ? img.src : '',
                alt: img ? img.alt : '',
                tag: badge ? badge.textContent : '',
                title: title ? title.textContent : '',
                desc: location ? location.textContent : '',
                element: item
            });

            // Adiciona evento de clique no card
            const card = item.querySelector('.portfolio-card');
            if (card) {
                card.addEventListener('click', () => {
                    openLightbox(index);
                });
            }
        });
    }

    refreshGalleryData();

    function openLightbox(index) {
        currentImageIndex = index;
        updateLightboxContent();
        lightbox.classList.add('active');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden'; // trava o scroll da página
    }

    function closeLightbox() {
        lightbox.classList.remove('active');
        lightbox.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = ''; // restaura o scroll
    }

    function updateLightboxContent() {
        const item = galleryData[currentImageIndex];
        if (!item) return;

        lightboxImg.src = item.src;
        lightboxImg.alt = item.alt;
        lightboxTag.textContent = item.tag;
        lightboxTitle.textContent = item.title;
        lightboxDesc.textContent = item.desc;
    }

    function showNextImage() {
        currentImageIndex = (currentImageIndex + 1) % galleryData.length;
        updateLightboxContent();
    }

    function showPrevImage() {
        currentImageIndex = (currentImageIndex - 1 + galleryData.length) % galleryData.length;
        updateLightboxContent();
    }

    if (lightbox) {
        if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
        if (lightboxOverlay) lightboxOverlay.addEventListener('click', closeLightbox);
        if (lightboxNext) lightboxNext.addEventListener('click', showNextImage);
        if (lightboxPrev) lightboxPrev.addEventListener('click', showPrevImage);

        // Navegação por teclado
        document.addEventListener('keydown', (e) => {
            if (!lightbox.classList.contains('active')) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowRight') showNextImage();
            if (e.key === 'ArrowLeft') showPrevImage();
        });
    }

    // Suporte a visualização de fotos de Feedbacks no Lightbox
    window.openLightboxFeedback = function(src, title, desc) {
        if (!lightbox) return;
        lightboxImg.src = src;
        lightboxImg.alt = title;
        if (lightboxTag) lightboxTag.textContent = 'Feedback Real de Cliente';
        if (lightboxTitle) lightboxTitle.textContent = title;
        if (lightboxDesc) lightboxDesc.textContent = desc;
        lightbox.classList.add('active');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    };

    // Alternar visibilidade de mais prints de feedback
    const btnToggleFeedbacks = document.getElementById('btn-toggle-feedbacks');
    if (btnToggleFeedbacks) {
        let isFeedbacksExpanded = false;
        btnToggleFeedbacks.addEventListener('click', () => {
            isFeedbacksExpanded = !isFeedbacksExpanded;
            const extraFeedbacks = document.querySelectorAll('.feedback-extra');
            extraFeedbacks.forEach(item => {
                if (isFeedbacksExpanded) {
                    item.classList.remove('hidden-extra');
                } else {
                    item.classList.add('hidden-extra');
                }
            });
            btnToggleFeedbacks.innerHTML = isFeedbacksExpanded
                ? '<i class="fa-solid fa-compress"></i> Mostrar Menos Prints'
                : '<i class="fa-solid fa-comments"></i> Ver Mais Prints de Carinho (+3)';
        });
    }

    /* ==========================================================================
       5. FAQ ACCORDION
       ========================================================================== */
    const accordionItems = document.querySelectorAll('.accordion-item');

    accordionItems.forEach(item => {
        const header = item.querySelector('.accordion-header');
        const body = item.querySelector('.accordion-body');

        if (header && body) {
            header.addEventListener('click', () => {
                const isActive = item.classList.contains('active');

                // Fecha todos os outros itens para um efeito sanfona limpo
                accordionItems.forEach(otherItem => {
                    otherItem.classList.remove('active');
                    const otherHeader = otherItem.querySelector('.accordion-header');
                    const otherBody = otherItem.querySelector('.accordion-body');
                    if (otherHeader) otherHeader.setAttribute('aria-expanded', 'false');
                    if (otherBody) otherBody.style.maxHeight = null;
                });

                // Alterna o item atual se não estava ativo
                if (!isActive) {
                    item.classList.add('active');
                    header.setAttribute('aria-expanded', 'true');
                    body.style.maxHeight = body.scrollHeight + 'px';
                }
            });
        }
    });

    /* ==========================================================================
       6. FORMULÁRIO DE ORÇAMENTO (GERAÇÃO DE LINK WHATSAPP)
       ========================================================================== */
    const whatsappForm = document.getElementById('whatsapp-form');
    const submitBtn = document.getElementById('btn-submit-budget');

    if (whatsappForm) {
        whatsappForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const nome = document.getElementById('cliente-nome').value.trim();
            const tipo = document.getElementById('evento-tipo').value;
            const dataInput = document.getElementById('evento-data').value;
            const local = document.getElementById('evento-local').value.trim() || 'A definir';
            const convidados = document.getElementById('evento-convidados').value;
            const observacoes = document.getElementById('evento-obs').value.trim();

            if (!nome || !tipo) {
                alert('Por favor, preencha pelo menos o seu nome e o tipo de evento.');
                return;
            }

            // Formatação de data amigável (DD/MM/AAAA)
            let dataFormatada = 'A definir';
            if (dataInput) {
                const partes = dataInput.split('-');
                if (partes.length === 3) {
                    dataFormatada = `${partes[2]}/${partes[1]}/${partes[0]}`;
                }
            }

            // Monta a mensagem estruturada e polida
            let mensagem = `Olá, Suzen! Gostaria de solicitar um orçamento para o meu evento:%0A%0A`;
            mensagem += `✨ *Nome:* ${encodeURIComponent(nome)}%0A`;
            mensagem += `🎉 *Celebração:* ${encodeURIComponent(tipo)}%0A`;
            mensagem += `📅 *Data Prevista:* ${encodeURIComponent(dataFormatada)}%0A`;
            mensagem += `📍 *Local / Cidade:* ${encodeURIComponent(local)}%0A`;
            mensagem += `👥 *Convidados:* ${encodeURIComponent(convidados)}%0A`;

            if (observacoes) {
                mensagem += `📝 *Mensagem:* ${encodeURIComponent(observacoes)}%0A`;
            }

            mensagem += `%0APoderia me informar sobre valores e a disponibilidade desta data? Muito obrigado(a)!`;

            const whatsappUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${mensagem}`;

            // Feedback visual no botão
            if (submitBtn) {
                const originalText = submitBtn.innerHTML;
                submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Abrindo WhatsApp...';
                submitBtn.disabled = true;

                setTimeout(() => {
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                    // Abre o WhatsApp em nova aba
                    window.open(whatsappUrl, '_blank');
                }, 600);
            } else {
                window.open(whatsappUrl, '_blank');
            }
        });
    }

    /* ==========================================================================
       7. ANIMAÇÕES DE REVELAÇÃO NO SCROLL (SCROLL REVEAL OBSERVER)
       ========================================================================== */
    const revealTargets = document.querySelectorAll(
        '.section-header, .service-card, .testimonial-card, .feedback-photo-card, .value-item, .manifesto-card, .budget-box, .about-image-wrapper, .about-content'
    );

    revealTargets.forEach((el, index) => {
        el.classList.add('reveal');
        // Adiciona um pequeno atraso escalonado para cards em grid
        if (el.classList.contains('service-card') || el.classList.contains('testimonial-card') || el.classList.contains('feedback-photo-card')) {
            el.style.transitionDelay = `${(index % 4) * 0.1}s`;
        }
    });

    if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            root: null,
            threshold: 0.08,
            rootMargin: '0px 0px -40px 0px'
        });

        revealTargets.forEach(el => revealObserver.observe(el));
    } else {
        // Fallback para navegadores sem suporte a IntersectionObserver
        revealTargets.forEach(el => el.classList.add('revealed'));
    }

});

