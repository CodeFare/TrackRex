const statusColors = {
  green: '#34c759',
  yellow: '#F6C343',
  red: '#E63946'
};

const cityLookup = {
  'new york': { city: 'New York', state: 'NY', country: 'USA', lat: 40.7128, lng: -74.006 },
  'portland': { city: 'Portland', state: 'OR', country: 'USA', lat: 45.5152, lng: -122.6784 },
  'los angeles': { city: 'Los Angeles', state: 'CA', country: 'USA', lat: 34.0522, lng: -118.2437 },
  'chicago': { city: 'Chicago', state: 'IL', country: 'USA', lat: 41.8781, lng: -87.6298 },
  'atlanta': { city: 'Atlanta', state: 'GA', country: 'USA', lat: 33.749, lng: -84.388 },
  'seattle': { city: 'Seattle', state: 'WA', country: 'USA', lat: 47.6062, lng: -122.3321 },
  'austin': { city: 'Austin', state: 'TX', country: 'USA', lat: 30.2672, lng: -97.7431 },
  'miami': { city: 'Miami', state: 'FL', country: 'USA', lat: 25.7617, lng: -80.1918 }
};

const mockPackages = [
  {
    id: 'pkg-1',
    trackingNumber: '1Z999AA10123456784',
    carrier: 'UPS',
    origin: { city: 'Portland', state: 'OR', country: 'USA', lat: 45.5152, lng: -122.6784 },
    destination: { city: 'Austin', state: 'TX', country: 'USA', postalCode: '73301', lat: 30.2672, lng: -97.7431 },
    vanityName: 'Atlassian F1 Pit Diorama',
    status: 'yellow',
    statusText: 'In transit · Sort delay in Salt Lake City',
    scans: [
      { time: '2024-05-12T07:40:00Z', city: 'Portland', state: 'OR', country: 'USA', lat: 45.5152, lng: -122.6784, description: 'Label created · Awaiting carrier pickup' },
      { time: '2024-05-13T11:10:00Z', city: 'Boise', state: 'ID', country: 'USA', lat: 43.615, lng: -116.2023, description: 'Departed carrier facility' },
      { time: '2024-05-14T18:25:00Z', city: 'Salt Lake City', state: 'UT', country: 'USA', lat: 40.7608, lng: -111.891, description: 'Processing exception · Re-routed' },
      { time: '2024-05-15T05:30:00Z', city: 'Denver', state: 'CO', country: 'USA', lat: 39.7392, lng: -104.9903, description: 'Arrived at carrier facility' },
      { time: '2024-05-16T16:45:00Z', city: 'Austin', state: 'TX', country: 'USA', lat: 30.2672, lng: -97.7431, description: 'Out for delivery' }
    ]
  },
  {
    id: 'pkg-2',
    trackingNumber: '9400109205568123456789',
    carrier: 'USPS',
    origin: { city: 'Brooklyn', state: 'NY', country: 'USA', lat: 40.6782, lng: -73.9442 },
    destination: { city: 'Miami', state: 'FL', country: 'USA', postalCode: '33101', lat: 25.7617, lng: -80.1918 },
    vanityName: 'Zephyr Amazon FBA Box',
    status: 'green',
    statusText: 'Delivered · Signed by DOUG',
    scans: [
      { time: '2024-05-08T10:00:00Z', city: 'Brooklyn', state: 'NY', country: 'USA', lat: 40.6782, lng: -73.9442, description: 'Accepted at USPS Origin Facility' },
      { time: '2024-05-09T03:30:00Z', city: 'Philadelphia', state: 'PA', country: 'USA', lat: 39.9526, lng: -75.1652, description: 'Arrived at USPS Regional Facility' },
      { time: '2024-05-10T13:15:00Z', city: 'Atlanta', state: 'GA', country: 'USA', lat: 33.749, lng: -84.388, description: 'Departed USPS Regional Facility' },
      { time: '2024-05-11T09:05:00Z', city: 'Miami', state: 'FL', country: 'USA', lat: 25.7617, lng: -80.1918, description: 'Delivered, Front Desk' }
    ]
  },
  {
    id: 'pkg-3',
    trackingNumber: 'JJD000255556666777',
    carrier: 'DHL',
    origin: { city: 'Berlin', country: 'Germany', lat: 52.52, lng: 13.405 },
    destination: { city: 'Seattle', state: 'WA', country: 'USA', postalCode: '98101', lat: 47.6062, lng: -122.3321 },
    vanityName: 'Nordic Lab Fixtures',
    status: 'red',
    statusText: 'Customs hold in Cincinnati hub',
    scans: [
      { time: '2024-05-10T08:00:00Z', city: 'Berlin', country: 'Germany', lat: 52.52, lng: 13.405, description: 'Shipment picked up' },
      { time: '2024-05-10T12:30:00Z', city: 'Leipzig', country: 'Germany', lat: 51.3397, lng: 12.3731, description: 'Departed DHL Facility' },
      { time: '2024-05-11T02:15:00Z', city: 'Cincinnati', state: 'OH', country: 'USA', lat: 39.1031, lng: -84.512, description: 'Arrived at DHL hub · Customs inspection' },
      { time: '2024-05-11T22:45:00Z', city: 'Cincinnati', state: 'OH', country: 'USA', lat: 39.1031, lng: -84.512, description: 'Clearance event · Awaiting documents' }
    ]
  }
];

const mockOrigins = [
  { city: 'Los Angeles', state: 'CA', country: 'USA', lat: 34.0522, lng: -118.2437 },
  { city: 'Chicago', state: 'IL', country: 'USA', lat: 41.8781, lng: -87.6298 },
  { city: 'Denver', state: 'CO', country: 'USA', lat: 39.7392, lng: -104.9903 }
];

const MockTrackingAPI = {
  createPackage: ({ trackingNumber, carrier, destinationInput, vanityName }) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const destination = inferLocation(destinationInput) || cityLookup['miami'];
        const origin = mockOrigins[Math.floor(Math.random() * mockOrigins.length)];
        const statusOptions = [
          { status: 'green', statusText: 'On time · Departed hub' },
          { status: 'yellow', statusText: 'Weather watch near hub' },
          { status: 'red', statusText: 'Exception reported · Await instructions' }
        ];
        const status = statusOptions[Math.floor(Math.random() * statusOptions.length)];
        const scans = buildMockScans(origin, destination);
        resolve({
          id: `pkg-${Date.now()}`,
          trackingNumber,
          carrier: carrier || detectCarrier(trackingNumber) || 'Other',
          origin,
          destination,
          vanityName,
          status: status.status,
          statusText: status.statusText,
          scans
        });
      }, 500);
    });
  }
};

const map = L.map('map', {
  zoomControl: false
}).setView([39.5, -98.35], 4);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 18,
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

L.control.zoom({ position: 'bottomright' }).addTo(map);

const packages = [...mockPackages];
const mapLayers = new Map();
let selectedPackageId = null;

function detectCarrier(trackingNumber) {
  if (!trackingNumber) return '';
  const normalized = trackingNumber.trim().toUpperCase();
  if (normalized.startsWith('1Z')) return 'UPS';
  if (/^9\d{21}$/.test(normalized)) return 'USPS';
  if (/^\d{12}$/.test(normalized)) return 'FedEx';
  if (normalized.startsWith('JJD')) return 'DHL';
  if (/^7\d{18}$/.test(normalized)) return 'FedEx';
  return 'Other';
}

function inferLocation(input) {
  if (!input) return null;
  const clean = input.trim().toLowerCase();
  if (cityLookup[clean]) return cityLookup[clean];
  const zipMatches = {
    '97209': { city: 'Portland', state: 'OR', country: 'USA', lat: 45.5334, lng: -122.6823 },
    '73301': { city: 'Austin', state: 'TX', country: 'USA', lat: 30.2672, lng: -97.7431 },
    '33101': { city: 'Miami', state: 'FL', country: 'USA', lat: 25.7617, lng: -80.1918 },
    '98101': { city: 'Seattle', state: 'WA', country: 'USA', lat: 47.6097, lng: -122.3331 }
  };
  if (zipMatches[clean]) return zipMatches[clean];
  return {
    city: input,
    country: 'USA',
    lat: 39 + (Math.random() * 6 - 3),
    lng: -98 + (Math.random() * 10 - 5)
  };
}

function buildMockScans(origin, destination) {
  const midLat = (origin.lat + destination.lat) / 2 + (Math.random() - 0.5) * 5;
  const midLng = (origin.lng + destination.lng) / 2 + (Math.random() - 0.5) * 5;
  return [
    {
      time: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
      city: origin.city,
      state: origin.state,
      country: origin.country,
      lat: origin.lat,
      lng: origin.lng,
      description: 'Shipment information received'
    },
    {
      time: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
      city: 'Transit Node',
      country: origin.country,
      lat: midLat,
      lng: midLng,
      description: 'Departed regional facility'
    },
    {
      time: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
      city: destination.city,
      state: destination.state,
      country: destination.country,
      lat: destination.lat,
      lng: destination.lng,
      description: 'Out for delivery'
    }
  ];
}

function renderPackages() {
  const listEl = document.getElementById('packageList');
  listEl.innerHTML = '';
  packages.forEach((pkg) => {
    const card = document.createElement('div');
    card.className = `package-card ${selectedPackageId === pkg.id ? 'active' : ''}`;
    card.dataset.id = pkg.id;
    card.innerHTML = `
      <div class="package-title">
        <span>${pkg.vanityName || pkg.trackingNumber}</span>
        <span class="mono">${pkg.trackingNumber}</span>
      </div>
      <div class="package-meta">
        <span>${pkg.carrier}</span>
        <span class="status-chip ${pkg.status}">${pkg.statusText.split('·')[0]}</span>
      </div>
    `;
    card.addEventListener('click', () => selectPackage(pkg.id));
    listEl.appendChild(card);
  });
}

function buildBaseLine(pkg) {
  const color = statusColors[pkg.status];
  const originLatLng = [pkg.origin.lat, pkg.origin.lng];
  const destLatLng = [pkg.destination.lat, pkg.destination.lng];
  const line = L.polyline([originLatLng, destLatLng], {
    color,
    weight: 4,
    opacity: 0.8
  }).addTo(map);
  const originMarker = L.circleMarker(originLatLng, {
    radius: 6,
    color,
    fillColor: '#fff',
    fillOpacity: 1,
    weight: 2
  }).addTo(map);
  const destMarker = L.circleMarker(destLatLng, {
    radius: 6,
    color,
    fillColor: color,
    fillOpacity: 0.9,
    weight: 2
  }).addTo(map);
  mapLayers.set(pkg.id, {
    line,
    originMarker,
    destMarker,
    scanLine: null,
    scanMarkers: []
  });
}

function refreshBounds() {
  if (!mapLayers.size) return;
  const lines = Array.from(mapLayers.values()).map((layer) => layer.line);
  const group = L.featureGroup(lines);
  map.fitBounds(group.getBounds().pad(0.2));
}

function resetMapLayers(pkgId) {
  const layers = mapLayers.get(pkgId);
  if (!layers) return;
  if (layers.scanLine) {
    map.removeLayer(layers.scanLine);
    layers.scanLine = null;
  }
  layers.scanMarkers.forEach((marker) => map.removeLayer(marker));
  layers.scanMarkers = [];
  layers.line.setStyle({ opacity: 0.8 });
}

function focusOnPackage(pkg) {
  const layers = mapLayers.get(pkg.id);
  if (!layers) return;
  const scanLatLngs = pkg.scans.map((scan) => [scan.lat, scan.lng]);
  if (scanLatLngs.length >= 2) {
    if (layers.scanLine) {
      map.removeLayer(layers.scanLine);
    }
    layers.scanLine = L.polyline(scanLatLngs, {
      color: statusColors[pkg.status],
      weight: 5,
      dashArray: '8 6',
      opacity: 0.95
    }).addTo(map);
    layers.line.setStyle({ opacity: 0.2 });
    layers.scanMarkers.forEach((marker) => map.removeLayer(marker));
    layers.scanMarkers = pkg.scans.map((scan, index) =>
      L.circleMarker([scan.lat, scan.lng], {
        radius: index === pkg.scans.length - 1 ? 7 : 5,
        color: statusColors[pkg.status],
        fillColor: '#fff',
        fillOpacity: 0.9,
        weight: 2
      })
        .bindTooltip(`${scan.description}<br>${scan.city || ''}`)
        .addTo(map)
    );
    const bounds = L.latLngBounds(scanLatLngs);
    map.fitBounds(bounds, { padding: [40, 40] });
  }
}

function selectPackage(pkgId) {
  selectedPackageId = pkgId;
  renderPackages();
  packages.forEach((pkg) => resetMapLayers(pkg.id));
  const pkg = packages.find((p) => p.id === pkgId);
  if (!pkg) return;
  focusOnPackage(pkg);
  populateDetails(pkg);
}

function populateDetails(pkg) {
  const panel = document.getElementById('detailsPanel');
  panel.classList.remove('hidden');
  document.getElementById('detailsTitle').textContent = pkg.vanityName || pkg.trackingNumber;
  const meta = `${pkg.carrier} · ${pkg.statusText}`;
  document.getElementById('detailsMeta').textContent = meta;
  const chip = document.getElementById('detailsStatusChip');
  chip.textContent = pkg.status.toUpperCase();
  chip.className = `status-chip ${pkg.status}`;
  const alertCta = document.getElementById('alertCta');
  if (pkg.status === 'red') {
    alertCta.classList.remove('hidden');
  } else {
    alertCta.classList.add('hidden');
  }
  const list = document.getElementById('scanList');
  list.innerHTML = '';
  pkg.scans.forEach((scan) => {
    const item = document.createElement('li');
    item.className = 'scan-item';
    item.innerHTML = `
      <time>${new Date(scan.time).toLocaleString()}</time>
      <strong>${scan.city || ''} ${scan.state || ''} ${scan.country}</strong>
      <p>${scan.description}</p>
    `;
    list.appendChild(item);
  });
}

function initializeMap() {
  packages.forEach((pkg) => buildBaseLine(pkg));
  refreshBounds();
}

function handleForm() {
  const form = document.getElementById('addPackageForm');
  const errorEl = document.getElementById('formError');
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const trackingNumber = document.getElementById('trackingNumber').value.trim();
    const carrier = document.getElementById('carrier').value;
    const destinationInput = document.getElementById('destination').value.trim();
    const vanityName = document.getElementById('vanityName').value.trim();

    if (!trackingNumber) {
      errorEl.textContent = 'Please enter a tracking number.';
      return;
    }
    errorEl.textContent = '';

    MockTrackingAPI.createPackage({ trackingNumber, carrier, destinationInput, vanityName })
      .then((pkg) => {
        packages.unshift(pkg);
        buildBaseLine(pkg);
        renderPackages();
        form.reset();
        refreshBounds();
      })
      .catch(() => {
        errorEl.textContent = 'Unable to add package right now.';
      });
  });
}

function handleAutoDetect() {
  const button = document.getElementById('autoDetectBtn');
  button.addEventListener('click', () => {
    const trackingInput = document.getElementById('trackingNumber');
    const carrierSelect = document.getElementById('carrier');
    const detected = detectCarrier(trackingInput.value);
    carrierSelect.value = detected;
    button.textContent = detected ? `Detected: ${detected}` : 'Try again';
    setTimeout(() => {
      button.textContent = 'Auto detect';
    }, 2000);
  });
}

function handleCTAs() {
  document.getElementById('faqBtn').addEventListener('click', () => {
    alert('Opening TrackRex FAQs — connect a real endpoint here.');
  });
  document.getElementById('proBtn').addEventListener('click', () => {
    alert('A claims specialist will be notified in the live product.');
  });
}

handleForm();
handleAutoDetect();
handleCTAs();
renderPackages();
initializeMap();
