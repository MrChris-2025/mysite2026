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
    { id: 'moonflix', name: 'Server 8: Moonflix' },
    { id: 'nextbox', name: 'Server 9: NextBox' },
    { id: 'peestream', name: 'Server 10: PeeStream' },
    { id: 'gaia', name: 'Server 11: Gaia' },
    { id: 'flixer', name: 'Server 12: flixer' },
    { id: 'oneembed', name: 'Server 13: 1Embed' }
];

const noSandboxSources = ['vault', 'xpass', 'videasy', 'oneembed', 'vidfast'];
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
            case "vidfast": return `https://vidfast.vc/movie/${id}`;
            case "moonflix": return `https://cinemaos.tech/player/${id}`;
            case "nextbox": return `https://nextbox.uno/player/movie/${id}`;
            case "peestream": return `https://peestream.in/embed/?type=movie&tmdbId=${id}`;
            case "gaia": return `https://gaiaflix.live/watch/${id}?type=movie`;
            case "flixer": return `https://flixer.gd/watch/movie/${id}`;
            case "oneembed": return `https://1embed.cc/embed/movie/${id}`;
            default: return `https://player.videasy.net/movie/${id}?color=8834ec`;
        }
    } else {
        switch (server) {
            case "novera": return `https://novera.tv/watch/tv/${id}?s=${season}&e=${episode}`;
            case "vault": return `https://streamvaultsrc.click/embed/tv/${id}/${season}/${episode}`;
            case "xpass": return `https://play.xpass.top/e/tv/${id}/${season}/${episode}`;
            case "nxsha": return `https://web.nxsha.app/embed/tv/${id}/${season}/${episode}`;
            case "shuttle": return `https://shuttletv.su/watch/${id}?s=${season}&e=${episode}`;
            case "videasy": return `https://player.videasy.net/tv/${id}/${season}/${episode}?autoplayNextEpisode=true&autoPlay=true&nextEpisode=true&color=8834ec`;
            case "vidfast": return `https://vidfast.vc/tv/${id}/${season}/${episode}?autoPlay=true`;
            case "moonflix": return `https://player.moonflix.website/tv/${id}/${season}/${episode}`;
            case "nextbox": return `https://nextbox.uno/player/tv/${id}/${season}/${episode}`;
            case "peestream": return `https://peestream.in/embed/?type=show&tmdbId=${id}&season=${season}&episode=${episode}`;
            case "gaia": return `https://gaiaflix.live/watch/${id}?type=tv&s=${season}&e=${episode}`;
            case "flixer": return `https://flixer.gd/watch/tv/${id}/${season}/${episode}`; 
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
            const seasonEl = document.getElementById('seasonSelect');
            const episodeEl = document.getElementById('episodeSelect');
            const s = seasonEl ? seasonEl.value : 1;
            const e = episodeEl ? episodeEl.value : 1;
            loadServerIframe("tv", window.state.current.id, s, e);
        } else {
            loadServerIframe("movie", window.state.current.id);
        }
    }
}
