// Nike Sales Dashboard JavaScript

// Register Chart.js zoom plugin - wait for Chart.js to be loaded
document.addEventListener('DOMContentLoaded', () => {
    // Try to register zoom plugin after Chart.js is loaded
    const registerZoomPlugin = () => {
        if (typeof Chart !== 'undefined' && Chart.register) {
            // Try different ways the plugin might be available
            const zoomPlugin = window.ChartZoom || 
                             (typeof ChartZoom !== 'undefined' && ChartZoom) ||
                             (Chart.helpers && Chart.helpers.getPlugin && Chart.helpers.getPlugin('zoom')) ||
                             (Chart.plugins && Chart.plugins.get && Chart.plugins.get('zoom'));
            
            if (zoomPlugin) {
                Chart.register(zoomPlugin);
                console.log('Chart.js zoom plugin registered successfully');
            } else {
                console.log('Zoom plugin not found, but zoom will still work if plugin is auto-registered');
            }
        } else {
            console.log('Chart.js not loaded yet, retrying...');
            setTimeout(registerZoomPlugin, 100);
        }
    };
    
    setTimeout(registerZoomPlugin, 500); // Give time for scripts to load
});

class NikeDashboard {
    constructor() {
        this.apiBaseUrl = 'https://visdat-nike.vercel.app';
        this.charts = {};
        this.zoomChart = null;
        this.filters = {
            years: [],
            regions: [],
            products: [],
            retailers: []
        };
        this.tooltip = document.getElementById('tooltip');
        this.loadingOverlay = document.getElementById('loadingOverlay');
        this.zoomModal = document.getElementById('zoomModal');
        this.zoomChart = null;
        
        this.init();
    }

    async init() {
        this.setupEventListeners();
        this.setupTooltips();
        this.showLoading();
        
        try {
            await this.loadFilterOptions();
            await this.loadDashboardData();
            this.updateLastUpdated();
        } catch (error) {
            console.error('Error initializing dashboard:', error);
            this.showError('Failed to initialize dashboard');
        } finally {
            this.hideLoading();
        }
    }

    setupEventListeners() {
        // Refresh button
        document.getElementById('refreshBtn').addEventListener('click', () => {
            this.refreshDashboard();
        });

        // Filter controls
        document.getElementById('yearFilter').addEventListener('change', (e) => {
            this.updateFilter('years', Array.from(e.target.selectedOptions).map(opt => opt.value));
        });

        document.getElementById('regionFilter').addEventListener('change', (e) => {
            this.updateFilter('regions', Array.from(e.target.selectedOptions).map(opt => opt.value));
        });

        document.getElementById('productFilter').addEventListener('change', (e) => {
            this.updateFilter('products', Array.from(e.target.selectedOptions).map(opt => opt.value));
        });

        document.getElementById('retailerFilter').addEventListener('change', (e) => {
            this.updateFilter('retailers', Array.from(e.target.selectedOptions).map(opt => opt.value));
        });

        // Reset filters
        document.getElementById('resetFilters').addEventListener('click', () => {
            this.resetFilters();
        });



        // Chart controls
        document.querySelectorAll('.chart-control').forEach(control => {
            control.addEventListener('click', (e) => {
                console.log('Chart control clicked:', e.currentTarget);
                console.log('Dataset:', e.currentTarget.dataset);
                const chartType = e.currentTarget.dataset.chart;
                const action = e.currentTarget.dataset.action;
                console.log('Chart type:', chartType, 'Action:', action);
                this.handleChartControl(chartType, action);
            });
        });

        // Modal controls
        document.getElementById('closeZoomModal').addEventListener('click', () => {
            this.closeZoomModal();
        });

        document.getElementById('resetZoomChart').addEventListener('click', () => {
            if (this.zoomChart) {
                console.log('Resetting zoom chart');
                if (this.zoomChart.resetZoom) {
                    this.zoomChart.resetZoom();
                } else {
                    console.log('Reset zoom function not available');
                }
            }
        });

        // Test modal directly
        setTimeout(() => {
            console.log('Testing modal functionality...');
            console.log('Zoom modal element:', this.zoomModal);
            console.log('Zoom modal classList:', this.zoomModal.classList);
            console.log('Zoom modal visible:', window.getComputedStyle(this.zoomModal).display);
        }, 3000);

        this.zoomModal.addEventListener('click', (e) => {
            if (e.target === this.zoomModal) {
                this.closeZoomModal();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeZoomModal();
            }
            if (e.ctrlKey && e.key === 'r') {
                e.preventDefault();
                this.refreshDashboard();
            }
        });
    }

    setupTooltips() {
        // Add tooltip functionality to all interactive elements
        document.querySelectorAll('[data-tooltip]').forEach(element => {
            element.addEventListener('mouseenter', (e) => {
                this.showTooltip(e.currentTarget.dataset.tooltip, e.currentTarget);
            });

            element.addEventListener('mouseleave', () => {
                this.hideTooltip();
            });

            element.addEventListener('mousemove', (e) => {
                this.updateTooltipPosition(e);
            });
        });
    }

    showTooltip(text, element) {
        this.tooltip.textContent = text;
        this.tooltip.classList.add('active');
        this.updateTooltipPosition({ clientX: element.getBoundingClientRect().left, clientY: element.getBoundingClientRect().top });
    }

    hideTooltip() {
        this.tooltip.classList.remove('active');
    }

    updateTooltipPosition(e) {
        const rect = this.tooltip.getBoundingClientRect();
        const x = e.clientX + 10;
        const y = e.clientY - rect.height - 10;
        
        this.tooltip.style.left = `${Math.min(x, window.innerWidth - rect.width - 10)}px`;
        this.tooltip.style.top = `${Math.max(y, 10)}px`;
    }

    async loadFilterOptions() {
        try {
            console.log('Loading filter options...');
            // Load summary data to get available filter options
            const summaryResponse = await this.fetchData('/summary');
            console.log('Summary data loaded:', summaryResponse);
            
            // Populate year filter
            const yearSelect = document.getElementById('yearFilter');
            if (summaryResponse.data_period && summaryResponse.data_period.years) {
                // Add actual years
                summaryResponse.data_period.years.forEach(year => {
                    const option = document.createElement('option');
                    option.value = year;
                    option.textContent = year;
                    yearSelect.appendChild(option);
                });
                console.log(`Populated yearFilter with:`, summaryResponse.data_period.years);
            }

            // Load region, product, and retailer options from other endpoints
            const [regionData, topProductsData, retailerData] = await Promise.all([
                this.fetchData('/region-distribution'),
                this.fetchData('/top-products'),
                this.fetchData('/retailer-analysis')
            ]);

            // Populate region filter
            const regionSelect = document.getElementById('regionFilter');
            if (regionData && regionData.regions) {
                regionData.regions.forEach(region => {
                    const option = document.createElement('option');
                    option.value = region;
                    option.textContent = region;
                    regionSelect.appendChild(option);
                });
            }

            // Populate product filter
            const productSelect = document.getElementById('productFilter');
            if (topProductsData && topProductsData.top_products) {
                topProductsData.top_products.forEach(product => {
                    const option = document.createElement('option');
                    option.value = product.product;
                    option.textContent = product.product;
                    productSelect.appendChild(option);
                });
            }

            // Populate retailer filter
            const retailerSelect = document.getElementById('retailerFilter');
            if (retailerData && retailerData.retailers) {
                retailerData.retailers.forEach(retailer => {
                    const option = document.createElement('option');
                    option.value = retailer;
                    option.textContent = retailer;
                    retailerSelect.appendChild(option);
                });
            }

        } catch (error) {
            console.error('Error loading filter options:', error);
            this.showError('Failed to load filter options: ' + error.message);
        }
    }

    async loadDashboardData() {
        try {
            // Check if filters are applied
            const hasFilters = Object.values(this.filters).some(filter => filter.length > 0);
            console.log('Loading dashboard data. Filters applied:', hasFilters, this.filters);
            
            if (hasFilters) {
                // Use filtered data endpoint when filters are applied
                const filteredData = await this.fetchData('/filtered-data', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(this.filters)
                });
                
                // Update summary with filtered data
                this.renderSummaryCards({
                    total_records: filteredData.total_records,
                    total_sales: filteredData.filtered_data.reduce((sum, item) => sum + (item['Total Sales'] || 0), 0),
                    total_units: filteredData.filtered_data.reduce((sum, item) => sum + (item['Units Sold'] || 0), 0),
                    avg_price_per_unit: filteredData.filtered_data.reduce((sum, item) => sum + (item['Price per Unit'] || 0), 0) / filteredData.filtered_data.length,
                    unique_products: new Set(filteredData.filtered_data.map(item => item.Product)).size,
                    unique_regions: new Set(filteredData.filtered_data.map(item => item.Region)).size
                });
                
                // Process filtered data for charts
                this.renderFilteredCharts(filteredData.filtered_data);
                
            } else {
                // Load all chart data in parallel when no filters
                const [
                    summaryData,
                    monthlyTrendsData,
                    topProductsData,
                    regionData,
                    priceCorrelationData,
                    stateData,
                    salesMethodData,
                    retailerData
                ] = await Promise.all([
                    this.fetchData('/summary'),
                    this.fetchData('/monthly-trends'),
                    this.fetchData('/top-products'),
                    this.fetchData('/region-distribution'),
                    this.fetchData('/price-correlation'),
                    this.fetchData('/state-analysis'),
                    this.fetchData('/sales-method-analysis'),
                    this.fetchData('/retailer-analysis')
                ]);

                // Render all charts with full data
                this.renderSummaryCards(summaryData);
                this.renderMonthlyTrendsChart(monthlyTrendsData);
                this.renderTopProductsChart(topProductsData);
                this.renderRegionDistributionChart(regionData);
                this.renderPriceCorrelationChart(priceCorrelationData);
                this.renderStateAnalysisChart(stateData);
                this.renderSalesMethodChart(salesMethodData);
                this.renderRetailerPerformanceChart(retailerData);
            }

        } catch (error) {
            console.error('Error loading dashboard data:', error);
            this.showError('Failed to load dashboard data');
        }
    }

    async fetchData(endpoint, options = {}) {
        console.log(`Making ${options.method || 'GET'} request to: ${endpoint}`);
        const response = await fetch(`${this.apiBaseUrl}${endpoint}`, options);
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`API Error for ${endpoint}:`, response.status, errorText);
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }
        return await response.json();
    }

    renderSummaryCards(data) {
        const summaryCards = document.getElementById('summaryCards');
        
        const cards = [
            {
                title: 'Total Records',
                value: data.total_records.toLocaleString(),
                icon: 'fas fa-database',
                color: 'var(--accent-color)'
            },
            {
                title: 'Total Sales',
                value: `$${data.total_sales.toLocaleString()}`,
                icon: 'fas fa-dollar-sign',
                color: 'var(--success-color)'
            },
            {
                title: 'Total Units',
                value: data.total_units.toLocaleString(),
                icon: 'fas fa-boxes',
                color: 'var(--info-color)'
            },
            {
                title: 'Avg Price/Unit',
                value: `$${data.avg_price_per_unit.toFixed(2)}`,
                icon: 'fas fa-tag',
                color: 'var(--warning-color)'
            },
            {
                title: 'Unique Products',
                value: data.unique_products.toLocaleString(),
                icon: 'fas fa-shoe-prints',
                color: 'var(--danger-color)'
            },
            {
                title: 'Unique Regions',
                value: data.unique_regions.toLocaleString(),
                icon: 'fas fa-globe',
                color: 'var(--secondary-color)'
            }
        ];

        summaryCards.innerHTML = cards.map(card => `
            <div class="summary-card fade-in">
                <div class="summary-card-header">
                    <div class="summary-card-title">${card.title}</div>
                    <div class="summary-card-icon" style="color: ${card.color}">
                        <i class="${card.icon}"></i>
                    </div>
                </div>
                <div class="summary-card-value">${card.value}</div>
                <div class="summary-card-change positive">
                    <i class="fas fa-arrow-up"></i>
                    <span>Real-time data</span>
                </div>
            </div>
        `).join('');
    }

    renderMonthlyTrendsChart(data) {
        const ctx = document.getElementById('monthlyTrendsChart').getContext('2d');
        
        // Destroy existing chart if it exists
        if (this.charts.monthlyTrends) {
            this.charts.monthlyTrends.destroy();
        }
        
        // Handle empty data
        if (!data || Object.keys(data).length === 0) {
            console.log('No monthly trends data available, showing empty chart');
            this.charts.monthlyTrends = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                    datasets: []
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: {
                            display: true,
                            text: 'No Data Available'
                        }
                    }
                }
            });
            return;
        }
        
        const datasets = Object.keys(data).map((year, index) => {
            const yearData = data[year];
            const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];
            
            return {
                label: `Year ${year}`,
                data: yearData.sales,
                borderColor: colors[index % colors.length],
                backgroundColor: colors[index % colors.length] + '20',
                tension: 0.4,
                fill: false
            };
        });

        this.charts.monthlyTrends = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top'
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: $${context.parsed.y.toLocaleString()}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        }
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                }
            }
        });
    }

    renderTopProductsChart(data) {
        const ctx = document.getElementById('topProductsChart').getContext('2d');
        
        // Destroy existing chart if it exists
        if (this.charts.topProducts) {
            this.charts.topProducts.destroy();
        }
        
        // Handle empty data
        if (!data || !data.top_products || !Array.isArray(data.top_products) || data.top_products.length === 0) {
            console.log('No top products data available, showing empty chart');
            this.charts.topProducts = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['No Data'],
                    datasets: [{
                        label: 'Total Sales',
                        data: [0],
                        backgroundColor: 'rgba(200, 200, 200, 0.5)',
                        borderColor: 'rgba(200, 200, 200, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: {
                            display: true,
                            text: 'No Data Available'
                        }
                    }
                }
            });
            return;
        }
        
        const products = data.top_products.slice(0, 10);
        const labels = products.map(p => p.product);
        const sales = products.map(p => p.total_sales);

        this.charts.topProducts = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Total Sales',
                    data: sales,
                    backgroundColor: 'rgba(59, 130, 246, 0.8)',
                    borderColor: 'rgba(59, 130, 246, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `Sales: $${context.parsed.y.toLocaleString()}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        }
                    },
                    x: {
                        ticks: {
                            maxRotation: 45,
                            minRotation: 45
                        }
                    }
                }
            }
        });
    }

    renderRegionDistributionChart(data) {
        const ctx = document.getElementById('regionDistributionChart').getContext('2d');
        
        // Destroy existing chart if it exists
        if (this.charts.regionDistribution) {
            this.charts.regionDistribution.destroy();
        }

        // Handle empty data
        if (!data || !data.regions || !Array.isArray(data.regions) || data.regions.length === 0) {
            console.log('No region distribution data available, showing empty chart');
            this.charts.regionDistribution = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['No Data'],
                    datasets: [{
                        data: [0],
                        backgroundColor: ['rgba(200, 200, 200, 0.5)'],
                        borderWidth: 2,
                        borderColor: '#FFFFFF'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: {
                            display: true,
                            text: 'No Data Available'
                        }
                    }
                }
            });
            return;
        }

        this.charts.regionDistribution = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: data.regions,
                datasets: [{
                    data: data.sales,
                    backgroundColor: [
                        '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
                        '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
                    ],
                    borderWidth: 2,
                    borderColor: '#FFFFFF'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const percentage = ((context.parsed / context.dataset.data.reduce((a, b) => a + b, 0)) * 100).toFixed(1);
                                return `${context.label}: $${context.parsed.toLocaleString()} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    renderPriceCorrelationChart(data) {
        const ctx = document.getElementById('priceCorrelationChart').getContext('2d');
        
        // Destroy existing chart if it exists
        if (this.charts.priceCorrelation) {
            this.charts.priceCorrelation.destroy();
        }

        // Handle different data structures
        let chartData;
        if (Array.isArray(data) && data.length > 0) {
            // Array of objects structure from processFilteredPriceCorrelation
            chartData = data.map(item => ({
                x: item.price_per_unit,
                y: item.units_sold
            }));
        } else if (data.price_per_unit && data.units_sold) {
            // Original structure with arrays
            chartData = data.price_per_unit.map((price, index) => ({
                x: price,
                y: data.units_sold[index]
            }));
        } else {
            console.log('No price correlation data available, showing empty chart');
            chartData = [];
        }

        this.charts.priceCorrelation = new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'Price vs Units',
                    data: chartData,
                    backgroundColor: 'rgba(59, 130, 246, 0.6)',
                    borderColor: 'rgba(59, 130, 246, 1)',
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `Price: $${context.parsed.x.toFixed(2)}, Units: ${context.parsed.y}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Price per Unit ($)'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Units Sold'
                        }
                    }
                }
            }
        });
    }

    renderStateAnalysisChart(data) {
        const ctx = document.getElementById('stateAnalysisChart').getContext('2d');
        
        // Destroy existing chart if it exists
        if (this.charts.stateAnalysis) {
            this.charts.stateAnalysis.destroy();
        }
        
        // Handle empty data
        if (!data || !data.state_analysis || !Array.isArray(data.state_analysis) || data.state_analysis.length === 0) {
            console.log('No state analysis data available, showing empty chart');
            this.charts.stateAnalysis = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['No Data'],
                    datasets: [{
                        label: 'Total Sales',
                        data: [0],
                        backgroundColor: 'rgba(200, 200, 200, 0.5)',
                        borderColor: 'rgba(200, 200, 200, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    indexAxis: 'y',
                    plugins: {
                        title: {
                            display: true,
                            text: 'No Data Available'
                        }
                    }
                }
            });
            return;
        }
        
        const states = data.state_analysis.slice(0, 15);
        const labels = states.map(s => s.state);
        const sales = states.map(s => s.total_sales);

        this.charts.stateAnalysis = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Total Sales',
                    data: sales,
                    backgroundColor: 'rgba(16, 185, 129, 0.8)',
                    borderColor: 'rgba(16, 185, 129, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `Sales: $${context.parsed.x.toLocaleString()}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        }
                    }
                }
            }
        });
    }

    renderSalesMethodChart(data) {
        const ctx = document.getElementById('salesMethodChart').getContext('2d');
        
        // Destroy existing chart if it exists
        if (this.charts.salesMethod) {
            this.charts.salesMethod.destroy();
        }
        
        // Handle empty data
        if (!data || !data.methods || !data.sales || !Array.isArray(data.methods) || !Array.isArray(data.sales) || data.methods.length === 0) {
            console.log('No sales method data available, showing empty chart');
            this.charts.salesMethod = new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: ['No Data'],
                    datasets: [{
                        data: [0],
                        backgroundColor: ['rgba(200, 200, 200, 0.5)'],
                        borderWidth: 2,
                        borderColor: '#FFFFFF'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: {
                            display: true,
                            text: 'No Data Available'
                        }
                    }
                }
            });
            return;
        }

        this.charts.salesMethod = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: data.methods,
                datasets: [{
                    data: data.sales,
                    backgroundColor: [
                        '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'
                    ],
                    borderWidth: 2,
                    borderColor: '#FFFFFF'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const percentage = ((context.parsed / context.dataset.data.reduce((a, b) => a + b, 0)) * 100).toFixed(1);
                                return `${context.label}: $${context.parsed.toLocaleString()} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    renderRetailerPerformanceChart(data) {
        const ctx = document.getElementById('retailerPerformanceChart').getContext('2d');
        
        // Destroy existing chart if it exists
        if (this.charts.retailerPerformance) {
            this.charts.retailerPerformance.destroy();
        }
        
        // Handle empty data
        if (!data || !data.retailers || !data.sales || !Array.isArray(data.retailers) || !Array.isArray(data.sales) || data.retailers.length === 0) {
            console.log('No retailer performance data available, showing empty chart');
            this.charts.retailerPerformance = new Chart(ctx, {
                type: 'radar',
                data: {
                    labels: ['No Data'],
                    datasets: [{
                        label: 'Sales Performance',
                        data: [0],
                        backgroundColor: 'rgba(200, 200, 200, 0.2)',
                        borderColor: 'rgba(200, 200, 200, 1)',
                        pointBackgroundColor: 'rgba(200, 200, 200, 1)',
                        pointBorderColor: '#FFFFFF',
                        pointHoverBackgroundColor: '#FFFFFF',
                        pointHoverBorderColor: 'rgba(200, 200, 200, 1)'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: {
                            display: true,
                            text: 'No Data Available'
                        }
                    }
                }
            });
            return;
        }

        this.charts.retailerPerformance = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: data.retailers.slice(0, 8),
                datasets: [{
                    label: 'Sales Performance',
                    data: data.sales.slice(0, 8),
                    backgroundColor: 'rgba(245, 158, 11, 0.2)',
                    borderColor: 'rgba(245, 158, 11, 1)',
                    pointBackgroundColor: 'rgba(245, 158, 11, 1)',
                    pointBorderColor: '#FFFFFF',
                    pointHoverBackgroundColor: '#FFFFFF',
                    pointHoverBorderColor: 'rgba(245, 158, 11, 1)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    r: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        }
                    }
                }
            }
        });
    }

    updateFilter(filterType, values) {
        // Handle "All" option - if "All" is selected, use empty array to get all data
        if (values.includes('All')) {
            this.filters[filterType] = [];
        } else {
            // Convert year values to numbers if it's years filter
            if (filterType === 'years') {
                this.filters[filterType] = values.map(year => parseInt(year));
            } else {
                this.filters[filterType] = values;
            }
        }
        this.applyFilters();
    }

    async applyFilters() {
        this.showLoading();
        try {
            console.log('Applying filters:', this.filters);
            
            // Apply filters to get filtered data
            const filteredData = await this.fetchData('/filtered-data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(this.filters)
            });

            console.log('Filtered data received:', filteredData);
            
            // Update charts with filtered data
            this.refreshCharts();
            
        } catch (error) {
            console.error('Error applying filters:', error);
            this.showError(`Failed to apply filters: ${error.message}`);
        } finally {
            this.hideLoading();
        }
    }

    resetFilters() {
        // Reset all filter selects
        document.querySelectorAll('.filter-select').forEach(select => {
            select.selectedIndex = -1;
        });

        // Reset filters object
        this.filters = {
            years: [],
            regions: [],
            products: [],
            retailers: []
        };

        // Refresh dashboard
        this.refreshDashboard();
    }

    async refreshDashboard() {
        this.showLoading();
        try {
            // Destroy existing charts
            Object.values(this.charts).forEach(chart => {
                if (chart) chart.destroy();
            });
            this.charts = {};

            // Reload all data
            await this.loadDashboardData();
            this.updateLastUpdated();
            
        } catch (error) {
            console.error('Error refreshing dashboard:', error);
            this.showError('Failed to refresh dashboard');
        } finally {
            this.hideLoading();
        }
    }

    async refreshCharts() {
        try {
            console.log('Refreshing charts with filters:', this.filters);
            const response = await fetch('http://localhost:8003/filtered-data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(this.filters)
            });

            const result = await response.json();
            console.log('Filtered data response:', result);
            
            if (result.filtered_data && result.filtered_data.length > 0) {
                console.log(`Found ${result.filtered_data.length} filtered records`);
                this.loadDashboardData(result.filtered_data);
            } else {
                console.log('No data found for filters:', this.filters);
                console.log('Total filtered records:', result.total_records);
                console.log('Showing empty charts with zero values instead of error');
                this.renderEmptyCharts();
            }
        } catch (error) {
            console.error('Error refreshing charts:', error);
            this.showError('Error refreshing charts');
        }
    }

    renderEmptyCharts() {
        // Render all charts with zero values when no data is found
        console.log('Rendering empty charts with zero values');
        
        try {
            // Empty monthly trends chart
            const emptyMonthlyData = {
                2023: {
                    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
                    sales: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    units: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                }
            };
            this.renderMonthlyTrendsChart(emptyMonthlyData);
            
            // Empty top products chart
            const emptyTopProductsData = {
                top_products: [
                    { product: 'No Data', total_sales: 0, units_sold: 0, transactions: 0 }
                ]
            };
            this.renderTopProductsChart(emptyTopProductsData);
            
            // Empty region distribution chart
            const emptyRegionData = {
                regions: ['No Data'],
                sales: [0],
                units: [0],
                transactions: [0]
            };
            this.renderRegionDistributionChart(emptyRegionData);
            
            // Empty price correlation chart
            const emptyPriceData = [
                { price_per_unit: 0, units_sold: 0, total_sales: 0 }
            ];
            this.renderPriceCorrelationChart(emptyPriceData);
            
            // Empty state analysis chart
            const emptyStateData = {
                state_analysis: [
                    { state: 'No Data', total_sales: 0 }
                ]
            };
            this.renderStateAnalysisChart(emptyStateData);
            
            // Empty sales method chart
            const emptyMethodData = {
                methods: ['No Data'],
                sales: [0],
                units: [0],
                transactions: [0]
            };
            this.renderSalesMethodChart(emptyMethodData);
            
            // Empty retailer performance chart
            const emptyRetailerData = {
                top_retailers: [
                    { retailer: 'No Data', total_sales: 0, units_sold: 0, transactions: 0 }
                ]
            };
            this.renderRetailerPerformanceChart(emptyRetailerData);
            
            console.log('Empty charts rendered successfully');
            
        } catch (error) {
            console.error('Error rendering empty charts:', error);
            this.showError('Error displaying empty charts');
        }
    }
    
    renderFilteredCharts(filteredData) {
        // Process filtered data for charts
        console.log('Rendering filtered charts with', filteredData.length, 'records');
        
        if (!filteredData || filteredData.length === 0) {
            console.log('No data found for filters, showing empty charts with zero values');
            this.renderEmptyCharts();
            return;
        }
        
        try {
            // Process data for monthly trends
            const monthlyData = this.processFilteredMonthlyTrends(filteredData);
            this.renderMonthlyTrendsChart(monthlyData);
            
            // Process data for top products
            const topProductsData = this.processFilteredTopProducts(filteredData);
            this.renderTopProductsChart(topProductsData);
            
            // Process data for region distribution
            const regionData = this.processFilteredRegions(filteredData);
            this.renderRegionDistributionChart(regionData);
            
            // Process data for price correlation
            const priceData = this.processFilteredPriceCorrelation(filteredData);
            this.renderPriceCorrelationChart(priceData);
            
            // Process data for state analysis
            const stateData = this.processFilteredStates(filteredData);
            this.renderStateAnalysisChart(stateData);
            
            // Process data for sales method
            const methodData = this.processFilteredSalesMethods(filteredData);
            this.renderSalesMethodChart(methodData);
            
            // Process data for retailer analysis
            const retailerData = this.processFilteredRetailers(filteredData);
            this.renderRetailerPerformanceChart(retailerData);
            
        } catch (error) {
            console.error('Error rendering filtered charts:', error);
            this.showError('Error displaying filtered data');
        }
    }
    
    processFilteredMonthlyTrends(filteredData) {
        // Group by year and month
        const monthlyStats = {};
        
        filteredData.forEach(item => {
            const date = new Date(item['Invoice Date']);
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            
            if (!monthlyStats[year]) {
                monthlyStats[year] = {};
            }
            if (!monthlyStats[year][month]) {
                monthlyStats[year][month] = { sales: 0, units: 0 };
            }
            
            monthlyStats[year][month].sales += item['Total Sales'] || 0;
            monthlyStats[year][month].units += item['Units Sold'] || 0;
        });
        
        // Convert to chart format
        const result = {};
        Object.keys(monthlyStats).forEach(year => {
            const months = [];
            const sales = [];
            const units = [];
            
            for (let month = 1; month <= 12; month++) {
                months.push(month);
                sales.push(monthlyStats[year][month]?.sales || 0);
                units.push(monthlyStats[year][month]?.units || 0);
            }
            
            result[year] = { months, sales, units };
        });
        
        return result;
    }
    
    processFilteredTopProducts(filteredData) {
        // Group by product
        const productStats = {};
        
        filteredData.forEach(item => {
            const product = item.Product;
            if (!productStats[product]) {
                productStats[product] = { sales: 0, units: 0, transactions: 0 };
            }
            
            productStats[product].sales += item['Total Sales'] || 0;
            productStats[product].units += item['Units Sold'] || 0;
            productStats[product].transactions += 1;
        });
        
        // Convert to top products format
        const topProducts = Object.entries(productStats)
            .map(([product, stats]) => ({
                product,
                total_sales: stats.sales,
                units_sold: stats.units,
                transactions: stats.transactions
            }))
            .sort((a, b) => b.total_sales - a.total_sales)
            .slice(0, 10);
        
        return { top_products: topProducts };
    }
    
    processFilteredRegions(filteredData) {
        // Group by region
        const regionStats = {};
        
        filteredData.forEach(item => {
            const region = item.Region;
            if (!regionStats[region]) {
                regionStats[region] = { sales: 0, units: 0, transactions: 0 };
            }
            
            regionStats[region].sales += item['Total Sales'] || 0;
            regionStats[region].units += item['Units Sold'] || 0;
            regionStats[region].transactions += 1;
        });
        
        return {
            regions: Object.keys(regionStats),
            sales: Object.values(regionStats).map(stats => stats.sales),
            units: Object.values(regionStats).map(stats => stats.units),
            transactions: Object.values(regionStats).map(stats => stats.transactions)
        };
    }
    
    processFilteredPriceCorrelation(filteredData) {
        return filteredData.map(item => ({
            price_per_unit: item['Price per Unit'],
            units_sold: item['Units Sold'],
            total_sales: item['Total Sales']
        }));
    }
    
    processFilteredStates(filteredData) {
        // Group by state
        const stateStats = {};
        
        filteredData.forEach(item => {
            const state = item.State;
            const region = item.Region;
            if (!stateStats[state]) {
                stateStats[state] = { sales: 0, units: 0, transactions: 0, region: region };
            }
            
            stateStats[state].sales += item['Total Sales'] || 0;
            stateStats[state].units += item['Units Sold'] || 0;
            stateStats[state].transactions += 1;
        });
        
        // Convert to state analysis format
        const topStates = Object.entries(stateStats)
            .map(([state, stats]) => ({
                state,
                region: stats.region,
                total_sales: stats.sales,
                units_sold: stats.units,
                transactions: stats.transactions
            }))
            .sort((a, b) => b.total_sales - a.total_sales)
            .slice(0, 15);
        
        return { top_states: topStates };
    }
    
    processFilteredSalesMethods(filteredData) {
        // Group by sales method
        const methodStats = {};
        
        filteredData.forEach(item => {
            const method = item['Sales Method'];
            if (!methodStats[method]) {
                methodStats[method] = { sales: 0, units: 0, transactions: 0 };
            }
            
            methodStats[method].sales += item['Total Sales'] || 0;
            methodStats[method].units += item['Units Sold'] || 0;
            methodStats[method].transactions += 1;
        });
        
        return {
            methods: Object.keys(methodStats),
            sales: Object.values(methodStats).map(stats => stats.sales),
            units: Object.values(methodStats).map(stats => stats.units),
            transactions: Object.values(methodStats).map(stats => stats.transactions)
        };
    }
    
    processFilteredRetailers(filteredData) {
        // Group by retailer
        const retailerStats = {};
        
        filteredData.forEach(item => {
            const retailer = item.Retailer;
            if (!retailerStats[retailer]) {
                retailerStats[retailer] = { sales: 0, units: 0, transactions: 0 };
            }
            
            retailerStats[retailer].sales += item['Total Sales'] || 0;
            retailerStats[retailer].units += item['Units Sold'] || 0;
            retailerStats[retailer].transactions += 1;
        });
        
        return {
            retailers: Object.keys(retailerStats),
            sales: Object.values(retailerStats).map(stats => stats.sales),
            units: Object.values(retailerStats).map(stats => stats.units),
            transactions: Object.values(retailerStats).map(stats => stats.transactions)
        };
    }

    handleChartControl(chartType, action) {
        console.log(`Chart control: ${action} for ${chartType}`);
        const chart = this.charts[chartType];
        if (!chart) {
            console.error(`Chart ${chartType} not found`);
            console.log('Available charts:', Object.keys(this.charts));
            return;
        }

        switch (action) {
            case 'zoom':
                console.log('Opening zoom modal for:', chartType);
                console.log('Chart data:', chart.config.data);
                console.log('Chart options:', chart.config.options);
                this.openZoomModal(chartType);
                break;
            case 'reset':
                console.log('Resetting zoom for:', chartType);
                chart.resetZoom();
                break;
            case 'download':
                console.log('Downloading chart:', chartType);
                this.downloadChart(chartType);
                break;
        }
    }

    openZoomModal(chartType) {
        console.log('=== OPENING ZOOM MODAL ===');
        console.log('Chart type:', chartType);
        
        const originalChart = this.charts[chartType];
        if (!originalChart) {
            console.error('Original chart not found:', chartType);
            return;
        }

        console.log('Original chart found:', originalChart);
        console.log('Chart config type:', originalChart.config.type);
        console.log('Chart data:', originalChart.config.data);

        const modalTitle = document.getElementById('zoomModalTitle');
        modalTitle.textContent = originalChart.options.plugins.title?.text || 'Chart Detail';
        
        console.log('Creating zoomed chart...');
        // Create zoomed chart
        this.createZoomedChart(chartType);

        console.log('Showing modal...');
        this.zoomModal.classList.add('active');
        console.log('=== ZOOM MODAL OPENED ===');
    }

    closeZoomModal() {
        this.zoomModal.classList.remove('active');
        if (this.zoomChart) {
            this.zoomChart.destroy();
            this.zoomChart = null;
        }
    }

    updateLastUpdated() {
        const lastUpdatedElement = document.getElementById('lastUpdated');
        const now = new Date();
        lastUpdatedElement.textContent = now.toLocaleString('id-ID');
    }

    showLoading() {
        this.loadingOverlay.classList.add('active');
    }

    hideLoading() {
        this.loadingOverlay.classList.remove('active');
    }

    showError(message) {
        // Create error notification
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-notification';
        errorDiv.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        document.body.appendChild(errorDiv);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (errorDiv.parentElement) {
                errorDiv.remove();
            }
        }, 5000);
    }

    createZoomedChart(chartId) {
        console.log('=== CREATING ZOOMED CHART ===');
        console.log('Chart ID:', chartId);
        
        const ctx = document.getElementById('zoomChart');
        console.log('Canvas element:', ctx);
        if (!ctx) {
            console.error('Zoom chart canvas not found');
            return;
        }
        
        // Destroy existing chart if any
        if (this.zoomChart) {
            console.log('Destroying existing zoom chart');
            this.zoomChart.destroy();
        }
        
        // Get original chart data
        const originalChart = this.charts[chartId];
        console.log('Original chart:', originalChart);
        if (!originalChart) {
            console.error('Original chart not found:', chartId);
            return;
        }
        
        console.log('Creating zoomed chart for:', chartId);
        console.log('Original chart type:', originalChart.config.type);
        console.log('Original chart data:', originalChart.config.data);
        
        // Create a larger version of the chart with enhanced zoom
        const chartOptions = {
            ...originalChart.config.options,
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                ...originalChart.config.options.scales,
                // Ensure scales are properly configured for zoom
                x: {
                    ...originalChart.config.options.scales?.x,
                    min: undefined,
                    max: undefined
                },
                y: {
                    ...originalChart.config.options.scales?.y,
                    min: undefined,
                    max: undefined
                }
            }
        };
        
        // Try to add zoom plugin if available
        if (Chart.defaults.plugins && Chart.defaults.plugins.zoom) {
            chartOptions.plugins = {
                ...originalChart.config.options.plugins,
                zoom: {
                    zoom: {
                        wheel: {
                            enabled: true,
                            speed: 0.1
                        },
                        pinch: {
                            enabled: true
                        },
                        drag: {
                            enabled: true,
                            backgroundColor: 'rgba(225,225,225,0.3)'
                        },
                        mode: 'xy',
                        onZoomComplete: function({chart}) {
                            console.log('Zoom completed');
                        }
                    },
                    pan: {
                        enabled: true,
                        mode: 'xy',
                        modifierKey: 'ctrl',
                        onPanComplete: function({chart}) {
                            console.log('Pan completed');
                        }
                    },
                    limits: {
                        x: {min: 'original', max: 'original'},
                        y: {min: 'original', max: 'original'}
                    }
                }
            };
        } else {
            console.log('Zoom plugin not available, creating chart without zoom functionality');
        }
        
        this.zoomChart = new Chart(ctx.getContext('2d'), {
            type: originalChart.config.type,
            data: originalChart.config.data,
            options: chartOptions
        });
        
        console.log('Zoomed chart created successfully');
    }

    // Test function for manual testing
    testZoomModal(chartType = 'monthlyTrends') {
        console.log('=== MANUAL ZOOM TEST ===');
        console.log('Testing zoom for chart:', chartType);
        console.log('Available charts:', Object.keys(this.charts));
        
        if (this.charts[chartType]) {
            console.log('Chart found, opening zoom modal...');
            this.openZoomModal(chartType);
        } else {
            console.error('Chart not found:', chartType);
        }
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new NikeDashboard(); // Make dashboard globally accessible for testing
});

// Add error notification styles
const errorStyles = `
.error-notification {
    position: fixed;
    top: 20px;
    right: 20px;
    background: #EF4444;
    color: white;
    padding: 12px 16px;
    border-radius: 8px;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    gap: 8px;
    z-index: 1001;
    animation: slideIn 0.3s ease-out;
}

.error-notification button {
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    margin-left: 8px;
}

.error-notification button:hover {
    background: rgba(255, 255, 255, 0.2);
}
`;

// Inject error styles
const styleSheet = document.createElement('style');
styleSheet.textContent = errorStyles;
document.head.appendChild(styleSheet);