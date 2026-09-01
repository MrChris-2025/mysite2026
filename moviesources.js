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
let activeServer = "vidcore";

/**
 * Sends postMessage events to the embedded player iframe.
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
        console.error("Failed to send player action:", e);
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

    toggleXpassControls();
}

/**
 * Displays parent controls when XPass is selected and styles them with glassmorphism.
 */
function toggleXpassControls() {
    let controlsContainer = document.getElementById("xpass-parent-controls");
    const playerWrapper = document.getElementById("player-wrapper");

    // Hide any optional diagnostic UI elements
    const diagnosticsSection = document.getElementById("player-diagnostics");
    if (diagnosticsSection) {
        diagnosticsSection.style.display = "none";
    }

    if (activeServer === "xpass") {
        if (!controlsContainer && playerWrapper && playerWrapper.parentNode) {
            controlsContainer = document.createElement("div");
            controlsContainer.id = "xpass-parent-controls";
            
            // Glassmorphism styling with Tailwind CSS
            controlsContainer.className = "mt-4 p-4 rounded-xl backdrop-blur-md bg-white/10 border border-white/20 shadow-xl text-white flex flex-wrap items-center justify-center gap-3 transition-all duration-300";

            controlsContainer.innerHTML = `
                <button onclick="sendPlayerAction('play')" class="px-3 py-1.5 rounded-lg bg-purple-600/50 hover:bg-purple-600/80 border border-purple-400/30 text-xs font-semibold backdrop-blur-sm transition-all">Play</button>
                <button onclick="sendPlayerAction('pause')" class="px-3 py-1.5 rounded-lg bg-purple-600/50 hover:bg-purple-600/80 border border-purple-400/30 text-xs font-semibold backdrop-blur-sm transition-all">Pause</button>
                <button onclick="sendPlayerAction('seek', { position: 120 })" class="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-medium backdrop-blur-sm transition-all">Seek 2m</button>
                <button onclick="sendPlayerAction('playAt', { position: 300 })" class="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-medium backdrop-blur-sm transition-all">Jump 5m</button>
                <button onclick="sendPlayerAction('setVolume', { volume: 65 })" class="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-medium backdrop-blur-sm transition-all">Vol 65%</button>
                <button onclick="sendPlayerAction('mute')" class="px-3 py-1.5 rounded-lg bg-red-500/30 hover:bg-red-500/50 border border-red-400/30 text-xs font-semibold backdrop-blur-sm transition-all">Mute</button>
                <button onclick="sendPlayerAction('unmute')" class="px-3 py-1.5 rounded-lg bg-emerald-500/30 hover:bg-emerald-500/50 border border-emerald-400/30 text-xs font-semibold backdrop-blur-sm transition-all">Unmute</button>
            `;

            playerWrapper.parentNode.insertBefore(controlsContainer, playerWrapper.nextSibling);
        }

        if (controlsContainer) {
            controlsContainer.classList.remove("hidden");
            controlsContainer.style.display = "flex";
        }
    } else if (controlsContainer) {
        controlsContainer.classList.add("hidden");
        controlsContainer.style.display = "none";
    }
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
        toggleXpassControls();
    }
}
