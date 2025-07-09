document.addEventListener('DOMContentLoaded', function () {
    
    AOS.init();
  
    const moNavBtn = document.querySelector('.mo_nav_btn');
    const moNav = document.querySelector('.mo_nav');
    const wrap = document.querySelector('.wrap');
    const moNavItems = moNav.querySelectorAll('ul li');
    let scrollY = 0;

    moNavBtn?.addEventListener('click', () => {
        const isMenuOpening = moNav.classList.contains('hide');
        if (isMenuOpening) {
            scrollY = window.scrollY;
            wrap.style.position = 'fixed';
            wrap.style.top = `-${scrollY}px`;
            wrap.style.width = '100%';
            wrap.style.overflow = 'hidden';
            window.isFullpageLocked = true;
        } else {
            wrap.style.position = '';
            wrap.style.top = '';
            wrap.style.width = '';
            wrap.style.overflow = '';
            window.scrollTo(0, scrollY);
            window.isFullpageLocked = false;
        }
        moNav.classList.toggle('hide');
        moNavBtn.classList.toggle('on');
    });

    moNavItems.forEach((li, i) => {
        li.addEventListener('click', () => {
            const targetSection = window.navTargetSections[i];
            const realIndex = window.scrollSections.indexOf(targetSection);

            moNav.classList.add('hide');
            moNavBtn.classList.remove('on');

            wrap.style.position = '';
            wrap.style.top = '';
            wrap.style.width = '';
            wrap.style.overflow = '';
            window.isFullpageLocked = false;

            requestAnimationFrame(() => {
                window.scrollTo(0, scrollY);
                requestAnimationFrame(() => {
                    if (realIndex >= 0 && realIndex !== window.currentIndex) {
                        window.scrollToIndex(realIndex);
                    }
                });
            });
        });
    });

    const contactBtn = document.querySelector('.main .go_contact_btn');
    if (contactBtn) {
        contactBtn.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector('.sc04');
            const index = window.scrollSections.indexOf(target);
            if (index !== -1) {
                const targetY = target.offsetTop;
                window.isAnimating = true;
                document.querySelector('.header')?.classList.remove('white');
                document.querySelector('.fullpage_nav')?.classList.remove('white');
                window.smoothScrollTo(targetY, 1000);
                window.currentIndex = index;
                window.updateNav?.();
            }
        });
    }

    const selectBox = document.querySelector('.custom_select');
    if (selectBox) {
        const selectBtn = selectBox.querySelector('.select_btn');
        const options = selectBox.querySelectorAll('.option');
        const textarea = document.querySelector('.input_box textarea');
        const counter = document.querySelector('.input_box .count span');

        selectBtn.addEventListener('click', () => {
            selectBox.classList.toggle('show');
        });

        options.forEach(option => {
            option.addEventListener('click', () => {
                selectBtn.textContent = option.textContent;
                selectBox.classList.remove('show');
            });
        });

        document.addEventListener('click', (e) => {
            if (!selectBox.contains(e.target)) {
                selectBox.classList.remove('show');
            }
        });

        textarea?.addEventListener('input', () => {
            counter.textContent = textarea.value.length;
        });
    }
});

let sliderInterval = null;
let currentSlideIndex = 1;
let isSliderMounted = false;

function initSlider() {
    if (isSliderMounted) return;
    isSliderMounted = true;
    const track = document.querySelector(".slider_track");
    const slides = Array.from(track.children);
    const firstClone = slides[0].cloneNode(true);
    const lastClone = slides[slides.length - 1].cloneNode(true);
    track.insertBefore(lastClone, slides[0]);
    track.appendChild(firstClone);
    const total = slides.length + 2;
    currentSlideIndex = 1;

    function moveTo(index) {
        track.style.transition = "transform 0.6s ease-in-out";
        track.style.transform = `translateX(-${index * 100}%)`;
        currentSlideIndex = index;
    }

    track.addEventListener("transitionend", () => {
        if (currentSlideIndex === total - 1) {
            track.style.transition = "none";
            currentSlideIndex = 1;
            track.style.transform = `translateX(-100%)`;
        } else if (currentSlideIndex === 0) {
            track.style.transition = "none";
            currentSlideIndex = total - 2;
            track.style.transform = `translateX(-${currentSlideIndex * 100}%)`;
        }
    });

    document.querySelector(".next_btn").addEventListener("click", () => {
        moveTo(currentSlideIndex + 1);
        restartSlider();
    });

    document.querySelector(".prev_btn").addEventListener("click", () => {
        moveTo(currentSlideIndex - 1);
        restartSlider();
    });

    track.style.transform = `translateX(-100%)`;
}

function startSlider() {
    if (sliderInterval) return;
    sliderInterval = setInterval(() => {
        const track = document.querySelector(".slider_track");
        if (!track) return;
        currentSlideIndex += 1;
        track.style.transition = "transform 0.6s ease-in-out";
        track.style.transform = `translateX(-${currentSlideIndex * 100}%)`;
    }, 3000);
}

function stopSlider() {
    clearInterval(sliderInterval);
    sliderInterval = null;
}

function restartSlider() {
    stopSlider();
    startSlider();
}

let tabSliderInterval = null;
let isTabSliderInitialized = false;
let currentTabIndex = 0;

function initTabSlider() {
    if (isTabSliderInitialized) return;
    isTabSliderInitialized = true;
    const sc02 = document.querySelector('.sc02');
    const tabItems = sc02.querySelectorAll('.tab li');
    const contentItems = sc02.querySelectorAll('.tab_contents li');

    function activateTab(index) {
        tabItems.forEach((tab, i) => {
            tab.classList.toggle('active', i === index);
        });
        contentItems.forEach((content, i) => {
            content.classList.toggle('show', i === index);
        });
        currentTabIndex = index;
    }

    function nextTab() {
        const nextIndex = (currentTabIndex + 1) % tabItems.length;
        activateTab(nextIndex);
    }

    tabItems.forEach((tab, index) => {
        tab.addEventListener('click', () => {
            activateTab(index);
            stopTabSlider();
            startTabSlider();
        });
    });

    activateTab(0);
}

function startTabSlider() {
    if (!tabSliderInterval) {
        tabSliderTimeout = setTimeout(() => {
            tabSliderInterval = setInterval(() => {
                const sc02 = document.querySelector('.sc02');
                const tabItems = sc02.querySelectorAll('.tab li');
                const contentItems = sc02.querySelectorAll('.tab_contents li');
                const nextIndex = (currentTabIndex + 1) % tabItems.length;

                tabItems.forEach((tab, i) => {
                    tab.classList.toggle('active', i === nextIndex);
                });
                contentItems.forEach((content, i) => {
                    content.classList.toggle('show', i === nextIndex);
                });

                currentTabIndex = nextIndex;
            }, 3000);
        }, 1000);
    }
}

function stopTabSlider() {
    clearInterval(tabSliderInterval);
    tabSliderInterval = null;
}

window.initSlider = initSlider;
window.startSlider = startSlider;
window.stopSlider = stopSlider;
window.initTabSlider = initTabSlider;
window.startTabSlider = startTabSlider;
window.stopTabSlider = stopTabSlider;