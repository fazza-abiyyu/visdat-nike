# Nike Sales Analytics Dashboard

A modern, minimalist web dashboard for analyzing Nike sales data with interactive charts, filtering capabilities, and responsive design.

## Features

### 🎨 Modern Design
- Clean, minimalist interface with professional styling
- Responsive design that works on all devices
- Smooth animations and transitions
- Dark mode support

### 📊 Interactive Visualizations
- **Monthly Sales Trends**: Line chart showing sales patterns over time
- **Top Products**: Bar chart of best-performing products
- **Regional Distribution**: Doughnut chart of sales by region
- **Price Correlation**: Scatter plot analyzing price vs units sold
- **State Performance**: Horizontal bar chart of top-performing states
- **Sales Methods**: Pie chart of different sales channels
- **Retailer Performance**: Radar chart showing retailer metrics

### 🔍 Interactive Features
- **Advanced Filtering**: Filter data by year, region, product, and retailer
- **Zoom Functionality**: Detailed view of charts with zoom and pan
- **Interactive Tooltips**: Hover for detailed information
- **Real-time Updates**: Live data refresh capability

### 📱 User Experience
- **Responsive Layout**: Optimized for desktop, tablet, and mobile
- **Loading States**: Smooth loading animations
- **Error Handling**: User-friendly error messages
- **Keyboard Shortcuts**: Ctrl+R to refresh, ESC to close modals

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Charts**: Chart.js for interactive visualizations
- **Backend**: FastAPI (Python) with REST API
- **Data Source**: Nike sales dataset from GitHub
- **Icons**: Font Awesome
- **Fonts**: Inter (Google Fonts)

## Quick Start

### Prerequisites
- Python 3.8+
- Modern web browser

### Backend Setup
```bash
cd web/backend
pip install -r requirements.txt
python main.py
```

### Frontend Setup
```bash
cd web/frontend
python -m http.server 8080
```

### Access Dashboard
Open your browser and navigate to: `http://localhost:8080`

## API Endpoints

The dashboard integrates with the following backend endpoints:

- `GET /summary` - Summary statistics
- `GET /monthly-trends` - Monthly sales trends
- `GET /top-products` - Top performing products
- `GET /region-distribution` - Regional sales distribution
- `GET /price-correlation` - Price vs units correlation
- `GET /state-analysis` - State-wise analysis
- `GET /retailer-analysis` - Retailer performance
- `GET /sales-method-analysis` - Sales method analysis
- `POST /filtered-data` - Filtered data based on criteria

## Dashboard Sections

### 1. Summary Cards
Displays key metrics:
- Total Records
- Total Sales Revenue
- Total Units Sold
- Average Price per Unit
- Number of Unique Products
- Number of Unique Regions

### 2. Filter Panel
Advanced filtering options:
- Year selection (multi-select)
- Region selection (multi-select)
- Product selection (multi-select)
- Retailer selection (multi-select)

### 3. Interactive Charts
Seven comprehensive visualizations with zoom capability and detailed tooltips.

### 4. Chart Controls
Each chart includes:
- Zoom button for detailed view
- Reset button to restore original view
- Interactive tooltips on hover

## Data Insights

The dashboard provides insights into:
- **Sales Trends**: Seasonal patterns and growth trends
- **Product Performance**: Best-selling products and their contribution
- **Geographic Distribution**: Regional performance analysis
- **Pricing Strategy**: Relationship between price and sales volume
- **Market Penetration**: State-wise performance analysis
- **Channel Effectiveness**: Sales method performance comparison
- **Partner Performance**: Retailer contribution analysis

## Browser Compatibility

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Performance Features

- **Lazy Loading**: Charts load as needed
- **Data Caching**: Efficient data fetching and caching
- **Responsive Images**: Optimized for different screen sizes
- **Minimal Dependencies**: Lightweight and fast loading

## Customization

The dashboard can be easily customized by modifying:
- Color scheme in CSS variables
- Chart configurations in JavaScript
- API endpoints for different data sources
- Filter options and criteria

## License

This project is part of the Visdat (Visualisasi Data) analysis project for Nike U.S. sales data.