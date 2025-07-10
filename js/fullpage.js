function setViewportHeight() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);

    document.querySelectorAll('.full_section:not(.short)').forEach(el => {
        el.style.height = `${vh * 100}px`;
    });
}

setViewportHeight();
window.addEventListener('resize', setViewportHeight);

document.addEventListener('DOMContentLoaded', () => {
    window.isSlideInitialized = false;

    const sections = document.querySelectorAll('.full_section');
    const footer = document.querySelector('footer');
    const topBtn = document.querySelector('.top_btn');
    const navItems = document.querySelectorAll('.fullpage_nav li');
    const fullpageNav = document.querySelector('.fullpage_nav');
    const header = document.querySelector('.header');
    const headerNavItems = document.querySelectorAll('header nav ul li:not(.login_btn)');

    window.navTargetSections = Array.from(sections).filter(section => !section.classList.contains('main'));
    window.scrollSections = [...sections, footer];

    let currentIndex = 0;
    let isAnimating = false;
    const maxIndex = scrollSections.length - 1;
    let justLeftFooter = false;

    header.classList.add('white');
    fullpageNav.classList.add('white');

    const updateTopButton = () => {
        const currentSection = scrollSections[currentIndex];
        const isHidden = currentSection.classList.contains('main') || currentSection.tagName === 'FOOTER';
        topBtn.classList.toggle('on', !isHidden);
    };

    const updateNav = () => {
        const currentSection = scrollSections[currentIndex];
        const navIndex = navTargetSections.indexOf(currentSection);

        fullpageNav.style.display = currentSection.classList.contains('main') ? 'none' : 'block';

        const whiteSections = ['main', 'sc03'];
        const isWhite = whiteSections.some(cls => currentSection.classList.contains(cls));
        header.classList.toggle('white', isWhite);
        fullpageNav.classList.toggle('white', isWhite);

        navItems.forEach((li, i) => {
            li.classList.toggle('on', i === navIndex);
        });

        headerNavItems.forEach((li, i) => {
            li.classList.toggle('on', i === navIndex);
        });

        updateTopButton();
    };

    window.smoothScrollTo = (targetY, duration = 1000) => {
        const startY = window.scrollY;
        const distance = targetY - startY;
        const startTime = performance.now();

        const animate = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const ease = 0.5 * (1 - Math.cos(Math.PI * progress));
            window.scrollTo(0, startY + distance * ease);

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                isAnimating = false;
            }
        };

        requestAnimationFrame(animate);
    };

    window.scrollToIndex = (index) => {
        if (index < 0 || index > maxIndex) return;
        isAnimating = true;

        const target = scrollSections[index];
        const isLeavingFooter = scrollSections[currentIndex]?.tagName === 'FOOTER';

        if (isLeavingFooter && index < currentIndex) {
            justLeftFooter = true;
            setTimeout(() => { justLeftFooter = false; }, 500);
        }

        const targetY = target.offsetTop;
        const isFooter = target.tagName === 'FOOTER';
        smoothScrollTo(targetY, isFooter ? 1400 : 1000);

        currentIndex = index;
        updateNav();

        if (target.classList.contains('sc01')) {
            initSlider();
            startSlider();
        } else {
            stopSlider();
        }

        if (target.classList.contains('sc02')) {
            initTabSlider();
            startTabSlider();
        } else {
            stopTabSlider();
        }
    };

    const handleScroll = (direction) => {
        if (isAnimating) return;
        if (direction === 'down' && currentIndex < maxIndex) {
            scrollToIndex(currentIndex + 1);
        } else if (direction === 'up' && currentIndex > 0) {
            scrollToIndex(currentIndex - 1);
        }
    };

    // Wheel
    window.addEventListener('wheel', (e) => {
        if (window.isFullpageLocked) return;

        const targetInner = e.target.closest('.inner');
        if (targetInner && !justLeftFooter) {
            const deltaY = e.deltaY;
            const scrollTop = targetInner.scrollTop;
            const scrollHeight = targetInner.scrollHeight;
            const clientHeight = targetInner.clientHeight;

            const isScrollable = scrollHeight > clientHeight;
            const isAtTop = scrollTop === 0;
            const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;

            if (!isScrollable) {
                e.preventDefault();
                const direction = deltaY > 0 ? 'down' : 'up';
                handleScroll(direction);
            } else {
                if (deltaY < 0 && isAtTop) {
                    e.preventDefault();
                    handleScroll('up');
                } else if (deltaY > 0 && isAtBottom) {
                    e.preventDefault();
                    handleScroll('down');
                }
            }
        } else {
            e.preventDefault();
            const direction = e.deltaY > 0 ? 'down' : 'up';
            handleScroll(direction);
        }
    }, { passive: false });

    // Touch
    let startY = 0;
    window.addEventListener('touchstart', (e) => {
        startY = e.touches[0].clientY;
    });

    window.addEventListener('touchend', (e) => {
        if (window.isFullpageLocked) return;

        const endY = e.changedTouches[0].clientY;
        const delta = endY - startY;

        if (Math.abs(delta) < 30) return;

        const direction = delta > 0 ? 'up' : 'down';
        const inner = document.querySelectorAll('.inner')[currentIndex];
        
        let didScroll = false;

        if (inner) {
            const scrollTop = inner.scrollTop;
            const scrollHeight = inner.scrollHeight;
            const clientHeight = inner.clientHeight;
            const isScrollable = scrollHeight > clientHeight;
            const isAtTop = scrollTop === 0;
            const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;

            if (isScrollable) {
                if (direction === 'up' && !isAtTop) {
                    // 위로 스크롤 가능한 경우 → inner 먼저 스크롤됨 (아무것도 안 함)
                    didScroll = true;
                }
                if (direction === 'down' && !isAtBottom) {
                    // 아래로 스크롤 가능한 경우 → inner 먼저 스크롤됨
                    didScroll = true;
                }
            }
        }

        // inner가 스크롤 안 됐으면 → fullpage 섹션 이동
        if (!didScroll) {
            if (direction === 'up') handleScroll('up');
            else if (direction === 'down') handleScroll('down');
        }
    });

    // Top 버튼
    topBtn.addEventListener('click', () => {
        scrollToIndex(0);
    });

    // fullpage_nav 클릭
    navItems.forEach((li, i) => {
        li.addEventListener('click', () => {
            if (isAnimating) return;
            const targetSection = navTargetSections[i];
            const realIndex = scrollSections.indexOf(targetSection);
            if (realIndex >= 0 && realIndex !== currentIndex) {
                scrollToIndex(realIndex);
            }
        });
    });

    // header 메뉴 클릭
    headerNavItems.forEach((li, i) => {
        li.addEventListener('click', () => {
            if (isAnimating) return;
            const targetSection = navTargetSections[i];
            const realIndex = scrollSections.indexOf(targetSection);
            if (realIndex >= 0 && realIndex !== currentIndex) {
                scrollToIndex(realIndex);
            }
        });
    });

    scrollToIndex(0);
});