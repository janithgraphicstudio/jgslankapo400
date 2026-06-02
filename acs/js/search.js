document.addEventListener('DOMContentLoaded', () => {
    const searchToggleBtn = document.getElementById('floating-search-toggle');
    const searchBar = document.getElementById('floating-search-bar');
    const searchInput = document.getElementById('floating-search-input');
    const searchDropdown = document.getElementById('search-results-dropdown');
    
    if (!searchToggleBtn || !searchBar || !searchInput || !searchDropdown) return;

    let searchData = [];

    // 1. Build Search Index from DOM
    function buildSearchIndex() {
        searchData = [];
        let idCounter = 0;

        // Helper to add item
        const addItem = (element, title, desc, type) => {
            if (!element.id) {
                element.id = `search-item-${idCounter++}`;
            }
            searchData.push({
                id: element.id,
                title: title.trim(),
                desc: desc ? desc.trim() : '',
                type: type,
                element: element
            });
        };

        // Section Titles
        document.querySelectorAll('.section-title').forEach(el => {
            addItem(el, el.innerText, 'Section Header', 'section');
        });

        // Portfolio Cards
        document.querySelectorAll('.portfolio-card').forEach(el => {
            const title = el.querySelector('.portfolio-title')?.innerText || '';
            const desc = el.querySelector('.portfolio-description')?.innerText || '';
            if (title) addItem(el, title, desc, 'portfolio');
        });

        // Event Cards
        document.querySelectorAll('.em-card').forEach(el => {
            const title = el.querySelector('.em-card-title')?.innerText || '';
            const desc = el.querySelector('.em-card-desc')?.innerText || '';
            if (title) addItem(el, title, desc, 'event');
        });

        // Process Cards
        document.querySelectorAll('.process-card').forEach(el => {
            const title = el.querySelector('.process-title')?.innerText || '';
            const desc = el.querySelector('.process-description')?.innerText || '';
            if (title) addItem(el, title, desc, 'process');
        });

        // FAQ Items
        document.querySelectorAll('.accordion-item').forEach(el => {
            const title = el.querySelector('.accordion-header')?.innerText || '';
            const desc = el.querySelector('.accordion-content-inner p')?.innerText || '';
            if (title) addItem(el, title, desc, 'faq');
        });
        
        // Mega Menu Cards
        document.querySelectorAll('.mega-menu-card').forEach(el => {
            const title = el.querySelector('h3')?.innerText || '';
            const desc = el.querySelector('p')?.innerText || '';
            if(title) addItem(el, title, desc, 'service');
        });
    }

    buildSearchIndex();

    // 2. Toggle Search Bar Expansion
    searchToggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (searchBar.classList.contains('expanded')) {
            // It's expanded, act as "Search" button
            performSearch(searchInput.value);
        } else {
            // Expand it
            searchBar.classList.add('expanded');
            searchInput.focus();
        }
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
        if (!searchBar.contains(e.target) && !searchDropdown.contains(e.target)) {
            searchBar.classList.remove('expanded');
            searchDropdown.classList.remove('show');
            searchInput.value = '';
        }
    });

    // Prevent closing when clicking inside input
    searchInput.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    // 3. Search Logic
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        performSearch(query);
    });

    function performSearch(query) {
        searchDropdown.innerHTML = '';
        
        if (query.length === 0) {
            searchDropdown.classList.remove('show');
            return;
        }

        const results = searchData.filter(item => {
            return item.title.toLowerCase().includes(query) || 
                   item.desc.toLowerCase().includes(query);
        });

        if (results.length > 0) {
            results.slice(0, 8).forEach(item => { // Limit to 8 results
                const resultEl = document.createElement('div');
                resultEl.className = 'search-result-item';
                
                // Highlight matching text (basic implementation)
                const regex = new RegExp(`(${query})`, 'gi');
                const highlightedTitle = item.title.replace(regex, '<span style="color:#0059ff;font-weight:bold;">$1</span>');
                
                // Truncate description
                let descSnippet = item.desc;
                if (descSnippet.length > 60) {
                    descSnippet = descSnippet.substring(0, 60) + '...';
                }

                resultEl.innerHTML = `
                    <div class="search-result-title">${highlightedTitle} <span style="font-size:0.7rem; color:#666; background:#222; padding:2px 5px; border-radius:3px; margin-left:5px;">${item.type}</span></div>
                    <div class="search-result-desc">${descSnippet}</div>
                `;

                resultEl.addEventListener('click', () => {
                    scrollToElement(item.element);
                });

                searchDropdown.appendChild(resultEl);
            });
        } else {
            searchDropdown.innerHTML = `<div class="search-no-results">No results found for "${query}"</div>`;
        }

        searchDropdown.classList.add('show');
    }

    // 4. Scroll and Highlight
    function scrollToElement(element) {
        // Close search
        searchBar.classList.remove('expanded');
        searchDropdown.classList.remove('show');
        searchInput.value = '';

        // If it's inside FAQ, open the FAQ
        if (element.classList.contains('accordion-item')) {
            const header = element.querySelector('.accordion-header');
            if (header && !element.classList.contains('active')) {
                header.click();
            }
        }
        
        // If it's a Mega Menu card, open the mega menu
        if (element.classList.contains('mega-menu-card')) {
            const toggleBtn = document.getElementById('service-launcher-toggle');
            const popup = document.getElementById('service-launcher-popup');
            if(toggleBtn && popup && !popup.classList.contains('active')){
                toggleBtn.click();
            }
        }

        // Scroll
        const yOffset = -100; // Offset for fixed headers
        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;

        window.scrollTo({ top: y, behavior: 'smooth' });

        // Highlight Glow Effect
        element.classList.remove('highlight-flash');
        void element.offsetWidth; // Trigger reflow
        element.classList.add('highlight-flash');
        
        // Remove class after animation
        setTimeout(() => {
            element.classList.remove('highlight-flash');
        }, 2000);
    }
});
