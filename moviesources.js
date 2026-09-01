/**
 * Centralized Streaming Sources Hub & Player Engine
 */

const serversList = [
    { id: 'novera', name: 'Server 1: Novera' },
    { id: 'vault', name: 'Server 2: Vault' },
    { id: 'xpass', name: 'Server 3: XPass' },
    { id: 'nxsha', name: 'Server 4: Nxsha' },
    { id: 'shuttle', name: 'Server 5: ShuttleTV' },
    { id: 'videasy', name: 'Server 6: Videasy' },
    { id: 'vidfast', name: 'Server 7: VidFast' },
    { id: 'cinemaos', name: 'Server 8: CinemaOS' },
    { id: 'nextbox', name: 'Server 9: NextBox' },
    { id: 'vyla', name: 'Server 10: PeeStream' },
    { id: 'gaia', name: 'Server 11: Gaia' },
    { id: 'oneembed', name: 'Server 12: 1Embed' }
];

const noSandboxSources = ['', 'xpass', 'videasy', 'oneembed', 'vidfast'];
let activeServer = "videasy";

/**
 * PostMessage API helper for xplay controls
 */
function sendPlayerAction(action, extra = {}) {
    const iframe = document.getElementById("xplay-iframe") || document.getElementById("xplay");
    if (!iframe || !iframe.contentWindow) return;

    try {
        const targetOrigin = iframe.src ? new URL(iframe.src).origin : "*";
        iframe.contentWindow.postMessage(
            { type: "player.action", action, ...extra },
            targetOrigin
        );
    } catch (e) {
        console.warn("Unable to postMessage to xplay iframe:", e);
    }
}

/**
 * Creates and injects glassmorphism player control bar for XPlay
 */
function renderXplayControls(container) {
    let controlsBar = document.getElementById("xplay-controls-bar");
    if (!controlsBar) {
        controlsBar = document.createElement("div");
        controlsBar.id = "xplay-controls-bar";
        
        // Glassmorphic Tailwind styles
        controlsBar.className = "flex items-center justify-center gap-3 p-3 mt-3 rounded-2xl backdrop-blur-md bg-white/10 border border-white/10 shadow-xl transition-all duration-300";

        controlsBar.innerHTML = `
            <button onclick="sendPlayerAction('play')" class="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-sm border border-white/10 transition-all">Play</button>
            <button onclick="sendPlayerAction('pause')" class="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-sm border border-white/10 transition-all">Pause</button>
            <button onclick="sendPlayerAction('seek', { position: 120 })" class="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-sm border border-white/10 transition-all">-10s</button>
            <button onclick="sendPlayerAction('playAt', { position: 300 })" class="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-sm border border-white/10 transition-all">+10s</button>
            <button onclick="sendPlayerAction('setMute', { muted: true })" class="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-sm border border-white/10 transition-all">Mute</button>
            <button onclick="sendPlayerAction('unmute')" class="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-sm border border-white/10 transition-all">Unmute</button>
        `;
        container.appendChild(controlsBar);
    }
    controlsBar.classList.remove("hidden");
}

/**
 * Handles toggling Visibility for Controls and Diagnostics
 */
function toggleServerUI() {
    const diagnosticsSection = document.getElementById("diagnostics-section") || document.querySelector(".diagnostics");
    const xplayControls = document.getElementById("xplay-controls-bar");

    // Hide Diagnostics Section
    if (diagnosticsSection) {
        diagnosticsSection.classList.add("hidden");
        diagnosticsSection.style.display = "none";
    }

    // Toggle XPlay Glassmorphism Controls
    if (activeServer === "xpass" || activeServer === "xplay") {
        const playerContainer = document.getElementById("player-wrapper");
        if (playerContainer) renderXplayControls(playerContainer);
    } else if (xplayControls) {
        xplayControls.classList.add("hidden");
    }
}

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
            case "videasy": return `https://player.videasy.net/movie/${id}?color=8834ec`;
            case "vidfast": return `https://www.vidfast.net/movie/${id}`;
            case "cinemaos": return `https://cinemaos.tech/player/${id}`;
            case "nextbox": return `https://nextbox.uno/player/movie/${id}`;
            case "vyla": return `https://peestream.in/embed/?type=movie&tmdbId=${id}`;
            case "gaia": return `https://gaiaflix.live/watch/${id}?type=movie`;
            case "oneembed": return `https://1embed.cc/embed/movie/${id}`;
            default: return `https://player.videasy.net/movie/${id}?color=8834ec`;
        }
    } else {
        switch (server) {
            case "novera": return `https://novera.tv/watch/tv/${id}?s=${season}&e=${episode}`;
            case "vault": return `https://streamvaultsrc.click/embed/tv/${id}/${season}/${episode}`;
            case "xpass": return `https://play.xpass.top/e/tv/${id}/${season}/${episode}`;
            case "nxsha": return `https://web.nxsha.app/embed/tv/${id}/${season}/${episode}`;
            case "shuttle": return `https://shuttletv.su/watch/${id}/${season}/${episode}`;
            case "videasy": return `https://player.videasy.net/tv/${id}/${season}/${episode}?autoplayNextEpisode=true&autoPlay=true&nextEpisode=true&color=8834ec`;
            case "vidfast": return `https://www.vidfast.net/tv/${id}/${season}/${episode}?autoPlay=true`;
            case "cinemaos": return `https://cinemaos.live/tv/watch/${id}&${season}&${episode}`;
            case "nextbox": return `https://nextbox.uno/player/tv/${id}/${season}/${episode}`;
            case "vyla": return `https://peestream.in/embed/?type=show&tmdbId=${id}&season=${season}&episode=${episode}`;
            case "gaia": return `https://gaiaflix.live/watch/${id}?type=tv&s=${season}&e=${episode}`;
            case "oneembed": return `https://1embed.cc/embed/tv/${id}/${season}/${episode}`;
            default: return `https://player.videasy.net/tv/${id}/${season}/${episode}?autoplayNextEpisode=true&autoPlay=true&nextEpisode=true&color=8834ec`;
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
    frameElement.id = "xplay-iframe";
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

    // Dynamic UI Update
    toggleServerUI();
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
        toggleServerUI();
    }
}
