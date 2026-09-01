const iframe = document.getElementById("xplay");

function sendPlayerAction(action, extra = {}) {
  if (!iframe || !iframe.src) return;
  const targetOrigin = new URL(iframe.src).origin;
  iframe.contentWindow?.postMessage(
    { type: "player.action", action, ...extra },
    targetOrigin
  );
}

sendPlayerAction("play");
sendPlayerAction("pause");
sendPlayerAction("seek", { position: 120 });
sendPlayerAction("playAt", { position: 300 });
sendPlayerAction("setVolume", { volume: 65 });
sendPlayerAction("mute");
sendPlayerAction("unmute");
sendPlayerAction("setMute", { muted: true });

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
 * Toggles visibility of XPass Parent Controls element.
 */
function updateParentControlsVisibility() {
    const parentControls = document.getElementById("xpass-parent-controls");
    if (parentControls) {
        if (activeServer === "xpass") {
            parentControls.classList.remove("hidden");
        } else {
            parentControls.classList.add("hidden");
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
    frameElement.className = "w-full h-full border-0 shadow-2xl bg-black rounded-lg backdrop-blur-md";
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
    
    updateParentControlsVisibility();
}

/**
 * Populates server selection dropdown UI elements with Glassmorphism styling.
 */
function populateSourcesDropdown() {
    const menu = document.getElementById("sources-menu-options");
    if (!menu) return;

    // Apply glassmorphism styling to dropdown container
    menu.className = "grid grid-cols-2 gap-2 p-3 bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl transition-all duration-300";
    menu.innerHTML = "";
    
    serversList.forEach(server => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.setAttribute("draggable", "false");
        
        const isActive = server.id === activeServer;
        btn.className = `p-2.5 rounded-xl text-[10px] font-bold transition-all duration-300 flex flex-col items-center justify-center text-center gap-1 border backdrop-blur-md cursor-pointer outline-none ${
            isActive 
            ? 'bg-purple-600/40 border-purple-400/60 text-white shadow-lg shadow-purple-500/20 backdrop-saturate-150 scale-[1.02]' 
            : 'bg-white/5 border-white/10 text-slate-200 hover:border-purple-400/40 hover:bg-white/15 hover:text-white hover:shadow-md'
        }`;

        btn.onclick = () => {
            selectServer(server.id);
            menu.classList.add("hidden");
        };

        const nameParts = server.name.split(': ');
        btn.innerHTML = `
            <span class="text-[8px] uppercase tracking-wider text-purple-300 font-extrabold">${nameParts[0] || 'Server'}</span>
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
    updateParentControlsVisibility();

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
