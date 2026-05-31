(async function() {
    console.log("news.js initialized");
    const FINNHUB_API_KEY = 'd8e6hhpr01qm5ffvuj5gd8e6hhpr01qm5ffvuj60';
    const CACHE_KEY = 'finwise_news_cache';
    const CACHE_TIME_KEY = 'finwise_news_time';
    const THREE_HOURS_MS = 3 * 60 * 60 * 1000;

    function renderNewsCards(topNews) {
        const container = document.getElementById('home-news-container');
        if (!container) return;
        
        if (topNews.length === 0) {
            container.innerHTML = '<p class="text-muted-color">No news available at the moment.</p>';
            return;
        }

        const newsHTML = topNews.map(item => {
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

        container.innerHTML = newsHTML;
        console.log("news.js successfully rendered cards.");
    }

    async function fetchHomeNews() {
        console.log("fetchHomeNews starting...");
        const container = document.getElementById('home-news-container');
        if (!container) {
            console.error("news.js: #home-news-container not found in DOM");
            return;
        }

        // Check cache first
        const cachedData = localStorage.getItem(CACHE_KEY);
        const cachedTime = localStorage.getItem(CACHE_TIME_KEY);
        const now = Date.now();

        if (cachedData && cachedTime && (now - parseInt(cachedTime, 10) < THREE_HOURS_MS)) {
            console.log("Loading news from cache...");
            try {
                const parsedData = JSON.parse(cachedData);
                renderNewsCards(parsedData);
                return; // Exit if cache is valid
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
            console.log("Fetched data:", data.length, "items");
            
            // Take the top 3 news items that have an image and a summary
            const topNews = data.filter(item => item.image && item.summary).slice(0, 3);
            
            // Save to cache
            localStorage.setItem(CACHE_KEY, JSON.stringify(topNews));
            localStorage.setItem(CACHE_TIME_KEY, now.toString());
            
            renderNewsCards(topNews);
            
        } catch (error) {
            console.error("Failed to fetch news:", error);
            // Fallback to cache if network fails, even if it's expired
            if (cachedData) {
                try {
                    console.log("Network failed, showing expired cache...");
                    renderNewsCards(JSON.parse(cachedData));
                    return;
                } catch(e) {}
            }
            container.innerHTML = '<p class="text-muted-color" style="color: var(--color-red);">Unable to load latest news.</p>';
        }
    }

    // Call initially
    fetchHomeNews();
    
    // Set interval to fetch new news every 3 hours
    setInterval(fetchHomeNews, THREE_HOURS_MS);
})();
