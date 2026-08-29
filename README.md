# Osaka Kyoto Food Map

모바일에서 보기 좋은 오사카/교토 맛집 지도 웹앱.

## 포함 내용
- 원본 메모 Markdown 저장
- 정리된 장소 데이터 JSON
- Leaflet + OpenStreetMap 기반 지도
- 현재 위치 기준 거리 계산
- Google Maps 검색/길찾기 링크
- exact pin / area pin / 폐업-불명 구분

## 로컬 실행
```bash
cd /Users/hakvision/osaka-kyoto-food-map/site
python3 -m http.server 8127
```
브라우저에서:
- http://127.0.0.1:8127

## 파일 구조
- `data/raw-notes.md` : 원본 메모
- `data/places.todo.json` : 정규화 초안
- `data/places.json` : 앱에 투입할 데이터 원본
- `content/osaka-kyoto-food-guide.md` : 설명용 Markdown
- `site/` : 실제 웹앱
- `research/sources.md` : 확인한 출처 메모
- `docs/plans/` : 계획 문서

## 배포 목표
- GitHub Pages 같은 정적 호스팅
- 실제 공개 URL에서 모바일 동작까지 검증
