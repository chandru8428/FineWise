(async function() {
    console.log("news.js initialized");
    const FINNHUB_API_KEY = 'd8e6hhpr01qm5ffvuj5gd8e6hhpr01qm5ffvuj60';
    const CACHE_KEY = 'finwise_news_cache_full';
    const CACHE_TIME_KEY = 'finwise_news_time';
    const THREE_HOURS_MS = 3 * 60 * 60 * 1000;

    let allNewsData = []; // Store all fetched news in memory
    let currentCategory = 'all';
    let currentSearchTerm = '';

    const categoryKeywords = {
        'markets': ['market', 'stock', 'index', 'dow', 'nasdaq', 's&p', 'wall street', 'trading'],
        'stocks': ['stock', 'shares', 'dividend', 'earnings', 'ipo', 'equities'],
        'mutual-funds': ['mutual fund', 'etf', 'index fund', 'vanguard', 'fidelity', 'blackrock'],
        'economy': ['economy', 'fed', 'interest rate', 'inflation', 'cpi', 'jobs', 'gdp', 'recession'],
        'crypto': ['crypto', 'bitcoin', 'btc', 'ethereum', 'eth', 'blockchain', 'binance', 'coinbase'],
        'personal-finance': ['tax', 'mortgage', 'loan', 'savings', 'retirement', '401k', 'credit card']
    };

    function renderHomeCards(newsData) {
        const container = document.getElementById('home-news-container');
        if (!container) return;
        
        const topNews = newsData.filter(item => item.image && item.summary).slice(0, 3);
        
        if (topNews.length === 0) {
            container.innerHTML = '<p class="text-muted-color">No news available at the moment.</p>';
            return;
        }

        const newsHTML = generateCardsHTML(topNews);
        container.innerHTML = newsHTML;
    }

    function renderFullNews() {
        const grid = document.getElementById('newsGrid');
        if (!grid) return;
        
        let filtered = allNewsData.filter(item => item.image && item.summary);
        
        // Apply search filter
        if (currentSearchTerm) {
            const term = currentSearchTerm.toLowerCase();
            filtered = filtered.filter(item => 
                (item.headline && item.headline.toLowerCase().includes(term)) || 
                (item.summary && item.summary.toLowerCase().includes(term))
            );
        }
        
        // Apply category filter
        if (currentCategory !== 'all' && categoryKeywords[currentCategory]) {
            const keywords = categoryKeywords[currentCategory];
            filtered = filtered.filter(item => {
                const text = ((item.headline || '') + ' ' + (item.summary || '')).toLowerCase();
                return keywords.some(kw => text.includes(kw));
            });
        }
        
        // Render max 20 for full page
        filtered = filtered.slice(0, 20);

        // Update stats
        const countSpan = document.getElementById('newsCount');
        if (countSpan) countSpan.textContent = filtered.length;
        
        const lastUpdated = document.getElementById('newsLastUpdated');
        if (lastUpdated) {
            const cachedTime = localStorage.getItem(CACHE_TIME_KEY);
            if (cachedTime) {
                const d = new Date(parseInt(cachedTime, 10));
                lastUpdated.textContent = 'Updated: ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            }
        }
        
        if (filtered.length === 0) {
            grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: var(--text-muted);">No news found for your criteria.</div>';
            return;
        }

        grid.innerHTML = generateCardsHTML(filtered);
    }

    function generateCardsHTML(newsArray) {
        return newsArray.map(item => {
            const date = new Date(item.datetime * 1000);
            const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const dateString = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
            const imageUrl = item.image || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80';
            
            return `
                <a href="${item.url}" target="_blank" rel="noopener noreferrer" class="news-card">
                    <div class="news-image" style="background-image: url('${imageUrl}')"></div>
                    <div class="news-content">
                        <div class="news-headline">${item.headline}</div>
                        <div class="news-meta">
                            <span class="news-source">${item.source}</span>
                            <span>${dateString} • ${timeString}</span>
                        </div>
                    </div>
                </a>
            `;
        }).join('');
    }

    async function fetchAllNews(forceRefresh = false) {
        const homeContainer = document.getElementById('home-news-container');
        const grid = document.getElementById('newsGrid');
        
        const cachedData = localStorage.getItem(CACHE_KEY);
        const cachedTime = localStorage.getItem(CACHE_TIME_KEY);
        const now = Date.now();

        if (!forceRefresh && cachedData && cachedTime && (now - parseInt(cachedTime, 10) < THREE_HOURS_MS)) {
            console.log("Loading news from cache...");
            try {
                allNewsData = JSON.parse(cachedData);
                renderHomeCards(allNewsData);
                renderFullNews();
                return;
            } catch (e) {
                console.error("Cache parsing failed, fetching new data...", e);
            }
        }

        try {
            console.log("Fetching new data from Finnhub...");
            const response = await fetch(`https://finnhub.io/api/v1/news?category=general&token=${FINNHUB_API_KEY}`);
            
            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }
            
            const data = await response.json();
            allNewsData = data;
            
            localStorage.setItem(CACHE_KEY, JSON.stringify(data));
            localStorage.setItem(CACHE_TIME_KEY, now.toString());
            
            renderHomeCards(allNewsData);
            renderFullNews();
            
        } catch (error) {
            console.error("Failed to fetch news:", error);
            if (cachedData) {
                try {
                    allNewsData = JSON.parse(cachedData);
                    renderHomeCards(allNewsData);
                    renderFullNews();
                    return;
                } catch(e) {}
            }
            if (homeContainer) homeContainer.innerHTML = '<p class="text-muted-color" style="color: var(--color-red);">Unable to load latest news.</p>';
            if (grid) grid.innerHTML = '<p class="text-muted-color" style="color: var(--color-red);">Unable to load latest news.</p>';
        }
    }

    // Bind event listeners for the Finance News page
    function bindNewsEvents() {
        const searchInput = document.getElementById('newsSearchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                currentSearchTerm = e.target.value;
                renderFullNews();
            });
        }

        const categoryBtns = document.querySelectorAll('.news-category');
        categoryBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                categoryBtns.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                currentCategory = e.target.dataset.newsCategory;
                renderFullNews();
            });
        });

        const refreshBtn = document.getElementById('newsRetryBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                fetchAllNews(true);
            });
        }
    }

    // Initialize
    fetchAllNews();
    bindNewsEvents();
    
    // Refresh every 3 hours
    setInterval(() => fetchAllNews(true), THREE_HOURS_MS);
})();
