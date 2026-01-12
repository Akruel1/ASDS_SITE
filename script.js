// ===== DOM ELEMENTS =====
const floatingTwitch = document.getElementById('floating-twitch');
const twitchWindow = document.getElementById('twitch-window');
const openTwitchBtn = document.getElementById('open-twitch-btn');
const closeTwitch = document.getElementById('close-twitch');
const minimizeTwitch = document.getElementById('minimize-twitch');
const maximizeTwitch = document.getElementById('maximize-twitch');
const buttonsSection = document.querySelector('.buttons-section');

// ===== TWITCH WINDOW STATE =====
let isTwitchOpen = false;
let isMinimized = false;

// ===== OPEN TWITCH WINDOW =====
openTwitchBtn.addEventListener('click', () => {
    openTwitchWindow();
});

function openTwitchWindow() {
    isTwitchOpen = true;
    isMinimized = false;
    twitchWindow.classList.add('active');
    twitchWindow.classList.remove('minimized');
    openTwitchBtn.classList.add('hidden');
    
    // Update iframe parent domain
    updateTwitchIframe();
}

// ===== CLOSE TWITCH WINDOW =====
closeTwitch.addEventListener('click', () => {
    closeTwitchWindow();
});

function closeTwitchWindow() {
    isTwitchOpen = false;
    isMinimized = false;
    twitchWindow.classList.remove('active');
    twitchWindow.classList.remove('minimized');
    openTwitchBtn.classList.remove('hidden');
}

// ===== MINIMIZE TWITCH WINDOW =====
minimizeTwitch.addEventListener('click', () => {
    if (isMinimized) {
        expandTwitchWindow();
    } else {
        minimizeTwitchWindow();
    }
});

function minimizeTwitchWindow() {
    isMinimized = true;
    twitchWindow.classList.add('minimized');
}

function expandTwitchWindow() {
    isMinimized = false;
    twitchWindow.classList.remove('minimized');
}

// ===== MAXIMIZE TWITCH WINDOW =====
maximizeTwitch.addEventListener('click', () => {
    if (twitchWindow.style.width === '90vw' && twitchWindow.style.height === '90vh') {
        resetTwitchWindow();
    } else {
        maximizeTwitchWindow();
    }
});

function maximizeTwitchWindow() {
    twitchWindow.style.width = '90vw';
    twitchWindow.style.height = '90vh';
    twitchWindow.style.maxWidth = '1400px';
    twitchWindow.style.maxHeight = '800px';
    const iframeWrapper = twitchWindow.querySelector('.twitch-iframe-wrapper');
    iframeWrapper.style.paddingBottom = '56.25%';
}

function resetTwitchWindow() {
    twitchWindow.style.width = '';
    twitchWindow.style.height = '';
    twitchWindow.style.maxWidth = '';
    twitchWindow.style.maxHeight = '';
    const iframeWrapper = twitchWindow.querySelector('.twitch-iframe-wrapper');
    iframeWrapper.style.paddingBottom = '';
}

// ===== IMPROVED DRAGGABLE TWITCH WINDOW =====
let isDragging = false;
let currentX = 0;
let currentY = 0;
let initialX = 0;
let initialY = 0;
let xOffset = 0;
let yOffset = 0;
let dragStartTime = 0;

// Инициализация перетягивания после загрузки DOM
let twitchHeader = null;

function initTwitchDrag() {
    if (twitchWindow) {
        twitchHeader = twitchWindow.querySelector('.twitch-header');
        if (twitchHeader) {
            twitchHeader.addEventListener('mousedown', dragStart);
            twitchHeader.addEventListener('touchstart', dragStartTouch, { passive: false });
        }
    }
}

// Инициализируем при загрузке
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTwitchDrag);
} else {
    initTwitchDrag();
}

document.addEventListener('mousemove', drag);
document.addEventListener('mouseup', dragEnd);
document.addEventListener('touchmove', dragTouch, { passive: false });
document.addEventListener('touchend', dragEnd);

function dragStart(e) {
    if (e.target.classList.contains('twitch-control-btn')) return;
    if (!twitchWindow.classList.contains('active')) return;
    
    dragStartTime = Date.now();
    initialX = e.clientX - xOffset;
    initialY = e.clientY - yOffset;

    if (e.target === twitchHeader || twitchHeader.contains(e.target)) {
        isDragging = true;
        twitchWindow.classList.add('dragging');
        e.preventDefault();
    }
}

function dragStartTouch(e) {
    if (e.target.classList.contains('twitch-control-btn')) return;
    if (!twitchWindow.classList.contains('active')) return;
    
    dragStartTime = Date.now();
    const touch = e.touches[0];
    initialX = touch.clientX - xOffset;
    initialY = touch.clientY - yOffset;

    if (e.target === twitchHeader || twitchHeader.contains(e.target)) {
        isDragging = true;
        twitchWindow.classList.add('dragging');
        e.preventDefault();
    }
}

function drag(e) {
    if (isDragging) {
        e.preventDefault();
        currentX = e.clientX - initialX;
        currentY = e.clientY - initialY;

        // Ограничиваем перемещение границами экрана
        const maxX = window.innerWidth - twitchWindow.offsetWidth;
        const maxY = window.innerHeight - twitchWindow.offsetHeight;
        
        currentX = Math.max(0, Math.min(currentX, maxX));
        currentY = Math.max(0, Math.min(currentY, maxY));

        xOffset = currentX;
        yOffset = currentY;

        setTranslate(currentX, currentY, twitchWindow);
    }
}

function dragTouch(e) {
    if (isDragging) {
        e.preventDefault();
        const touch = e.touches[0];
        currentX = touch.clientX - initialX;
        currentY = touch.clientY - initialY;

        const maxX = window.innerWidth - twitchWindow.offsetWidth;
        const maxY = window.innerHeight - twitchWindow.offsetHeight;
        
        currentX = Math.max(0, Math.min(currentX, maxX));
        currentY = Math.max(0, Math.min(currentY, maxY));

        xOffset = currentX;
        yOffset = currentY;

        setTranslate(currentX, currentY, twitchWindow);
    }
}

function dragEnd(e) {
    if (isDragging) {
        const dragDuration = Date.now() - dragStartTime;
        
        // Если перетаскивание было быстрым, добавляем инерцию
        if (dragDuration < 200) {
            const velocityX = currentX - initialX;
            const velocityY = currentY - initialY;
            
            // Небольшая инерция
            if (Math.abs(velocityX) > 5 || Math.abs(velocityY) > 5) {
                const inertiaX = velocityX * 0.3;
                const inertiaY = velocityY * 0.3;
                
                currentX += inertiaX;
                currentY += inertiaY;
                
                const maxX = window.innerWidth - twitchWindow.offsetWidth;
                const maxY = window.innerHeight - twitchWindow.offsetHeight;
                
                currentX = Math.max(0, Math.min(currentX, maxX));
                currentY = Math.max(0, Math.min(currentY, maxY));
                
                xOffset = currentX;
                yOffset = currentY;
                
                setTranslate(currentX, currentY, twitchWindow);
            }
        }
        
        initialX = currentX;
        initialY = currentY;
        isDragging = false;
        twitchWindow.classList.remove('dragging');
    }
}

function setTranslate(xPos, yPos, el) {
    el.style.transform = `translate(${xPos}px, ${yPos}px)`;
    el.style.left = 'auto';
    el.style.right = 'auto';
    el.style.top = 'auto';
    el.style.bottom = 'auto';
}

// Навигация убрана

// ===== 3D BUTTON EFFECTS (SMOOTH) =====
const neonButtons = document.querySelectorAll('.neon-button');
let hoverTimeout;

neonButtons.forEach(button => {
    let isHovering = false;
    
    button.addEventListener('mouseenter', function() {
        isHovering = true;
        this.style.transition = 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    });
    
    button.addEventListener('mousemove', function(e) {
        if (!isHovering) return;
        
        clearTimeout(hoverTimeout);
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        // Более мягкие значения для плавности
        const rotateX = (y - centerY) / 25;
        const rotateY = (centerX - x) / 25;
        
        // Используем requestAnimationFrame для плавности
        requestAnimationFrame(() => {
            if (isHovering) {
                this.style.transform = `translateY(-8px) translateZ(20px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
            }
        });
    });
    
    button.addEventListener('mouseleave', function() {
        isHovering = false;
        this.style.transition = 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        this.style.transform = '';
    });
});

// ===== SCROLL ANIMATIONS =====
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0) translateZ(0) rotateX(0deg)';
        }
    });
}, observerOptions);

// Observe buttons for scroll animations
neonButtons.forEach(button => {
    observer.observe(button);
});

// ===== KEYBOARD SHORTCUTS =====
document.addEventListener('keydown', (e) => {
    // ESC to close Twitch
    if (e.key === 'Escape' && isTwitchOpen) {
        closeTwitchWindow();
    }
    
    // T to toggle Twitch
    if (e.key === 't' || e.key === 'T') {
        if (document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
            if (!isTwitchOpen) {
                openTwitchWindow();
            } else {
                closeTwitchWindow();
            }
        }
    }
    
    // M to minimize/maximize
    if ((e.key === 'm' || e.key === 'M') && isTwitchOpen) {
        if (document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
            if (isMinimized) {
                expandTwitchWindow();
            } else {
                minimizeTwitchWindow();
            }
        }
    }
});

// ===== PARALLAX EFFECT FOR BACKGROUND =====
let lastScroll = 0;
window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    const particles = document.querySelector('.particles');
    const container = document.querySelector('.container');
    
    if (particles) {
        const speed = currentScroll * 0.1;
        particles.style.transform = `translateY(${speed}px)`;
    }
    
    if (container) {
        const rotateY = (currentScroll / 100) * 0.5;
        container.style.transform = `perspective(1000px) rotateY(${rotateY}deg)`;
    }
    
    lastScroll = currentScroll;
});

// ===== MOUSE TRACKING GLOW EFFECT (SMOOTH) =====
let cursorGlow = null;
let mouseX = 0;
let mouseY = 0;
let glowX = 0;
let glowY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    if (!cursorGlow) {
        cursorGlow = document.createElement('div');
        cursorGlow.className = 'cursor-glow';
        cursorGlow.style.cssText = `
            position: fixed;
            width: 400px;
            height: 400px;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(0, 243, 255, 0.08) 0%, transparent 70%);
            pointer-events: none;
            z-index: 9998;
            transform: translate(-50%, -50%);
            transition: transform 0.1s ease-out;
        `;
        document.body.appendChild(cursorGlow);
        glowX = mouseX;
        glowY = mouseY;
    }
});

// Плавное следование курсора
function smoothCursorFollow() {
    if (cursorGlow) {
        glowX += (mouseX - glowX) * 0.1;
        glowY += (mouseY - glowY) * 0.1;
        cursorGlow.style.left = glowX + 'px';
        cursorGlow.style.top = glowY + 'px';
    }
    requestAnimationFrame(smoothCursorFollow);
}
smoothCursorFollow();

// ===== SPLASH SCREEN & LOADING ANIMATION =====
const splashScreen = document.getElementById('splash-screen');
const mainContainer = document.getElementById('main-container');

window.addEventListener('load', () => {
    // Добавляем класс loading к body
    document.body.classList.add('loading');
    
    // После завершения анимации загрузчика скрываем splash screen
    setTimeout(() => {
        if (splashScreen) {
            splashScreen.classList.add('hidden');
        }
        
        // Показываем основной контент
        if (mainContainer) {
            mainContainer.classList.add('visible');
        }
        
        // Убираем класс loading с body
        setTimeout(() => {
            document.body.classList.remove('loading');
            
            // Анимируем кнопки с задержкой для эффекта параллакса
            neonButtons.forEach((button, index) => {
                setTimeout(() => {
                    button.style.opacity = '0';
                    button.style.transform = 'translateY(80px) translateZ(-80px) rotateX(45deg) scale(0.7)';
                    button.style.transition = 'all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                    
                    setTimeout(() => {
                        button.style.opacity = '1';
                        button.style.transform = 'translateY(0) translateZ(0) rotateX(0deg) scale(1)';
                    }, 50);
                }, 3500 + (index * 80)); // Начинаем после появления секции кнопок
            });
            
            // Анимируем статистику
            setTimeout(() => {
                animateStats();
            }, 4000);
        }, 500);
    }, 3500); // Ждем завершения анимации загрузчика (2s) + небольшая задержка
});

// ===== ANIMATE FOOTER STATS =====
function animateStats() {
    const viewersCount = document.getElementById('viewers-count');
    const followersCount = document.getElementById('followers-count');
    
    if (viewersCount && followersCount) {
        animateNumber(viewersCount, 0, 1250, 2000);
        animateNumber(followersCount, 0, 8500, 2500);
    }
}

function animateNumber(element, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const current = Math.floor(progress * (end - start) + start);
        element.textContent = current.toLocaleString();
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// ===== TWITCH IFRAME PARENT DOMAIN =====
function updateTwitchIframe() {
    const iframe = document.getElementById('twitch-embed');
    if (iframe) {
        const currentHost = window.location.hostname;
        const currentSrc = iframe.src;
        
        // Add current domain to parent parameter
        if (currentHost && currentHost !== 'localhost' && currentHost !== '127.0.0.1') {
            if (!currentSrc.includes(`parent=${currentHost}`)) {
                const newSrc = currentSrc.includes('parent=') 
                    ? currentSrc + `&parent=${currentHost}`
                    : `${currentSrc}&parent=${currentHost}`;
                iframe.src = newSrc;
            }
        }
    }
}

// Update on load
window.addEventListener('load', updateTwitchIframe);

// ===== PERFORMANCE OPTIMIZATION =====
function throttle(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Apply throttling to scroll
window.addEventListener('scroll', throttle(() => {
    // Scroll-based animations
}, 16));

// ===== 3D TITLE INTERACTION =====
const neonTitle = document.querySelector('.neon-title');
if (neonTitle) {
    document.addEventListener('mousemove', (e) => {
        const rect = neonTitle.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;
        
        neonTitle.style.transform = `translateZ(50px) translateY(-10px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });
    
    neonTitle.addEventListener('mouseleave', () => {
        neonTitle.style.transform = '';
    });
}

// ===== DYNAMIC BACKGROUND EFFECTS =====
function createFloatingParticle() {
    const particle = document.createElement('div');
    particle.style.cssText = `
        position: fixed;
        width: ${Math.random() * 4 + 2}px;
        height: ${Math.random() * 4 + 2}px;
        background: ${Math.random() > 0.5 ? 'var(--neon-blue)' : 'var(--neon-purple)'};
        border-radius: 50%;
        pointer-events: none;
        z-index: 2;
        box-shadow: 0 0 ${Math.random() * 10 + 5}px currentColor;
        opacity: ${Math.random() * 0.5 + 0.3};
    `;
    
    const startX = Math.random() * window.innerWidth;
    const startY = window.innerHeight + 20;
    const endY = -20;
    const duration = Math.random() * 10000 + 15000;
    const drift = (Math.random() - 0.5) * 200;
    
    particle.style.left = startX + 'px';
    particle.style.top = startY + 'px';
    
    document.body.appendChild(particle);
    
    particle.animate([
        { 
            transform: `translate(0, 0)`,
            opacity: 0
        },
        { 
            transform: `translate(${drift}px, ${endY - startY}px)`,
            opacity: 0.8,
            offset: 0.1
        },
        { 
            transform: `translate(${drift * 1.5}px, ${endY - startY}px)`,
            opacity: 0.3,
            offset: 0.9
        },
        { 
            transform: `translate(${drift * 2}px, ${endY - startY}px)`,
            opacity: 0
        }
    ], {
        duration: duration,
        easing: 'linear'
    }).onfinish = () => {
        particle.remove();
    };
}

// Создаем частицы периодически
setInterval(createFloatingParticle, 2000);

// ===== ADDITIONAL ENERGY LINES =====
function createEnergyLine() {
    const line = document.createElement('div');
    const left = Math.random() * 100;
    line.style.cssText = `
        position: fixed;
        left: ${left}%;
        top: -100px;
        width: 2px;
        height: ${Math.random() * 200 + 100}px;
        background: linear-gradient(180deg, 
            transparent 0%,
            var(--neon-blue) 20%,
            var(--neon-purple) 50%,
            var(--neon-pink) 80%,
            transparent 100%);
        box-shadow: 0 0 10px var(--neon-blue), 0 0 20px var(--neon-purple);
        pointer-events: none;
        z-index: 2;
        opacity: 0.3;
    `;
    
    document.body.appendChild(line);
    
    const duration = Math.random() * 2000 + 3000;
    const endY = window.innerHeight + 200;
    
    line.animate([
        { 
            transform: 'translateY(0)',
            opacity: 0
        },
        { 
            transform: 'translateY(0)',
            opacity: 0.3,
            offset: 0.1
        },
        { 
            transform: `translateY(${endY}px)`,
            opacity: 0.3,
            offset: 0.9
        },
        { 
            transform: `translateY(${endY}px)`,
            opacity: 0
        }
    ], {
        duration: duration,
        easing: 'linear'
    }).onfinish = () => {
        line.remove();
    };
}

// Создаем энергетические линии периодически
setInterval(createEnergyLine, 3000);

// ===== SUBJECTS CONFIGURATION =====
const subjectsConfig = {
    'father': {
        text: [
            'СУБЪЕКТ №1: ОТЕЦ',
            '',
            'СТАТУС: АКТИВЕН',
            'РОЛЬ: ИНИЦИАТОР И ИДЕЙНЫЙ ВДОХНОВИТЕЛЬ',
            '',
            'ОСНОВНАЯ ДЕЯТЕЛЬНОСТЬ:',
            'Ведение стримов и развитие личного блога',
            'в сфере видеоигр и цифрового контента.',
            '',
            'ЦЕЛЬ:',
            'Стать топовым блогером и стримером,',
            'формируя узнаваемый стиль, качественную',
            'подачу и стабильную аудиторию.',
            '',
            'ОБЯЗАННОСТИ:',
            'Организация стримов, техническое оснащение,',
            'визуальное оформление трансляций,',
            'взаимодействие с подписчиками,',
            'продвижение контента в социальных сетях,',
            'создание единой медийной концепции семьи.',
            '',
            'РОЛЬ В ПРОЕКТЕ:',
            'Поддержка детей, мотивация, передача опыта',
            'и формирование дисциплины, необходимой',
            'для роста в киберспортивной и медийной среде.'
        ],
        image: 'отец.jpg',
        links: [
            { name: 'Telegram', url: 'https://t.me/asdsgames', icon: '📱' }
        ]
    },
    'elder-son': {
        text: [
            'СУБЪЕКТ №2: СТАРШИЙ СЫН',
            '',
            'СТАТУС: ОНЛАЙН',
            'РОЛЬ: КЛЮЧЕВАЯ ФИГУРА ПРОЕКТА',
            '',
            'ГЛАВНАЯ ЦЕЛЬ:',
            'Попасть в профессиональную киберспортивную',
            'команду уровня Tier 1 и принять участие',
            'в крупнейших международных турнирах.',
            '',
            'МЕЧТА:',
            'Завоевать Aegis of Champions.',
            '',
            'ДЕЯТЕЛЬНОСТЬ:',
            'Активные тренировки, участие в рейтинговых',
            'матчах, анализ собственной игры и развитие',
            'как игрока.',
            '',
            'КОНТЕНТ:',
            'Процесс становления в киберспорте',
            'транслируется в формате стримов и блогов,',
            'позволяя зрителям наблюдать реальный путь',
            'игрока от любительского уровня к',
            'профессиональной сцене.',
            '',
            'ОБРАЗ:',
            'Целеустремленный киберспортсмен, готовый',
            'к постоянному росту и работе над собой.'
        ],
        image: 'старший.jpg',
        links: [
            { name: 'TikTok', url: 'https://www.tiktok.com/@asds__games?_t=ZM-8wv6FYt2mIA&_r=1', icon: '🎵' },
            { name: 'Twitch', url: 'https://m.twitch.tv/asds__games/home', icon: '🎮' },
            { name: 'YouTube', url: 'https://www.youtube.com/@asdsgames6114', icon: '▶️' }
        ]
    },
    'younger-son': {
        text: [
            'СУБЪЕКТ №3: МЛАДШИЙ СЫН',
            '',
            'СТАТУС: ОНЛАЙН',
            'РОЛЬ: НАЧИНАЮЩИЙ СТРИМЕР',
            '',
            'ОСНОВНОЕ НАПРАВЛЕНИЕ:',
            'Стриминг Minecraft и других популярных',
            'видеоигр.',
            '',
            'РАЗВИТИЕ:',
            'Постепенное освоение навыков общения',
            'с аудиторией, обучение уверенному ведению',
            'трансляций, развитие креативного мышления',
            'и игрового мастерства.',
            '',
            'ЗНАЧЕНИЕ В ПРОЕКТЕ:',
            'Демонстрирует раннее погружение в',
            'цифровую культуру и формирует основу',
            'для дальнейшего развития в сфере',
            'стриминга или киберспорта.'
        ],
        image: 'младший.jpg',
        links: [
            { name: 'TikTok', url: 'https://www.tiktok.com/@asds_lite', icon: '🎵' },
            { name: 'Twitch', url: 'https://www.twitch.tv/asds_live', icon: '🎮' }
        ]
    }
};

// ===== SUBJECT CONTENT ELEMENTS =====
let subjectContent = null;
let closeSubjectBtn = null;
let subjectButtons = [];
let decodedTextContainer = null;
let hologramFrame = null;
let hologramImage = null;
let subjectLinks = null;

// Инициализация элементов после загрузки DOM
function initSubjectElements() {
    console.log('Initializing subject elements...');
    subjectContent = document.getElementById('subject-content');
    closeSubjectBtn = document.getElementById('close-subject-btn');
    decodedTextContainer = document.getElementById('decoded-text');
    hologramFrame = document.getElementById('hologram-frame');
    hologramImage = document.getElementById('hologram-image');
    subjectLinks = document.getElementById('subject-links');
    
    if (!subjectContent) {
        console.error('❌ subjectContent not found');
    } else {
        console.log('✅ subjectContent found');
    }
    if (!decodedTextContainer) {
        console.error('❌ decodedTextContainer not found');
    } else {
        console.log('✅ decodedTextContainer found');
    }
    if (!hologramFrame) {
        console.error('❌ hologramFrame not found');
    } else {
        console.log('✅ hologramFrame found');
    }
    if (!hologramImage) {
        console.error('❌ hologramImage not found');
    } else {
        console.log('✅ hologramImage found');
    }
    if (!subjectLinks) {
        console.error('❌ subjectLinks not found');
    } else {
        console.log('✅ subjectLinks found');
    }
    
    // Добавляем обработчик закрытия
    if (closeSubjectBtn) {
        closeSubjectBtn.addEventListener('click', closeSubjectContent);
        console.log('✅ Close button handler added');
    } else {
        console.error('❌ Close button not found');
    }
}

// Инициализация кнопок после загрузки DOM
function initSubjectButtons() {
    subjectButtons = document.querySelectorAll('.subject-btn');
    if (subjectButtons.length === 0) {
        console.warn('Subject buttons not found, retrying...');
        setTimeout(initSubjectButtons, 100);
        return;
    }
    console.log('Found', subjectButtons.length, 'subject buttons');
    subjectButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const subject = btn.dataset.subject;
            console.log('Button clicked, subject:', subject);
            showSubject(subject);
        });
    });
}

// ===== SINGLE CARD VARIABLES =====
let singleCard = null;
let singleCardWrapper = null;
let cardIndicators = null;
let currentCardIndex = 0;
let isCardDragging = false;
let dragStartX = 0;
let autoRotateInterval = null;
let isAutoRotating = true;
let touchStartX = 0;
let subjects = ['father', 'elder-son', 'younger-son'];
let isSwitching = false; // Флаг для предотвращения двойного переключения
let animationFrameId = null; // ID для requestAnimationFrame

// ===== INITIALIZE SINGLE CARD =====
function init3DCylinder() {
    try {
        singleCard = document.getElementById('single-card');
        singleCardWrapper = document.getElementById('single-card-wrapper');
        cardIndicators = document.getElementById('card-indicators');
        
        if (!singleCard || !singleCardWrapper || !cardIndicators) {
            console.warn('Card elements not found, retrying...');
            setTimeout(init3DCylinder, 100);
            return;
        }
        
        // Создаем индикаторы
        subjects.forEach((subjectId, index) => {
            const indicator = document.createElement('div');
            indicator.className = 'card-indicator';
            if (index === 0) indicator.classList.add('active');
            indicator.dataset.index = index;
            indicator.addEventListener('click', () => {
                switchToCard(index);
            });
            cardIndicators.appendChild(indicator);
        });
        
        // Загружаем первую карточку
        updateCard(0);
        
        // Добавляем обработчики событий
        setupCardInteractions();
        
        // Запускаем авто-вращение с небольшой задержкой
        setTimeout(() => {
            startAutoRotation();
        }, 2000);
        
        console.log('✅ Single Card initialized');
    } catch (error) {
        console.error('Error initializing single card:', error);
    }
}

// ===== UPDATE CARD =====
function updateCard(index) {
    if (!singleCard || index < 0 || index >= subjects.length) return;
    
    currentCardIndex = index;
    const subjectId = subjects[index];
    const config = subjectsConfig[subjectId];
    
    if (!config) {
        console.warn(`Config not found for subject: ${subjectId}`);
        return;
    }
    
    // Обновляем содержимое карточки
    singleCard.innerHTML = `
        <div class="single-card-front" data-subject="${subjectId}">
            <img class="single-card-image" src="${config.image}" alt="${subjectId}" loading="lazy">
            <div class="single-card-overlay">
                <h3 class="single-card-title">${getSubjectTitle(subjectId)}</h3>
            </div>
        </div>
    `;
    
    // Обновляем индикаторы
    const indicators = cardIndicators.querySelectorAll('.card-indicator');
    indicators.forEach((ind, i) => {
        if (i === index) {
            ind.classList.add('active');
        } else {
            ind.classList.remove('active');
        }
    });
    
    // Обновляем динамические кнопки
    updateDynamicLinks(subjectId);
}

// ===== SWITCH TO CARD =====
function switchToCard(index, direction = 'next') {
    if (index < 0 || index >= subjects.length) return;
    
    // Защита от двойного переключения
    if (isSwitching) {
        console.log('Already switching, ignoring...');
        return;
    }
    
    // Если пытаемся переключиться на ту же карточку
    if (index === currentCardIndex) {
        return;
    }
    
    isSwitching = true;
    stopAutoRotation(); // Останавливаем авто-вращение при ручном переключении
    
    // Добавляем класс для анимации
    singleCard.classList.add('flipping');
    
    // Определяем направление вращения
    const rotation = direction === 'next' ? 180 : -180;
    const startRotation = 0;
    const targetRotation = rotation;
    const duration = 600; // Длительность анимации
    const startTime = performance.now();
    
    // Плавная анимация вращения
    function animateRotation(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing функция для плавности
        const easeProgress = 0.5 - Math.cos(progress * Math.PI) / 2;
        
        const currentRotation = startRotation + (targetRotation * easeProgress);
        singleCard.style.transform = `rotateY(${currentRotation}deg)`;
        
        // После половины анимации меняем карточку
        if (progress >= 0.5 && index !== currentCardIndex) {
            updateCard(index);
        }
        
        if (progress < 1) {
            animationFrameId = requestAnimationFrame(animateRotation);
        } else {
            // Завершаем анимацию
            singleCard.classList.remove('flipping');
            singleCard.style.transform = 'rotateY(0deg)';
            isSwitching = false;
            animationFrameId = null;
            
            // Возобновляем авто-вращение через 3 секунды
            setTimeout(() => {
                if (!isCardDragging && !isSwitching) {
                    isAutoRotating = true;
                    startAutoRotation();
                }
            }, 3000);
        }
    }
    
    animationFrameId = requestAnimationFrame(animateRotation);
}

function getSubjectTitle(subjectId) {
    const titles = {
        'father': 'ОТЕЦ',
        'elder-son': 'СТАРШИЙ СЫН',
        'younger-son': 'МЛАДШИЙ СЫН'
    };
    return titles[subjectId] || subjectId.toUpperCase();
}

// ===== SETUP CARD INTERACTIONS =====
function setupCardInteractions() {
    if (!singleCardWrapper) return;
    
    let dragStartX = 0;
    let dragDistance = 0;
    let hasDragged = false;
    const swipeThreshold = 50; // Минимальное расстояние для смены карточки
    
    // Mouse drag
    singleCardWrapper.addEventListener('mousedown', (e) => {
        // Проверяем, кликнули ли на карточку
        const clickedCard = e.target.closest('.single-card-front');
        if (clickedCard) {
            // Если клик на карточку, обрабатываем клик
            return;
        }
        
        isCardDragging = true;
        isAutoRotating = false;
        stopAutoRotation();
        dragStartX = e.clientX;
        dragDistance = 0;
        hasDragged = false;
        singleCardWrapper.style.cursor = 'grabbing';
    });
    
    let lastRotation = 0;
    function updateDragRotation() {
        if (!isCardDragging) return;
        
        const currentMouseX = window.mouseX || dragStartX;
        const deltaX = currentMouseX - dragStartX;
        dragDistance = Math.abs(deltaX);
        
        if (dragDistance > 5) {
            hasDragged = true;
        }
        
        // Вращаем карточку при drag с плавностью
        const rotation = deltaX * 0.5; // Скорость вращения
        lastRotation = rotation;
        
        // Используем requestAnimationFrame для плавности
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
        
        function smoothRotate() {
            if (isCardDragging) {
                singleCard.style.transform = `rotateY(${lastRotation}deg)`;
                animationFrameId = requestAnimationFrame(smoothRotate);
            } else {
                animationFrameId = null;
            }
        }
        
        animationFrameId = requestAnimationFrame(smoothRotate);
    }
    
    document.addEventListener('mousemove', (e) => {
        if (!isCardDragging) return;
        
        window.mouseX = e.clientX;
        updateDragRotation();
    });
    
    document.addEventListener('mouseup', () => {
        if (isCardDragging) {
            isCardDragging = false;
            singleCardWrapper.style.cursor = 'grab';
            
            // Отменяем анимацию drag
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
            }
            
            // Если был достаточный swipe, меняем карточку
            if (hasDragged && dragDistance > swipeThreshold && !isSwitching) {
                const currentMouseX = window.mouseX || dragStartX;
                const deltaX = currentMouseX - dragStartX;
                
                if (deltaX > 0) {
                    // Swipe вправо - предыдущая карточка
                    const prevIndex = (currentCardIndex - 1 + subjects.length) % subjects.length;
                    switchToCard(prevIndex, 'prev');
                } else {
                    // Swipe влево - следующая карточка
                    const nextIndex = (currentCardIndex + 1) % subjects.length;
                    switchToCard(nextIndex, 'next');
                }
            } else {
                // Плавно возвращаем карточку в исходное положение
                const startRotation = lastRotation;
                const targetRotation = 0;
                const duration = 300;
                const startTime = performance.now();
                
                function returnToStart(currentTime) {
                    const elapsed = currentTime - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    const easeProgress = 1 - Math.pow(1 - progress, 3);
                    
                    const currentRotation = startRotation + (targetRotation - startRotation) * easeProgress;
                    singleCard.style.transform = `rotateY(${currentRotation}deg)`;
                    
                    if (progress < 1) {
                        animationFrameId = requestAnimationFrame(returnToStart);
                    } else {
                        singleCard.style.transform = 'rotateY(0deg)';
                        animationFrameId = null;
                    }
                }
                
                animationFrameId = requestAnimationFrame(returnToStart);
            }
            
            // Сбрасываем состояние
            dragStartX = 0;
            dragDistance = 0;
            hasDragged = false;
            lastRotation = 0;
        }
    });
    
    // Touch events для мобильных
    singleCardWrapper.addEventListener('touchstart', (e) => {
        isCardDragging = true;
        isAutoRotating = false;
        stopAutoRotation();
        touchStartX = e.touches[0].clientX;
        dragDistance = 0;
        hasDragged = false;
        e.preventDefault();
    }, { passive: false });
    
    let touchLastRotation = 0;
    singleCardWrapper.addEventListener('touchmove', (e) => {
        if (!isCardDragging) return;
        
        const deltaX = e.touches[0].clientX - touchStartX;
        dragDistance = Math.abs(deltaX);
        
        if (dragDistance > 5) {
            hasDragged = true;
        }
        
        const rotation = deltaX * 0.5;
        touchLastRotation = rotation;
        
        // Плавное обновление через requestAnimationFrame
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
        
        function smoothTouchRotate() {
            if (isCardDragging) {
                singleCard.style.transform = `rotateY(${touchLastRotation}deg)`;
                animationFrameId = requestAnimationFrame(smoothTouchRotate);
            } else {
                animationFrameId = null;
            }
        }
        
        animationFrameId = requestAnimationFrame(smoothTouchRotate);
        e.preventDefault();
    }, { passive: false });
    
    singleCardWrapper.addEventListener('touchend', (e) => {
        if (isCardDragging) {
            isCardDragging = false;
            
            // Отменяем анимацию drag
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
            }
            
            if (hasDragged && dragDistance > swipeThreshold && !isSwitching) {
                const finalTouchX = e.changedTouches[0].clientX;
                const deltaX = finalTouchX - touchStartX;
                
                if (deltaX > 0) {
                    const prevIndex = (currentCardIndex - 1 + subjects.length) % subjects.length;
                    switchToCard(prevIndex, 'prev');
                } else {
                    const nextIndex = (currentCardIndex + 1) % subjects.length;
                    switchToCard(nextIndex, 'next');
                }
            } else {
                // Плавно возвращаем карточку
                const startRotation = touchLastRotation;
                const targetRotation = 0;
                const duration = 300;
                const startTime = performance.now();
                
                function returnToStart(currentTime) {
                    const elapsed = currentTime - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    const easeProgress = 1 - Math.pow(1 - progress, 3);
                    
                    const currentRotation = startRotation + (targetRotation - startRotation) * easeProgress;
                    singleCard.style.transform = `rotateY(${currentRotation}deg)`;
                    
                    if (progress < 1) {
                        animationFrameId = requestAnimationFrame(returnToStart);
                    } else {
                        singleCard.style.transform = 'rotateY(0deg)';
                        animationFrameId = null;
                    }
                }
                
                animationFrameId = requestAnimationFrame(returnToStart);
            }
            
            // Сбрасываем состояние
            touchStartX = 0;
            dragDistance = 0;
            hasDragged = false;
            touchLastRotation = 0;
        }
    });
    
    // Click на карточку
    singleCard.addEventListener('click', (e) => {
        const cardFront = e.target.closest('.single-card-front');
        if (cardFront && !hasDragged && dragDistance <= 5) {
            const subjectId = cardFront.dataset.subject;
            if (subjectId) {
                handleCardClick(subjectId);
            }
        }
    });
    
    // Остановка вращения при hover
    singleCardWrapper.addEventListener('mouseenter', () => {
        stopAutoRotation();
        isAutoRotating = false;
    });
    
    singleCardWrapper.addEventListener('mouseleave', () => {
        setTimeout(() => {
            if (!isCardDragging) {
                isAutoRotating = true;
                startAutoRotation();
            }
        }, 1000);
    });
}

// ===== HANDLE CARD CLICK =====
function handleCardClick(subjectId) {
    if (!subjectId) return;
    
    // Останавливаем вращение
    stopAutoRotation();
    isAutoRotating = false;
    
    // Открываем информацию о субъекте
    showSubject(subjectId);
}

// ===== START AUTO ROTATION =====
function startAutoRotation() {
    if (!isAutoRotating || isCardDragging || isSwitching) return;
    
    stopAutoRotation();
    
    autoRotateInterval = setInterval(() => {
        // Проверяем, что нет активных действий
        if (!isCardDragging && isAutoRotating && !isSwitching) {
            // Переключаем на следующую карточку каждые 5 секунд
            const nextIndex = (currentCardIndex + 1) % subjects.length;
            switchToCard(nextIndex, 'next');
        }
    }, 5000); // Меняем карточку каждые 5 секунд
}

function stopAutoRotation() {
    if (autoRotateInterval) {
        clearInterval(autoRotateInterval);
        autoRotateInterval = null;
    }
    
    // Отменяем любые активные анимации
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
}

function updateDynamicLinks(subjectId) {
    const dynamicLinksContainer = document.getElementById('dynamic-links-container');
    const dynamicLinks = document.getElementById('dynamic-links');
    
    if (!dynamicLinksContainer || !dynamicLinks) return;
    
    // Очищаем предыдущие кнопки
    dynamicLinks.innerHTML = '';
    
    const config = subjectsConfig[subjectId];
    if (!config) return;
    
    if (config.links && config.links.length > 0) {
        // Создаем кнопки для ссылок
        config.links.forEach(link => {
            const linkBtn = document.createElement('a');
            linkBtn.href = link.url;
            linkBtn.target = '_blank';
            linkBtn.className = 'dynamic-link-btn';
            linkBtn.innerHTML = `
                <span class="link-icon">${link.icon}</span>
                <span>${link.name}</span>
            `;
            dynamicLinks.appendChild(linkBtn);
        });
        
        // Добавляем кнопку донатов для всех
        const donateBtn = document.createElement('a');
        donateBtn.href = 'https://www.donationalerts.com/r/asdsfamily';
        donateBtn.target = '_blank';
        donateBtn.className = 'dynamic-link-btn donate-button';
        donateBtn.innerHTML = `
            <span class="link-icon">💰</span>
            <span>Донаты</span>
        `;
        dynamicLinks.appendChild(donateBtn);
        
        dynamicLinksContainer.classList.add('active');
    } else if (config.connectionText) {
        // Показываем текст связи
        const connectionDiv = document.createElement('div');
        connectionDiv.className = 'dynamic-connection-text';
        connectionDiv.textContent = config.connectionText;
        dynamicLinks.appendChild(connectionDiv);
        
        // Добавляем кнопку донатов
        const donateBtn = document.createElement('a');
        donateBtn.href = 'https://www.donationalerts.com/r/asdsfamily';
        donateBtn.target = '_blank';
        donateBtn.className = 'dynamic-link-btn donate-button';
        donateBtn.innerHTML = `
            <span class="link-icon">💰</span>
            <span>Донаты</span>
        `;
        dynamicLinks.appendChild(donateBtn);
        
        dynamicLinksContainer.classList.add('active');
    } else {
        dynamicLinksContainer.classList.remove('active');
    }
}

// Инициализация всех элементов
function initAll() {
    try {
        console.log('🚀 Initializing all elements...');
        initSubjectElements();
        initSubjectButtons();
        initLinksSection();
        
        // Инициализируем цилиндр с небольшой задержкой, чтобы не блокировать загрузку
        setTimeout(() => {
            init3DCylinder();
        }, 100);
        
        console.log('✅ Initialization complete');
    } catch (error) {
        console.error('Error during initialization:', error);
    }
}

// Инициализация секции ссылок
function initLinksSection() {
    const linksBtn = document.getElementById('links-btn');
    const linksSection = document.getElementById('links-section');
    const mainSection = document.getElementById('main-section');
    
    // Если кнопка "ССЫЛКИ" существует (старая версия), инициализируем её
    if (linksBtn && linksSection && mainSection) {
        linksBtn.addEventListener('click', () => {
            // Переключаем видимость секций
            if (linksSection.style.display === 'none') {
                linksSection.style.display = 'block';
                mainSection.style.display = 'none';
                linksSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
                linksSection.style.display = 'none';
                mainSection.style.display = 'block';
            }
        });
        
        // Добавляем кнопку "Назад" в секцию ссылок (если еще не добавлена)
        if (!linksSection.querySelector('.back-to-main-btn')) {
            const backBtn = document.createElement('button');
            backBtn.className = 'neon-button back-to-main-btn';
            backBtn.innerHTML = '<span class="button-icon">←</span><span class="button-text">НАЗАД</span><span class="button-glow"></span>';
            backBtn.style.marginBottom = '30px';
            backBtn.style.margin = '0 auto 30px';
            backBtn.style.display = 'block';
            backBtn.style.maxWidth = '300px';
            backBtn.addEventListener('click', () => {
                linksSection.style.display = 'none';
                mainSection.style.display = 'block';
                mainSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
            
            const linksContainer = linksSection.querySelector('.links-container');
            if (linksContainer) {
                linksContainer.insertBefore(backBtn, linksContainer.firstChild);
            }
        }
    }
    
    // Убеждаемся, что все кнопки в секции ссылок кликабельны
    function makeButtonsClickable() {
        const linksSection = document.getElementById('links-section');
        if (!linksSection) return;
        
        const linkButtons = linksSection.querySelectorAll('.link-button');
        linkButtons.forEach(button => {
            // Принудительно устанавливаем все необходимые свойства
            button.style.pointerEvents = 'auto';
            button.style.zIndex = '100000';
            button.style.position = 'relative';
            button.style.cursor = 'pointer';
            
            // Убеждаемся, что дочерние элементы не блокируют клики
            const children = button.querySelectorAll('*');
            children.forEach(child => {
                child.style.pointerEvents = 'none';
            });
            
            // Добавляем обработчик mousedown для принудительной обработки кликов
            button.addEventListener('mousedown', (e) => {
                e.stopPropagation();
                e.preventDefault();
                if (button.href && button.href !== '#') {
                    window.open(button.href, button.target || '_self');
                }
            }, true);
            
            // Также добавляем обработчик click
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                if (button.href && button.href !== '#') {
                    if (button.target === '_blank') {
                        window.open(button.href, '_blank');
                    } else {
                        window.location.href = button.href;
                    }
                }
            }, true);
        });
    }
    
    // Вызываем функцию сразу и после загрузки DOM
    makeButtonsClickable();
    
    // Также вызываем при показе секции
    if (linksSection) {
        const observer = new MutationObserver(() => {
            if (linksSection.style.display !== 'none') {
                setTimeout(makeButtonsClickable, 100);
            }
        });
        observer.observe(linksSection, { attributes: true, attributeFilter: ['style'] });
    }
}

if (document.readyState === 'loading') {
    console.log('⏳ Document is loading, waiting for DOMContentLoaded...');
    document.addEventListener('DOMContentLoaded', () => {
        console.log('📄 DOMContentLoaded fired');
        initAll();
    });
} else {
    console.log('✅ Document already loaded, initializing immediately');
    initAll();
}

// ===== GLOBAL CLICK HANDLER FOR BUTTONS =====
// Обработчик на уровне document для перехвата всех кликов на кнопках
document.addEventListener('click', (e) => {
    // Проверяем, кликнули ли на кнопку или её дочерний элемент
    const linkButton = e.target.closest('.link-button');
    if (linkButton && linkButton.href && linkButton.href !== '#' && linkButton.href !== 'javascript:void(0)') {
        e.preventDefault();
        e.stopPropagation();
        console.log('Global handler: Opening link:', linkButton.href);
        if (linkButton.target === '_blank') {
            window.open(linkButton.href, '_blank');
        } else {
            window.location.href = linkButton.href;
        }
        return false;
    }
}, true); // Используем capture phase для перехвата всех кликов

// ===== RANDOM CHARACTERS FOR DECODING =====
const randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';

function getRandomChar() {
    return randomChars[Math.floor(Math.random() * randomChars.length)];
}

// ===== TEXT DECODING ANIMATION (VERY FAST) =====
async function decodeText(lines) {
    decodedTextContainer.innerHTML = '';
    
    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
        const line = lines[lineIndex];
        if (!line) {
            const emptyLine = document.createElement('div');
            emptyLine.className = 'decoded-line';
            decodedTextContainer.appendChild(emptyLine);
            await new Promise(resolve => setTimeout(resolve, 20));
            continue;
        }
        
        const lineDiv = document.createElement('div');
        lineDiv.className = 'decoded-line';
        decodedTextContainer.appendChild(lineDiv);
        
        // Правильно обрабатываем пробелы
        const chars = [];
        for (let i = 0; i < line.length; i++) {
            chars.push(line[i]);
        }
        const charElements = [];
        
        // Создаем элементы для каждого символа (включая пробелы)
        for (let i = 0; i < chars.length; i++) {
            const charSpan = document.createElement('span');
            charSpan.className = 'decoded-char decoding';
            if (chars[i] === ' ') {
                charSpan.innerHTML = '&nbsp;';
                charSpan.style.width = '0.3em';
                charSpan.style.display = 'inline-block';
            } else {
                charSpan.textContent = getRandomChar();
            }
            lineDiv.appendChild(charSpan);
            charElements.push(charSpan);
        }
        
        // Декодируем каждый символ (очень быстро)
        for (let i = 0; i < chars.length; i++) {
            if (chars[i] === ' ') {
                charElements[i].textContent = '\u00A0';
                charElements[i].classList.remove('decoding');
                charElements[i].classList.add('decoded');
                continue;
            }
            
            const iterations = 2 + Math.floor(Math.random() * 3);
            
            for (let j = 0; j < iterations; j++) {
                await new Promise(resolve => setTimeout(resolve, 8));
                charElements[i].textContent = getRandomChar();
            }
            
            charElements[i].textContent = chars[i];
            charElements[i].classList.remove('decoding');
            charElements[i].classList.add('decoded');
            await new Promise(resolve => setTimeout(resolve, 5));
        }
        
        await new Promise(resolve => setTimeout(resolve, 30));
    }
}

// ===== PLATFORM ANIMATION =====
function animatePlatform() {
    const platform = document.getElementById('light-platform');
    if (platform) {
        platform.classList.add('active');
    }
}

// ===== LIGHT BEAM FROM PLATFORM =====
function activateLightBeam() {
    const beam = document.getElementById('light-beam');
    if (beam) {
        setTimeout(() => {
            beam.classList.add('active');
        }, 300);
    }
}

// ===== HOLOGRAM ANIMATION =====
function showHologram(imageSrc) {
    hologramImage.src = imageSrc;
    hologramFrame.classList.add('active');
}

// ===== SHOW SUBJECT CONTENT =====
async function showSubject(subjectKey) {
    console.log('showSubject called with:', subjectKey);
    const config = subjectsConfig[subjectKey];
    if (!config) {
        console.error('Config not found for subject:', subjectKey);
        return;
    }
    
    // Инициализируем элементы если они еще не инициализированы
    if (!subjectContent || !decodedTextContainer) {
        console.log('Elements not initialized, initializing...');
        initSubjectElements();
    }
    
    // Проверяем, что элемент существует
    if (!subjectContent) {
        console.error('Subject content element not found!');
        subjectContent = document.getElementById('subject-content');
        if (!subjectContent) {
            console.error('Still not found after retry!');
            alert('Ошибка: элемент не найден. Проверьте консоль.');
            return;
        }
    }
    
    if (!decodedTextContainer) {
        console.error('Decoded text container not found!');
        decodedTextContainer = document.getElementById('decoded-text');
        if (!decodedTextContainer) {
            console.error('Still not found after retry!');
            alert('Ошибка: контейнер текста не найден. Проверьте консоль.');
            return;
        }
    }
    
    console.log('All elements found, showing content...');
    
    // Показываем блок
    console.log('Setting display to flex...');
    subjectContent.style.display = 'flex';
    subjectContent.style.visibility = 'visible';
    subjectContent.style.opacity = '1';
    subjectContent.style.pointerEvents = 'auto';
    subjectContent.style.zIndex = '99999';
    subjectContent.classList.add('active');
    document.body.classList.add('subject-content-open');
    document.body.style.overflow = 'hidden';
    
    console.log('Window should be visible now');
    console.log('Computed styles:', {
        display: window.getComputedStyle(subjectContent).display,
        visibility: window.getComputedStyle(subjectContent).visibility,
        opacity: window.getComputedStyle(subjectContent).opacity,
        zIndex: window.getComputedStyle(subjectContent).zIndex
    });
    
    // Прокручиваем окно к началу
    subjectContent.scrollTop = 0;
    window.scrollTo(0, 0);
    
    // Сбрасываем состояние
    decodedTextContainer.innerHTML = '';
    const lightPlatform = document.getElementById('light-platform');
    const lightBeam = document.getElementById('light-beam');
    if (lightPlatform) lightPlatform.classList.remove('active');
    if (lightBeam) lightBeam.classList.remove('active');
    if (hologramFrame) hologramFrame.classList.remove('active');
    if (hologramImage) hologramImage.src = '';
    if (subjectLinks) subjectLinks.innerHTML = '';
    
    // Убеждаемся, что контейнер текста виден
    const textContainer = document.getElementById('subject-text-container');
    if (textContainer) {
        textContainer.style.opacity = '1';
        textContainer.style.visibility = 'visible';
    }
    
    // Начинаем декодирование текста
    await decodeText(config.text);
    
    // Анимируем платформу и луч
    setTimeout(() => {
        animatePlatform();
        // Запускаем луч от платформы
        activateLightBeam();
    }, 500);
    
    // Показываем голограмму после луча
    setTimeout(() => {
        showHologram(config.image);
    }, 1500);
    
    // Показываем ссылки или текст связи
    setTimeout(() => {
        if (config.links) {
            const linksContainer = document.createElement('div');
            linksContainer.className = 'social-buttons';
            
            config.links.forEach(link => {
                const linkBtn = document.createElement('a');
                linkBtn.href = link.url;
                linkBtn.target = '_blank';
                linkBtn.className = 'social-button';
                linkBtn.innerHTML = `<span>${link.icon}</span> ${link.name}`;
                linksContainer.appendChild(linkBtn);
            });
            
            subjectLinks.appendChild(linksContainer);
        } else if (config.connectionText) {
            const connectionDiv = document.createElement('div');
            connectionDiv.className = 'connection-text';
            connectionDiv.textContent = config.connectionText;
            subjectLinks.appendChild(connectionDiv);
        }
    }, 4000);
}

// ===== CLOSE SUBJECT CONTENT =====
function closeSubjectContent() {
    if (!subjectContent) return;
    
    subjectContent.classList.remove('active');
    subjectContent.style.display = 'none';
    document.body.classList.remove('subject-content-open');
    document.body.style.overflow = '';
    
    // Скрываем динамические кнопки
    const dynamicLinksContainer = document.getElementById('dynamic-links-container');
    if (dynamicLinksContainer) {
        dynamicLinksContainer.classList.remove('active');
    }
    
    // Сбрасываем все элементы
    setTimeout(() => {
        if (decodedTextContainer) decodedTextContainer.innerHTML = '';
        if (lightPlatform) lightPlatform.classList.remove('active');
        if (lightBeam) lightBeam.classList.remove('active');
        if (hologramFrame) hologramFrame.classList.remove('active');
        if (hologramImage) hologramImage.src = '';
        if (subjectLinks) subjectLinks.innerHTML = '';
        
        // Возобновляем авто-вращение через 1 секунду
        setTimeout(() => {
            if (!isCardDragging) {
                isAutoRotating = true;
                startAutoRotation();
            }
        }, 1000);
    }, 500);
}

// ===== EVENT LISTENERS =====
if (closeSubjectBtn) {
    closeSubjectBtn.addEventListener('click', closeSubjectContent);
}

// Закрытие по ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && subjectContent.classList.contains('active')) {
        closeSubjectContent();
    }
});

// ===== CONSOLE MESSAGE =====
console.log('%c🎮 ASDS Games', 'color: #00f3ff; font-size: 24px; font-weight: bold; text-shadow: 0 0 10px #00f3ff;');
console.log('%cWelcome to the gaming zone!', 'color: #b300ff; font-size: 16px;');
console.log('%cPress T to toggle Twitch, M to minimize, ESC to close', 'color: #00ff88; font-size: 12px;');
