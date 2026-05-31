(async function() {
    console.log("news.js initialized");
    const FINNHUB_API_KEY = 'd8e6hhpr01qm5ffvuj5gd8e6hhpr01qm5ffvuj60';

    async function fetchHomeNews() {
        console.log("fetchHomeNews starting...");
        const container = document.getElementById('home-news-container');
        if (!container) {
            console.error("news.js: #home-news-container not found in DOM");
            return;
        }

        try {
            console.log("Fetching from Finnhub...");
            const response = await fetch(`https://finnhub.io/api/v1/news?category=general&token=${FINNHUB_API_KEY}`);
            
            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }
            
            const data = await response.json();
            console.log("Fetched data:", data.length, "items");
            
            // Take the top 3 news items that have an image and a summary
            const topNews = data.filter(item => item.image && item.summary).slice(0, 3);
            
            if (topNews.length === 0) {
                container.innerHTML = '<p class="text-muted-color">No news available at the moment.</p>';
                return;
            }

            // Generate HTML for each news card
            const newsHTML = topNews.map(item => {
                // Format timestamp to readable date/time
                const date = new Date(item.datetime * 1000);
                const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const dateString = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
                
                // Provide a fallback image just in case
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
            
        } catch (error) {
            console.error("Failed to fetch news:", error);
            container.innerHTML = '<p class="text-muted-color" style="color: var(--color-red);">Unable to load latest news.</p>';
        }
    }

    // Call directly since script is placed at bottom of body
    fetchHomeNews();
})();
