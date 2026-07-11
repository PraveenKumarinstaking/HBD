// 🎂 Birthday Surprise Website Javascript Code

document.addEventListener('DOMContentLoaded', () => {
    
    // --- AUDIO SYSTEM SELECTIONS (Define first to avoid reference errors) ---
    const bgAudio = document.getElementById('bg-audio');
    const musicToggle = document.getElementById('music-toggle');
    const musicStatus = document.querySelector('.music-status');
    let isMusicPlaying = false;

    // --- 1. PRELOADER & PAGE TRANSITION ---
    const loadingScreen = document.getElementById('loading-screen');
    const mainContent = document.getElementById('main-content');
    const startSurpriseBtn = document.getElementById('start-surprise-btn');
    const entryBtn = document.getElementById('entry-btn');
    const loaderStatus = document.getElementById('loader-status');
    const loaderBarContainer = document.getElementById('loader-bar-container');
    
    // Attempt to start audio immediately (modern browsers allow muted autoplay)
    bgAudio.play().then(() => {
        isMusicPlaying = true;
        updateMusicButtonState(true);
    }).catch(err => {
        console.log("Muted autoplay blocked or deferred.");
    });

    // Global listener to unmute and start audio on the absolute first interaction anywhere on the screen
    const playOnFirstInteraction = () => {
        bgAudio.muted = false;
        startAudio();
        // Remove listeners once playback is triggered and unmuted
        if (isMusicPlaying && !bgAudio.muted) {
            document.removeEventListener('click', playOnFirstInteraction);
            document.removeEventListener('touchstart', playOnFirstInteraction);
        }
    };
    document.addEventListener('click', playOnFirstInteraction, { passive: true });
    document.addEventListener('touchstart', playOnFirstInteraction, { passive: true });

    // Show Entry Button after progress completes (3 seconds)
    setTimeout(() => {
        if (loaderBarContainer && loaderStatus && entryBtn) {
            loaderBarContainer.classList.add('hidden');
            loaderStatus.textContent = "Your Surprise is Ready! ✨";
            entryBtn.classList.remove('hidden');
        }
    }, 3000);

    // Dismiss preloader and start music when user clicks "Open Surprise"
    if (entryBtn) {
        entryBtn.addEventListener('click', () => {
            bgAudio.muted = false;
            startAudio();
            
            if (loadingScreen) {
                loadingScreen.style.opacity = '0';
                setTimeout(() => {
                    loadingScreen.classList.add('hidden');
                    mainContent.classList.remove('hidden');
                    document.body.classList.remove('preloading');
                    initBackgroundParticles();
                }, 1000);
            }
        });
    }

    // Scroll to welcome section on clicking start surprise
    if (startSurpriseBtn) {
        startSurpriseBtn.addEventListener('click', () => {
            document.getElementById('welcome').scrollIntoView({ behavior: 'smooth' });
            bgAudio.muted = false;
            startAudio(); // Ensure music is playing and unmuted
            startWelcomeTyping();
        });
    }

    // --- 2. AUDIO SYSTEM FOR BACKGROUND MUSIC ---

    function startAudio() {
        bgAudio.muted = false;
        bgAudio.play().then(() => {
            isMusicPlaying = true;
            updateMusicButtonState(true);
        }).catch(err => {
            console.log("Autoplay unmuting deferred until interaction.");
        });
    }

    function updateMusicButtonState(playing) {
        if (playing) {
            musicToggle.innerHTML = '<i class="fas fa-pause"></i>';
            musicStatus.textContent = "Playing Sweet Melody 🎵";
            musicToggle.classList.add('playing');
        } else {
            musicToggle.innerHTML = '<i class="fas fa-play"></i>';
            musicStatus.textContent = "Music Paused 🎵";
            musicToggle.classList.remove('playing');
        }
    }

    if (musicToggle) {
        musicToggle.addEventListener('click', () => {
            if (isMusicPlaying) {
                bgAudio.pause();
                isMusicPlaying = false;
                updateMusicButtonState(false);
            } else {
                startAudio();
            }
        });
    }

    // Play synthesis chime upon candle blowing
    function playCelebrationSound() {
        try {
            const ctx = audioCtx || new audioContextClass();
            const now = ctx.currentTime;
            
            // Play a celebratory chime
            const playChime = (freq, delay) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, now + delay);
                gain.gain.setValueAtTime(0.15, now + delay);
                gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 1.2);
                osc.start(now + delay);
                osc.stop(now + delay + 1.2);
            };
            
            playChime(523.25, 0);    // C5
            playChime(659.25, 0.15); // E5
            playChime(783.99, 0.3);  // G5
            playChime(1046.50, 0.45);// C6
        } catch(e) {
            console.log("Celebration sound failed", e);
        }
    }


    // --- 3. FLOATING PARTICLES SYSTEM ---
    const partCanvas = document.getElementById('particles-canvas');
    const partCtx = partCanvas.getContext('2d');
    
    let particles = [];
    
    function resizeParticlesCanvas() {
        partCanvas.width = window.innerWidth;
        partCanvas.height = window.innerHeight;
    }
    
    window.addEventListener('resize', resizeParticlesCanvas);
    resizeParticlesCanvas();

    class Particle {
        constructor() {
            this.reset();
            this.y = Math.random() * partCanvas.height; // Spread initially
        }

        reset() {
            this.x = Math.random() * partCanvas.width;
            this.y = partCanvas.height + 50;
            this.size = Math.random() * 18 + 8;
            this.speedY = Math.random() * 1.0 + 0.4;
            this.angle = Math.random() * Math.PI * 2;
            this.swaySpeed = Math.random() * 0.02 + 0.01;
            this.swayAmplitude = Math.random() * 1.5 + 0.5;
            
            // Types: 0: Balloon, 1: Heart (preferred), 2: Petal
            const typeRand = Math.random();
            if (typeRand < 0.65) {
                this.type = 1; // Heart
            } else if (typeRand < 0.90) {
                this.type = 2; // Petal
            } else {
                this.type = 0; // Balloon
            }
            
            // Rich pink, purple, and gold palettes
            const colors = [
                'rgba(255, 105, 180, 0.65)', // Hot Pink
                'rgba(255, 20, 147, 0.55)',  // Deep Pink
                'rgba(255, 182, 193, 0.7)',   // Pastel Light Pink
                'rgba(219, 112, 147, 0.6)',  // Pale Violet Red (warm pinkish purple)
                'rgba(155, 93, 229, 0.55)',  // Purple
                'rgba(255, 215, 0, 0.6)'     // Gold Sparkle
            ];
            this.color = colors[Math.floor(Math.random() * colors.length)];
            this.glow = Math.random() > 0.6; // 40% of particles have glow
        }

        update() {
            this.y -= this.speedY;
            this.angle += this.swaySpeed;
            this.x += Math.sin(this.angle) * this.swayAmplitude;
            
            if (this.y < -50 || this.x < -50 || this.x > partCanvas.width + 50) {
                this.reset();
            }
        }

        draw() {
            partCtx.save();
            partCtx.fillStyle = this.color;
            
            if (this.glow) {
                partCtx.shadowBlur = 10;
                partCtx.shadowColor = this.color;
            }
            
            partCtx.beginPath();
            
            if (this.type === 0) {
                // Balloon
                partCtx.ellipse(this.x, this.y, this.size * 0.8, this.size, 0, 0, Math.PI * 2);
                partCtx.fill();
                // Balloon thread
                partCtx.beginPath();
                partCtx.strokeStyle = 'rgba(0,0,0,0.1)';
                partCtx.lineWidth = 1;
                partCtx.moveTo(this.x, this.y + this.size);
                partCtx.quadraticCurveTo(this.x - 3, this.y + this.size + 8, this.x, this.y + this.size + 15);
                partCtx.stroke();
            } else if (this.type === 1) {
                // Heart
                const x = this.x;
                const y = this.y;
                const size = this.size;
                partCtx.moveTo(x, y + size / 4);
                partCtx.quadraticCurveTo(x, y, x - size / 2, y);
                partCtx.quadraticCurveTo(x - size, y, x - size, y + size / 3);
                partCtx.quadraticCurveTo(x - size, y + size * 0.7, x, y + size * 1.1);
                partCtx.quadraticCurveTo(x + size, y + size * 0.7, x + size, y + size / 3);
                partCtx.quadraticCurveTo(x + size, y, x + size / 2, y);
                partCtx.quadraticCurveTo(x, y, x, y + size / 4);
                partCtx.fill();
            } else {
                // Flower Petal
                partCtx.translate(this.x, this.y);
                partCtx.rotate(this.angle * 0.2); // Rotating petals
                partCtx.ellipse(0, 0, this.size * 0.5, this.size * 1.0, 0, 0, Math.PI * 2);
                partCtx.fill();
            }
            partCtx.restore();
        }
    }

    function initBackgroundParticles() {
        particles = [];
        for (let i = 0; i < 40; i++) {
            particles.push(new Particle());
        }
        animateParticles();
    }

    function animateParticles() {
        partCtx.clearRect(0, 0, partCanvas.width, partCanvas.height);
        
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        
        requestAnimationFrame(animateParticles);
    }


    // --- 4. WELCOME MESSAGE TYPING EFFECT ---
    const welcomeMsg = [
        "Every birthday is a new beginning.",
        "Today is not just another day.",
        "It is the day the world became more beautiful because you were born.",
        "This little surprise is made especially for you."
    ];
    
    let welcomeTypingStarted = false;

    function startWelcomeTyping() {
        if (welcomeTypingStarted) return;
        welcomeTypingStarted = true;
        
        const container = document.getElementById('welcome-typing');
        if (!container) return;
        container.innerHTML = '';
        
        let lineIdx = 0;
        
        function typeLine() {
            if (lineIdx >= welcomeMsg.length) return;
            
            const line = welcomeMsg[lineIdx];
            const p = document.createElement('p');
            p.style.marginBottom = '15px';
            container.appendChild(p);
            
            let charIdx = 0;
            
            function typeChar() {
                if (charIdx < line.length) {
                    p.innerHTML = line.substring(0, charIdx + 1) + '<span class="typing-cursor"></span>';
                    charIdx++;
                    setTimeout(typeChar, 50);
                } else {
                    // Remove cursor from finished line
                    const cursor = p.querySelector('.typing-cursor');
                    if (cursor) cursor.remove();
                    
                    lineIdx++;
                    setTimeout(typeLine, 800);
                }
            }
            
            typeChar();
        }
        
        typeLine();
    }


    // --- 5. MEMORY GALLERY LIGHTBOX ---
    // --- 5. MEMORY GALLERY LIGHTBOX & VIDEO ---
    const images = [
        "images/IMG-20260710-WA0017.jpg",
        "images/IMG-20260710-WA0018.jpg",
        "images/IMG-20260710-WA0019.jpg",
        "images/IMG-20260710-WA0023.jpg",
        "images/IMG-20260710-WA0024.jpg",
        "images/IMG-20260710-WA0025.jpg",
        "images/birthday_video.mp4"
    ];
    
    const captions = [
        "Beautiful Moments - Sparkling memories filled with laughter",
        "Warm Smiles - For all the happiness you share",
        "Joy & Laughter - Making every single day brighter",
        "Endless Support - A guiding light in every step",
        "Caring Heart - An amazing sister and absolute guide",
        "Wonderful Times - Wishing you the best in life",
        "Special Video Message - A beautiful birthday greeting video"
    ];

    let wasMusicPlayingBeforeVideo = false;

    window.openLightbox = function(index) {
        const lightbox = document.getElementById('lightbox');
        const img = document.getElementById('lightbox-img');
        const video = document.getElementById('lightbox-video');
        const caption = document.getElementById('lightbox-caption');
        
        if (lightbox && img && video && caption) {
            caption.textContent = captions[index];
            
            // Check if source is MP4 video
            if (images[index].endsWith('.mp4')) {
                img.classList.add('hidden');
                video.classList.remove('hidden');
                video.src = images[index];
                video.load();
                
                // Auto-pause background music to play video audio cleanly
                if (isMusicPlaying) {
                    bgAudio.pause();
                    isMusicPlaying = false;
                    updateMusicButtonState(false);
                    wasMusicPlayingBeforeVideo = true;
                }
            } else {
                video.classList.add('hidden');
                img.classList.remove('hidden');
                img.src = images[index];
            }
            
            lightbox.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }
    };

    window.closeLightbox = function() {
        const lightbox = document.getElementById('lightbox');
        const video = document.getElementById('lightbox-video');
        
        if (lightbox) {
            // Stop and clear video
            if (video) {
                video.pause();
                video.src = "";
            }
            
            lightbox.style.display = 'none';
            document.body.style.overflow = 'auto';
            
            // Resume background music if it was playing before
            if (wasMusicPlayingBeforeVideo) {
                bgAudio.play().then(() => {
                    isMusicPlaying = true;
                    updateMusicButtonState(true);
                }).catch(err => console.log("Failed to resume background music automatically."));
                wasMusicPlayingBeforeVideo = false;
            }
        }
    };


    // --- 6. TAMIL LETTER ENVELOPE ---
    const envelope = document.getElementById('envelope');
    const tamilTextElement = document.getElementById('tamil-letter-text');
    let letterTypingStarted = false;

    const letterContent = `அன்புள்ள அபி அக்காவிற்கு,

இனிய பிறந்தநாள் நல்வாழ்த்துகள்!

உங்கள் வாழ்க்கையின் இந்த அழகான நாளில், என் மனமார்ந்த வாழ்த்துகளை உங்களுக்குத் தெரிவிக்கிறேன்.

எப்போதும் அன்பாகப் பேசி, அக்கறையுடன் நடந்து, அனைவரின் முகத்திலும் புன்னகையை வரவழைக்கும் நல்ல மனம் கொண்டவர் நீங்கள்.

இந்த புதிய வயது உங்களுக்கு மகிழ்ச்சி, நல்ல உடல்நலம், வெற்றி, அமைதி மற்றும் எண்ணற்ற இனிய நினைவுகளை கொண்டு வரட்டும்.

எப்போதும் இதேபோல் சிரித்துக் கொண்டே மகிழ்ச்சியாக வாழுங்கள்.

மீண்டும் ஒருமுறை...

🎂 இனிய பிறந்தநாள் நல்வாழ்த்துகள் அபி அக்கா! 🎂

அன்புடன்,

Ishuu ❤️`;

    if (envelope) {
        envelope.addEventListener('click', (e) => {
            if (!envelope.classList.contains('open')) {
                envelope.classList.add('open');
                startAudio();
                
                // Delay typing effect slightly after opening envelope animation
                setTimeout(() => {
                    startLetterTyping();
                }, 1000);
            } else {
                // If clicked again, close it
                envelope.classList.remove('open');
            }
            e.stopPropagation();
        });
    }

    function startLetterTyping() {
        if (letterTypingStarted || !tamilTextElement) return;
        letterTypingStarted = true;
        
        let charIdx = 0;
        tamilTextElement.textContent = '';
        
        function type() {
            if (charIdx < letterContent.length) {
                // Keep appending characters
                tamilTextElement.textContent = letterContent.substring(0, charIdx + 1);
                charIdx++;
                setTimeout(type, 30);
            }
        }
        
        type();
    }


    // --- 7. BIRTHDAY CAKE & BLOW CANDLES ---
    const blowBtn = document.getElementById('blow-btn');
    const wishMsg = document.getElementById('wish-message');
    const flames = document.querySelectorAll('.flame');
    let candlesBlown = false;

    function playCelebrationSound() {
        try {
            const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
            const ctx = new AudioCtxClass();
            const now = ctx.currentTime;
            
            const playChime = (freq, delay) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, now + delay);
                gain.gain.setValueAtTime(0.15, now + delay);
                gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 1.2);
                osc.start(now + delay);
                osc.stop(now + delay + 1.2);
            };
            
            playChime(523.25, 0);    // C5
            playChime(659.25, 0.15); // E5
            playChime(783.99, 0.3);  // G5
            playChime(1046.50, 0.45);// C6
        } catch(e) {
            console.log("Celebration sound failed", e);
        }
    }

    // Blow action helper
    function blowOutCandles() {
        if (candlesBlown) return;
        candlesBlown = true;
        
        // Extinguish flames
        flames.forEach(flame => {
            flame.parentElement.classList.add('extinguished');
        });

        // Show wish message
        if (wishMsg) {
            wishMsg.classList.remove('hidden');
        }

        // Trigger celebratory sound synthesis & visual effects
        playCelebrationSound();
        triggerCelebrationEffects();
    }

    if (blowBtn) {
        blowBtn.addEventListener('click', blowOutCandles);
    }

    // Allow blowing candles by clicking them directly
    document.querySelectorAll('.candle').forEach(candle => {
        candle.addEventListener('click', blowOutCandles);
    });


    // --- 8. CELEBRATION EFFECTS (CANVAS CONFETTI & FIREWORKS) ---
    const celCanvas = document.getElementById('celebration-canvas');
    const celCtx = celCanvas.getContext('2d');
    
    let celebrationActive = false;
    let confettiArray = [];
    let fireworksArray = [];

    function resizeCelebrationCanvas() {
        celCanvas.width = window.innerWidth;
        celCanvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCelebrationCanvas);
    resizeCelebrationCanvas();

    // Confetti class
    class Confetti {
        constructor() {
            this.x = Math.random() * celCanvas.width;
            this.y = Math.random() * -50 - 20;
            this.size = Math.random() * 6 + 6;
            this.speedY = Math.random() * 3 + 3;
            this.speedX = Math.random() * 2 - 1;
            this.color = `hsl(${Math.random() * 360}, 90%, 60%)`;
            this.rotation = Math.random() * 360;
            this.rotationSpeed = Math.random() * 4 - 2;
        }

        update() {
            this.y += this.speedY;
            this.x += this.speedX;
            this.rotation += this.rotationSpeed;
        }

        draw() {
            celCtx.save();
            celCtx.translate(this.x, this.y);
            celCtx.rotate(this.rotation * Math.PI / 180);
            celCtx.fillStyle = this.color;
            celCtx.fillRect(-this.size/2, -this.size/2, this.size, this.size);
            celCtx.restore();
        }
    }

    // Firework particle class
    class FireworkParticle {
        constructor(x, y, color) {
            this.x = x;
            this.y = y;
            this.size = Math.random() * 3 + 1;
            this.color = color;
            this.angle = Math.random() * Math.PI * 2;
            this.speed = Math.random() * 4 + 2;
            this.drag = 0.95;
            this.gravity = 0.08;
            this.alpha = 1;
            this.fadeSpeed = Math.random() * 0.02 + 0.01;
        }

        update() {
            this.speed *= this.drag;
            this.x += Math.cos(this.angle) * this.speed;
            this.y += Math.sin(this.angle) * this.speed + this.gravity;
            this.alpha -= this.fadeSpeed;
        }

        draw() {
            celCtx.save();
            celCtx.globalAlpha = this.alpha;
            celCtx.fillStyle = this.color;
            celCtx.beginPath();
            celCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            celCtx.fill();
            celCtx.restore();
        }
    }

    // Rocket/Firework Shell launcher
    class Rocket {
        constructor() {
            this.x = Math.random() * (celCanvas.width - 200) + 100;
            this.y = celCanvas.height;
            this.targetY = Math.random() * (celCanvas.height / 2);
            this.speedY = Math.random() * 5 + 7;
            this.color = `hsl(${Math.random() * 360}, 100%, 60%)`;
            this.exploded = false;
        }

        update() {
            this.y -= this.speedY;
            if (this.y <= this.targetY) {
                this.exploded = true;
                this.explode();
            }
        }

        draw() {
            celCtx.fillStyle = this.color;
            celCtx.beginPath();
            celCtx.arc(this.x, this.y, 4, 0, Math.PI * 2);
            celCtx.fill();
        }

        explode() {
            for (let i = 0; i < 60; i++) {
                fireworksArray.push(new FireworkParticle(this.x, this.y, this.color));
            }
        }
    }

    function triggerCelebrationEffects() {
        celebrationActive = true;
        
        // Spawn initial confetti burst
        for (let i = 0; i < 150; i++) {
            confettiArray.push(new Confetti());
        }

        // Loop to continuously spawn fireworks & confetti
        let frameCount = 0;
        
        function animateCelebration() {
            if (!celebrationActive) return;
            
            // Subtle trail effect
            celCtx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            celCtx.clearRect(0, 0, celCanvas.width, celCanvas.height);
            
            frameCount++;
            
            // Spawn confetti periodically
            if (frameCount % 4 === 0 && confettiArray.length < 250) {
                confettiArray.push(new Confetti());
            }

            // Launch rockets periodically
            if (frameCount % 35 === 0 && fireworksArray.length < 500) {
                rockets.push(new Rocket());
            }

            // Update & Draw Confetti
            confettiArray = confettiArray.filter(c => c.y < celCanvas.height + 20);
            confettiArray.forEach(c => {
                c.update();
                c.draw();
            });

            // Update & Draw Rockets
            rockets = rockets.filter(r => !r.exploded);
            rockets.forEach(r => {
                r.update();
                r.draw();
            });

            // Update & Draw Firework Particles
            fireworksArray = fireworksArray.filter(fp => fp.alpha > 0);
            fireworksArray.forEach(fp => {
                fp.update();
                fp.draw();
            });

            requestAnimationFrame(animateCelebration);
        }

        let rockets = [];
        rockets.push(new Rocket());
        rockets.push(new Rocket());
        animateCelebration();
    }


    // --- 9. WISHES CAROUSEL SLIDESHOW ---
    let currentSlideIndex = 0;
    const slides = document.querySelectorAll('.wish-slide');
    const dots = document.querySelectorAll('.dot');
    let wishCarouselInterval = null;

    function showWishSlide(index) {
        if (index >= slides.length) index = 0;
        if (index < 0) index = slides.length - 1;
        
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));
        
        slides[index].classList.add('active');
        dots[index].classList.add('active');
        currentSlideIndex = index;
    }

    window.currentWish = function(index) {
        showWishSlide(index);
        resetWishCarouselTimer();
    };

    function startWishCarouselTimer() {
        wishCarouselInterval = setInterval(() => {
            showWishSlide(currentSlideIndex + 1);
        }, 4000);
    }

    function resetWishCarouselTimer() {
        clearInterval(wishCarouselInterval);
        startWishCarouselTimer();
    }

    startWishCarouselTimer();

});
