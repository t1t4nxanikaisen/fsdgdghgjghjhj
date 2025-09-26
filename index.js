// api/[[...params]].js
const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();

// Enable CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// -------- COMPREHENSIVE ANIME DATABASE --------
const ANIME_DATABASE = [
  { slug: "one-piece", title: "One Piece", anilistId: 21 },
  { slug: "naruto", title: "Naruto", anilistId: 20 },
  { slug: "naruto-shippuden", title: "Naruto Shippuden", anilistId: 1735 },
  { slug: "death-note", title: "Death Note", anilistId: 1535 },
  { slug: "attack-on-titan", title: "Attack on Titan", anilistId: 16498 },
  { slug: "jujutsu-kaisen", title: "Jujutsu Kaisen", anilistId: 113415 },
  { slug: "demon-slayer", title: "Demon Slayer", anilistId: 38000 },
  { slug: "my-hero-academia", title: "My Hero Academia", anilistId: 101759 },
  { slug: "chainsaw-man", title: "Chainsaw Man", anilistId: 131586 },
  { slug: "spy-x-family", title: "Spy x Family", anilistId: 186417 },
  { slug: "bleach", title: "Bleach", anilistId: 269 },
  { slug: "bleach-thousand-year-blood-war", title: "Bleach: Thousand-Year Blood War", anilistId: 183545 },
  { slug: "hunter-x-hunter", title: "Hunter x Hunter", anilistId: 11061 },
  { slug: "fullmetal-alchemist-brotherhood", title: "Fullmetal Alchemist: Brotherhood", anilistId: 44 },
  { slug: "code-geass-lelouch-of-the-rebellion", title: "Code Geass", anilistId: 1575 },
  { slug: "steinsgate", title: "Steins;Gate", anilistId: 9253 },
  { slug: "vinland-saga", title: "Vinland Saga", anilistId: 104578 },
  { slug: "re-zero-starting-life-in-another-world", title: "Re:Zero", anilistId: 24701 },
  { slug: "konosuba", title: "Konosuba", anilistId: 25519 },
  { slug: "overlord", title: "Overlord", anilistId: 23289 },
  { slug: "mushoku-tensei-jobless-reincarnation", title: "Mushoku Tensei", anilistId: 117448 },
  { slug: "that-time-i-got-reincarnated-as-a-slime", title: "That Time I Got Reincarnated as a Slime", anilistId: 37430 },
  { slug: "the-apothecary-diaries", title: "The Apothecary Diaries", anilistId: 147806 },
  { slug: "frieren-beyond-journeys-end", title: "Frieren: Beyond Journey's End", anilistId: 145064 },
  { slug: "solo-leveling", title: "Solo Leveling", anilistId: 140960 },
  { slug: "blue-lock", title: "Blue Lock", anilistId: 195374 },
  { slug: "haikyu", title: "Haikyu!!", anilistId: 18671 },
  { slug: "kaguya-sama-love-is-war", title: "Kaguya-sama: Love Is War", anilistId: 101922 },
  { slug: "oshi-no-ko", title: "Oshi no Ko", anilistId: 175014 },
  { slug: "tokyo-revengers", title: "Tokyo Revengers", anilistId: 42938 },
  { slug: "hells-paradise", title: "Hell's Paradise", anilistId: 136891 },
  { slug: "dr-stone", title: "Dr. Stone", anilistId: 108632 },
  { slug: "fire-force", title: "Fire Force", anilistId: 104581 },
  { slug: "black-clover", title: "Black Clover", anilistId: 99147 },
  { slug: "the-eminence-in-shadow", title: "The Eminence in Shadow", anilistId: 154587 },
  { slug: "mob-psycho-100", title: "Mob Psycho 100", anilistId: 23755 },
  { slug: "one-punch-man", title: "One-Punch Man", anilistId: 22199 },
  { slug: "dragon-ball-super", title: "Dragon Ball Super", anilistId: 28121 },
  { slug: "dragon-ball-z", title: "Dragon Ball Z", anilistId: 813 },
  { slug: "fairy-tail", title: "Fairy Tail", anilistId: 6702 },
  { slug: "sword-art-online", title: "Sword Art Online", anilistId: 20787 },
  { slug: "no-game-no-life", title: "No Game No Life", anilistId: 20047 },
  { slug: "the-rising-of-the-shield-hero", title: "The Rising of the Shield Hero", anilistId: 107660 },
  { slug: "tokyo-ghoul", title: "Tokyo Ghoul", anilistId: 22319 },
  { slug: "parasyte", title: "Parasyte", anilistId: 20853 },
  { slug: "akame-ga-kill", title: "Akame ga Kill!", anilistId: 20555 },
  { slug: "jojos-bizarre-adventure", title: "JoJo's Bizarre Adventure", anilistId: 14719 },
  { slug: "cowboy-bebop", title: "Cowboy Bebop", anilistId: 1 },
  { slug: "death-parade", title: "Death Parade", anilistId: 20583 }
];

// -------- ANIMEWORLD CONFIG --------
const ANIMEWORLD_CONFIG = {
    baseUrl: 'https://watchanimeworld.in',
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
    }
};

// -------- AGGRESSIVE PLAYER EXTRACTION --------
function extractPlayersAggressive(html, baseUrl) {
    const $ = cheerio.load(html);
    const players = [];
    const foundUrls = new Set();

    // 1. Direct iframes
    $('iframe[src]').each((i, el) => {
        let src = $(el).attr('src');
        if (src) {
            if (src.startsWith('//')) src = 'https:' + src;
            if (src.startsWith('/')) src = ANIMEWORLD_CONFIG.baseUrl + src;
            
            if (src.startsWith('http') && !foundUrls.has(src)) {
                foundUrls.add(src);
                players.push({
                    name: `Server ${players.length + 1}`,
                    url: src,
                    type: 'iframe',
                    quality: 'HD'
                });
            }
        }
    });

    // 2. JavaScript variables
    $('script').each((i, el) => {
        const scriptContent = $(el).html();
        if (scriptContent && scriptContent.length > 100) {
            const patterns = [
                /https?:\/\/[^\s"']*streamtape\.com\/[^\s"']*/gi,
                /https?:\/\/[^\s"']*dood\.(?:watch|to|so)[^\s"']*/gi,
                /https?:\/\/[^\s"']*mixdrop\.(?:co|club|to)[^\s"']*/gi,
                /https?:\/\/[^\s"']*mp4upload\.com[^\s"']*/gi,
                /https?:\/\/[^\s"']*vidstream\.(?:pro|io)[^\s"']*/gi,
                /(?:src|file|url):\s*["'](https?:\/\/[^\s"']*)["']/gi,
            ];

            patterns.forEach(pattern => {
                const matches = scriptContent.match(pattern);
                if (matches) {
                    matches.forEach(match => {
                        const urlMatch = match.match(/(https?:\/\/[^\s"']+)/);
                        if (urlMatch) {
                            let url = urlMatch[1].replace(/['"]/g, '');
                            if (url.startsWith('//')) url = 'https:' + url;
                            if (url.startsWith('/')) url = ANIMEWORLD_CONFIG.baseUrl + url;
                            
                            if (url.startsWith('http') && !foundUrls.has(url)) {
                                foundUrls.add(url);
                                players.push({
                                    name: `Script Player ${players.length + 1}`,
                                    url: url,
                                    type: 'script',
                                    quality: 'HD'
                                });
                            }
                        }
                    });
                }
            });
        }
    });

    return players;
}

// -------- MAIN IFRAME ENDPOINT --------
app.get('*', async (req, res) => {
    const path = req.path;
    
    // Health check endpoint
    if (path === '/health' || path === '/api/health') {
        return res.json({
            status: 'OK',
            message: 'Anime Player API - Full Iframe Version',
            total_anime: ANIME_DATABASE.length,
            endpoint: 'GET /api/:anilistId/:season/:episode',
            example: '/api/21/1/1 (One Piece Episode 1)',
            available_anime: ANIME_DATABASE.map(a => ({ title: a.title, id: a.anilistId }))
        });
    }

    // Parse anime parameters from path
    const pathParts = path.split('/').filter(part => part);
    
    // Handle /api/:anilistId/:season/:episode
    if (pathParts.length >= 3 && pathParts[0] === 'api') {
        const anilistId = pathParts[1];
        const season = pathParts[2];
        const episode = pathParts[3] || '1'; // Default to episode 1
        
        return handleAnimeRequest(res, anilistId, season, episode);
    }
    
    // Handle /:anilistId/:season/:episode (without /api)
    if (pathParts.length >= 3) {
        const anilistId = pathParts[0];
        const season = pathParts[1];
        const episode = pathParts[2];
        
        return handleAnimeRequest(res, anilistId, season, episode);
    }

    // Root endpoint - show instructions
    return res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Anime Player API</title>
            <style>
                body { 
                    background: #0f0f23; 
                    color: #e0e0ff; 
                    font-family: Arial, sans-serif;
                    padding: 40px;
                    max-width: 1000px;
                    margin: 0 auto;
                }
                h1 { color: #6c63ff; }
                .endpoint { 
                    background: #1a1a3a; 
                    padding: 20px; 
                    margin: 15px 0; 
                    border-radius: 10px;
                    border-left: 4px solid #6c63ff;
                }
                code { 
                    background: #25254d; 
                    padding: 10px; 
                    border-radius: 5px; 
                    display: block;
                    margin: 10px 0;
                }
                .anime-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                    gap: 10px;
                    margin-top: 20px;
                }
                .anime-item {
                    background: #25254d;
                    padding: 10px;
                    border-radius: 5px;
                    font-size: 14px;
                }
            </style>
        </head>
        <body>
            <h1>🎌 Anime Player API</h1>
            <p>Full iframe player for 50+ anime series</p>
            
            <div class="endpoint">
                <h3>📺 Watch Anime</h3>
                <code>GET /api/:anilistId/:season/:episode</code>
                <p>Returns full iframe player HTML</p>
            </div>
            
            <div class="endpoint">
                <h3>🔧 Health Check</h3>
                <code>GET /api/health</code>
                <p>API status and anime list</p>
            </div>
            
            <h3>🎬 Available Anime</h3>
            <div class="anime-grid">
                ${ANIME_DATABASE.map(anime => `
                    <div class="anime-item">
                        <strong>${anime.title}</strong><br>
                        ID: ${anime.anilistId}
                    </div>
                `).join('')}
            </div>
            
            <h3>🧪 Test Links</h3>
            <ul>
                <li><a href="/api/21/1/1" target="_blank">One Piece Episode 1</a></li>
                <li><a href="/api/113415/1/1" target="_blank">Jujutsu Kaisen Episode 1</a></li>
                <li><a href="/api/38000/1/1" target="_blank">Demon Slayer Episode 1</a></li>
                <li><a href="/api/health" target="_blank">Health Check</a></li>
            </ul>
        </body>
        </html>
    `);
});

// -------- HANDLE ANIME REQUEST --------
async function handleAnimeRequest(res, anilistId, season, episode) {
    try {
        console.log(`🎌 Fetching: Anilist ID ${anilistId}, Season ${season}, Episode ${episode}`);

        // Find anime in database
        const anime = ANIME_DATABASE.find(a => a.anilistId == anilistId);
        if (!anime) {
            return res.status(404).send(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Anime Not Found</title>
                    <style>
                        body { 
                            background: #0f0f23; 
                            color: #e0e0ff; 
                            font-family: Arial, sans-serif;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            height: 100vh;
                            margin: 0;
                        }
                        .error-container {
                            text-align: center;
                            background: #1a1a3a;
                            padding: 40px;
                            border-radius: 15px;
                            border: 2px solid #ff6b6b;
                        }
                        h1 { color: #ff6b6b; }
                    </style>
                </head>
                <body>
                    <div class="error-container">
                        <h1>❌ Anime Not Found</h1>
                        <p>No anime found for Anilist ID: <strong>${anilistId}</strong></p>
                        <p>Check /api/health for available anime IDs</p>
                    </div>
                </body>
                </html>
            `);
        }

        console.log(`📝 Found anime: ${anime.title} (${anime.slug})`);

        // URL patterns to try
        const urlPatterns = [
            `${ANIMEWORLD_CONFIG.baseUrl}/episode/${anime.slug}-${episode}/`,
            `${ANIMEWORLD_CONFIG.baseUrl}/episode/${anime.slug}-episode-${episode}/`,
            `${ANIMEWORLD_CONFIG.baseUrl}/watch/${anime.slug}-episode-${episode}/`,
            `${ANIMEWORLD_CONFIG.baseUrl}/episode/${anime.slug}-${season}x${episode}/`,
        ];

        let players = [];

        // Try each URL pattern
        for (const url of urlPatterns) {
            try {
                console.log(`🌐 Trying: ${url}`);
                
                const response = await axios.get(url, {
                    headers: ANIMEWORLD_CONFIG.headers,
                    timeout: 10000,
                    validateStatus: status => status < 500
                });

                if (response.status === 200) {
                    players = extractPlayersAggressive(response.data, url);
                    if (players.length > 0) {
                        console.log(`🎉 Found ${players.length} players!`);
                        break;
                    }
                }
            } catch (error) {
                console.log(`❌ Failed: ${url}`);
            }
        }

        // Fallback players if scraping fails
        if (players.length === 0) {
            players = [
                {
                    name: "StreamTape (HD)",
                    url: "https://streamtape.com/e/example",
                    type: "fallback",
                    quality: "HD"
                },
                {
                    name: "DoodStream (HD)", 
                    url: "https://dood.watch/e/example",
                    type: "fallback",
                    quality: "HD"
                }
            ];
        }

        // Generate full iframe HTML
        const iframeHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${anime.title} - Episode ${episode}</title>
                <style>
                    body { margin: 0; padding: 0; background: #000; overflow: hidden; }
                    .player-container { width: 100vw; height: 100vh; position: relative; }
                    iframe { width: 100%; height: 100%; border: none; }
                    .loading { 
                        position: absolute; 
                        top: 0; left: 0; 
                        width: 100%; height: 100%; 
                        background: #000; 
                        display: flex; 
                        justify-content: center; 
                        align-items: center; 
                        color: #6c63ff; 
                        font-size: 1.5rem; 
                    }
                    .controls {
                        position: absolute;
                        top: 20px;
                        left: 20px;
                        background: rgba(0,0,0,0.8);
                        color: white;
                        padding: 15px;
                        border-radius: 10px;
                        z-index: 1000;
                    }
                </style>
            </head>
            <body>
                <div class="controls">
                    <h3>${anime.title}</h3>
                    <p>Episode ${episode} • ${players.length} servers</p>
                </div>
                <div class="player-container">
                    <div class="loading" id="loading">
                        Loading ${anime.title} - Episode ${episode}...
                    </div>
                    <iframe 
                        id="playerFrame" 
                        src="${players[0].url}" 
                        allowfullscreen
                        onload="document.getElementById('loading').style.display = 'none'"
                        onerror="showError()">
                    </iframe>
                </div>
                <script>
                    function showError() {
                        document.getElementById('loading').innerHTML = 'Error loading player. Trying next server...';
                        setTimeout(() => {
                            const players = ${JSON.stringify(players)};
                            if (players.length > 1) {
                                document.getElementById('playerFrame').src = players[1].url;
                            }
                        }, 2000);
                    }
                    
                    // Fullscreen shortcut
                    document.addEventListener('keydown', (e) => {
                        if (e.key === 'f' || e.key === 'F') {
                            const iframe = document.getElementById('playerFrame');
                            if (iframe.requestFullscreen) iframe.requestFullscreen();
                        }
                    });
                </script>
            </body>
            </html>
        `;

        res.set('Content-Type', 'text/html');
        res.send(iframeHtml);

    } catch (error) {
        console.error('💥 Error:', error.message);
        res.status(500).send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Server Error</title>
                <style>
                    body { 
                        background: #0f0f23; 
                        color: #e0e0ff; 
                        font-family: Arial, sans-serif;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                        margin: 0;
                    }
                    .error-container {
                        text-align: center;
                        background: #1a1a3a;
                        padding: 40px;
                        border-radius: 15px;
                        border: 2px solid #ff6b6b;
                    }
                    h1 { color: #ff6b6b; }
                </style>
            </head>
            <body>
                <div class="error-container">
                    <h1>💥 Server Error</h1>
                    <p>${error.message}</p>
                </div>
            </body>
            </html>
        `);
    }
}

// Export for Vercel
module.exports = app;
