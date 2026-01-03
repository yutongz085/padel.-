// State Management
const state = {
    currentSection: 0,
    currentMaterial: '3k',
    currentDesign: 0,
    audioEnabled: false
};

const designs = [
    { id: 0, title: "Traditional Chinese", desc: "Ink & Mountain" },
    { id: 1, title: "Imperial Crane", desc: "Gold & Clouds" },
    { id: 2, title: "Pro Sport", desc: "Competitive Edge" }
];

// Audio Engine (Tone.js)
let drumSynth, droneSynth, noiseSynth;

async function initAudio() {
    if (state.audioEnabled) return;
    await Tone.start();
    
    // Synths
    drumSynth = new Tone.MembraneSynth().toDestination();
    drumSynth.volume.value = -5;
    
    droneSynth = new Tone.PolySynth(Tone.Synth).toDestination();
    droneSynth.volume.value = -15;
    
    noiseSynth = new Tone.NoiseSynth().toDestination();
    noiseSynth.volume.value = -12;

    state.audioEnabled = true;
    document.getElementById('audioIcon').textContent = 'volume_up';
    document.getElementById('audioToggle').classList.add('border-[#d4af37]');
}

function playDrumHit() { if (state.audioEnabled) drumSynth.triggerAttackRelease("C1", "8n"); }
function playSwish() { if (state.audioEnabled) noiseSynth.triggerAttackRelease("16n"); }

function toggleAudio() {
    if (!state.audioEnabled) initAudio();
    else {
        Tone.Destination.mute = !Tone.Destination.mute;
        const icon = document.getElementById('audioIcon');
        icon.textContent = Tone.Destination.mute ? 'volume_off' : 'volume_up';
        document.getElementById('audioToggle').classList.toggle('border-[#d4af37]');
    }
}

// Interaction
function startExperience() {
    initAudio();
    playDrumHit();
    scrollToSection(1);
}

function scrollToSection(index) {
    const target = document.getElementById('section' + index);
    if(target) {
        target.scrollIntoView({ behavior: 'smooth' });
        state.currentSection = index;
        updateNavDots(index);
        playSwish();
    }
}

function updateNavDots(index) {
    document.querySelectorAll('.nav-dot').forEach(dot => {
        const dotIndex = parseInt(dot.dataset.index);
        if (dotIndex === index) {
            dot.classList.remove('bg-slate-600');
            dot.classList.add('bg-[#d4af37]', 'scale-125');
        } else {
            dot.classList.add('bg-slate-600');
            dot.classList.remove('bg-[#d4af37]', 'scale-125');
        }
    });
}

function setMaterial(type) {
    if (state.currentMaterial === type) return;
    state.currentMaterial = type;
    playDrumHit();

    // UI Updates
    document.querySelectorAll('.material-btn').forEach(btn => {
        btn.classList.remove('active', 'border-[#d4af37]', 'bg-[rgba(212,175,55,0.1)]');
        btn.querySelector('span.text-xl').classList.remove('text-[#d4af37]');
    });
    const activeBtn = document.getElementById('btn-' + type);
    activeBtn.classList.add('active', 'border-[#d4af37]', 'bg-[rgba(212,175,55,0.1)]');
    activeBtn.querySelector('span.text-xl').classList.add('text-[#d4af37]');

    // Image Updates
    document.querySelectorAll('.material-view').forEach(view => {
        view.classList.remove('opacity-100');
        view.classList.add('opacity-0');
    });
    document.getElementById('img-' + type).classList.remove('opacity-0');
    document.getElementById('img-' + type).classList.add('opacity-100');
    
    // Text Updates
    const desc = document.getElementById('material-desc');
    let text = "";
    if (type === '3k') text = "The 3K Carbon weave offers a distinct, coarse pattern providing excellent durability.";
    if (type === '18k') text = "The 18K Carbon features a dense, fine weave for maximum stiffness and energy return.";
    if (type === 'fiberglass') text = "Fiberglass provides a smooth, matte finish with superior flexibility.";
    
    desc.style.opacity = 0;
    setTimeout(() => { desc.textContent = text; desc.style.opacity = 1; }, 300);
}

function switchDesign(index) {
    if (index < 0) index = designs.length - 1;
    if (index >= designs.length) index = 0;
    state.currentDesign = index;
    playSwish();

    const slides = document.querySelectorAll('.design-slide');
    const dots = document.querySelectorAll('.design-dot');

    slides.forEach(slide => {
        slide.style.opacity = '0';
        slide.style.transform = 'scale(0.75) translateX(100px)';
        slide.style.zIndex = '10';
    });

    const activeSlide = slides[index];
    activeSlide.style.opacity = '1';
    activeSlide.style.transform = 'scale(1) translateX(0)';
    activeSlide.style.zIndex = '30';

    const titleEl = document.getElementById('design-title');
    titleEl.setAttribute('data-text', designs[index].title.toUpperCase());
    titleEl.textContent = designs[index].title.toUpperCase();

    dots.forEach((dot, i) => {
        if(i === index) dot.classList.replace('bg-slate-700', 'bg-[#d4af37]');
        else dot.classList.replace('bg-[#d4af37]', 'bg-slate-700');
    });
}

function nextDesign() { switchDesign(state.currentDesign + 1); }
function prevDesign() { switchDesign(state.currentDesign - 1); }

// Observers
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const id = entry.target.id;
            const index = parseInt(id.replace('section', ''));
            updateNavDots(index);
            if(index !== state.currentSection) playDrumHit();
            state.currentSection = index;
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('section').forEach(section => observer.observe(section));