const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');

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
  { slug: "ghost-in-the-shell-arise", title: "Ghost in the Shell: Arise", anilistId: 15583 },
  { slug: "death-note", title: "Death Note", anilistId: 1535 },
  { slug: "naruto-shippuden", title: "Naruto Shippuden", anilistId: 1735 },
  { slug: "one-piece", title: "One Piece", anilistId: 21 },
  { slug: "attack-on-titan", title: "Attack on Titan", anilistId: 16498 },
  { slug: "jujutsu-kaisen", title: "Jujutsu Kaisen", anilistId: 113415 },
  { slug: "demon-slayer", title: "Demon Slayer", anilistId: 38000 },
  { slug: "my-hero-academia", title: "My Hero Academia", anilistId: 101759 },
  { slug: "chainsaw-man", title: "Chainsaw Man", anilistId: 131586 },
  { slug: "spy-x-family", title: "Spy x Family", anilistId: 186417 },
  { slug: "vinland-saga", title: "Vinland Saga", anilistId: 104578 },
  { slug: "bleach-thousand-year-blood-war", title: "Bleach: Thousand-Year Blood War", anilistId: 183545 },
  { slug: "overlord", title: "Overlord", anilistId: 23289 },
  { slug: "re-zero-starting-life-in-another-world", title: "Re:Zero", anilistId: 24701 },
  { slug: "konosuba", title: "Konosuba", anilistId: 25519 },
  { slug: "mushoku-tensei-jobless-reincarnation", title: "Mushoku Tensei", anilistId: 117448 },
  { slug: "that-time-i-got-reincarnated-as-a-slime", title: "That Time I Got Reincarnated as a Slime", anilistId: 37430 },
  { slug: "the-apothecary-diaries", title: "The Apothecary Diaries", anilistId: 147806 },
  { slug: "frieren-beyond-journeys-end", title: "Frieren: Beyond Journey's End", anilistId: 145064 },
  { slug: "solo-leveling", title: "Solo Leveling", anilistId: 140960 },
  { slug: "blue-lock", title: "Blue Lock", anilistId: 195374 },
  { slug: "haikyu", title: "Haikyu!!", anilistId: 18671 },
  { slug: "kaguya-sama-love-is-war", title: "Kaguya-sama: Love Is War", anilistId: 101922 },
  { slug: "horimiya", title: "Horimiya", anilistId: 42897 },
  { slug: "classroom-of-the-elite", title: "Classroom of the Elite", anilistId: 18441 },
  { slug: "oshi-no-ko", title: "Oshi no Ko", anilistId: 175014 },
  { slug: "tokyo-revengers", title: "Tokyo Revengers", anilistId: 42938 },
  { slug: "hells-paradise", title: "Hell's Paradise", anilistId: 136891 },
  { slug: "dr-stone", title: "Dr. Stone", anilistId: 108632 },
  { slug: "fire-force", title: "Fire Force", anilistId: 104581 },
  { slug: "black-clover", title: "Black Clover", anilistId: 99147 },
  { slug: "the-eminence-in-shadow", title: "The Eminence in Shadow", anilistId: 154587 },
  { slug: "mob-psycho-100", title: "Mob Psycho 100", anilistId: 23755 },
  { slug: "one-punch-man", title: "One-Punch Man", anilistId: 22199 },
  { slug: "hunter-x-hunter", title: "Hunter x Hunter", anilistId: 11061 },
  { slug: "code-geass-lelouch-of-the-rebellion", title: "Code Geass", anilistId: 1575 },
  { slug: "fullmetal-alchemist-brotherhood", title: "Fullmetal Alchemist: Brotherhood", anilistId: 44 },
  { slug: "steinsgate", title: "Steins;Gate", anilistId: 9253 },
  { slug: "cowboy-bebop", title: "Cowboy Bebop", anilistId: 1 },
  { slug: "death-parade", title: "Death Parade", anilistId: 20583 },
  { slug: "parasyte", title: "Parasyte", anilistId: 20853 },
  { slug: "tokyo-ghoul", title: "Tokyo Ghoul", anilistId: 22319 },
  { slug: "akame-ga-kill", title: "Akame ga Kill!", anilistId: 20555 },
  { slug: "sword-art-online", title: "Sword Art Online", anilistId: 20787 },
  { slug: "no-game-no-life", title: "No Game No Life", anilistId: 20047 },
  { slug: "the-rising-of-the-shield-hero", title: "The Rising of the Shield Hero", anilistId: 107660 },
  { slug: "jobless-reincarnation", title: "Mushoku Tensei", anilistId: 117448 },
  { slug: "the-devil-is-a-part-timer", title: "The Devil is a Part-Timer!", anilistId: 15809 },
  { slug: "noragami", title: "Noragami", anilistId: 19815 },
  { slug: "blue-exorcist", title: "Blue Exorcist", anilistId: 9919 },
  { slug: "fairy-tail", title: "Fairy Tail", anilistId: 6702 },
  { slug: "seven-deadly-sins", title: "Seven Deadly Sins", anilistId: 30015 },
  { slug: "dragon-ball-super", title: "Dragon Ball Super", anilistId: 28121 },
  { slug: "naruto", title: "Naruto", anilistId: 20 },
  { slug: "bleach", title: "Bleach", anilistId: 269 },
  { slug: "dragon-ball-z", title: "Dragon Ball Z", anilistId: 813 },
  { slug: "gintama", title: "Gintama", anilistId: 918 },
  { slug: "jojos-bizarre-adventure", title: "JoJo's Bizarre Adventure", anilistId: 14719 }
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

    console.log('🔍 Aggressively searching for players...');

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

    // 2. Video elements
    $('video source[src], video[src]').each((i, el) => {
        let src = $(el).attr('src');
        if (src && src.startsWith('http') && !foundUrls.has(src)) {
            foundUrls.add(src);
            players.push({
                name: `Direct Video ${players.length + 1}`,
                url: src,
                type: 'direct',
                quality: 'Auto'
            });
        }
    });

    // 3. JavaScript variables
    $('script').each((i, el) => {
        const scriptContent = $(el).html();
        if (scriptContent && scriptContent.length > 100) {
            
            const aggressivePatterns = [
                /https?:\/\/[^\s"']*streamtape\.com\/[^\s"']*/gi,
                /https?:\/\/[^\s"']*dood\.(?:watch|to|so)[^\s"']*/gi,
                /https?:\/\/[^\s"']*mixdrop\.(?:co|club|to)[^\s"']*/gi,
                /https?:\/\/[^\s"']*mp4upload\.com[^\s"']*/gi,
                /https?:\/\/[^\s"']*vidstream\.(?:pro|io)[^\s"']*/gi,
                /https?:\/\/[^\s"']*\.(?:mp4|m3u8|webm|mkv)[^\s"']*/gi,
                /(?:src|file|url):\s*["'](https?:\/\/[^\s"']*)["']/gi,
                /atob\s*\(\s*["']([A-Za-z0-9+/=]+)["']\s*\)/gi,
            ];

            aggressivePatterns.forEach(pattern => {
                const matches = scriptContent.match(pattern);
                if (matches) {
                    matches.forEach(match => {
                        let url = match;
                        
                        if (match.includes('atob')) {
                            const base64Match = match.match(/atob\s*\(\s*"([^"]+)"\s*\)/);
                            if (base64Match) {
                                try {
                                    url = Buffer.from(base64Match[1], 'base64').toString();
                                } catch (e) {}
                            }
                        }
                        
                        const urlMatch = url.match(/(https?:\/\/[^\s"']+)/);
                        if (urlMatch) {
                            url = urlMatch[1].replace(/['"]/g, '');
                            
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

    console.log(`🎯 Total players found: ${players.length}`);
    return players;
}

// -------- MAIN IFRAME ENDPOINT --------
app.get('/:anilistId/:season/:episode', async (req, res) => {
    const { anilistId, season, episode } = req.params;

    try {
        console.log(`🎌 Fetching player for Anilist ID: ${anilistId}, Season: ${season}, Episode: ${episode}`);

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
                        h1 { color: #ff6b6b; margin-bottom: 20px; }
                        p { color: #a0a0ff; margin-bottom: 20px; }
                        .anime-list {
                            text-align: left;
                            max-height: 200px;
                            overflow-y: auto;
                            background: #25254d;
                            padding: 15px;
                            border-radius: 8px;
                            margin-top: 20px;
                        }
                    </style>
                </head>
                <body>
                    <div class="error-container">
                        <h1>❌ Anime Not Found</h1>
                        <p>No anime found for Anilist ID: <strong>${anilistId}</strong></p>
                        <p>Available anime IDs:</p>
                        <div class="anime-list">
                            ${ANIME_DATABASE.map(a => `<div>${a.title} - ID: ${a.anilistId}</div>`).join('')}
                        </div>
                    </div>
                </body>
                </html>
            `);
        }

        console.log(`📝 Found anime: ${anime.title} (${anime.slug})`);

        // ULTRA AGGRESSIVE URL PATTERNS
        const urlPatterns = [
            `${ANIMEWORLD_CONFIG.baseUrl}/episode/${anime.slug}-${episode}/`,
            `${ANIMEWORLD_CONFIG.baseUrl}/episode/${anime.slug}-episode-${episode}/`,
            `${ANIMEWORLD_CONFIG.baseUrl}/watch/${anime.slug}-episode-${episode}/`,
            `${ANIMEWORLD_CONFIG.baseUrl}/episode/${anime.slug}-${season}x${episode}/`,
            `${ANIMEWORLD_CONFIG.baseUrl}/series/${anime.slug}/episode-${episode}/`,
            `${ANIMEWORLD_CONFIG.baseUrl}/episode/${anime.slug}-ep-${episode}/`
        ];

        let players = [];
        let finalUrl = '';

        // TRY EVERY PATTERN
        for (const url of urlPatterns) {
            try {
                console.log(`🌐 Trying: ${url}`);
                
                const response = await axios.get(url, {
                    headers: ANIMEWORLD_CONFIG.headers,
                    timeout: 15000,
                    validateStatus: status => status < 500
                });

                if (response.status === 200) {
                    console.log(`✅ Page loaded: ${url}`);
                    players = extractPlayersAggressive(response.data, url);
                    finalUrl = url;
                    
                    if (players.length > 0) {
                        console.log(`🎉 SUCCESS: Found ${players.length} players!`);
                        break;
                    }
                }
            } catch (error) {
                console.log(`❌ Failed: ${url}`);
            }
        }

        // FALLBACK PLAYERS
        if (players.length === 0) {
            console.log('🔄 Using fallback players');
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
                },
                {
                    name: "MixDrop (HD)",
                    url: "https://mixdrop.co/e/example",
                    type: "fallback",
                    quality: "HD"
                }
            ];
        }

        // GENERATE FULL IFRAME HTML
        const iframeHtml = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${anime.title} - Episode ${episode}</title>
                <style>
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    
                    body {
                        background: #000;
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        overflow: hidden;
                        height: 100vh;
                    }
                    
                    .player-container {
                        width: 100vw;
                        height: 100vh;
                        position: relative;
                        background: #000;
                    }
                    
                    iframe {
                        width: 100%;
                        height: 100%;
                        border: none;
                        display: block;
                    }
                    
                    .player-controls {
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        background: linear-gradient(180deg, rgba(0,0,0,0.8) 0%, transparent 100%);
                        padding: 20px;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        z-index: 1000;
                        transition: opacity 0.3s ease;
                    }
                    
                    .player-controls.hidden {
                        opacity: 0;
                        pointer-events: none;
                    }
                    
                    .anime-info {
                        color: white;
                    }
                    
                    .anime-title {
                        font-size: 1.5rem;
                        font-weight: bold;
                        color: #6c63ff;
                        margin-bottom: 5px;
                    }
                    
                    .episode-info {
                        color: #a0a0ff;
                        font-size: 1rem;
                    }
                    
                    .server-controls {
                        display: flex;
                        gap: 15px;
                        align-items: center;
                    }
                    
                    .server-select {
                        background: #1a1a3a;
                        border: 2px solid #6c63ff;
                        border-radius: 8px;
                        padding: 10px 15px;
                        color: white;
                        outline: none;
                    }
                    
                    .episode-nav {
                        display: flex;
                        gap: 10px;
                    }
                    
                    .nav-btn {
                        background: #6c63ff;
                        border: none;
                        border-radius: 8px;
                        padding: 10px 20px;
                        color: white;
                        cursor: pointer;
                        transition: all 0.3s ease;
                    }
                    
                    .nav-btn:hover:not(:disabled) {
                        background: #5a52d5;
                        transform: translateY(-2px);
                    }
                    
                    .nav-btn:disabled {
                        background: #3a3a5a;
                        cursor: not-allowed;
                        opacity: 0.5;
                    }
                    
                    .loading {
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background: #000;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        flex-direction: column;
                        color: #6c63ff;
                        font-size: 1.5rem;
                        z-index: 999;
                    }
                    
                    .spinner {
                        width: 60px;
                        height: 60px;
                        border: 6px solid #25254d;
                        border-top: 6px solid #6c63ff;
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                        margin-bottom: 20px;
                    }
                    
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                    
                    .fullscreen-btn {
                        background: rgba(108, 99, 255, 0.8);
                        border: none;
                        border-radius: 8px;
                        padding: 10px 15px;
                        color: white;
                        cursor: pointer;
                        transition: all 0.3s ease;
                    }
                    
                    .fullscreen-btn:hover {
                        background: #6c63ff;
                        transform: scale(1.05);
                    }
                    
                    .error-message {
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        background: rgba(255, 107, 107, 0.9);
                        color: white;
                        padding: 30px;
                        border-radius: 15px;
                        text-align: center;
                        max-width: 500px;
                        z-index: 1001;
                    }
                </style>
            </head>
            <body>
                <div class="player-container">
                    <div class="loading" id="loading">
                        <div class="spinner"></div>
                        <p>Loading ${anime.title} - Episode ${episode}</p>
                    </div>
                    
                    <div class="player-controls" id="playerControls">
                        <div class="anime-info">
                            <div class="anime-title">${anime.title}</div>
                            <div class="episode-info">Season ${season} • Episode ${episode}</div>
                        </div>
                        
                        <div class="server-controls">
                            ${players.length > 1 ? `
                                <select class="server-select" id="serverSelect" onchange="switchServer()">
                                    ${players.map((player, index) => 
                                        `<option value="${index}">${player.name} (${player.quality})</option>`
                                    ).join('')}
                                </select>
                            ` : ''}
                            
                            <div class="episode-nav">
                                <button class="nav-btn" onclick="changeEpisode(-1)" id="prevBtn">⬅ Previous</button>
                                <button class="nav-btn" onclick="changeEpisode(1)" id="nextBtn">Next ➡</button>
                            </div>
                            
                            <button class="fullscreen-btn" onclick="toggleFullscreen()">⛶ Fullscreen</button>
                        </div>
                    </div>
                    
                    <iframe 
                        id="playerFrame" 
                        src="${players[0].url}" 
                        allowfullscreen 
                        webkitallowfullscreen 
                        mozallowfullscreen
                        onload="hideLoading()"
                        onerror="showError()">
                    </iframe>
                </div>

                <script>
                    const players = ${JSON.stringify(players)};
                    let currentServerIndex = 0;
                    let controlsVisible = true;
                    let controlsTimeout;
                    
                    function hideLoading() {
                        document.getElementById('loading').style.display = 'none';
                        startControlsTimer();
                    }
                    
                    function showError() {
                        const errorDiv = document.createElement('div');
                        errorDiv.className = 'error-message';
                        errorDiv.innerHTML = \`
                            <h3>❌ Player Error</h3>
                            <p>Failed to load the video player.</p>
                            <p>Trying next server...</p>
                        \`;
                        document.body.appendChild(errorDiv);
                        
                        setTimeout(() => {
                            if (players.length > 1) {
                                switchToNextServer();
                                errorDiv.remove();
                            }
                        }, 3000);
                    }
                    
                    function switchServer() {
                        const select = document.getElementById('serverSelect');
                        currentServerIndex = parseInt(select.value);
                        const iframe = document.getElementById('playerFrame');
                        iframe.src = players[currentServerIndex].url;
                        document.getElementById('loading').style.display = 'flex';
                    }
                    
                    function switchToNextServer() {
                        if (players.length > 1) {
                            currentServerIndex = (currentServerIndex + 1) % players.length;
                            const iframe = document.getElementById('playerFrame');
                            iframe.src = players[currentServerIndex].url;
                            if (document.getElementById('serverSelect')) {
                                document.getElementById('serverSelect').value = currentServerIndex;
                            }
                            document.getElementById('loading').style.display = 'flex';
                        }
                    }
                    
                    function changeEpisode(direction) {
                        const currentEpisode = ${parseInt(episode)};
                        const newEpisode = currentEpisode + direction;
                        if (newEpisode >= 1) {
                            window.location.href = \`/${anime.anilistId}/${season}/\${newEpisode}\`;
                        }
                    }
                    
                    function toggleFullscreen() {
                        const iframe = document.getElementById('playerFrame');
                        if (iframe.requestFullscreen) {
                            iframe.requestFullscreen();
                        } else if (iframe.webkitRequestFullscreen) {
                            iframe.webkitRequestFullscreen();
                        } else if (iframe.msRequestFullscreen) {
                            iframe.msRequestFullscreen();
                        }
                    }
                    
                    function startControlsTimer() {
                        clearTimeout(controlsTimeout);
                        controlsTimeout = setTimeout(() => {
                            document.getElementById('playerControls').classList.add('hidden');
                            controlsVisible = false;
                        }, 3000);
                    }
                    
                    // Show controls on mouse move
                    document.addEventListener('mousemove', () => {
                        if (!controlsVisible) {
                            document.getElementById('playerControls').classList.remove('hidden');
                            controlsVisible = true;
                        }
                        startControlsTimer();
                    });
                    
                    // Keyboard shortcuts
                    document.addEventListener('keydown', (e) => {
                        switch(e.key) {
                            case 'ArrowLeft':
                                changeEpisode(-1);
                                break;
                            case 'ArrowRight':
                                changeEpisode(1);
                                break;
                            case 'f':
                            case 'F':
                                toggleFullscreen();
                                break;
                            case 's':
                            case 'S':
                                if (players.length > 1) switchToNextServer();
                                break;
                            case ' ':
                                e.preventDefault();
                                // Spacebar for play/pause would need to communicate with iframe
                                break;
                        }
                    });
                    
                    // Auto-hide cursor
                    let cursorTimeout;
                    document.addEventListener('mousemove', () => {
                        document.body.style.cursor = 'default';
                        clearTimeout(cursorTimeout);
                        cursorTimeout = setTimeout(() => {
                            document.body.style.cursor = 'none';
                        }, 2000);
                    });
                </script>
            </body>
            </html>
        `;

        res.set('Content-Type', 'text/html');
        res.send(iframeHtml);

    } catch (error) {
        console.error('💥 Server error:', error.message);
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
                    h1 { color: #ff6b6b; margin-bottom: 20px; }
                    p { color: #a0a0ff; margin-bottom: 20px; }
                </style>
            </head>
            <body>
                <div class="error-container">
                    <h1>💥 Server Error</h1>
                    <p>Failed to load the anime player.</p>
                    <p><strong>Error:</strong> ${error.message}</p>
                    <p>Try refreshing the page or check the anime ID.</p>
                </div>
            </body>
            </html>
        `);
    }
});

// -------- HEALTH CHECK ENDPOINT --------
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Anime Player API - Full Iframe Version',
        total_anime: ANIME_DATABASE.length,
        endpoint: 'GET /:anilistId/:season/:episode',
        example: '/21/1/1 (One Piece Episode 1)',
        available_anime: ANIME_DATABASE.map(a => ({ title: a.title, id: a.anilistId, slug: a.slug }))
    });
});

// -------- ROOT REDIRECT TO HEALTH --------
app.get('/', (req, res) => {
    res.redirect('/health');
});

// -------- START SERVER --------
const PORT = process.env.PORT || 3000;

// For Vercel serverless
module.exports = app;

// For local development
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`🚀 Anime Player API running on port ${PORT}`);
        console.log(`📊 Total anime: ${ANIME_DATABASE.length}`);
        console.log(`🔗 Example: http://localhost:${PORT}/21/1/1`);
        console.log(`🔗 Health: http://localhost:${PORT}/health`);
    });
}
