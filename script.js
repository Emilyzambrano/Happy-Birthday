let flame = document.getElementById("flame");
const instruction = document.querySelector('.instruction');

const LOUD_THRESHOLD = 55;
const REQUIRED_FRAMES = 20;
let loudFrames = 0;

let timeoutId = null;
const TIMEOUT_DURATION = 4000;

// Timeout für "Puuusten Mami"
function startTimeout() {
    timeoutId = setTimeout(() => {
        instruction.textContent = 'Puuuuusten Mami... 🤦‍♀️';
    }, TIMEOUT_DURATION);
}

function clearTimeoutIfRunning() {
    if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
    }
}

async function startListening() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        source.connect(analyser);
        analyser.fftSize = 256;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        startTimeout();

        function checkVolume() {
            analyser.getByteFrequencyData(dataArray);
            let volume = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;

            if (volume > LOUD_THRESHOLD) {
                loudFrames++;
                clearTimeoutIfRunning();
            } else {
                loudFrames = 0;
            }

            if (loudFrames > REQUIRED_FRAMES) {
                extinguishFlame();
            } else {
                requestAnimationFrame(checkVolume);
            }
        }

        checkVolume();
    } catch (error) {
        alert("Bitte Mikrofonzugriff erlauben, um weiterzumachen.");
        console.error(error);
    }
}

function extinguishFlame() {
    flame.style.animation = "fadeOut 1s ease-out forwards";
    setTimeout(() => {
        flame.style.display = "none";
        window.location.href = "GeschenkJagen.html"; // deine Zielseite
    }, 1200);
}

// Mobile-kompatibler Start
window.onload = () => {
    instruction.textContent = "Tippe und dann pusten! 🎂";

    function startAfterInteraction() {
        startListening();
        document.body.removeEventListener('click', startAfterInteraction);
        document.body.removeEventListener('touchstart', startAfterInteraction);
    }

    document.body.addEventListener('click', startAfterInteraction);
    document.body.addEventListener('touchstart', startAfterInteraction);
};
