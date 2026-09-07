/**
 * endpoints.js - Backend Aggregator Router & Data Controller
 * Matches path structure: /a/{slug}
 */

(function (window) {
    class BackendAggregatorEngine {
        constructor() {
            this.eventsData = [];
        }

        // Fetch and normalize incoming buffsports.json data
        async fetchAndNormalizeData(sourceUrl) {
            try {
                // Using a proxy to bypass client-side CORS restrictions for the raw JSON source
                const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(sourceUrl)}`;
                const response = await fetch(proxyUrl);
                const jsonWrapper = await response.json();
                
                if (!jsonWrapper.contents) throw new Error("Empty response payload from source");
                
                const rawData = JSON.parse(jsonWrapper.contents);
                this.eventsData = this.normalizeJson(rawData);
                
                return {
                    success: true,
                    count: this.eventsData.length,
                    data: this.eventsData
                };
            } catch (error) {
                console.error("Backend Error fetching source JSON:", error);
                return {
                    success: false,
                    error: error.message
                };
            }
        }

        normalizeJson(raw) {
            let items = Array.isArray(raw) ? raw : (raw.events || raw.matches || raw.data || []);
            const now = new Date();
            
            return items.map((item, index) => {
                const title = item.title || item.name || item.match || `Event #${index + 1}`;
                const category = item.category || item.sport || item.league || "General";
                const slug = item.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                
                // Parse or assign game timestamp
                let eventTime;
                if (item.time || item.date || item.timestamp) {
                    eventTime = new Date(item.time || item.date || item.timestamp);
                } else {
                    // Stagger mock times around current time for demonstration if not provided
                    eventTime = new Date(now.getTime() + (index - 1) * 45 * 60 * 1000);
                }
                
                let rawStreams = item.streams || item.channels || item.links || [];
                if (rawStreams.length === 0 && item.url) {
                    rawStreams = [{ name: "Stream 1", url: item.url }];
                }

                const streams = rawStreams.map((s, sIdx) => {
                    const streamUrl = typeof s === 'string' ? s : (s.url || s.embed || s.link);
                    const streamName = (typeof s === 'object' && s.name) ? s.name : `Stream ${sIdx + 1}`;
                    return {
                        name: streamName,
                        url: streamUrl || `https://embedsports.me/a/${slug}-stream-${sIdx + 1}`
                    };
                });

                return {
                    id: item.id || `event-${index}`,
                    category,
                    slug,
                    title,
                    timestamp: eventTime,
                    streams: streams.length > 0 ? streams : [{ name: "Stream 1", url: `https://embedsports.me/a/${slug}-stream-1` }]
                };
            });
        }

        // Formats date into New York EDT time (12-hour format, no seconds)
        formatEDT(date) {
            return new Intl.DateTimeFormat('en-US', {
                timeZone: 'America/New_York',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                hour12: true
            }).format(date) + ' EDT';
        }

        // Backend Route Resolver for /a/{slug}
        resolveRoute(routePath) {
            if (!routePath.startsWith('/a/')) {
                return { view: 'home', data: this.eventsData };
            }

            const slugMatch = routePath.replace('/a/', '');
            const baseSlug = slugMatch.replace(/-stream-\d+$/, '');
            const event = this.eventsData.find(e => e.slug === baseSlug);

            if (event) {
                return {
                    view: 'player',
                    slug: slugMatch,
                    event: event
                };
            } else {
                // Fallback virtual event if deep-linked slug is custom/external
                return {
                    view: 'player',
                    slug: slugMatch,
                    event: {
                        title: "Resolved Remote Stream",
                        slug: slugMatch,
                        streams: [{ name: "Source 1", url: `https://embedsports.me/a/${slugMatch}` }]
                    }
                };
            }
        }
    }

    // Expose backend router instance globally
    window.BackendEndpoints = new BackendAggregatorEngine();
})(window);
