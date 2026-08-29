const state = {
  places: [],
  filtered: [],
  map: null,
  markers: [],
  currentPosition: null,
};

const cityFilter = document.querySelector('#cityFilter');
const cuisineFilter = document.querySelector('#cuisineFilter');
const searchInput = document.querySelector('#searchInput');
const locateBtn = document.querySelector('#locateBtn');
const placeList = document.querySelector('#placeList');
const resultMeta = document.querySelector('#resultMeta');
const detailSheet = document.querySelector('#detailSheet');
const detailContent = document.querySelector('#detailContent');
const closeSheet = document.querySelector('#closeSheet');
const cardTemplate = document.querySelector('#cardTemplate');

async function init() {
  const res = await fetch('./data/places.json');
  state.places = await res.json();
  initMap();
  populateCuisineFilter();
  bindEvents();
  applyFilters();
}

function initMap() {
  state.map = L.map('map', { zoomControl: true }).setView([34.679, 135.503], 12);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(state.map);
}

function populateCuisineFilter() {
  const cuisines = [...new Set(state.places.map(place => place.food_type))].sort();
  cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.value = cuisine;
    option.textContent = cuisine;
    cuisineFilter.appendChild(option);
  });
}

function bindEvents() {
  cityFilter.addEventListener('change', applyFilters);
  cuisineFilter.addEventListener('change', applyFilters);
  searchInput.addEventListener('input', applyFilters);
  closeSheet.addEventListener('click', () => detailSheet.classList.add('hidden'));
  locateBtn.addEventListener('click', locateUser);
}

function applyFilters() {
  const city = cityFilter.value;
  const cuisine = cuisineFilter.value;
  const term = searchInput.value.trim().toLowerCase();

  state.filtered = state.places.filter(place => {
    const cityOk = city === 'all' || place.city === city;
    const cuisineOk = cuisine === 'all' || place.food_type === cuisine;
    const haystack = [place.name, place.area, place.food_type, place.user_note, place.cuisine].join(' ').toLowerCase();
    const searchOk = !term || haystack.includes(term);
    return cityOk && cuisineOk && searchOk;
  });

  renderMarkers();
  renderList();
  updateResultMeta();
}

function renderMarkers() {
  state.markers.forEach(marker => marker.remove());
  state.markers = [];
  const bounds = [];

  state.filtered.forEach(place => {
    const marker = L.circleMarker([place.lat, place.lon], {
      radius: 9,
      weight: 2,
      color: markerColor(place),
      fillColor: markerColor(place),
      fillOpacity: 0.9,
    }).addTo(state.map);

    marker.bindPopup(`<b>${escapeHtml(place.name)}</b><br>${escapeHtml(place.food_type)}<br>${escapeHtml(locationLabel(place))}`);
    marker.on('click', () => openDetail(place));
    state.markers.push(marker);
    bounds.push([place.lat, place.lon]);
  });

  if (bounds.length) {
    state.map.fitBounds(bounds, { padding: [30, 30] });
    if (state.filtered.length === 1) state.map.setZoom(16);
  }
}

function renderList() {
  placeList.innerHTML = '';
  state.filtered.forEach(place => {
    const fragment = cardTemplate.content.cloneNode(true);
    fragment.querySelector('.card-area').textContent = `${place.city} · ${displayArea(place.area)}`;
    fragment.querySelector('.card-title').textContent = place.name;
    fragment.querySelector('.card-rank').textContent = place.rank || (place.status === 'closed_or_uncertain' ? '주의' : '추천');
    fragment.querySelector('.card-food').textContent = place.food_type;
    fragment.querySelector('.card-note').textContent = place.user_note || '메모 없음';

    const meta = fragment.querySelector('.card-meta');
    meta.appendChild(makeChip(locationLabel(place), `status-${place.status}`));
    if (state.currentPosition) meta.appendChild(makeChip(distanceLabel(place), ''));
    if (place.area && place.area !== 'unknown') meta.appendChild(makeChip(displayArea(place.area), ''));

    const card = fragment.querySelector('.place-card');
    card.addEventListener('click', () => openDetail(place));
    placeList.appendChild(fragment);
  });
}

function updateResultMeta() {
  const exact = state.filtered.filter(place => place.location_precision === 'exact').length;
  resultMeta.textContent = `${state.filtered.length}곳 표시 · 정확 위치 ${exact}곳 · 나머지는 대략 위치/검색 링크 지원`;
}

function openDetail(place) {
  detailSheet.classList.remove('hidden');
  detailContent.innerHTML = `
    <p class="card-area">${place.city} · ${displayArea(place.area)}</p>
    <h2>${escapeHtml(place.name)}</h2>
    <p class="${'status-' + place.status}">${locationLabel(place)}</p>
    <p>${escapeHtml(place.food_type)}</p>
    <p>${escapeHtml(place.user_note || '메모 없음')}</p>
    ${state.currentPosition ? `<p><b>현재 위치 기준:</b> ${distanceLabel(place)}</p>` : '<p><b>거리:</b> 위치 권한 허용 시 표시</p>'}
    <p><b>도시:</b> ${place.city}</p>
    <p><b>지역:</b> ${displayArea(place.area)}</p>
    <div class="detail-actions">
      <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.maps_query)}" target="_blank" rel="noreferrer">Google Maps 검색</a>
      <a class="secondary" href="https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lon}&travelmode=walking" target="_blank" rel="noreferrer">도보 경로 열기</a>
    </div>
    ${place.source_url ? `<p><a href="${place.source_url}" target="_blank" rel="noreferrer">좌표 참고 출처</a></p>` : ''}
  `;
}

function locateUser() {
  if (!navigator.geolocation) {
    alert('이 브라우저는 위치 기능을 지원하지 않음');
    return;
  }
  locateBtn.disabled = true;
  locateBtn.textContent = '위치 확인 중...';
  navigator.geolocation.getCurrentPosition(
    ({ coords }) => {
      state.currentPosition = { lat: coords.latitude, lon: coords.longitude };
      L.circleMarker([coords.latitude, coords.longitude], {
        radius: 10, color: '#ffffff', fillColor: '#4dd0ff', fillOpacity: 1, weight: 3
      }).addTo(state.map).bindPopup('현재 위치').openPopup();
      renderList();
      locateBtn.disabled = false;
      locateBtn.textContent = '거리 갱신 완료';
    },
    () => {
      locateBtn.disabled = false;
      locateBtn.textContent = '내 위치로 거리 보기';
      alert('위치 권한이 거부되었거나 확인 실패');
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
  );
}

function markerColor(place) {
  if (place.status === 'closed_or_uncertain') return '#8f96a3';
  if (place.location_precision === 'exact') return '#73f0c2';
  return '#ffd479';
}

function locationLabel(place) {
  if (place.status === 'closed_or_uncertain') return '폐업 메모 또는 이름 재확인 필요';
  return place.location_precision === 'exact' ? '정확 위치 핀' : '대략 위치 핀';
}

function displayArea(area) {
  return area === 'unknown' ? '지역 추가확인중' : area;
}

function distanceLabel(place) {
  const meters = haversine(state.currentPosition.lat, state.currentPosition.lon, place.lat, place.lon);
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}

function haversine(lat1, lon1, lat2, lon2) {
  const toRad = deg => deg * Math.PI / 180;
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)**2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function makeChip(text, klass) {
  const span = document.createElement('span');
  span.className = `meta-chip ${klass}`.trim();
  span.textContent = text;
  return span;
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, ch => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[ch]));
}

init().catch(err => {
  console.error(err);
  placeList.innerHTML = '<p>데이터 로딩 실패</p>';
});
