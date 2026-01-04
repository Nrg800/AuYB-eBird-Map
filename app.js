import { mapconfig } from './mapconfig.js';
import { observercolours } from './observercolours.js';
import { addPointLayerPopups } from './popup.js';


// ============================
// 1️⃣ Point Layer Styling Block
const pointLayerStyle = {
    id: 'points-layer',
    type: 'circle',
    source: 'eBird_Locs',
    paint: {
        'circle-radius': [
            'interpolate',
            ['linear'],
            ['get', 'totalSpecies'],
            0, 2,
            150, 22,
            999, 22
        ],

        'circle-opacity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            4, 0.25,
            6, 0.4,
            12, 0.95
        ],

        'circle-color': ['get', 'color'],
    }
};
 

// ============================
// 3️⃣ CSV load & GeoJSON
// ============================
function loadCSVAndAddLayer(map) {
    Papa.parse('Final/LivingFinal.csv', {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: function(results) {

            // Assign colors
            const colorMap = observercolours(results.data);

            // Convert CSV rows to GeoJSON features
            const features = results.data
                .filter(d => d.Latitude && d.Longitude)
                .map(d => ({
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        coordinates: [
                            parseFloat(d.Longitude),
                            parseFloat(d.Latitude)
                        ]
                    },
                    properties: {
                        totalSpecies: parseInt(d['Total Species']) || 0,
                        topObserver: d['Top Observer'],
                        color: colorMap[d['Top Observer']] || '#888888',
                        visitlast: d['Date Last Visited'],
                        locationID: d['Location ID'],
                        locationName: d['Location Name'],
                        rarestSpecies: d['Rarest Species'],
                        rarestSpeciesScore: parseFloat(d['Rarest Species Score']) || 0,
                        topObserver: d['Top Observer'],
                        visitedBy: d['Visited By'],
                        observerSpeciesCounts: d['Observer Species Counts'],
                        yearsVisited: d['Years Visited'],
                        totalRecords: parseInt(d['Total Records']) || 0,
                        totalIndividualsSeen: parseFloat(d['Total Individuals Seen']) || 0
                    }
                }));

            const geojson = { type: 'FeatureCollection', features };

            // Add source and layer
            map.addSource('eBird_Locs', { type: 'geojson', data: geojson });
            map.addLayer(pointLayerStyle);
            addPointLayerPopups(map, 'points-layer');
            console.log(`Loaded ${features.length} points`);
        },
        error: function(err) {
            console.error('Error loading CSV:', err);
        }
    });
}

// ============================
// Filters – helper
// ============================
function nameToInitials(name) {
  const parts = name.trim().split(/\s+/);
  if (parts.length < 2) return null;

  return parts
    .slice(0, 2)
    .map(p => p.slice(0, 2))
    .join('');
}


// ============================
// 3️⃣ Initialize Map & Load CSV
// ============================
mapboxgl.accessToken = 'pk.eyJ1IjoibnJnODAwIiwiYSI6ImJlYzQ3YTc0NDE2MjJlYWMyNTk5YTY1MTVhNWU0NTY1In0.JwqTcbQSkM-8Nv91NRe80A';
const map = new mapboxgl.Map(mapconfig);

// Load CSV and add points after map loads
map.on('load', () => {
  // ============================
  // DOM elements
  // ============================
  const filterToggle = document.getElementById('filterToggle');
  const filterPanel = document.getElementById('filterPanel');
  const filterTypeSelect = document.getElementById('filterType');
  const filterValueInput = document.getElementById('filterValue');
  const applyFilterBtn = document.getElementById('applyFilter');
  const clearFilterBtn = document.getElementById('clearFilter');

clearFilterBtn.addEventListener('click', () => {
  // Remove any Mapbox filter
  map.setFilter('points-layer', null);

  // Reset input field
  filterValueInput.value = '';

  // Optionally reset filter type to "Name"
  filterTypeSelect.value = 'name';
  filterValueInput.placeholder = 'Enter full name';

  // Hide filter panel if desired
  // filterPanel.style.display = 'none';
});

  // ============================
  // Toggle filter panel
  // ============================
  filterToggle.addEventListener('click', () => {
    filterPanel.style.display =
      filterPanel.style.display === 'none' ? 'block' : 'none';
  });

  // Optional: change placeholder when filter type changes
  filterTypeSelect.addEventListener('change', () => {
    filterValueInput.value = '';
    filterValueInput.placeholder =
      filterTypeSelect.value === 'name'
        ? 'Enter full name'
        : 'Enter year (e.g. 2024)';
  });

  // ============================
  // Apply filter
  // ============================
  applyFilterBtn.addEventListener('click', () => {
    const filterType = filterTypeSelect.value;
    const rawValue = filterValueInput.value.trim();

    if (!rawValue) {
      alert('Please enter a value');
      return;
    }

    let filterExpression;

    if (filterType === 'name') {
      const initials = nameToInitials(rawValue);
      if (!initials) {
        alert('Please enter first and last name');
        return;
      }

      filterExpression = [
        'in',
        initials,
        ['split', ['get', 'visitedBy'], '|']
      ];
    }

    if (filterType === 'year') {
    if (!/^\d{4}$/.test(rawValue)) {
        alert('Please enter a 4-digit year');
        return;
    }

    // Use index-of like your styling
    filterExpression = [
        '!=',
        ['index-of', rawValue, ['get', 'yearsVisited']],
        -1
    ];
    }

    map.setFilter('points-layer', filterExpression);
  });

  // Clear filter listener
clearFilterBtn.addEventListener('click', () => {
  map.setFilter('points-layer', null);
  filterValueInput.value = '';
  filterTypeSelect.value = 'name';
  filterValueInput.placeholder = 'Enter name (e.g. Nathan Ruser)';
});

  // ============================
  // Load CSV and add points layer
  // ============================
  loadCSVAndAddLayer(map);
});
