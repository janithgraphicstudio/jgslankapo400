document.addEventListener('DOMContentLoaded', () => {
    // GSAP 3D Scroll Animations
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);

        // 3D Reveal for section titles
        gsap.utils.toArray('.section-title').forEach(title => {
            gsap.fromTo(title, 
                { y: 50, opacity: 0, rotationX: -30, transformPerspective: 500 },
                { 
                    scrollTrigger: {
                        trigger: title,
                        start: "top 85%",
                        toggleActions: "play none none reverse"
                    },
                    y: 0, opacity: 1, rotationX: 0,
                    duration: 1.2,
                    ease: "power3.out"
                }
            );
        });

        // 3D Floating Elements (Continuous animation for background orbs)
        const orbs = document.querySelectorAll('.gradient-orb');
        if (orbs.length > 0) {
            orbs.forEach((orb, index) => {
                gsap.to(orb, {
                    y: `random(-50, 50)`,
                    x: `random(-50, 50)`,
                    rotationZ: `random(-30, 30)`,
                    duration: `random(5, 10)`,
                    repeat: -1,
                    yoyo: true,
                    ease: "sine.inOut",
                    delay: index * 0.5
                });
            });
        }
    }

    // 3D Interactive Background Parallax (Performance optimized)
    const bg = document.querySelector('.animated-background');
    if (bg) {
        let mouseX = 0;
        let mouseY = 0;
        let targetX = 0;
        let targetY = 0;
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        document.addEventListener('mousemove', (e) => {
            mouseX = (e.clientX - windowWidth / 2) / 20;
            mouseY = (e.clientY - windowHeight / 2) / 20;
        });

        const tick = () => {
            const dx = (mouseX - targetX) * 0.1;
            const dy = (mouseY - targetY) * 0.1;
            
            // Only update DOM if the change is significant enough to be visible
            if (Math.abs(dx) > 0.01 || Math.abs(dy) > 0.01) {
                targetX += dx;
                targetY += dy;
                bg.style.transform = `translate3d(${-targetX}px, ${-targetY}px, 0) scale(1.05)`;
            }
            requestAnimationFrame(tick);
        };
        tick();
    }
});
