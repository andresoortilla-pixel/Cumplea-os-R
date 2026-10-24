// Autocarga de los archivos nuevos si el index.html no los incluye
(function () {
    if (!document.querySelector('link[href*="upgrade.css"]')) {
        const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'css/upgrade.css'; document.head.appendChild(l);
    }
    if (!document.querySelector('link[href*="polish.css"]')) {
        const p = document.createElement('link'); p.rel = 'stylesheet'; p.href = 'css/polish.css'; document.head.appendChild(p);
    }
    if (!window.startWarp && !document.querySelector('script[src*="warp.js"]')) {
        const s = document.createElement('script'); s.src = 'js/warp.js'; document.body.appendChild(s);
    }
})();
document.addEventListener('DOMContentLoaded', () => {
    // --- REFERENCIAS DE ESCENAS Y FASE 1 / 2 ---
    const scene1 = document.getElementById('scene-1');
    const scene2 = document.getElementById('scene-2');
    const scene3 = document.getElementById('scene-3');
    const btnYes = document.getElementById('btn-yes');
    const btnNo = document.getElementById('btn-no');
    const buttonsContainer = document.getElementById('buttons-container');
    const questionText = document.getElementById('question-text');
    const jokeResponse = document.getElementById('joke-response');
    const jokeText = document.getElementById('joke-text');
    const jokeGif = document.getElementById('joke-gif');
    const shatterOverlay = document.getElementById('shatter-overlay');
    const giantGiftTrigger = document.getElementById('giant-gift-trigger');

    // --- REFERENCIAS FASE 3 (DIARIO) ---
    const btnOpenDiary = document.getElementById('btn-open-diary');
    const btnCloseDiary = document.getElementById('btn-close-diary');
    const diaryModal = document.getElementById('diary-modal');
    const book = document.getElementById('book');
    const pages = document.querySelectorAll('.diary-page');
    const prevPageBtn = document.getElementById('prev-page');
    const nextPageBtn = document.getElementById('next-page');
    const pageIndicator = document.getElementById('page-indicator');
    let currentPage = 1;

    // --- REFERENCIAS FASE 4 Y 5 (PASTEL, AUDIO Y WHATSAPP) ---
    const btnOpenCake = document.getElementById('btn-open-cake');
    const btnCloseCake = document.getElementById('btn-close-cake');
    const cakeModal = document.getElementById('cake-modal');
    const birthdayAudio = document.getElementById('birthday-audio');
    const cakeMessage = document.getElementById('cake-message');
    const btnFinalGift = document.getElementById('btn-final-gift');
    const finalGiftModal = document.getElementById('final-gift-modal');
    const btnCloseFinal = document.getElementById('btn-close-final');

    const waLink = document.getElementById('whatsapp-link');
    if (waLink) {
        const msg = `_Así que sí decidiste reclamar tu regalo, pues aquí vamos_ 🎁

🍽️ *Tengo antojo de:*
🏪 *Nombre del restaurante:*
📋 *Qué quieres del menú:*
📍 *Dirección de envío:*`;
        waLink.href = waLink.href.split('?')[0] + '?text=' + encodeURIComponent(msg);
    }

    let confettiInterval = null;
    let cakeBuilt = false;
    let isExploding = false;

    // Audio 1 (suena al explotar el regalo) y utilidad de fundido
    const introAudio = new Audio('assets/audio/inicio.mp3');
    introAudio.loop = true; introAudio.volume = 0.8;
    const fadeAudio = (a, to, ms, done) => {
        const from = a.volume, st = performance.now();
        (function f(n) {
            const k = Math.min(1, (n - st) / ms);
            a.volume = from + (to - from) * k;
            k < 1 ? requestAnimationFrame(f) : (done && done());
        })(st);
    };

    // Banderines curvos, estrellitas y stickers como en la referencia
    (function buildDecor() {
        document.querySelectorAll('.bunting').forEach(el => {
            const P0 = [0, 92], P1 = [190, 100], P2 = [372, 6];
            let f = '';
            for (let i = 0; i < 11; i++) {
                const t = (i + .5) / 11, u = 1 - t;
                const x = u*u*P0[0] + 2*u*t*P1[0] + t*t*P2[0], y = u*u*P0[1] + 2*u*t*P1[1] + t*t*P2[1];
                const a = Math.atan2(2*u*(P1[1]-P0[1]) + 2*t*(P2[1]-P1[1]), 2*u*(P1[0]-P0[0]) + 2*t*(P2[0]-P1[0])) * 180 / Math.PI;
                f += `<path d="M-14 0 L14 0 L0 38Z" transform="translate(${x} ${y}) rotate(${a})" fill="${i % 2 ? '#f9a8bb' : '#f65c78'}" stroke="#3a2229" stroke-width="1.5" stroke-linejoin="round"/>`;
            }
            el.innerHTML = `<svg viewBox="0 0 380 135"><path d="M0 92 Q190 100 372 6" fill="none" stroke="#3a2229" stroke-width="2"/>${f}</svg>`;
        });
        const sc = document.getElementById('scene-3'); if (!sc) return;
        [[6,22],[13,60],[30,12],[44,8],[47,30],[63,5],[62,84],[93,40],[4,92],[88,88]].forEach(([l, t], i) => {
            const e = document.createElement('i'); e.className = 'spark';
            e.style.cssText = `left:${l}%;top:${t}%;animation-delay:${1.8 + i * .15}s,${i * .3}s`; sc.appendChild(e);
        });
        const lobes = [...Array(12)].map((_, i) => { const a = i * Math.PI / 6; return `<circle cx="${60 + 38*Math.cos(a)}" cy="${60 + 38*Math.sin(a)}" r="17"/>`; }).join('');
        sc.insertAdjacentHTML('beforeend',
          `<svg class="sticker-blob" viewBox="0 0 120 120"><g fill="#f5596f">${lobes}<circle cx="60" cy="60" r="42"/></g></svg>
           <svg class="sticker-smile" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="#fff" stroke="#3a2229" stroke-width="4"/>
           <ellipse cx="35" cy="40" rx="5" ry="8" fill="#3a2229"/><ellipse cx="65" cy="40" rx="5" ry="8" fill="#3a2229"/>
           <path d="M25 60 Q50 88 75 60" fill="none" stroke="#3a2229" stroke-width="5" stroke-linecap="round"/></svg>`);
    })();

    // Función auxiliar para disparar confeti sin bloquear el código si falla internet
    const safeConfetti = (options) => {
        if (typeof confetti === 'function') {
            confetti(options);
        }
    };

    // ==========================================
    // LÓGICA FASE 1: BROMA INICIAL
    // ==========================================
    const handleInitialChoice = (choice) => {
        buttonsContainer.classList.add('hidden');
        questionText.classList.add('hidden');
        jokeResponse.classList.remove('hidden');

        if (choice === 'yes') {
            jokeText.textContent = "Pues qué lástima porque no hay regalo 🤣";
            jokeGif.classList.remove('hidden');
        } else {
            jokeText.textContent = "Qué bueno porque para ti no hay regalo jajaj 😜";
            jokeGif.classList.add('hidden');
        }

        // Esperamos 3.8 segundos y rompemos la pantalla
        setTimeout(runStory, choice === 'yes' ? 8000 : 4200);   // 8 s = lo que dura el GIF
    };

    if (btnYes) btnYes.addEventListener('click', () => handleInitialChoice('yes'));
    if (btnNo) btnNo.addEventListener('click', () => handleInitialChoice('no'));

    // ==========================================
    // LÓGICA FASE 2: PANTALLA SE HACE PEDAZOS
    // ==========================================
    const wait = ms => new Promise(r => setTimeout(r, ms));
    async function runStory() {
        jokeResponse.style.transition = 'opacity .7s';
        jokeResponse.style.opacity = 0; await wait(750);
        jokeGif.classList.add('hidden');
        jokeText.textContent = 'Es broma, sí te mereces un regalo por todo lo que has hecho 💖';
        jokeResponse.style.opacity = 1; await wait(4500);
        jokeResponse.style.opacity = 0; await wait(800);
        const st = document.createElement('div');
        st.id = 'story'; st.innerHTML = '<h1>VAMOS</h1>';
        document.body.appendChild(st);
        void st.offsetWidth; st.classList.add('on'); await wait(1000);
        const h = st.firstChild; h.classList.add('on'); await wait(2600);
        h.classList.remove('on'); await wait(1000);
        shatterScreen();
    }

    function shatterScreen() {
        const swapScene = () => {
            const st = document.getElementById('story'); if (st) st.remove();
            scene1.classList.remove('active'); scene1.classList.add('hidden');
            scene2.classList.remove('hidden'); scene2.classList.add('active');
        };
        if (typeof window.startWarp === 'function') window.startWarp(swapScene);
        else swapScene(); // respaldo: si warp.js no cargó, pasa igual a la siguiente fase
    }
    function _oldShatter() {
        if (shatterOverlay) {
            shatterOverlay.classList.remove('hidden');
            shatterOverlay.classList.add('crack');
        }

        setTimeout(() => {
            scene1.classList.remove('active');
            scene1.classList.add('hidden');
            scene2.classList.remove('hidden');
            scene2.classList.add('active');

            if (shatterOverlay) shatterOverlay.classList.add('fall');
        }, 400);

        setTimeout(() => {
            if (shatterOverlay) shatterOverlay.classList.add('hidden');
        }, 1700);
    }

    // ==========================================
    // LÓGICA FASE 3: EXPLOSIÓN DEL REGALO Y PASO A ESCENA 3
    // ==========================================
    if (giantGiftTrigger) {
        giantGiftTrigger.addEventListener('click', () => {
            if (isExploding) return;
            isExploding = true;

            const customGift = document.getElementById('custom-gift');
            const shockwave = document.getElementById('shockwave');
            const explosionFlash = document.getElementById('explosion-flash');
            const openLabel = document.getElementById('open-label-text');
            const tapHint = document.getElementById('tap-hint-text');

            // 1. Sobrecarga del regalo
            if (openLabel) openLabel.textContent = "¡¡VA A EXPLOTAR!! 💥";
            if (tapHint) tapHint.classList.add('hidden');
            if (customGift) customGift.classList.add('charging');

            // 2. Detonación (tapa vuela + onda expansiva)
            setTimeout(() => {
                if (customGift) {
                    customGift.classList.remove('charging');
                    customGift.classList.add('detonate');
                }
                if (shockwave) shockwave.classList.add('boom');
                introAudio.play().catch(() => console.log('Coloca inicio.mp3 en assets/audio/'));

                safeConfetti({
                    particleCount: 90,
                    spread: 360,
                    startVelocity: 45,
                    origin: { x: 0.5, y: 0.55 },
                    colors: ['#ff2e63', '#ffd32a', '#ffffff', '#ff85a2']
                });
            }, 550);

            // 3. Destello blanco
            setTimeout(() => {
                if (explosionFlash) {
                    explosionFlash.classList.remove('hidden');
                    void explosionFlash.offsetWidth;
                    explosionFlash.classList.add('flash-on');
                }
            }, 1500);

            // 4. Cambio a Escena 3 y aparición de los elementos
            setTimeout(() => {
                scene2.classList.remove('active');
                scene2.classList.add('hidden');
                scene3.classList.remove('hidden');
                scene3.classList.add('active');

                if (explosionFlash) {
                    explosionFlash.classList.remove('flash-on');
                    explosionFlash.classList.add('flash-fade');
                }

                safeConfetti({
                    particleCount: 140,
                    spread: 110,
                    origin: { y: 0.5 }
                });

                // Mostrar las letras Happy Birthday, el osito y los botones
                runVideoEntranceAnimations();
            }, 1900);

            // 5. Ocultar capa del destello
            setTimeout(() => {
                if (explosionFlash) explosionFlash.classList.add('hidden');
            }, 3100);
        });
    }

    // Secuencia que hace visibles los elementos en la pantalla de cuadrícula rosa
    function runVideoEntranceAnimations() {
        const sequence = [
            { id: 'anim-happy', delay: 150 },
            { id: 'anim-birthday', delay: 450 },
            { id: 'anim-hat', delay: 800 },
            { id: 'anim-date', delay: 1050 },
            { id: 'anim-neon', delay: 950 },
            { id: 'anim-char', delay: 1300 },
            { id: 'anim-buttons', delay: 1600 }
        ];

        sequence.forEach(item => {
            setTimeout(() => {
                const el = document.getElementById(item.id);
                if (el) el.classList.add('show');
            }, item.delay);
        });
    }

    // ==========================================
    // LÓGICA MODAL 1: DIARIO 3D CON FÍSICA
    //   · movimiento en dos etapas (referencia suave + hoja con resorte): arranque y llegada sin tirones
    //   · al caer sobre la pila rebota apenas, como papel real
    //   · se arrastra con dedo/mouse (con inercia) o se toca la hoja para avanzar
    //   · sombras dinámicas, la hoja se levanta y se curva mientras gira
    // ==========================================
    (function initDiary() {
        const bookCover = document.getElementById('book-cover');
        const coverBack = bookCover ? bookCover.querySelector('.cover-back') : null;
        const bookInside = book ? book.querySelector('.book-inside') : null;
        const controls = document.querySelector('.page-controls');
        if (!book || !bookCover || !coverBack || !bookInside || !pages.length) return;

        const N = pages.length;
        const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
        const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
        let autoCloseT = null, closingDiary = false, diaryOpen = false;

        // --- Página izquierda de cada "pliego" (reverso de la hoja anterior) ---
        const spreads = [
            { badge: 'Edición especial ★ N°1', quote: '“Pequeños fragmentos de momentos que valen oro...”', emojis: ['🌸', '✨', '🐼', '✨', '🌸'] },
            { badge: 'Recuerdos ★ N°2', quote: '“Las risas compartidas son las páginas que más se vuelven a leer...”', emojis: ['🎈', '✨', '🐱', '✨', '🎈'] },
            { badge: 'Siempre aquí ★ N°3', quote: '“Hay personas que se sienten como hogar, aunque estén lejos...”', emojis: ['🌟', '💌', '🐼', '💌', '🌟'] },
            { badge: 'Mis deseos ★ N°4', quote: '“Que este año te devuelva todo lo bonito que tú das...”', emojis: ['🎂', '✨', '🎁', '✨', '🎂'] }
        ];
        const leftPage = d => `<div class="left-page"><span class="lp-badge">${d.badge}</span><p class="lp-quote">${d.quote}</p><div class="lp-emojis">${d.emojis.map(e => `<span>${e}</span>`).join('')}</div></div>`;

        coverBack.innerHTML = leftPage(spreads[0]);
        coverBack.firstElementChild.classList.add('on-cover');       // el interior de la portada es la primera página izquierda

        pages.forEach((pg, i) => pg.insertAdjacentHTML('beforeend',
            `<i class="page-shade"></i><i class="page-shade back"></i>
             <div class="page-back">${leftPage(spreads[Math.min(i + 1, spreads.length - 1)])}</div>
             <p class="page-hint">${i === N - 1 ? 'Cuando termines, toca «Cerrar» 💌' : 'Toca la hoja o usa los botones para avanzar ➜'}</p>`));
        book.querySelectorAll('img').forEach(img => { img.draggable = false; });

        // --- Motor de física ---
        // etapa 1: una "referencia" viaja suave hacia el destino (críticamente amortiguada → sin sacudidas)
        // etapa 2: la hoja persigue la referencia con un resorte casi crítico → asienta con un golpecito mínimo
        const sheets = [];
        const makeSheet = (el, cfg) => {
            const s = Object.assign({ el, angle: 0, vel: 0, ref: 0, rv: 0, target: 0, drag: false,
                w1: 8.4, w2: 13, z2: 0.7, zClosed: 0, zOpen: 0, lift: 34, occ: 0 }, cfg);
            if (reduceMotion) { s.w1 = 30; s.w2 = 40; s.z2 = 1; s.lift = 0; }
            sheets.push(s);
            return s;
        };
        const cover = makeSheet(bookCover, { w1: 6.4, w2: 10, zClosed: 14, zOpen: 0, lift: 26 });
        const pagesS = [...pages].map((el, i) => makeSheet(el, { page: true, zClosed: (N - i) * 2, zOpen: (i + 1) * 2 }));

        const reset = s => { s.angle = s.ref = s.target = 0; s.vel = s.rv = 0; s.drag = false; };

        // Cada hoja en movimiento oscurece a sus vecinas (oclusión ambiental)
        function occlude() {
            pagesS.forEach(s => { s.occ = 0; });
            pagesS.forEach((s, i) => {
                const a = Math.sin(Math.PI * clamp(-s.angle / 180, 0, 1)) * 0.42;
                if (a < 0.01) return;
                [pagesS[i - 1], pagesS[i + 1]].forEach(n => { if (n) n.occ = Math.max(n.occ, a); });
            });
        }

        function render(s) {
            const p = clamp(-s.angle / 180, 0, 1);               // 0 = a la derecha · 1 = volteada
            const arc = Math.sin(Math.PI * p);                   // 0 plana · 1 vertical
            const z = s.zClosed + (s.zOpen - s.zClosed) * p + arc * s.lift;   // se levanta al girar
            const flex = arc * -2.2 + clamp(s.vel * -0.0035, -3, 3);          // el borde libre se curva con la velocidad
            s.el.style.transform = `translateZ(${z.toFixed(2)}px) rotateY(${s.angle.toFixed(3)}deg) skewY(${flex.toFixed(3)}deg)`;
            if (s.page) s.el.style.setProperty('--sh', Math.max(arc * 0.55, s.occ).toFixed(3));
        }

        let rafId = null, lastT = 0;
        function tick(now) {
            const dt = Math.min(0.05, Math.max(0.001, (now - lastT) / 1000)); lastT = now;
            const steps = Math.max(1, Math.ceil(dt / 0.004)), h = dt / steps;   // sub-pasos pequeños = integración estable
            let busy = false;
            for (const s of sheets) {
                if (s.drag) { busy = true; continue; }
                if (s.vel === 0 && s.rv === 0 && s.angle === s.target && s.ref === s.target) continue;
                for (let i = 0; i < steps; i++) {
                    s.rv += (s.w1 * s.w1 * (s.target - s.ref) - 2 * s.w1 * s.rv) * h;
                    s.ref += s.rv * h;
                    s.vel += (s.w2 * s.w2 * (s.ref - s.angle) - 2 * s.z2 * s.w2 * s.vel) * h;
                    s.angle += s.vel * h;
                    if (s.angle < -180) { s.angle = -180; s.vel *= -0.2; }     // aterriza en la pila izquierda
                    else if (s.angle > 0) { s.angle = 0; s.vel *= -0.2; }      // aterriza en la pila derecha
                }
                if (Math.abs(s.vel) < 0.4 && Math.abs(s.rv) < 0.4 && Math.abs(s.target - s.angle) < 0.08 && Math.abs(s.target - s.ref) < 0.08) {
                    s.angle = s.ref = s.target; s.vel = s.rv = 0;
                } else busy = true;
            }
            occlude();
            sheets.forEach(render);
            rafId = busy ? requestAnimationFrame(tick) : null;
        }
        const kick = () => { if (!rafId) { lastT = performance.now(); rafId = requestAnimationFrame(tick); } };

        // --- Navegación ---
        function updateControls() {
            pages.forEach((p, i) => p.classList.toggle('active', i + 1 === currentPage));
            const last = currentPage === N;
            if (pageIndicator) pageIndicator.textContent = `${currentPage} / ${N}`;
            if (prevPageBtn) prevPageBtn.disabled = currentPage === 1;
            if (nextPageBtn) nextPageBtn.textContent = last ? 'Cerrar 💌' : 'Siguiente ➔';
            if (controls) controls.classList.toggle('show', diaryOpen && !closingDiary);
            clearTimeout(autoCloseT);
        }

        function setPage(n) {
            currentPage = clamp(n, 1, N);
            pagesS.forEach((s, i) => { s.target = (i + 1) < currentPage ? -180 : 0; });
            updateControls();
            kick();
        }

        async function openDiary() {
            closingDiary = false; diaryOpen = false;
            book.classList.remove('closing', 'open');
            sheets.forEach(reset);
            currentPage = 1; updateControls(); occlude(); sheets.forEach(render);
            document.body.classList.add('diary-open');           // pausa las animaciones de atrás para que todo vaya a 60 fps
            diaryModal.classList.remove('hidden');
            await wait(380);
            book.classList.add('open');
            cover.target = -180; kick();
            await wait(1000);
            diaryOpen = true; updateControls();
        }

        async function closeDiaryAnimated(fast) {
            if (closingDiary || (!diaryOpen && !book.classList.contains('open'))) return;
            closingDiary = true; diaryOpen = false;
            clearTimeout(autoCloseT);
            book.classList.add('closing');
            updateControls();
            const flipped = pagesS.filter(s => s.target === -180).reverse();
            for (const s of flipped) {                           // las hojas regresan una tras otra, solapándose
                s.target = 0; kick();
                currentPage = pagesS.indexOf(s) + 1; updateControls();
                await wait(fast ? 120 : 300);
            }
            await wait(fast ? 320 : 800);
            book.classList.remove('open');
            cover.target = 0; kick();                            // la portada se cierra
            await wait(fast ? 900 : 1300);
            diaryModal.classList.add('hidden');
            document.body.classList.remove('diary-open');
            book.classList.remove('closing');
            closingDiary = false; currentPage = 1; updateControls();
        }

        if (btnOpenDiary) btnOpenDiary.addEventListener('click', openDiary);
        if (btnCloseDiary) btnCloseDiary.addEventListener('click', () => closeDiaryAnimated(true));
        if (prevPageBtn) prevPageBtn.addEventListener('click', () => { if (diaryOpen && currentPage > 1) setPage(currentPage - 1); });
        if (nextPageBtn) nextPageBtn.addEventListener('click', () => {
            if (!diaryOpen) return;
            if (currentPage < N) setPage(currentPage + 1); else closeDiaryAnimated(false);
        });
        document.addEventListener('keydown', e => {
            if (!diaryOpen || diaryModal.classList.contains('hidden')) return;
            if (e.key === 'ArrowRight' && currentPage < N) setPage(currentPage + 1);
            else if (e.key === 'ArrowLeft' && currentPage > 1) setPage(currentPage - 1);
            else if (e.key === 'Escape') closeDiaryAnimated(true);
        });

        // --- Arrastrar (con inercia) o tocar la hoja ---
        let press = null, dragS = null;
        const bookW = () => book.offsetWidth || 320;

        book.addEventListener('pointerdown', e => {
            if (!diaryOpen || closingDiary) return;
            press = { x: e.clientX };
        });
        book.addEventListener('pointermove', e => {
            if (!press) return;
            const now = performance.now();
            if (!dragS) {
                const dx = e.clientX - press.x;
                if (Math.abs(dx) < 7) return;
                const fwd = dx < 0;                              // izquierda = siguiente · derecha = anterior
                const idx = fwd ? currentPage - 1 : currentPage - 2;
                if (idx < 0 || idx >= N || (fwd && currentPage === N)) { press = null; return; }
                dragS = pagesS[idx]; dragS.drag = true; dragS.vel = 0;
                Object.assign(press, { x: e.clientX, base: fwd ? 0 : -180, lastA: dragS.angle, lastT: now });
                try { book.setPointerCapture(e.pointerId); } catch (_) {}
                clearTimeout(autoCloseT);
                kick();
                return;
            }
            dragS.angle = clamp(press.base + (e.clientX - press.x) / (bookW() * 0.85) * 180, -180, 0);
            dragS.ref = dragS.angle;
            const dtm = (now - press.lastT) / 1000;
            if (dtm > 0.004) {                                   // velocidad suavizada para la inercia
                dragS.vel = dragS.vel * 0.55 + ((dragS.angle - press.lastA) / dtm) * 0.45;
                dragS.rv = dragS.vel;
                press.lastA = dragS.angle; press.lastT = now;
            }
            kick();
        });
        const endDrag = e => {
            const s = dragS, was = press;
            press = null; dragS = null;
            if (!was) return;
            if (!s) {                                            // toque sin arrastrar: derecha avanza, izquierda retrocede
                if (e && e.type === 'pointerup' && diaryOpen && !closingDiary) {
                    const spine = bookInside.getBoundingClientRect().left;
                    if (e.clientX >= spine) { if (currentPage < N) setPage(currentPage + 1); }
                    else if (currentPage > 1) setPage(currentPage - 1);
                }
                return;
            }
            s.drag = false;
            const idx = pagesS.indexOf(s);
            const projected = s.angle + clamp(s.vel, -900, 900) * 0.18;   // hacia dónde iría con su inercia
            setPage(projected < -90 ? idx + 2 : idx + 1);
        };
        book.addEventListener('pointerup', endDrag);
        book.addEventListener('pointercancel', endDrag);
    })();

    // ==========================================
    // LÓGICA MODAL 2: PASTEL, CANCIÓN Y SERPENTINAS
    // ==========================================
    if (btnOpenCake) {
        btnOpenCake.addEventListener('click', () => {
            cakeModal.classList.remove('hidden');

            if (birthdayAudio) {
                fadeAudio(introAudio, 0, 800, () => introAudio.pause());
                birthdayAudio.currentTime = 0;
                birthdayAudio.play().catch(() => {
                    console.log("Coloca tu archivo cancion.mp3 en assets/audio/");
                });
            }

            startContinuousStreamers();

            if (!cakeBuilt) {
                buildCakeSequence();
                cakeBuilt = true;
            }
        });
    }

    if (btnCloseCake) {
        btnCloseCake.addEventListener('click', () => {
            cakeModal.classList.add('hidden');
            stopContinuousStreamers();
            if (birthdayAudio) birthdayAudio.pause();
            introAudio.volume = 0; introAudio.play().catch(() => {}); fadeAudio(introAudio, 0.8, 800);
        });
    }

    function startContinuousStreamers() {
        if (confettiInterval) clearInterval(confettiInterval);
        confettiInterval = setInterval(() => {
            safeConfetti({
                particleCount: 15,
                angle: 60,
                spread: 55,
                origin: { x: 0, y: 0.65 },
                colors: ['#ff6b8b', '#ffe89e', '#70a1ff', '#7bed9f']
            });
            safeConfetti({
                particleCount: 15,
                angle: 120,
                spread: 55,
                origin: { x: 1, y: 0.65 },
                colors: ['#ff6b8b', '#ffe89e', '#70a1ff', '#7bed9f']
            });
        }, 700);
    }

    function stopContinuousStreamers() {
        if (confettiInterval) {
            clearInterval(confettiInterval);
            confettiInterval = null;
        }
    }

    function buildCakeSequence() {
        const layers = [
            'layer-plate',
            'layer-bottom',
            'layer-middle',
            'layer-top',
            'layer-frosting',
            'layer-candle',
            'layer-flame'
        ];

        layers.forEach((id, index) => {
            setTimeout(() => {
                const layerEl = document.getElementById(id);
                if (layerEl) layerEl.classList.add('built');
            }, (index + 1) * 700);
        });

        const text = "¡Feliz vuelta al sol! 🎂✨ Que este nuevo año de vida te regale momentos increíbles, risas infinitas y mucha felicidad... Pero espera, aún falta una última sorpresa para ti:";
        // reserva desde el inicio el espacio del mensaje completo (invisible) para que nada se mueva
        cakeMessage.innerHTML = '<span class="tw-off"></span>'; cakeMessage.firstChild.textContent = text;
        setTimeout(() => {
            typeWriterEffect(cakeMessage, text, 45, () => {
                if (btnFinalGift) btnFinalGift.classList.remove('hidden');
            });
        }, 5200);
    }

    function typeWriterEffect(element, text, speed, callback) {
        if (!element) return;
        // Se escribe sobre el texto completo (invisible) para que el recuadro nunca cambie de altura
        element.innerHTML = '<span class="tw-on"></span><span class="tw-off"></span>';
        const on = element.firstChild, off = element.lastChild;
        off.textContent = text; let i = 0;
        const timer = setInterval(() => {
            if (i < text.length) {
                i++; on.textContent = text.slice(0, i); off.textContent = text.slice(i);
            } else {
                clearInterval(timer);
                if (callback) callback();
            }
        }, speed);
    }

    // ==========================================
    // LÓGICA MODAL 3: CARTA FINAL Y WHATSAPP
    // ==========================================
    if (btnFinalGift) {
        btnFinalGift.addEventListener('click', () => {
            cakeModal.classList.add('hidden');
            finalGiftModal.classList.remove('hidden');
        });
    }

    if (btnCloseFinal) {
        btnCloseFinal.addEventListener('click', () => {
            finalGiftModal.classList.add('hidden');
            stopContinuousStreamers();
        });
    }

    // ==========================================
    // CELULAR: el texto de cada hoja se ajusta para que se lea completo
    // ==========================================
    function fitPageTexts() {
        if (innerWidth >= 720) return;
        document.querySelectorAll('.diary-page .page-text').forEach(t => {
            t.style.fontSize = ''; t.style.lineHeight = '';
            let fs = parseFloat(getComputedStyle(t).fontSize);
            while (t.scrollHeight > t.clientHeight + 1 && fs > 9) {
                fs -= 0.5; t.style.fontSize = fs + 'px'; t.style.lineHeight = (fs * 1.3) + 'px';
            }
        });
    }
    new MutationObserver(() => { if (document.body.classList.contains('diary-open')) setTimeout(fitPageTexts, 120); })
        .observe(document.body, { attributes: true, attributeFilter: ['class'] });
    addEventListener('resize', () => setTimeout(fitPageTexts, 150));
    addEventListener('orientationchange', () => setTimeout(fitPageTexts, 300));
});
