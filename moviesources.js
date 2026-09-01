/**
 * Centralized Streaming Sources Hub & Player Engine
 */

const serversList = [
    { id: 'novera', name: 'Server 1: Novera' },
    { id: 'vault', name: 'Server 2: Vault' },
    { id: 'xpass', name: 'Server 3: XPass' },
    { id: 'nxsha', name: 'Server 4: Nxsha' },
    { id: 'shuttle', name: 'Server 5: ShuttleTV' },
    { id: 'vidcore', name: 'Server 6: Vidcore' },
    { id: 'vidfast', name: 'Server 7: VidFast' },
    { id: 'fmov', name: 'Server 8: fmov' },
    { id: 'nextbox', name: 'Server 9: NextBox' },
    { id: 'peestream', name: 'Server 10: PeeStream' },
    { id: 'gaia', name: 'Server 11: Gaia' },
    { id: 'flixer', name: 'Server 12: flixer' },
    { id: 'oneembed', name: 'Server 13: 1Embed' },
    { id: 'xully', name: 'Server 14: xully' }
];

const noSandboxSources = ['vault', 'xpass', 'vid', 'oneembed', 'vidfast'];
let activeServer = "xpass";

// Parent Control State Tracking
let isPlaying = true;
let isSeeking = false;
let isMuted = false;

/**
 * Generates stream URL for the specified server and content parameters.
 */
function getStreamUrl(server, type, id, season = 1, episode = 1) {
    if (type === "movie") {
        switch (server) {
            case "novera": return `https://novera.tv/watch/movie/${id}`;
            case "vault": return `https://streamvaultsrc.click/embed/movie/${id}`;
            case "xpass": return `https://play.xpass.top/e/movie/${id}`;
            case "nxsha": return `https://web.nxsha.app/embed/movie/${id}`;
            case "shuttle": return `https://shuttletv.su/watch/${id}`;
            case "vidcore": return `https://vidcore.org/embed/movie/${id}?autoplay=true`;
            case "vidfast": return `https://vidfast.vc/movie/${id}`;
            case "fmov": return `https://fmov.my/embed/movie/${id}`;
            case "nextbox": return `https://nextbox.uno/player/movie/${id}`;
            case "peestream": return `https://peestream.in/embed/?type=movie&tmdbId=${id}`;
            case "gaia": return `https://gaiaflix.live/watch/${id}?type=movie`;
            case "flixer": return `https://flixer.gd/watch/movie/${id}`;
            case "oneembed": return `https://1embed.cc/embed/movie/${id}`;
            case "xully": return `https://xullys.xyz/watch/${id}`;
            default: return `https://vidcore.org/embed/movie/${id}`;
        }
    } else {
        switch (server) {
            case "novera": return `https://novera.tv/watch/tv/${id}?s=${season}&e=${episode}`;
            case "vault": return `https://streamvaultsrc.click/embed/tv/${id}/${season}/${episode}`;
            case "xpass": return `https://play.xpass.top/e/tv/${id}/${season}/${episode}`;
            case "nxsha": return `https://web.nxsha.app/embed/tv/${id}/${season}/${episode}`;
            case "shuttle": return `https://shuttletv.su/watch/${id}?s=${season}&e=${episode}`;
            case "vidcore": return `https://vidcore.org/embed/tv/${id}/${season}/${episode}?autoplay=true`;
            case "vidfast": return `https://vidfast.vc/tv/${id}/${season}/${episode}?autoPlay=true`;
            case "fmov": return `https://fmov.my/embed/tv/${id}/${season}/${episode}`;
            case "nextbox": return `https://nextbox.uno/player/tv/${id}/${season}/${episode}`;
            case "peestream": return `https://peestream.in/embed/?type=show&tmdbId=${id}&season=${season}&episode=${episode}`;
            case "gaia": return `https://gaiaflix.live/watch/${id}?type=tv&s=${season}&e=${episode}`;
            case "flixer": return `https://flixer.gd/watch/tv/${id}/${season}/${episode}`;
            case "oneembed": return `https://1embed.cc/embed/tv/${id}/${season}/${episode}`;
            case "xully": return `https://xullys.xyz/watch/${id}?s=${season}&e=${episode}`;
            default: return `https://vidcore.org/embed/tv/${id}/${season}/${episode}`;
        }
    }
}

/**
 * Sends a postMessage command to the active iframe.
 */
function sendPlayerAction(action, extra = {}) {
    const iframe = document.getElementById("xplay");
    if (!iframe || !iframe.src) return;
    try {
        const targetOrigin = new URL(iframe.src).origin;
        iframe.contentWindow.postMessage(
            { type: "player.action", action, ...extra },
            targetOrigin
        );
    } catch (e) {
        // Suppressed cross-origin/invalid URL logs
    }
}

/**
 * Creates or updates the Glassmorphism Parent Controls UI Bar.
 */
function renderParentControlsUI() {
    let container = document.getElementById("xpass-parent-controls");
    const playerWrapper = document.getElementById("player-wrapper");

    if (!playerWrapper) return;

    if (activeServer !== "xpass") {
        if (container) container.style.display = "none";
        return;
    }

    if (!container) {
        container = document.createElement("div");
        container.id = "xpass-parent-controls";
        container.className = "mt-3 p-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl text-white transition-all duration-300 flex flex-col gap-3";

        container.innerHTML = `
            <div class="flex items-center justify-between gap-4 flex-wrap">
                <button id="togglePlay" class="px-4 py-2 bg-purple-600/80 hover:bg-purple-600 text-white rounded-lg font-bold text-xs transition">Pause</button>
                
                <div class="flex items-center gap-2 flex-1 min-w-[200px]">
                    <span id="posLabel" class="text-xs font-mono">0</span>
                    <input type="range" id="seekBar" min="0" max="100" value="0" class="w-full accent-purple-500 bg-white/20 rounded-lg h-1.5 cursor-pointer">
                    <span id="durationLabel" class="text-xs font-mono">0</span>
                </div>

                <div class="flex items-center gap-2">
                    <button id="toggleMute" class="px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg font-bold text-xs transition">Mute</button>
                    <input type="range" id="volumeBar" min="0" max="100" value="100" class="w-20 accent-purple-500 bg-white/20 rounded-lg h-1.5 cursor-pointer">
                    <span id="volumeLabel" class="text-xs font-mono w-6">100</span>
                </div>
            </div>

            <div class="flex items-center gap-2 border-t border-white/10 pt-2">
                <input type="number" id="positionInput" placeholder="Sec" value="0" class="w-20 px-2 py-1 bg-black/40 border border-white/20 rounded text-xs text-white outline-none focus:border-purple-500">
                <button id="playAt" class="px-3 py-1 bg-purple-600/50 hover:bg-purple-600 text-white rounded text-xs font-bold transition">Play at 0s</button>
            </div>
        `;

        playerWrapper.parentNode.insertBefore(container, playerWrapper.nextSibling);

        // Bind UI Elements & Event Listeners
        const seekBar = container.querySelector("#seekBar");
        const positionInput = container.querySelector("#positionInput");
        const playAtBtn = container.querySelector("#playAt");
        const toggleBtn = container.querySelector("#togglePlay");
        const volumeBar = container.querySelector("#volumeBar");
        const volumeLabel = container.querySelector("#volumeLabel");
        const muteBtn = container.querySelector("#toggleMute");

        const updateButtonLabel = () => {
            const value = Number(positionInput.value || 0);
            playAtBtn.textContent = `Play at ${value}s`;
        };

        positionInput.addEventListener("input", updateButtonLabel);

        seekBar.addEventListener("input", () => {
            isSeeking = true;
            container.querySelector("#posLabel").textContent = seekBar.value;
        });

        seekBar.addEventListener("change", () => {
            isSeeking = false;
            sendPlayerAction("seek", { position: Number(seekBar.value) });
        });

        playAtBtn.addEventListener("click", () => {
            sendPlayerAction("playAt", { position: Number(positionInput.value || 0) });
            isPlaying = true;
            toggleBtn.textContent = "Pause";
        });

        toggleBtn.addEventListener("click", () => {
            const action = isPlaying ? "pause" : "play";
            sendPlayerAction(action);
            toggleBtn.textContent = isPlaying ? "Play" : "Pause";
            isPlaying = !isPlaying;
        });

        volumeBar.addEventListener("input", () => {
            volumeLabel.textContent = volumeBar.value;
            sendPlayerAction("setVolume", { volume: Number(volumeBar.value) });
        });

        muteBtn.addEventListener("click", () => {
            isMuted = !isMuted;
            sendPlayerAction("setMute", { muted: isMuted });
            muteBtn.textContent = isMuted ? "Unmute" : "Mute";
        });
    }

    container.style.display = "flex";
}

/**
 * Builds and renders the streaming iframe into the target container.
 */
function loadServerIframe(type, id, season = 1, episode = 1) {
    const playerContainer = document.getElementById("player-wrapper");
    if (!playerContainer) return;

    const streamUrl = getStreamUrl(activeServer, type, id, season, episode);

    const frameElement = document.createElement('iframe');
    frameElement.id = "xplay";
    frameElement.src = streamUrl;
    frameElement.className = "w-full h-full border-0 shadow-2xl bg-black rounded-lg";
    frameElement.allowFullscreen = true;
    frameElement.setAttribute("scrolling", "no");
    frameElement.setAttribute("referrerpolicy", "origin");
    frameElement.setAttribute("allow", "autoplay; encrypted-media; picture-in-picture");

    if (noSandboxSources.includes(activeServer)) {
        frameElement.removeAttribute('sandbox');
    } else {
        frameElement.setAttribute('sandbox', 'allow-forms allow-pointer-lock allow-same-origin allow-scripts allow-top-navigation');
    }

    playerContainer.innerHTML = "";
    playerContainer.appendChild(frameElement);

    renderParentControlsUI();
}

/**
 * Populates server selection dropdown UI elements.
 */
function populateSourcesDropdown() {
    const menu = document.getElementById("sources-menu-options");
    if (!menu) return;
    menu.innerHTML = "";
    
    serversList.forEach(server => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.setAttribute("draggable", "false");
        
        const isActive = server.id === activeServer;
        btn.className = `p-2.5 rounded-lg text-[10px] font-bold transition-all duration-200 flex flex-col items-center justify-center text-center gap-1 border border-white/5 cursor-pointer outline-none ${
            isActive 
            ? 'bg-purple-600/30 border-purple-500 text-white shadow-lg shadow-purple-500/10' 
            : 'bg-white/5 text-slate-300 hover:border-purple-500/50 hover:bg-white/10 hover:text-white'
        }`;

        btn.onclick = () => {
            selectServer(server.id);
            menu.classList.add("hidden");
        };

        const nameParts = server.name.split(': ');
        btn.innerHTML = `
            <span class="text-[8px] uppercase tracking-wider text-purple-400 font-extrabold">${nameParts[0] || 'Server'}</span>
            <span class="text-white truncate max-w-full font-bold">${nameParts[1] || server.id}</span>
        `;
        menu.appendChild(btn);
    });
    updateSelectedSourceText();
}

function updateSelectedSourceText() {
    const active = serversList.find(s => s.id === activeServer);
    const sourceTextEl = document.getElementById("selected-source-text");
    if (sourceTextEl) {
        sourceTextEl.textContent = active ? active.name : "Select Server";
    }
}

function selectServer(serverId) {
    activeServer = serverId;
    updateSelectedSourceText();
    populateSourcesDropdown(); 

    if (window.state && window.state.current) {
        if (window.state.type === "tv") {
            const s = document.getElementById('seasonSelect')?.value || 1;
            const e = document.getElementById('episodeSelect')?.value || 1;
            loadServerIframe("tv", window.state.current.id, s, e);
        } else {
            loadServerIframe("movie", window.state.current.id);
        }
    } else {
        renderParentControlsUI();
    }
}

/**
 * Global PostMessage Listener for XPass Player Synchronization
 */
window.addEventListener("message", (event) => {
    const iframe = document.getElementById("xplay");
    if (!iframe || !iframe.src || activeServer !== "xpass") return;

    try {
        if (event.origin !== new URL(iframe.src).origin) return;
    } catch (e) {
        return;
    }

    const data = event.data;
    if (data?.type === "player.event") {
        const container = document.getElementById("xpass-parent-controls");
        if (!container) return;

        const seekBar = container.querySelector("#seekBar");
        const posLabel = container.querySelector("#posLabel");
        const durationLabel = container.querySelector("#durationLabel");
        const volumeBar = container.querySelector("#volumeBar");
        const volumeLabel = container.querySelector("#volumeLabel");
        const muteBtn = container.querySelector("#toggleMute");

        if (!isSeeking && data.event?.name === "position") {
            const pos = Math.floor(data.event.position || 0);
            if (seekBar) seekBar.value = pos;
            if (posLabel) posLabel.textContent = pos;

            if (data.event.duration) {
                const dur = Math.floor(data.event.duration);
                if (durationLabel) durationLabel.textContent = dur;
                if (seekBar) seekBar.max = dur;
            }
        }

        if (data.event?.name === "volume") {
            if (volumeBar) volumeBar.value = data.event.volume;
            if (volumeLabel) volumeLabel.textContent = data.event.volume;
            isMuted = Boolean(data.event.muted);
            if (muteBtn) muteBtn.textContent = isMuted ? "Unmute" : "Mute";
        }
    }
});
