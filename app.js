const statusColors = {
  green: '#38B000',
  yellow: '#FFB703',
  red: '#E63946'
};

const cityCoordinates = {
  'San Francisco, CA': { city: 'San Francisco', state: 'CA', country: 'USA', lat: 37.7749, lng: -122.4194 },
  'New York, NY': { city: 'New York', state: 'NY', country: 'USA', lat: 40.7128, lng: -74.006 },
  'Austin, TX': { city: 'Austin', state: 'TX', country: 'USA', lat: 30.2672, lng: -97.7431 },
  'Chicago, IL': { city: 'Chicago', state: 'IL', country: 'USA', lat: 41.8781, lng: -87.6298 },
  'Seattle, WA': { city: 'Seattle', state: 'WA', country: 'USA', lat: 47.6062, lng: -122.3321 },
  'Los Angeles, CA': { city: 'Los Angeles', state: 'CA', country: 'USA', lat: 34.0522, lng: -118.2437 },
  'Denver, CO': { city: 'Denver', state: 'CO', country: 'USA', lat: 39.7392, lng: -104.9903 }
};

const postalShortcuts = {
  '94107': 'San Francisco, CA',
  '73301': 'Austin, TX',
  '10001': 'New York, NY',
  '60601': 'Chicago, IL',
  '98101': 'Seattle, WA',
  '80202': 'Denver, CO',
  '90001': 'Los Angeles, CA'
};

const mockPackages = [
  {
    id: 'pkg-1',
    trackingNumber: '1Z56R8F90398234231',
    carrier: 'UPS',
    origin: cityCoordinates['San Francisco, CA'],
    destination: { ...cityCoordinates['New York, NY'], postalCode: '10001' },
    vanityName: 'Atlassian F1 Pit Diorama',
    status: 'yellow',
    statusText: 'Arrived at sort facility • Newark, NJ',
    scans: [
      { time: '2024-06-13 08:10', description: 'Label created', ...cityCoordinates['San Francisco, CA'] },
      { time: '2024-06-14 12:24', description: 'Departed Oakland, CA hub', city: 'Oakland', state: 'CA', country: 'USA', lat: 37.8044, lng: -122.2712 },
      { time: '2024-06-16 03:55', description: 'Arrived at Louisville, KY sort', city: 'Louisville', state: 'KY', country: 'USA', lat: 38.2527, lng: -85.7585 },
      { time: '2024-06-17 07:12', description: 'Processed at Newark, NJ facility', city: 'Newark', state: 'NJ', country: 'USA', lat: 40.7357, lng: -74.1724 },
      { time: '2024-06-18 05:40', description: 'Out for delivery - Manhattan', ...cityCoordinates['New York, NY'] }
    ]
  },
  {
    id: 'pkg-2',
    trackingNumber: '9400111899223197428499',
    carrier: 'USPS',
    origin: cityCoordinates['Austin, TX'],
    destination: { ...cityCoordinates['Chicago, IL'], postalCode: '60601' },
    vanityName: 'Zephyr Amazon FBA Box',
    status: 'green',
    statusText: 'Delivered • 2:05 PM local',
    scans: [
      { time: '2024-06-11 09:30', description: 'Accepted at USPS Austin', ...cityCoordinates['Austin, TX'] },
      { time: '2024-06-12 04:05', description: 'Departed Austin, TX', city: 'Dallas', state: 'TX', country: 'USA', lat: 32.7767, lng: -96.797 },
      { time: '2024-06-13 08:45', description: 'Arrived at St. Louis hub', city: 'St. Louis', state: 'MO', country: 'USA', lat: 38.627, lng: -90.1994 },
      { time: '2024-06-14 13:10', description: 'Out for delivery', ...cityCoordinates['Chicago, IL'] }
    ]
  },
  {
    id: 'pkg-3',
    trackingNumber: 'FDX7785123490',
    carrier: 'FedEx',
    origin: cityCoordinates['Los Angeles, CA'],
    destination: { ...cityCoordinates['Seattle, WA'], postalCode: '98101' },
    vanityName: 'Studio Lighting Rig',
    status: 'red',
    statusText: 'Delivery exception • Weather hold in Portland',
    scans: [
      { time: '2024-06-10 11:12', description: 'Picked up - Los Angeles', ...cityCoordinates['Los Angeles, CA'] },
      { time: '2024-06-11 05:22', description: 'Departed Los Angeles, CA', city: 'Sacramento', state: 'CA', country: 'USA', lat: 38.5816, lng: -121.4944 },
      { time: '2024-06-12 02:40', description: 'Arrived Portland, OR', city: 'Portland', state: 'OR', country: 'USA', lat: 45.5152, lng: -122.6784 },
      { time: '2024-06-13 14:00', description: 'Weather delay - Portland hub', city: 'Portland', state: 'OR', country: 'USA', lat: 45.52, lng: -122.6819 }
    ]
  }
];

const packages = [...mockPackages];
let selectedPackageId = null;

const map = L.map('map', { zoomControl: false }).setView([39.5, -98.35], 4);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);
L.control.zoom({ position: 'bottomright' }).addTo(map);

const packageLayers = new Map();

function initPackageOnMap(pkg) {
  const color = statusColors[pkg.status];
  const originLatLng = [pkg.origin.lat, pkg.origin.lng];
  const destinationLatLng = [pkg.destination.lat, pkg.destination.lng];
  const baseLine = L.polyline([originLatLng, destinationLatLng], {
    color,
    weight: 3,
    opacity: 0.9
  }).addTo(map);

  const markerStyle = {
    radius: 6,
    color: '#fff',
    weight: 2,
    fillColor: color,
    fillOpacity: 1
  };

  const originMarker = L.circleMarker(originLatLng, markerStyle).addTo(map).bindTooltip(`${pkg.origin.city} origin`, { permanent: false });
  const destinationMarker = L.circleMarker(destinationLatLng, markerStyle).addTo(map).bindTooltip(`${pkg.destination.city} destination`, { permanent: false });

  const scanCoords = pkg.scans.map(scan => [scan.lat, scan.lng]);
  const scanLine = L.polyline(scanCoords, {
    color,
    weight: 4,
    dashArray: '6,8'
  });

  const scanMarkers = pkg.scans.map(scan => {
    return L.circleMarker([scan.lat, scan.lng], {
      radius: 5,
      color: '#fff',
      weight: 1,
      fillColor: color,
      fillOpacity: 1
    }).bindTooltip(`${scan.description}`);
  });

  packageLayers.set(pkg.id, { baseLine, originMarker, destinationMarker, scanLine, scanMarkers });
}

packages.forEach(initPackageOnMap);

function statusClass(status) {
  return `status-${status}`;
}

function renderPackages() {
  const container = document.getElementById('packagesContainer');
  container.innerHTML = '';
  packages.forEach(pkg => {
    const card = document.createElement('div');
    card.className = 'package-card';
    if (pkg.id === selectedPackageId) card.classList.add('active');
    card.innerHTML = `
      <div class="package-meta">
        <h3>${pkg.vanityName || pkg.trackingNumber}</h3>
        <span>${pkg.carrier} • ${pkg.statusText}</span>
      </div>
      <span class="status-chip ${statusClass(pkg.status)}">${pkg.status}</span>
    `;
    card.addEventListener('click', () => selectPackage(pkg.id));
    container.appendChild(card);
  });
  document.getElementById('packageCount').textContent = packages.length;
}

function selectPackage(id) {
  selectedPackageId = id;
  renderPackages();
  const pkg = packages.find(p => p.id === id);
  if (!pkg) return;
  toggleMapLayers(id);
  populateDetails(pkg);
}

function toggleMapLayers(activeId) {
  packageLayers.forEach((layer, id) => {
    if (id === activeId) {
      if (layer.baseLine && map.hasLayer(layer.baseLine)) map.removeLayer(layer.baseLine);
      if (layer.scanLine && !map.hasLayer(layer.scanLine) && layer.scanLine.getLatLngs().length > 1) {
        layer.scanLine.addTo(map);
        map.fitBounds(layer.scanLine.getBounds(), { padding: [30, 30] });
      }
      layer.scanMarkers.forEach(marker => {
        if (!map.hasLayer(marker)) marker.addTo(map);
      });
    } else {
      if (layer.scanLine && map.hasLayer(layer.scanLine)) map.removeLayer(layer.scanLine);
      layer.scanMarkers.forEach(marker => {
        if (map.hasLayer(marker)) map.removeLayer(marker);
      });
      if (layer.baseLine && !map.hasLayer(layer.baseLine)) layer.baseLine.addTo(map);
    }
  });
}

function populateDetails(pkg) {
  const details = document.getElementById('packageDetails');
  details.classList.remove('hidden');
  document.getElementById('detailTitle').textContent = pkg.vanityName || pkg.trackingNumber;
  const statusChip = document.getElementById('detailStatus');
  statusChip.textContent = pkg.status;
  statusChip.className = `status-chip ${statusClass(pkg.status)}`;
  document.getElementById('detailCarrier').textContent = pkg.carrier;
  document.getElementById('detailTracking').textContent = pkg.trackingNumber;
  document.getElementById('detailRoute').textContent = `${pkg.origin.city}, ${pkg.origin.state || pkg.origin.country} → ${pkg.destination.city}, ${pkg.destination.state || pkg.destination.country}`;
  document.getElementById('detailStatusText').textContent = pkg.statusText;

  const scanList = document.getElementById('scanList');
  scanList.innerHTML = '';
  pkg.scans.forEach(scan => {
    const item = document.createElement('li');
    item.className = 'scan-item';
    item.innerHTML = `
      <time>${scan.time}</time>
      <div><strong>${scan.city}${scan.state ? ', ' + scan.state : ''}</strong> • ${scan.description}</div>
    `;
    scanList.appendChild(item);
  });

  const helpCta = document.getElementById('helpCta');
  if (pkg.status === 'red') {
    helpCta.classList.remove('hidden');
  } else {
    helpCta.classList.add('hidden');
  }
}

renderPackages();
selectPackage(packages[0].id);

const form = document.getElementById('packageForm');
const errorEl = document.getElementById('formError');

form.addEventListener('submit', event => {
  event.preventDefault();
  errorEl.textContent = '';
  const trackingNumber = document.getElementById('trackingNumber').value.trim();
  const carrierSelect = document.getElementById('carrier');
  const carrier = carrierSelect.value;
  const destinationInput = document.getElementById('destination').value.trim();
  const vanityName = document.getElementById('vanityName').value.trim();

  if (!trackingNumber) {
    errorEl.textContent = 'Please enter a tracking number';
    return;
  }

  const finalCarrier = carrier || 'Auto';
  const destination = resolveDestination(destinationInput) || cityCoordinates['Chicago, IL'];
  const origin = randomOrigin(destination.city);
  const status = randomStatus();
  const scans = generateScans(origin, destination);

  const newPackage = {
    id: crypto.randomUUID(),
    trackingNumber,
    carrier: finalCarrier,
    origin,
    destination,
    vanityName: vanityName || null,
    status,
    statusText: scans[scans.length - 1].description,
    scans
  };

  packages.unshift(newPackage);
  initPackageOnMap(newPackage);
  renderPackages();
  form.reset();
  selectPackage(newPackage.id);
});

function resolveDestination(input) {
  if (!input) return null;
  if (postalShortcuts[input]) {
    return { ...cityCoordinates[postalShortcuts[input]], postalCode: input };
  }
  const normalized = Object.keys(cityCoordinates).find(key => key.toLowerCase() === input.toLowerCase());
  if (normalized) {
    return { ...cityCoordinates[normalized] };
  }
  return null;
}

function randomOrigin(excludeCity) {
  const keys = Object.keys(cityCoordinates).filter(key => cityCoordinates[key].city !== excludeCity);
  const pick = cityCoordinates[keys[Math.floor(Math.random() * keys.length)]];
  return pick;
}

function randomStatus() {
  const statuses = ['green', 'yellow', 'red'];
  return statuses[Math.floor(Math.random() * statuses.length)];
}

function generateScans(origin, destination) {
  const midpoints = interpolatePoints(origin, destination, 2);
  const events = [origin, ...midpoints, destination];
  return events.map((point, index) => {
    const description = index === events.length - 1 ? 'Destination scan completed' : index === 0 ? 'Origin scan processed' : `In transit checkpoint ${index}`;
    return {
      time: new Date(Date.now() - (events.length - index) * 3600 * 1000).toISOString().slice(0, 16).replace('T', ' '),
      city: point.city,
      state: point.state,
      country: point.country,
      lat: point.lat,
      lng: point.lng,
      description
    };
  });
}

function interpolatePoints(start, end, count) {
  const points = [];
  for (let i = 1; i <= count; i++) {
    const ratio = i / (count + 1);
    points.push({
      city: `Waypoint ${i}`,
      state: '',
      country: start.country,
      lat: start.lat + (end.lat - start.lat) * ratio + randomOffset(),
      lng: start.lng + (end.lng - start.lng) * ratio + randomOffset(),
    });
  }
  return points;
}

function randomOffset() {
  return (Math.random() - 0.5) * 2;
}

const autoDetectBtn = document.getElementById('autoDetect');
autoDetectBtn.addEventListener('click', () => {
  const trackingInput = document.getElementById('trackingNumber');
  const detectedCarrier = detectCarrier(trackingInput.value.trim());
  if (detectedCarrier) {
    document.getElementById('carrier').value = detectedCarrier;
    errorEl.textContent = `Detected ${detectedCarrier}`;
  } else {
    errorEl.textContent = 'Could not detect carrier';
  }
});

function detectCarrier(tracking) {
  if (!tracking) return null;
  const normalized = tracking.replace(/\s+/g, '').toUpperCase();
  if (normalized.startsWith('1Z')) return 'UPS';
  if (/^9\d{21}$/.test(normalized)) return 'USPS';
  if (/^(96\d{20}|94\d{20})$/.test(normalized)) return 'USPS';
  if (/^\d{12,15}$/.test(normalized)) return 'FedEx';
  if (/^[A-Z]{2}\d{9}[A-Z]{2}$/.test(normalized)) return 'DHL';
  return null;
}
