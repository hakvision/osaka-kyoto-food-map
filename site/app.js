const GOOGLE_MAPS_API_KEY = 'AIzaSyAYoKYldmgkXzrMEdD16zPKW_NKy_DuRBc';

const LANDMARKS = [
  { name: '난바역', city: 'Osaka', area: 'Namba', lat: 34.6663, lon: 135.5019, note: '난바 중심 이동 기준점' },
  { name: '도톤보리', city: 'Osaka', area: 'Namba', lat: 34.6687, lon: 135.5019, note: '먹거리 밀집 지역' },
  { name: '오사카역', city: 'Osaka', area: 'Umeda', lat: 34.7025, lon: 135.4959, note: '우메다/오사카역 환승 중심' },
  { name: '신세카이', city: 'Osaka', area: 'Shinsekai', lat: 34.6525, lon: 135.5066, note: '신세카이 먹거리 구역' },
  { name: '텐노지역', city: 'Osaka', area: 'Tennoji', lat: 34.6477, lon: 135.5136, note: '텐노지 이동 기준점' },
  { name: '교토역', city: 'Kyoto', area: 'Kyoto Station', lat: 34.9855, lon: 135.7586, note: '교토 메인 허브' },
  { name: '기온', city: 'Kyoto', area: 'Gion', lat: 35.0037, lon: 135.7751, note: '교토 동부 관광/식당 구역' },
  { name: '아라시야마', city: 'Kyoto', area: 'Arashiyama', lat: 35.015, lon: 135.6777, note: '교토 서쪽 관광지' },
  { name: '폰토초', city: 'Kyoto', area: 'Pontocho', lat: 35.0064, lon: 135.7704, note: '가모가와 옆 번화가' },
];

const state = {
  places: [],
  filtered: [],
  map: null,
  markers: [],
  landmarkMarkers: [],
  currentPosition: null,
  userMarker: null,
  infoWindow: null,
  activePlace: null,
  openPanelId: null,
};

const cityFilter = document.querySelector('#cityFilter');
const cuisineFilter = document.querySelector('#cuisineFilter');
const searchInput = document.querySelector('#searchInput');
const locateBtn = document.querySelector('#locateBtn');
const menuBtn = document.querySelector('#menuBtn');
const menuDrawer = document.querySelector('#menuDrawer');
const closeDrawer = document.querySelector('#closeDrawer');
const panelButtons = [...document.querySelectorAll('[data-panel]')];
const panelCloseButtons = [...document.querySelectorAll('[data-close-panel]')];
const overlayPanels = ['filterPanel', 'listPanel', 'legendPanel'].map(id => document.getElementById(id));
const placeList = document.querySelector('#placeList');
const resultMeta = document.querySelector('#resultMeta');
const detailSheet = document.querySelector('#detailSheet');
const detailContent = document.querySelector('#detailContent');
const closeSheet = document.querySelector('#closeSheet');
const cardTemplate = document.querySelector('#cardTemplate');

window.initGoogleFoodMap = async function initGoogleFoodMap() {
  state.map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: 34.679, lng: 135.503 },
    zoom: 12,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
    clickableIcons: true,
    gestureHandling: 'greedy',
    language: 'ko',
    styles: [
      { elementType: 'geometry', stylers: [{ color: '#101c30' }] },
      { elementType: 'labels.text.fill', stylers: [{ color: '#d8e5ff' }] },
      { elementType: 'labels.text.stroke', stylers: [{ color: '#08111e' }] },
      { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#a8bddf' }] },
      { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1f365a' }] },
      { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#27436f' }] },
      { featureType: 'transit.station', elementType: 'labels.text.fill', stylers: [{ color: '#8ef0c4' }] },
      { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0b2746' }] },
    ],
  });

  state.infoWindow = new google.maps.InfoWindow();
  state.map.addListener('click', () => {
    closeDrawerPanelAndDetail({ keepDetail: false });
  });

  const res = await fetch('./data/places.json?v=user-curation-2');
  state.places = await res.json();
  translateDataset();
  populateCuisineFilter();
  bindEvents();
  renderLandmarks();
  applyFilters();
};

function bindEvents() {
  menuBtn.addEventListener('click', toggleDrawer);
  closeDrawer.addEventListener('click', closeMenuDrawer);
  panelButtons.forEach(button => {
    button.addEventListener('click', () => {
      openPanel(button.dataset.panel);
    });
  });
  panelCloseButtons.forEach(button => {
    button.addEventListener('click', () => {
      closePanel(button.dataset.closePanel);
    });
  });
  cityFilter.addEventListener('change', applyFilters);
  cuisineFilter.addEventListener('change', applyFilters);
  searchInput.addEventListener('input', applyFilters);
  closeSheet.addEventListener('click', closeDetail);
  locateBtn.addEventListener('click', locateUser);
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeDrawerPanelAndDetail({ keepDetail: false });
  });
}

function translateDataset() {
  state.places = state.places.map(place => ({
    ...place,
    city_ko: cityLabel(place.city),
    area_ko: displayArea(place.area),
  }));
}

function toggleDrawer() {
  const opening = menuDrawer.classList.contains('hidden');
  if (opening) {
    menuDrawer.classList.remove('hidden');
    menuBtn.setAttribute('aria-expanded', 'true');
  } else {
    closeMenuDrawer();
  }
}

function closeMenuDrawer() {
  menuDrawer.classList.add('hidden');
  menuBtn.setAttribute('aria-expanded', 'false');
}

function openPanel(panelId) {
  overlayPanels.forEach(panel => panel.classList.add('hidden'));
  const panel = document.getElementById(panelId);
  panel?.classList.remove('hidden');
  state.openPanelId = panelId;
  closeMenuDrawer();
}

function closePanel(panelId) {
  document.getElementById(panelId)?.classList.add('hidden');
  if (state.openPanelId === panelId) state.openPanelId = null;
}

function closeAllPanels() {
  overlayPanels.forEach(panel => panel.classList.add('hidden'));
  state.openPanelId = null;
}

function closeDrawerPanelAndDetail({ keepDetail }) {
  closeMenuDrawer();
  closeAllPanels();
  if (!keepDetail) closeDetail();
}

function renderLandmarks() {
  clearMarkers(state.landmarkMarkers);
  state.landmarkMarkers = [];
  LANDMARKS.forEach(spot => {
    const marker = new google.maps.Marker({
      position: { lat: spot.lat, lng: spot.lon },
      map: state.map,
      title: spot.name,
      label: { text: spot.name, color: '#f6fbff', fontSize: '12px', fontWeight: '700' },
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 7,
        fillColor: '#3b82f6',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2,
      },
      zIndex: 50,
    });
    marker.addListener('click', () => {
      state.infoWindow.setContent(`<b>${escapeHtml(spot.name)}</b><br>${escapeHtml(spot.note)}`);
      state.infoWindow.open({ anchor: marker, map: state.map });
      closeAllPanels();
      closeDetail();
    });
    state.landmarkMarkers.push(marker);
  });
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

function applyFilters() {
  const city = cityFilter.value;
  const cuisine = cuisineFilter.value;
  const term = searchInput.value.trim().toLowerCase();

  state.filtered = state.places.filter(place => {
    const cityOk = city === 'all' || place.city === city;
    const cuisineOk = cuisine === 'all' || place.food_type === cuisine;
    const haystack = [place.name, place.area, place.area_ko, place.food_type, place.user_note, place.cuisine, place.city_ko].join(' ').toLowerCase();
    const searchOk = !term || haystack.includes(term);
    return cityOk && cuisineOk && searchOk;
  });

  if (state.activePlace && !state.filtered.some(place => place.name === state.activePlace.name)) {
    closeDetail();
  }

  renderMarkers();
  renderList();
  updateResultMeta();
}

function renderMarkers() {
  clearMarkers(state.markers);
  state.markers = [];

  const bounds = new google.maps.LatLngBounds();
  let hasBounds = false;

  state.filtered.forEach(place => {
    const marker = new google.maps.Marker({
      position: { lat: place.lat, lng: place.lon },
      map: state.map,
      title: place.name,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: markerColor(place),
        fillOpacity: 0.95,
        strokeColor: '#0b1220',
        strokeWeight: 2,
      },
      zIndex: place.location_precision === 'exact' ? 40 : 30,
    });
    marker.addListener('click', () => focusPlace(place, marker));
    state.markers.push(marker);
    bounds.extend(marker.getPosition());
    hasBounds = true;
  });

  LANDMARKS.filter(spot => cityFilter.value === 'all' || spot.city === cityFilter.value).forEach(spot => {
    bounds.extend({ lat: spot.lat, lng: spot.lon });
    hasBounds = true;
  });

  if (state.userMarker && state.currentPosition) {
    bounds.extend({ lat: state.currentPosition.lat, lng: state.currentPosition.lon });
    hasBounds = true;
  }

  if (hasBounds) {
    state.map.fitBounds(bounds, 64);
    if (state.filtered.length === 1) state.map.setZoom(15);
  }
}

function renderList() {
  placeList.innerHTML = '';
  if (!state.filtered.length) {
    placeList.innerHTML = '<p class="empty-state">조건에 맞는 장소가 없어. 검색어를 바꾸거나 도시 필터를 풀어봐.</p>';
    return;
  }

  state.filtered.forEach(place => {
    const fragment = cardTemplate.content.cloneNode(true);
    fragment.querySelector('.card-area').textContent = `${place.city_ko} · ${place.area_ko}`;
    fragment.querySelector('.card-title').textContent = place.name;
    fragment.querySelector('.card-rank').textContent = place.rank || (place.status === 'closed_or_uncertain' ? '주의' : '추천');
    fragment.querySelector('.card-food').textContent = place.food_type;
    fragment.querySelector('.card-note').textContent = place.user_note || '메모 없음';
    const meta = fragment.querySelector('.card-meta');
    meta.appendChild(makeChip(locationLabel(place), `status-${place.status}`));
    if (state.currentPosition) meta.appendChild(makeChip(distanceLabel(place), ''));
    if (place.area && place.area !== 'unknown') meta.appendChild(makeChip(place.area_ko, ''));

    const card = fragment.querySelector('.place-card');
    if (state.activePlace?.name === place.name) card.classList.add('active');
    card.addEventListener('click', () => {
      state.map.panTo({ lat: place.lat, lng: place.lon });
      if (state.map.getZoom() < 15) state.map.setZoom(15);
      closeAllPanels();
      openDetail(place);
    });
    placeList.appendChild(fragment);
  });
}

function updateResultMeta() {
  const exact = state.filtered.filter(place => place.location_precision === 'exact').length;
  const currentCity = cityFilter.value === 'all' ? '전체' : cityLabel(cityFilter.value);
  resultMeta.textContent = `${currentCity} ${state.filtered.length}곳 · 정확 위치 ${exact}곳`;
}

function focusPlace(place, marker) {
  state.infoWindow.setContent(`
    <div style="min-width:160px">
      <b>${escapeHtml(place.name)}</b><br>
      ${escapeHtml(place.food_type)}<br>
      ${escapeHtml(locationLabel(place))}<br>
      <span>${escapeHtml(place.city_ko)} · ${escapeHtml(place.area_ko)}</span>
    </div>
  `);
  state.infoWindow.open({ anchor: marker, map: state.map });
  closeAllPanels();
  openDetail(place);
}

function openDetail(place) {
  state.activePlace = place;
  detailSheet.classList.remove('hidden');
  detailContent.innerHTML = `
    <p class="card-area">${place.city_ko} · ${place.area_ko}</p>
    <h2>${escapeHtml(place.name)}</h2>
    <p class="${'status-' + place.status}">${locationLabel(place)}</p>
    <p><b>음식:</b> ${escapeHtml(place.food_type)}</p>
    <p>${escapeHtml(place.user_note || '메모 없음')}</p>
    ${state.currentPosition ? `<p><b>현재 위치 기준:</b> ${distanceLabel(place)}</p>` : '<p><b>거리:</b> 위치 권한 허용 시 표시</p>'}
    <p><b>도시:</b> ${place.city_ko}</p>
    <p><b>지역:</b> ${place.area_ko}</p>
    <p><b>지도 메모:</b> ${place.location_precision === 'exact' ? '정확한 가게 좌표' : '대략적인 상권/동네 기준 좌표'}</p>
    <div class="detail-actions">
      <a href="${place.google_maps_uri || ('https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(place.maps_query))}" target="_blank" rel="noreferrer">Google Maps에서 열기</a>
      <a class="secondary" href="https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lon}&travelmode=walking" target="_blank" rel="noreferrer">도보 경로</a>
    </div>
    ${place.source_url ? `<p><a href="${place.source_url}" target="_blank" rel="noreferrer">좌표 참고 출처</a></p>` : ''}
  `;
  renderList();
}

function closeDetail() {
  state.activePlace = null;
  detailSheet.classList.add('hidden');
  state.infoWindow?.close();
  renderList();
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
      if (state.userMarker) state.userMarker.setMap(null);
      state.userMarker = new google.maps.Marker({
        position: { lat: coords.latitude, lng: coords.longitude },
        map: state.map,
        title: '현재 위치',
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 9,
          fillColor: '#4dd0ff',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 3,
        },
        zIndex: 60,
      });
      renderList();
      renderMarkers();
      if (state.activePlace) openDetail(state.activePlace);
      locateBtn.disabled = false;
      locateBtn.textContent = '내 위치';
    },
    () => {
      locateBtn.disabled = false;
      locateBtn.textContent = '내 위치';
      alert('위치 권한이 거부되었거나 확인 실패');
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
  );
}

function clearMarkers(markers) {
  markers.forEach(marker => marker.setMap(null));
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

function cityLabel(city) {
  return city === 'Kyoto' ? '교토' : city === 'Osaka' ? '오사카' : city;
}

function displayArea(area) {
  const map = {
    unknown: '지역 추가확인중',
    multiple: '여러 지점',
    Namba: '난바',
    Umeda: '우메다',
    Tennoji: '텐노지',
    Sennichimae: '센니치마에',
    'Den Den Town': '덴덴타운',
    Abiko: '아비코',
    Shinsekai: '신세카이',
    Hommachi: '혼마치',
    Gion: '기온',
    Arashiyama: '아라시야마',
    Pontocho: '폰토초',
    'Kyoto Station': '교토역',
    'Tenjinbashisuji?': '텐진바시스지 추정',
    Tenjinbashisuji: '텐진바시스지',
    Ebisucho: '에비스초',
    Temmabashi: '덴마바시',
    Dotonbori: '도톤보리',
    Shinsaibashi: '신사이바시',
  };
  return map[area] || area;
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
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function makeChip(text, klass) {
  const span = document.createElement('span');
  span.className = `meta-chip ${klass}`.trim();
  span.textContent = text;
  return span;
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}

(function loadGoogleMaps() {
  if (window.google?.maps) {
    window.initGoogleFoodMap();
    return;
  }
  const script = document.createElement('script');
  script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&language=ko&region=KR&callback=initGoogleFoodMap`;
  script.async = true;
  script.defer = true;
  script.onerror = () => {
    placeList.innerHTML = '<p class="empty-state">Google Maps 로딩 실패</p>';
  };
  document.head.appendChild(script);
})();
