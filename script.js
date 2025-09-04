let flame = document.getElementById("flame");
const instruction = document.querySelector('.instruction');

const LOUD_THRESHOLD = 55;         // Lautstärke-Schwelle
const REQUIRED_FRAMES = 20;        // Anzahl lauter Frames in Folge (~1/3 Sekunde)
let loudFrames = 0;

let timeoutId = null;
const TIMEOUT_DURATION = 10000;    // 10 Sekunden

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

        startTimeout(); // Timeout starten

        function checkVolume() {
            analyser.getByteFrequencyData(dataArray);
            let volume = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;

            if (volume > LOUD_THRESHOLD) {
                loudFrames++;
                clearTimeoutIfRunning();  // Timeout abbrechen, wenn gepustet wird
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
        window.location.href = "GeschenkJagen.html";
    }, 1200);
}

window.onload = startListening;
