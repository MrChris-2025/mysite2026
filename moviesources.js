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
    { id: 'yap', name: 'Server 14: Yap' },
    { id: 'xully', name: 'Server 15: xully' }
];

const noSandboxSources = ['vault', 'xpass', 'vid', 'oneembed', 'vidfast'];
let activeServer = "";

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
            case "yap": return `https://yapgrid.com/embed/movie/${id}?autoplay=1`;
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
            case "yap": return `https://yapgrid.com/embed/tv/${id}/${season}/${episode}?autoplay=1`;
            default: return `https://vidcore.org/embed/tv/${id}/${season}/${episode}`;
        }
    }
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
}

/**
 * Ensures or builds the Glassmorphism Parental Controls panel directly under sources.
 */
function renderParentControlsUI() {
    let controlsContainer = document.getElementById("xpass-parent-controls");
    const sourcesContainer = document.getElementById("sources-menu-options")?.parentElement || document.getElementById("player-wrapper");

    if (!controlsContainer && sourcesContainer) {
        controlsContainer = document.createElement("div");
        controlsContainer.id = "xpass-parent-controls";
        controlsContainer.className = "hidden mt-4 p-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl text-white transition-all duration-300";
        
        controlsContainer.innerHTML = `
            <div class="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
                <div class="flex items-center gap-2">
                    <span class="w-2.5 h-2.5 rounded-full bg-purple-400 animate-pulse"></span>
                    <h4 class="text-xs font-bold uppercase tracking-wider text-purple-300">XPass Controls</h4>
                </div>
                <span id="posLabel" class="text-[10px] font-mono text-slate-300">0s</span>
            </div>
            
            <div class="space-y-3">
                <div class="flex flex-col gap-1">
                    <input type="range" id="seekBar" value="0" min="0" max="100" class="w-full accent-purple-500 bg-white/20 h-1.5 rounded-lg appearance-none cursor-pointer">
                    <div class="flex justify-between text-[9px] text-slate-400 font-mono">
                        <span>0s</span>
                        <span id="durationLabel">0s</span>
                    </div>
                </div>

                <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button type="button" id="togglePlay" class="px-3 py-1.5 rounded-lg bg-purple-600/40 hover:bg-purple-600/60 border border-purple-400/30 text-xs font-semibold backdrop-blur-sm transition">Pause</button>
                    <button type="button" id="toggleMute" class="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-semibold backdrop-blur-sm transition">Mute</button>
                    
                    <div class="col-span-2 flex items-center gap-1.5">
                        <input type="number" id="positionInput" value="0" min="0" placeholder="Sec" class="w-16 px-2 py-1 bg-black/30 border border-white/20 rounded-lg text-xs text-white outline-none focus:border-purple-400">
                        <button type="button" id="playAt" class="flex-1 px-2 py-1.5 rounded-lg bg-purple-600/40 hover:bg-purple-600/60 border border-purple-400/30 text-xs font-semibold backdrop-blur-sm transition truncate">Play at 0s</button>
                    </div>
                </div>

                <div class="flex items-center gap-2 pt-1 border-t border-white/5">
                    <span class="text-[10px] text-slate-300 font-medium">Volume</span>
                    <input type="range" id="volumeBar" min="0" max="100" value="100" class="flex-1 accent-purple-500 bg-white/20 h-1 rounded-lg appearance-none cursor-pointer">
                    <span id="volumeLabel" class="text-[10px] font-mono text-slate-300 w-6 text-right">100</span>
                </div>
            </div>
        `;

        sourcesContainer.insertAdjacentElement('afterend', controlsContainer);
        bindControlEvents();
    }

    if (controlsContainer) {
        if (activeServer === 'xpass') {
            controlsContainer.classList.remove("hidden");
        } else {
            controlsContainer.classList.add("hidden");
        }
    }
}

/**
 * Sends action payload via postMessage to xpass iframe.
 */
function sendPlayerAction(action, extra = {}) {
    const iframe = document.getElementById("xplay");
    if (!iframe || !iframe.contentWindow) return;
    
    try {
        const targetOrigin = new URL(iframe.src).origin;
        iframe.contentWindow.postMessage(
            { type: "player.action", action, ...extra },
            targetOrigin
        );
    } catch (err) {
        // Safe origin parsing failure handling
    }
}

function updateSeekUI(value) {
    const seekBar = document.getElementById("seekBar");
    const posLabel = document.getElementById("posLabel");
    if (seekBar) seekBar.value = value;
    if (posLabel) posLabel.textContent = `${value}s`;
}

function bindControlEvents() {
    const seekBar = document.getElementById("seekBar");
    const positionInput = document.getElementById("positionInput");
    const playAtBtn = document.getElementById("playAt");
    const toggleBtn = document.getElementById("togglePlay");
    const volumeBar = document.getElementById("volumeBar");
    const volumeLabel = document.getElementById("volumeLabel");
    const muteBtn = document.getElementById("toggleMute");

    if (seekBar) {
        seekBar.addEventListener("input", () => {
            isSeeking = true;
            updateSeekUI(Number(seekBar.value));
        });

        seekBar.addEventListener("change", () => {
            isSeeking = false;
            sendPlayerAction("seek", { position: Number(seekBar.value) });
        });
    }

    if (positionInput && playAtBtn) {
        const updateButtonLabel = () => {
            const value = Number(positionInput.value || 0);
            playAtBtn.textContent = `Play at ${value}s`;
        };

        positionInput.addEventListener("input", updateButtonLabel);
        updateButtonLabel();

        playAtBtn.addEventListener("click", () => {
            sendPlayerAction("playAt", { position: Number(positionInput.value || 0) });
            isPlaying = true;
            if (toggleBtn) toggleBtn.textContent = "Pause";
        });
    }

    if (toggleBtn) {
        toggleBtn.addEventListener("click", () => {
            const action = isPlaying ? "pause" : "play";
            sendPlayerAction(action);
            isPlaying = !isPlaying;
            toggleBtn.textContent = isPlaying ? "Pause" : "Play";
        });
    }

    if (volumeBar && volumeLabel) {
        volumeBar.addEventListener("input", () => {
            volumeLabel.textContent = volumeBar.value;
            sendPlayerAction("setVolume", { volume: Number(volumeBar.value) });
        });
    }

    if (muteBtn) {
        muteBtn.addEventListener("click", () => {
            isMuted = !isMuted;
            sendPlayerAction("setMute", { muted: isMuted });
            muteBtn.textContent = isMuted ? "Unmute" : "Mute";
        });
    }
}

/**
 * Event listener for incoming iframe events from XPass.
 */
window.addEventListener("message", (event) => {
    const iframe = document.getElementById("xplay");
    if (!iframe) return;

    try {
        if (event.origin !== new URL(iframe.src).origin) return;
    } catch {
        return;
    }

    const data = event.data;
    if (data?.type === "player.event") {
        const seekBar = document.getElementById("seekBar");
        const durationLabel = document.getElementById("durationLabel");
        const volumeBar = document.getElementById("volumeBar");
        const volumeLabel = document.getElementById("volumeLabel");
        const muteBtn = document.getElementById("toggleMute");

        if (!isSeeking && data.event?.name === "position") {
            updateSeekUI(Math.floor(data.event.position));
            if (data.event.duration && durationLabel && seekBar) {
                durationLabel.textContent = `${Math.floor(data.event.duration)}s`;
                seekBar.max = Math.floor(data.event.duration);
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
    renderParentControlsUI();

    if (window.state && window.state.current) {
        if (window.state.type === "tv") {
            const s = document.getElementById('seasonSelect')?.value || 1;
            const e = document.getElementById('episodeSelect')?.value || 1;
            loadServerIframe("tv", window.state.current.id, s, e);
        } else {
            loadServerIframe("movie", window.state.current.id);
        }
    }
}
