document.addEventListener('DOMContentLoaded', () => {
    // Disable right-click context menu across the site
    document.addEventListener('contextmenu', event => event.preventDefault());
});
// --- Preloader Logic ---
const preloader = document.getElementById('preloader');
if (preloader) {
    // Hide preloader on window load
    window.addEventListener('load', () => {
        preloader.classList.add('hidden');
    });
    // Fallback: hide preloader after max 3 seconds
    setTimeout(() => {
        if (!preloader.classList.contains('hidden')) {
            preloader.classList.add('hidden');
        }
    }, 3000);
}

// Helper to safely initialize looping Swipers by duplicating slides if needed
function initLoopingSwiper(selector, config, minSlidesRequired = 6) {
    const container = document.querySelector(selector);
    if (!container) return null;
    
    const wrapper = container.querySelector('.swiper-wrapper');
    if (wrapper) {
        const slides = wrapper.querySelectorAll('.swiper-slide');
        if (slides.length > 0 && slides.length < minSlidesRequired) {
            const repeatCount = Math.ceil(minSlidesRequired / slides.length);
            for (let i = 0; i < repeatCount - 1; i++) {
                slides.forEach(slide => {
                    const clone = slide.cloneNode(true);
                    wrapper.appendChild(clone);
                });
            }
        }
    }
    if (typeof Swiper !== 'undefined') {
        return new Swiper(selector, config);
    } else {
        console.warn(`Swiper is not loaded, skipped initialization for ${selector}`);
        return null;
    }
}

// --- ALL POPUP LOGIC (Corrected Version) ---

document.addEventListener('DOMContentLoaded', function () {

    // --- Element Definitions ---
    const introPopup = document.getElementById('intro-popup');
    const closePopupBtn = document.getElementById('close-popup-btn');
    const qrPopup = document.getElementById('qr-popup');
    const qrCloseBtn = document.getElementById('qr-close-btn');
    const notif = document.getElementById('chatbot-notification');
    const notifClose = document.getElementById('chatbot-notification-close');

    // --- Function Definitions ---
    setTimeout(() => {
        notif.classList.add('show');
        setTimeout(() => {
            notif.classList.remove('show');
        }, 4000);
    }, 1000);

    notifClose.onclick = () => notif.classList.remove('show');

    // QR Popup එක පෙන්වන සහ එහි ක්‍රියාකාරීත්වය පාලනය කරන Function එක
    function showQrPopup() {
        if (qrPopup && window.innerWidth > 768) {
            qrPopup.classList.remove('initial-hide');

            const qrTimeout = setTimeout(() => {
                if (qrPopup) qrPopup.classList.add('hidden');
            }, 10000);

            if (qrCloseBtn) {
                qrCloseBtn.addEventListener('click', () => {
                    if (qrPopup) qrPopup.classList.add('hidden');
                    clearTimeout(qrTimeout);
                }, { once: true }); // Listener එක එක් වරක් පමණක් ක්‍රියාත්මක වීමට
            }
        }
    }

    // Welcome Popup එක සඟවන Function එක
    function hideWelcomePopup() {
        if (introPopup && !introPopup.classList.contains('hidden')) {
            introPopup.classList.add('hidden');
            // Scroll lock ඉවත් කිරීම (scrollbar compensation සමග)
            const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
            // Welcome popup එකේ auto-close timer එක නතර කිරීම
            clearTimeout(window.welcomePopupTimeout);

            // තත්පර 1කට පසු QR Popup එක පෙන්වීමට trigger කිරීම
            setTimeout(showQrPopup, 1000);
        }
    }

    // --- Initial Triggers and Event Listeners ---

    // --- Premium Features Initialization (Lenis, Cursor, GSAP) ---

    // 1. Initialize Lenis Smooth Scroll
    if (typeof Lenis !== 'undefined') {
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            direction: 'vertical',
            gestureDirection: 'vertical',
            smooth: true,
            mouseMultiplier: 1,
            smoothTouch: false,
            touchMultiplier: 2,
            infinite: false,
        });

        // Sync Lenis with GSAP ScrollTrigger to prevent jitter/shaking
        if (typeof ScrollTrigger !== 'undefined') {
            lenis.on('scroll', ScrollTrigger.update);
        }

        // Drive Lenis scrolling natively via high-priority requestAnimationFrame loop
        // to bypass any GSAP ticker latency or lag-smoothing hiccups
        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);

        // Continuous resize sync using ResizeObserver to prevent empty scroll space
        // Keep ScrollTrigger.refresh() OUT of this loop to prevent infinite layout-calculation cascades
        if (typeof ResizeObserver !== 'undefined') {
            const resizeObserver = new ResizeObserver(() => {
                lenis.resize();
            });
            resizeObserver.observe(document.body);
        }

        // Fallback load-event resizes (safe to refresh ScrollTrigger once layout finishes loading)
        window.addEventListener('load', () => {
            setTimeout(() => {
                lenis.resize();
                if (typeof ScrollTrigger !== 'undefined') {
                    ScrollTrigger.refresh();
                }
            }, 600);
        });

        // Intercept anchor links for smooth scrolling via Lenis
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const targetId = this.getAttribute('href');
                if (targetId && targetId !== '#') {
                    const targetElement = document.querySelector(targetId);
                    if (targetElement) {
                        e.preventDefault();
                        lenis.scrollTo(targetElement, { offset: -50 }); // Offset for navbar
                    }
                }
            });
        });
    } else {
        console.warn('Lenis not loaded');
    }

    // 2. Custom Cursor Logic
    const cursor = document.createElement('div');
    const follower = document.createElement('div');
    cursor.classList.add('cursor');
    follower.classList.add('cursor-follower');
    document.body.appendChild(cursor);
    document.body.appendChild(follower);

    document.addEventListener('mousemove', (e) => {
        if (typeof gsap !== 'undefined') {
            gsap.to(cursor, {
                x: e.clientX,
                y: e.clientY,
                duration: 0.1
            });
            gsap.to(follower, {
                x: e.clientX,
                y: e.clientY,
                duration: 0.3
            });
        } else {
            // Simple robust fallback positioning if GSAP is not loaded
            cursor.style.transform = `translate3d(${e.clientX - 10}px, ${e.clientY - 10}px, 0)`;
            follower.style.transform = `translate3d(${e.clientX - 20}px, ${e.clientY - 20}px, 0)`;
        }
    });

    // Cursor Hover Effects
    const hoverElements = document.querySelectorAll('a, button, .card, .portfolio-card, input, textarea');
    hoverElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.classList.add('active');
            follower.classList.add('active');
        });
        el.addEventListener('mouseleave', () => {
            cursor.classList.remove('active');
            follower.classList.remove('active');
        });
    });

    // 3. GSAP Animations (Enhancing existing AOS)
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);

        // Hero Text Reveal
        const welcomeTexts = document.querySelectorAll('.welcome-text');
        if (welcomeTexts.length > 0) {
            gsap.from(welcomeTexts, {
                y: 100,
                opacity: 0,
                duration: 1.5,
                stagger: 0.2,
                ease: "power4.out",
                delay: 0.5
            });
        }
        // Section Titles Reveal logic moved to 3d-effects.js to prevent duplication and jitter.
    } else {
        console.warn('GSAP or ScrollTrigger not loaded');
    }


    // 4. Magnetic Buttons Effect
    const magneticButtons = document.querySelectorAll('.animated-btn, .portfolio-button');
    magneticButtons.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            if (typeof gsap === 'undefined') return;
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            gsap.to(btn, {
                x: x * 0.3,
                y: y * 0.3,
                duration: 0.3,
                ease: "power2.out"
            });
        });

        btn.addEventListener('mouseleave', () => {
            if (typeof gsap === 'undefined') return;
            gsap.to(btn, {
                x: 0,
                y: 0,
                duration: 0.5,
                ease: "elastic.out(1, 0.3)"
            });
        });
    });

    // --- Existing Popup Logic ---

    // Welcome Popup - only show once per user using localStorage
    const INTRO_STORAGE_KEY = 'introSeen';

    const shouldShowIntro = () => {
        try {
            return !localStorage.getItem(INTRO_STORAGE_KEY);
        } catch (err) {
            console.warn('localStorage not available:', err);
            return true;
        }
    };

    const markIntroSeen = () => {
        try {
            localStorage.setItem(INTRO_STORAGE_KEY, '1');
        } catch (err) {
            console.warn('Could not write to localStorage:', err);
        }
    };

    if (introPopup && closePopupBtn) {
        if (shouldShowIntro()) {
            // Popup open — lock scroll + compensate for scrollbar width to prevent layout shift
            const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
            document.body.style.overflow = 'hidden';
            document.body.style.paddingRight = `${scrollBarWidth}px`;

            window.welcomePopupTimeout = setTimeout(() => {
                hideWelcomePopup();
                markIntroSeen();
            }, 5000);

            closePopupBtn.addEventListener('click', function (e) {
                e.preventDefault();
                hideWelcomePopup();
                markIntroSeen();
            });
        } else {
            introPopup.classList.add('hidden');
            setTimeout(showQrPopup, 500);
        }
    }
});

document.addEventListener('DOMContentLoaded', function () {

    // --- Initialize AOS (Animate On Scroll) ---
    AOS.init({
        duration: 700,
        once: true,       // Play only once — prevents re-trigger jitter
        offset: 60,       // Start animation sooner so elements don't snap-jump
        easing: 'ease-out-cubic', // Smoother deceleration curve
        anchorPlacement: 'top-bottom'
    });


    // initLoopingSwiper helper is now defined globally at the top of this file

    // --- Swiper for Gallery ---
    const swiper = initLoopingSwiper('.swiper-container', {
        loop: true,
        speed: 1000,
        centeredSlides: true,
        slidesPerView: 'auto',
        spaceBetween: 30,
        autoplay: {
            delay: 3000,
            disableOnInteraction: false,
        },
        grabCursor: true,
        allowTouchMove: true,
    }, 15);

    // --- Testimonials Slider Logic ---
    const testimonialsSlider = initLoopingSwiper('.testimonials-slider', {
        loop: true,
        grabCursor: true,
        spaceBetween: 30,
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        autoplay: {
            delay: 5000,
            disableOnInteraction: false,
        },
        breakpoints: {
            640: {
                slidesPerView: 1,
            },
            768: {
                slidesPerView: 2,
            },
            1024: {
                slidesPerView: 3,
            },
        }
    }, 15);

    // --- Animate Skills Bars on Scroll ---
    const skillBars = document.querySelectorAll('.skill-bar');

    const skillObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const progressBar = entry.target.querySelector('.progress-line span');
                const percentage = progressBar.dataset.percent;

                progressBar.style.width = percentage + '%';

                skillObserver.unobserve(entry.target); // Animation එක එක් වරක් පමණක් ක්‍රියාත්මක වීමට
            }
        });
    }, {
        threshold: 0.5 // කොටස 50%ක් පෙනෙන විට animation එක පටන් ගැනීමට
    });

    skillBars.forEach(bar => {
        skillObserver.observe(bar);
    });

    // --- Portfolio Card Lightning Effect (නැවත එක් කරන ලදී) ---
    const cards = document.querySelectorAll('.portfolio-card');
    cards.forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
        card.addEventListener('mouseleave', () => {
            card.style.setProperty('--mouse-x', '-100%');
            card.style.setProperty('--mouse-y', '-100%');
        });
    });

    // --- International Standard Mobile Navigation Logic ---
    const menuToggle = document.getElementById('menu-toggle');
    const navLinks = document.getElementById('nav-links');
    const navLinkItems = document.querySelectorAll('#nav-links li a');
    const toggleIcon = menuToggle.querySelector('i');

    function toggleMenu(forceClose = false) {
        const isOpen = navLinks.classList.contains('active');

        if (isOpen || forceClose) {
            navLinks.classList.remove('active');
            toggleIcon.classList.replace('fa-times', 'fa-bars');
            document.body.style.overflow = ''; // Unlock scroll
        } else {
            navLinks.classList.add('active');
            toggleIcon.classList.replace('fa-bars', 'fa-times');
            document.body.style.overflow = 'hidden'; // Lock scroll
        }
    }

    menuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMenu();
    });

    // Close menu when a link is clicked
    navLinkItems.forEach(link => {
        link.addEventListener('click', () => toggleMenu(true));
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (navLinks.classList.contains('active') && !navLinks.contains(e.target) && !menuToggle.contains(e.target)) {
            toggleMenu(true);
        }
    });

    // --- Go to Top Button ---
    const goToTopBtn = document.querySelector('.go-to-top');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            goToTopBtn.classList.add('show');
        } else {
            goToTopBtn.classList.remove('show');
        }
        // --- Navbar Scrollspy (Highlight link on scroll) ---
        const sections = document.querySelectorAll('section[id], header[id]');
        const navLinks = document.querySelectorAll('.navbar ul li a');

        const observerOptions = {
            root: null, // 'null' යනු viewport එකයි
            rootMargin: '0px',
            threshold: 0.2 // අංශයක් 20%ක් පෙනෙන විට trigger වීමට (වෙනස් කරන ලදී)
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                // isIntersecting යනු අංශය තිරයේ පෙනේද යන්නයි
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    const activeLink = document.querySelector(`.navbar ul li a[href="#${id}"]`);

                    // අදාළ ID එකට link එකක් ඇත්නම් පමණක්...
                    if (activeLink) {
                        // පළමුව, සියලුම link වලින් 'active' class එක ඉවත් කරන්න
                        navLinks.forEach(link => link.classList.remove('active'));

                        // අලුතින් පෙනෙන අංශයට අදාළ link එකට 'active' class එක එක් කරන්න
                        activeLink.classList.add('active');
                    }
                }
            });
        }, observerOptions);

        // සියලුම අංශ නිරීක්ෂණය කිරීම ආරම්භ කරන්න
        sections.forEach(section => {
            observer.observe(section);
        });
    });



    // --- Price Accordion ---
    const accordionItems = document.querySelectorAll('.accordion-item');
    accordionItems.forEach(item => {
        const header = item.querySelector('.accordion-header');
        const content = item.querySelector('.accordion-content');

        header.addEventListener('click', () => {
            const isActive = item.classList.contains('active');

            accordionItems.forEach(otherItem => {
                otherItem.classList.remove('active');
                otherItem.querySelector('.accordion-content').style.maxHeight = 0;
            });

            if (!isActive) {
                item.classList.add('active');
                content.style.maxHeight = content.scrollHeight + 'px';
            }
        });
    });

    // --- Project Stats Counter ---
    function animateCount(element, targetNumber, finalDisplayText) {
        let current = 0;
        // ඉලක්කම විශාල වන විට වේගයෙන් ගණනය වීමට
        const increment = targetNumber / 100;

        const interval = setInterval(() => {
            current += increment;
            if (current >= targetNumber) {
                clearInterval(interval);
                element.textContent = finalDisplayText; // අවසානයේදී අවශ්‍ය අගය පෙන්වීම
            } else {
                element.textContent = Math.ceil(current).toLocaleString(); // ගණනය වන අතරතුර සංඛ්‍යාව පෙන්වීම
            }
        }, 20); // මිලි තත්පර 20 කට වරක් update වීම
    }

    const statsSection = document.querySelector('.project-stats');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // අලුත් අගයන් සහ පෙන්විය යුතු ආකාරය මෙහි ලබා දෙන්න
                animateCount(document.getElementById('projects-count'), 250, '250+');
                animateCount(document.getElementById('customers-count'), 10000, '10K+');
                animateCount(document.getElementById('reviews-count'), 5000, '5K+');

                observer.unobserve(statsSection); // එක් වරක් පමණක් ක්‍රියාත්මක වීමට
            }
        });
    }, { threshold: 0.5 });

    // statsSection එකක් ඇත්නම් පමණක් observer එක ක්‍රියාත්මක කිරීම
    if (statsSection) {
        observer.observe(statsSection);
    }
    // --- Order Form WhatsApp Logic ---
    const orderForm = document.getElementById('order-form');
    const agreementCheckbox = document.getElementById('agreement');
    const sendBtn = document.getElementById('send-btn');

    if (agreementCheckbox && sendBtn) {
        agreementCheckbox.addEventListener('change', function () {
            if (this.checked) {
                sendBtn.disabled = false;
            } else {
                sendBtn.disabled = true;
            }
        });
    }

    if (orderForm && agreementCheckbox) {
        orderForm.addEventListener('submit', function (e) {
            e.preventDefault();

            if (!agreementCheckbox.checked) {
                alert("Please agree to the terms before sending.");
                return;
            }

            const name = document.getElementById('customer-name').value;
            const item = document.getElementById('item-selection').value;
            const message = document.getElementById('customer-message').value;
            const dateTime = new Date().toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' });

            let whatsappMessage = `*New Order from Website* 🎉\n\n`;
            whatsappMessage += `*Name:* ${name}\n`;
            whatsappMessage += `*Item:* ${item}\n`;
            whatsappMessage += `*Date & Time:* ${dateTime}\n\n`;
            whatsappMessage += `*Message:*\n${message}`;

            const whatsappUrl = `https://wa.me/94702001859?text=${encodeURIComponent(whatsappMessage)}`;

            window.open(whatsappUrl, '_blank');
        });
    }
});

// tsParticles ක්‍රියාත්මක කිරීම
(async () => {
    await tsParticles.load({
        id: "tsparticles",
        options: {
            // පසුබිම
            background: {
                color: {
                    value: "#121212" // ඔබගේ වෙබ් අඩවියේ පසුබිම් වර්ණය
                },
            },
            // අංශු (Particles)
            particles: {
                number: {
                    value: 160, // අංශු ගණන (noise effect එකට වැඩි අගයක්)
                    density: {
                        enable: true,
                    },
                },
                color: {
                    value: "#666" // අංශුවල අළු පැහැය
                },
                shape: {
                    type: "circle",
                },
                opacity: {
                    value: { min: 0.1, max: 0.5 }, // විනිවිදභාවය
                },
                size: {
                    value: { min: 1, max: 2.5 }, // අංශුවල කුඩා ප්‍රමාණය
                },
                links: {
                    enable: false, // අංශු අතර සම්බන්ධතා ඉවත් කිරීම
                },
                move: {
                    enable: true,
                    speed: 0.5, // ඉතා සෙමින් චලනය වීමට
                    direction: "none",
                    outModes: {
                        default: "out",
                    },
                },
            },
            // Interactive බව
            interactivity: {
                events: {
                    onHover: {
                        enable: true,
                        mode: "repulse", // mouse pointer එකට අංශු විකර්ෂණය වීම
                    },
                },
                modes: {
                    repulse: {
                        distance: 60,
                        duration: 0.4,
                    },
                },
            },
            detectRetina: true,
        },
    });

    // --- Chatbot Logic (Advanced Version) --- [English]
    const chatbotButton = document.getElementById('chatbot-button');
    const chatbotPanel = document.querySelector('.chatbot-panel');
    const chatbotClose = document.querySelector('.chatbot-close');
    const chatbotMessages = document.getElementById('chatbot-messages');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn'); // ID එක script.js එකේ 'send-btn' ලෙස තිබුනත්, HTML එකේ 'send-btn' ID එක chatbot එකට අදාල එකක් නොවේ. මම chatbot එකේ ID එකට අදාලව සකසමි.
    // HTML එකේ chatbot send button එකට ID එකක් නැති නිසා, මම එය මෙසේ තෝරාගනිමි:
    const chatbotSendBtn = chatbotPanel.querySelector('.chatbot-input button');

    if (chatbotButton && chatbotPanel && chatbotClose && chatbotMessages && userInput && chatbotSendBtn) {
        let currentState = 'initial';

        // පරිශීලකයා type කර send කලවිට ක්‍රියාත්මක වන function එක (Requirement #3)
        const handleUserSendMessage = () => {
            const message = userInput.value.trim();
            if (message === '') return;

            addUserMessage(message);
            userInput.value = '';

            // Hide explain cards when user starts chatting
            const explainContainer = document.getElementById('chatbot-explain');
            if (explainContainer) explainContainer.classList.add('hide');

            const lowerMsg = message.toLowerCase();

            // Intelligent Keyword Parsing & Direct Inline Responses (No direct popups)
            setTimeout(() => {
                if (lowerMsg.includes('hi') || lowerMsg.includes('hello') || lowerMsg.includes('hey') || lowerMsg.includes('ආයුබෝවන්') || lowerMsg.includes('හායි')) {
                    addBotMessage("Hello! 😊 Welcome to JGS ChatBot Assistant. How can I help you today? You can choose a category below or ask me about pricing, services, or contact details.", () => {
                        setTimeout(showMainCategories, 1000);
                    });
                } else if (lowerMsg.includes('price') || lowerMsg.includes('pricing') || lowerMsg.includes('cost') || lowerMsg.includes('මිල') || lowerMsg.includes('ගණන්')) {
                    const priceMsg = `
                        <strong>Our Premium Packages:</strong><br>
                        💼 <strong>BUSINESS PACKAGE:</strong> Rs. 8,000 (10 Posts, 5 Logos, 10 Other Services)<br>
                        👑 <strong>VIP LEVEL PACKAGE:</strong> Rs. 10,000 (20 Posts, 10 Logos, 10 Other Services)<br>
                        ⭐ <strong>VIP EXPRESS PACKAGE:</strong> Rs. 15,000 (Unlimited Designs + Protection)<br><br>
                        <em>To get a quote for other individual services (e.g. Logo Design, Banner, Video Editing), you can click on the shopping cart icon on the portfolio cards above, or select "Graphic Design" in the options.</em>
                    `;
                    addBotMessage(priceMsg, () => {
                        setTimeout(showResetButton, 1000);
                    });
                } else if (lowerMsg.includes('logo') || lowerMsg.includes('ලෝගෝ')) {
                    const logoMsg = `
                        🎨 <strong>Logo Design Services:</strong><br>
                        • 2 Color Normal Logo: Rs. 2,500<br>
                        • Full Color Corporate Branding Logo: Rs. 5,000 - Rs. 15,000<br>
                        • Source files (AI, PSD, SVG) are provided <strong>FREE</strong> with revisions!<br><br>
                        Would you like to order a logo design now?
                    `;
                    addBotMessage(logoMsg, () => {
                        const orderHtml = `
                            <div class="options-list">
                                <a href="https://wa.me/94702001859?text=I%20want%20to%20order%20a%20Logo%20Design" target="_blank" class="option-item" style="background:#25d366; color:#fff; font-weight:bold; justify-content:center; text-decoration:none; display:flex; align-items:center; gap:8px;">
                                    <i class="fab fa-whatsapp"></i> Order Logo via WhatsApp
                                </a>
                            </div>
                        `;
                        addDynamicBotMessage(orderHtml, '.option-item', 'click', () => {
                            setTimeout(showResetButton, 500);
                        });
                    });
                } else if (lowerMsg.includes('website') || lowerMsg.includes('web') || lowerMsg.includes('වෙබ්')) {
                    const webMsg = `
                        💻 <strong>Web Design & Development:</strong><br>
                        • We build premium, modern, responsive websites (Vite, Next.js, HTML/JS/CSS).<br>
                        • Equipped with custom interactive 3D effects, animations, and speed optimizations.<br>
                        • Perfect for portfolios, brands, shops, and business pages.<br><br>
                        Contact us to discuss your project requirements!
                    `;
                    addBotMessage(webMsg, () => {
                        const contactHtml = `
                            <div class="options-list">
                                <a href="https://wa.me/94702001859?text=I%20am%20interested%20in%20Web%20Design%20services" target="_blank" class="option-item" style="background:#0059ff; color:#fff; font-weight:bold; justify-content:center; text-decoration:none; display:flex; align-items:center; gap:8px;">
                                    <i class="fab fa-whatsapp"></i> Discuss Web Project
                                </a>
                            </div>
                        `;
                        addDynamicBotMessage(contactHtml, '.option-item', 'click', () => {
                            setTimeout(showResetButton, 500);
                        });
                    });
                } else if (lowerMsg.includes('contact') || lowerMsg.includes('phone') || lowerMsg.includes('whatsapp') || lowerMsg.includes('email') || lowerMsg.includes('කතා කරන්න') || lowerMsg.includes('දුරකථන')) {
                    const contactMsg = `
                        📞 <strong>JGS Lanka Co. Contacts:</strong><br>
                        • <strong>WhatsApp:</strong> +94 70 200 1859<br>
                        • <strong>Hotline:</strong> +94 70 200 1859<br>
                        • <strong>Email:</strong> janithgraphicstudio.e@gmail.com<br>
                        • <strong>Office Hours:</strong> 24/7 online consultation
                    `;
                    addBotMessage(contactMsg, () => {
                        setTimeout(showResetButton, 1000);
                    });
                } else if (lowerMsg.includes('location') || lowerMsg.includes('address') || lowerMsg.includes('කුරුණෑගල') || lowerMsg.includes('පිහිටීම')) {
                    const locMsg = `
                        📍 <strong>Our Location:</strong><br>
                        • JGS Lanka Co. is based in Kurunegala, Sri Lanka 🇱🇰.<br>
                        • You can view our map in the Contact section of this page, or click below to view on Google Maps.
                    `;
                    addBotMessage(locMsg, () => {
                        const mapsHtml = `
                            <div class="options-list">
                                <a href="https://maps.app.goo.gl/t8jgEAztTUbimkE6A" target="_blank" class="option-item" style="justify-content:center; text-decoration:none; display:flex; align-items:center; gap:8px;">
                                    <i class="fas fa-map-marker-alt"></i> View on Google Maps
                                </a>
                            </div>
                        `;
                        addDynamicBotMessage(mapsHtml, '.option-item', 'click', () => {
                            setTimeout(showResetButton, 500);
                        });
                    });
                } else {
                    // Fallback for custom inquiries
                    const fallbackMsg = `
                        I am JGS ChatBot Assistant. 🤖<br>
                        I didn't quite catch that, but I can instantly redirect your message to our human support team on WhatsApp for a personal response!
                    `;
                    addBotMessage(fallbackMsg, () => {
                        const dateTime = new Date().toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' });
                        const whatsappMessage = `*Chatbot Inquiry* 🤖\n\n*Message:* ${message}\n*Date:* ${dateTime}`;
                        const whatsappUrl = `https://wa.me/94702001859?text=${encodeURIComponent(whatsappMessage)}`;
                        
                        const actionHtml = `
                            <div class="options-list" style="display:flex; flex-direction:column; gap:8px; margin-top:10px;">
                                <a href="${whatsappUrl}" target="_blank" class="option-item" style="background:#25d366; color:#fff; font-weight:bold; justify-content:center; text-decoration:none; display:flex; align-items:center; gap:8px;">
                                    <i class="fab fa-whatsapp"></i> Send message to WhatsApp
                                </a>
                                <div class="option-item reset-btn" data-action="reset" style="justify-content:center; display:flex; align-items:center; gap:8px;">
                                    <i class="fas fa-redo"></i> Start Over
                                </div>
                            </div>
                        `;
                        addDynamicBotMessage(actionHtml, '.reset-btn', 'click', () => {
                            chatbotMessages.innerHTML = '';
                            showInitialMessages();
                        });
                    });
                }
            }, 500);
        };

        // Chatbot එක විවෘත කිරීම සහ වැසීම
        chatbotButton.addEventListener('click', () => {
            chatbotPanel.classList.toggle('active');

            // Hide explain cards when chatbot is opened
            const explainContainer = document.getElementById('chatbot-explain');
            if (explainContainer) explainContainer.classList.add('hide');

            if (chatbotPanel.classList.contains('active') && chatbotMessages.children.length === 0) {
                showInitialMessages();
            }
        });

        chatbotClose.addEventListener('click', () => {
            chatbotPanel.classList.remove('active');
        });

        // Send button සහ Enter key එකට event listeners
        chatbotSendBtn.addEventListener('click', handleUserSendMessage);
        userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleUserSendMessage();
            }
        });

        // --- Helper Functions (සහායක Functions) ---

        // Chat එක ස්වයංක්‍රීයව පහළට scroll කිරීම
        const scrollToBottom = () => {
            chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
        };

        // Bot ගේ පණිවිඩ chat එකට එකතු කිරීම (Advance Thinking Animation සමග)
        const addBotMessage = (text, callback) => {
            const messageElement = document.createElement('div');
            messageElement.className = 'bot-message message';
            // "Advance Thinking Animation" (Requirement #5)
            messageElement.innerHTML = '<div class="thinking"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>';
            chatbotMessages.appendChild(messageElement);
            scrollToBottom();

            const typingTime = Math.min(text.length * 30, 1500) + 500; // සිතීමේ කාලය

            setTimeout(() => {
                messageElement.innerHTML = text; // සැබෑ පණිවිඩය පෙන්වීම
                scrollToBottom();
                if (callback) callback();
            }, typingTime);
        };

        // User ගේ පණිවිඩ chat එකට එකතු කිරීම
        const addUserMessage = (text) => {
            const messageElement = document.createElement('div');
            messageElement.className = 'user-message message';
            messageElement.textContent = text;
            chatbotMessages.appendChild(messageElement);
            scrollToBottom();
        };

        // Dynamic buttons හෝ cards එකතු කිරීම
        const addDynamicBotMessage = (html, selector, event, handler) => {
            const container = document.createElement('div');
            container.className = 'bot-message message';
            container.innerHTML = '<div class="thinking"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>';
            chatbotMessages.appendChild(container);
            scrollToBottom();

            setTimeout(() => {
                container.innerHTML = html;
                container.querySelectorAll(selector).forEach(el => {
                    el.addEventListener(event, handler);
                });
                scrollToBottom();
            }, 1000);
        };

        // පිටුවේ අදාල කොටසට Scroll කිරීමේ function එක (Requirement #2)
        const scrollToSection = (selector) => {
            const element = document.querySelector(selector);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                // Scroll කල පසු chatbot එක වැසීම
                chatbotPanel.classList.remove('active');
            } else {
                console.warn(`Scroll target ${selector} not found.`);
            }
        };

        // "නැවත අරඹන්න" (Reset) button එක පෙන්වීම (Requirement #4)
        const showResetButton = () => {
            const resetHtml = `<div class="options-list"><div class="option-item reset-btn" data-action="reset"><i class="fas fa-redo"></i> Start Over</div></div>`;
            addDynamicBotMessage(resetHtml, '.reset-btn', 'click', () => {
                chatbotMessages.innerHTML = '';
                showInitialMessages();
            });
        };

        // --- Chatbot Flow Functions (සංවාද රටා) ---

        // 1. ආරම්භක පණිවිඩ (Requirement #1)
        const showInitialMessages = () => {
            currentState = 'initial';
            addBotMessage("Welcome to our main website. Please select the service you need.", () => {
                setTimeout(showMainCategories, 1000);
            });
        };

        // 2. ප්‍රධාන Categories පෙන්වීම (Requirement #1)
        const showMainCategories = () => {
            currentState = 'categories';
            const cardsHtml = `
            <div class="category-cards">
                <div class="category-card" data-service="web-nav"><i class="fas fa-compass"></i><span>Web Navigator</span></div>
                <div class="category-card" data-service="graphic-design"><i class="fas fa-paint-brush"></i><span>Graphic Design</span></div>
                <div class="category-card" data-service="it-service"><i class="fas fa-laptop-code"></i><span>IT Service</span></div>
                <div class="category-card" data-service="other-service"><i class="fas fa-concierge-bell"></i><span>Other Service</span></div>
                <div class="category-card" data-service="about-us"><i class="fas fa-info-circle"></i><span>About Us</span></div>
            </div>`;
            addDynamicBotMessage(cardsHtml, '.category-card', 'click', (e) => {
                handleMainCategorySelection(e.currentTarget.dataset.service);
            });
        };

        // 3. ප්‍රධාන Category එකක් තේරූ විට
        const handleMainCategorySelection = (service) => {
            const serviceCard = document.querySelector(`.category-card[data-service="${service}"]`);
            if (serviceCard) {
                addUserMessage(serviceCard.textContent.trim());
            }
            document.querySelector('.category-cards')?.parentElement.remove();

            switch (service) {
                case 'web-nav':
                    showWebNavOptions();
                    break;
                case 'graphic-design':
                    showGraphicDesignOptions();
                    break;
                case 'it-service':
                    showITServiceOptions();
                    break;
                case 'other-service':
                    // "Other Service" සඳහා පැවති 'consulting' logic එක (Requirement #4)
                    addBotMessage("We are happy to assist you. Please describe your issue or question.", showConsultingInput);
                    break;
                case 'about-us':
                    // "About Us" සඳහා නව logic එක (Requirement #4 & #5)
                    showAboutUsOptions();
                    break;
            }
        };

        // 4. "Web Navigator" Options (Requirement #2)
        const showWebNavOptions = () => {
            currentState = 'web-nav-options';
            const optionsHtml = `
            <div class="options-list">
                <div class="option-item" data-action="scroll" data-target="#home"><i class="fas fa-home"></i> Home</div>
                <div class="option-item" data-action="link" data-target="https://sites.google.com/view/janithgraphicstudio/services"><i class="fas fa-briefcase"></i> Service</div>
                <div class="option-item" data-action="scroll" data-target="#portfolio"><i class="fas fa-image"></i> Portfolio</div>
                <div class="option-item" data-action="link" data-target="https://sites.google.com/view/janithgraphicstudio/shop"><i class="fas fa-shopping-cart"></i> Shop</div>
                <div class="option-item" data-action="scroll" data-target="#about-me"><i class="fas fa-user"></i> Designer</div>
                <div class="option-item" data-action="scroll" data-target="#about-me"><i class="fas fa-info-circle"></i> About Us</div>
            </div>`;
            addDynamicBotMessage(optionsHtml, '.option-item', 'click', (e) => {
                const target = e.currentTarget.dataset.target;
                const action = e.currentTarget.dataset.action;

                addUserMessage(e.currentTarget.textContent.trim());
                document.querySelector('.options-list')?.parentElement.remove();

                if (action === 'scroll') {
                    addBotMessage(`Taking you to ${target.substring(1)} section...`, () => {
                        scrollToSection(target);
                        setTimeout(showResetButton, 500);
                    });
                } else {
                    addBotMessage(`Opening link...`, () => {
                        window.open(target, '_blank');
                        setTimeout(showResetButton, 500);
                    });
                }
            });
        };

        // 5. "Graphic Design Service" Options (Requirement #2)

        // --- Show Chatbot Explain Cards ---
        setTimeout(() => {
            const exp1 = document.getElementById('exp-card-1');
            const exp2 = document.getElementById('exp-card-2');
            if (exp1) exp1.classList.add('show');
            if (exp2) setTimeout(() => exp2.classList.add('show'), 500);
        }, 2000);
        const showGraphicDesignOptions = () => {
            currentState = 'graphic-design-options';
            const optionsHtml = `
            <div class="options-list">
                <div class="option-item" data-action="link" data-target="https://sites.google.com/view/janithgraphicstudio/home"><i class="fas fa-book"></i> Our Services</div>
                <div class="option-item" data-action="scroll" data-target="#portfolio"><i class="fas fa-eye"></i> View Our Designs</div>
                <div class="option-item" data-action="scroll" data-target="#projects"><i class="fas fa-project-diagram"></i> View Our Projects</div>
                <div class="option-item" data-action="scroll" data-target="#company-branding"><i class="fas fa-building"></i> Learn about Professional Services</div>
                <div class="option-item" data-action="scroll" data-target="#about-me"><i class="fas fa-user-circle"></i> Learn About Us</div>
                <div class="option-item" data-action="link" data-target="https://sites.google.com/view/janithgraphicstudio/shop"><i class="fas fa-shopping-basket"></i> Order Services</div>
            </div>`;
            addDynamicBotMessage(optionsHtml, '.option-item', 'click', (e) => {
                const target = e.currentTarget.dataset.target;
                const action = e.currentTarget.dataset.action;

                addUserMessage(e.currentTarget.textContent.trim());
                document.querySelector('.options-list')?.parentElement.remove();

                if (action === 'scroll') {
                    addBotMessage(`Scrolling to ${target.substring(1)} section...`, () => {
                        scrollToSection(target);
                        setTimeout(showResetButton, 500);
                    });
                } else {
                    addBotMessage(`Opening link...`, () => {
                        window.open(target, '_blank');
                        setTimeout(showResetButton, 500);
                    });
                }
            });
        };

        // 6. "IT Service" Options (Requirement #2)
        const showITServiceOptions = () => {
            currentState = 'it-service-options';
            const optionsHtml = `
            <div class="options-list">
                <div class="option-item" data-action="link" data-target="https://sites.google.com/view/janithgraphicstudio/about"><i class="fas fa-headset"></i> Help and Support Facility</div>
                <div class="option-item" data-action="link" data-target="https://sites.google.com/view/janithgraphicstudio/home"><i class="fas fa-info"></i> About IT Service</div>
            </div>`;
            addDynamicBotMessage(optionsHtml, '.option-item', 'click', (e) => {
                const target = e.currentTarget.dataset.target;

                addUserMessage(e.currentTarget.textContent.trim());
                document.querySelector('.options-list')?.parentElement.remove();

                addBotMessage(`Opening link...`, () => {
                    window.open(target, '_blank');
                    setTimeout(showResetButton, 500);
                });
            });
        };

        // 7. "About Us" & Contact Options (Requirement #2 & #5)
        const showAboutUsOptions = () => {
            currentState = 'about-us-options';
            addBotMessage("Use the methods below to learn about us and get in touch.", () => {
                const buttonsHtml = `
            <div class="action-buttons-vertical">
                <button class="action-btn" data-action="link" data-target="https://sites.google.com/view/janithgraphicstudio/about">
                    <i class="fas fa-external-link-alt"></i> Visit About Page
                </button>
                <button class="action-btn whatsapp" data-action="link" data-target="https://wa.me/94702001859?text=Hi%20JGS%2C%20I%20need%20assistance.">
                    <i class="fab fa-whatsapp"></i> Contact via WhatsApp
                </button>
                <button class="action-btn call" data-action="link" data-target="tel:+94702001859">
                    <i class="fas fa-phone"></i> Call Us (070 200 1859)
                </button>
            </div>`;
                addDynamicBotMessage(buttonsHtml, '.action-btn', 'click', (e) => {
                    const target = e.currentTarget.dataset.target;
                    addUserMessage(e.currentTarget.textContent.trim());
                    window.open(target, (target.startsWith('tel:') ? '_self' : '_blank'));

                    // button එක click කල පසු reset button එක පෙන්වීම
                    document.querySelector('.action-buttons-vertical')?.parentElement.remove();
                    setTimeout(showResetButton, 1000);
                });
                // කිසිවක් නොකලත් reset button එක පෙන්වීම
                setTimeout(showResetButton, 5000);
            });
        };

        // 8. "Other Service" (Consulting) Input (Requirement #4)
        const showConsultingInput = () => {
            const inputHtml = `
            <p>Please write your question or problem:</p>
            <div class="chatbot-input" style="padding: 10px 0 0 0; border: none; background: transparent;">
                <input type="text" placeholder="Type your question..." id="consulting-input" style="width: 100%;">
            </div>
            <div class="action-buttons">
                <button class="action-btn whatsapp" id="send-consultation" style="margin-top: 10px;"><i class="fab fa-whatsapp"></i> Send via WhatsApp</button>
            </div>`;
            addDynamicBotMessage(inputHtml, '#send-consultation', 'click', () => {
                const input = document.getElementById('consulting-input');
                if (input && input.value.trim() !== '') {
                    const userQuery = input.value;
                    addUserMessage(userQuery);
                    // Input box එක ඉවත් කිරීම
                    document.querySelector('#consulting-input').parentElement.parentElement.remove();

                    setTimeout(() => {
                        addBotMessage("Thank you! Your question is being redirected to WhatsApp...", () => {
                            window.open(`https://wa.me/94702001859?text=${encodeURIComponent(userQuery)}`, '_blank');
                            setTimeout(showResetButton, 1000);
                        });
                    }, 500);
                }
            });
        };

        window.triggerChatbotPriceInquiry = (details) => {
            // First show user message asking for item price
            addUserMessage(`Price range of "${details.title}"?`);

            // Then show bot response with the details
            setTimeout(() => {
                const messageHtml = `
                    <div style="font-family: inherit; line-height: 1.6;">
                        <h4 style="color: #0059ff; margin: 0 0 5px 0; font-size: 1.1rem; display: flex; align-items: center; gap: 8px;"><i class="fas fa-tag"></i> ${details.title}</h4>
                        <div style="background: rgba(255,255,255,0.05); padding: 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); margin: 8px 0;">
                            <strong style="color: #00ff66;">Price Range:</strong> ${details.priceRange}
                        </div>
                        <p style="margin: 5px 0 12px 0; font-size: 0.9rem; color: #ccc; white-space: pre-line;">${details.description}</p>
                        <div class="options-list" style="margin-top: 10px;">
                            <a href="https://wa.me/94702001859?text=${encodeURIComponent('I would like to order: ' + details.title + '\nPrice Range: ' + details.priceRange)}" 
                               target="_blank" class="option-item" style="background: #25d366; color: #fff; justify-content: center; text-decoration: none; font-weight: 600; display: flex; align-items: center; gap: 8px;">
                               <i class="fab fa-whatsapp"></i> Order Now via WhatsApp
                            </a>
                        </div>
                    </div>
                `;
                
                addBotMessage(messageHtml, () => {
                    setTimeout(showResetButton, 1000);
                });
            }, 800);
        };
    }
    // --- End of Chatbot Logic (Advanced Version) --- [English]

    // --- Package Section 'Shop Now' Button Logic ---
    const packageShopButtons = document.querySelectorAll('.package-shop-btn');

    packageShopButtons.forEach(button => {
        button.addEventListener('click', () => {
            const packageName = button.dataset.packageName;
            const now = new Date();
            const dateTime = now.toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' });

            let whatsappMessage = `Package Buy\n\n`;
            whatsappMessage += `Package : ${packageName}\n`;
            whatsappMessage += `Powerd by JGS LANKA Co.\n`;
            whatsappMessage += `${dateTime}`;

            const whatsappUrl = `https://wa.me/94702001859?text=${encodeURIComponent(whatsappMessage)}`;

            window.open(whatsappUrl, '_blank');
        });
    });
    // --- Standalone Service Launcher Toggle (FINAL CORRECTED VERSION) ---
    const launcherContainer = document.querySelector('.jgs-service-launcher');
    const launcherToggle = document.getElementById('service-launcher-toggle');
    const launcherPopup = document.getElementById('service-launcher-popup');
    const launcherClose = document.getElementById('launcher-popup-close');

    if (launcherContainer && launcherToggle && launcherPopup && launcherClose) {

        // Open the popup
        launcherToggle.addEventListener('click', (event) => {
            event.stopPropagation();
            launcherPopup.classList.toggle('active');
        });

        // Close with the 'X' button
        launcherClose.addEventListener('click', () => {
            launcherPopup.classList.remove('active');
        });

        // Close by clicking anywhere outside the launcher container (button AND popup)
        document.addEventListener('click', (event) => {
            if (launcherPopup.classList.contains('active') && !launcherContainer.contains(event.target)) {
                launcherPopup.classList.remove('active');
            }
        });
    }

    // --- Portfolio Price Inquiry via Chatbot Logic ---
    window.showPricePopup = function (event, button) {
        event.preventDefault();
        event.stopPropagation();

        const itemId = button.getAttribute('data-item');

        if (!window.priceDetailsData || !window.priceDetailsData[itemId]) {
            console.warn('Details not found for item:', itemId);
            return;
        }

        const details = window.priceDetailsData[itemId];

        // 1. Open Chatbot Panel
        const chatbotPanel = document.querySelector('.chatbot-panel');
        if (chatbotPanel) {
            chatbotPanel.classList.add('active');
            
            // Hide explain cards
            const explainContainer = document.getElementById('chatbot-explain');
            if (explainContainer) explainContainer.classList.add('hide');
        }

        // 2. Trigger inquiry in chatbot
        if (window.triggerChatbotPriceInquiry) {
            window.triggerChatbotPriceInquiry(details);
        }
    };

    // --- Company Branding Section (New) ---

    // Swiper Sliders දෙක initialize කිරීම
    const brandSwiper = initLoopingSwiper('.branding-slider-brand', {
        loop: true,
        speed: 600,
        centeredSlides: true,
        slidesPerView: 'auto', // CSS එකෙන් පළල පාලනය කිරීමට

        // --- AUTOPLAY (අලුතින් එක් කරන ලදී) ---
        autoplay: {
            delay: 3000, // තත්පර 3 කට වරක්
            disableOnInteraction: false, // පරිශීලකයා click/drag කල පසුවත් play වීමට
        },
        // -------------------------------------

        navigation: {
            nextEl: '.brand-next',
            prevEl: '.brand-prev',
        },
        grabCursor: true,
        breakpoints: {
            // Mobile (default)
            320: {
                spaceBetween: 15
            },
            // Desktop
            768: {
                spaceBetween: 30
            }
        }
    }, 15);

    const logoSwiper = initLoopingSwiper('.branding-slider-logo', {
        loop: true,
        speed: 600,
        centeredSlides: true,
        slidesPerView: 'auto', // CSS එකෙන් පළල පාලනය කිරීමට

        // --- AUTOPLAY (අලුතින් එක් කරන ලදී) ---
        autoplay: {
            delay: 3000, // තත්පර 3 කට වරක්
            disableOnInteraction: false, // පරිශීලකයා click/drag කල පසුවත් play වීමට
        },
        // -------------------------------------

        navigation: {
            nextEl: '.logo-next',
            prevEl: '.logo-prev',
        },
        grabCursor: true,
        breakpoints: {
            // Mobile (default)
            320: {
                spaceBetween: 15
            },
            // Desktop
            768: {
                spaceBetween: 30
            }
        }
    }, 15);

    // Tab ක්‍රියාකාරීත්වය
    const tabs = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.branding-tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // සියලු active class ඉවත් කිරීම
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            // click කල tab එක සහ ඊට අදාල content එක active කිරීම
            tab.classList.add('active');
            const contentId = tab.dataset.tab;
            document.getElementById(contentId).classList.add('active');

            // අලුතින් පෙන්වූ Swiper එක update කිරීම (මානයන් නිවැරදිව ගණනය වීමට)
            if (contentId === 'brand-content') {
                brandSwiper.update();
            } else if (contentId === 'logo-content') {
                logoSwiper.update();
            }
        });
    });

    // Lightbox (පින්තූර විශාල කර බැලීමේ) ක්‍රියාකාරීත්වය
    const lightbox = document.getElementById('image-lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxClose = document.querySelector('.lightbox-close');

    // Slider දෙකේම ඇති සියලුම පින්තූර තෝරා ගැනීම
    const sliderImages = document.querySelectorAll('#company-branding .swiper-slide img');

    sliderImages.forEach(img => {
        img.addEventListener('click', () => {
            lightboxImg.src = img.src;
            lightbox.style.display = 'flex';
        });
    });

    // Lightbox එක වැසීමට
    const closeLightbox = () => {
        lightbox.style.display = 'none';
    };

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (lightbox) lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) { // අඳුරු overlay එක click කල විට පමණක් වැසීමට
            closeLightbox();
        }
    });
})();

