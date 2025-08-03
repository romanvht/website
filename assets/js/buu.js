async function loadAsciiFrames(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Ошибка загрузки: ${response.statusText}`);
    }
    return await response.json();
}

function displayAsciiAnimation(divId, frames, fps = 10) {
    const container = document.getElementById(divId);
    if (!container) {
        console.error(`Элемент с id "${divId}" не найден.`);
        return;
    }

    let currentFrame = 0;
    const totalFrames = frames.length;
    const interval = 1000 / fps;

    function updateFrame() {
        container.textContent = frames[currentFrame];
        currentFrame = (currentFrame + 1) % totalFrames;
        setTimeout(() => {
            requestAnimationFrame(updateFrame);
        }, interval);
    }

    updateFrame();
}