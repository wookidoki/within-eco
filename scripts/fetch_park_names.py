"""
좌표 기반으로 공원 고유명칭 가져오기
- OpenStreetMap Overpass API 사용 (무료, API 키 불필요)
- 좌표 주변의 공원 검색 후 이름 매핑
"""

import os
import json
import time
import requests
from datetime import datetime

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROCESSED_DIR = os.path.join(SCRIPT_DIR, "..", "data", "climate_processed")
OUTPUT_DIR = os.path.join(SCRIPT_DIR, "..", "src", "data", "spots")

# Overpass API (OpenStreetMap)
OVERPASS_URL = "https://overpass-api.de/api/interpreter"


def fetch_osm_parks_in_gyeonggi():
    """경기도 전체 공원 데이터를 OSM에서 가져오기"""
    print("Fetching parks from OpenStreetMap...")

    # 경기도 범위 (대략적인 bbox)
    # 남쪽: 36.9, 북쪽: 38.3, 서쪽: 126.4, 동쪽: 127.9
    query = """
    [out:json][timeout:120];
    (
      // 공원
      way["leisure"="park"](36.9,126.4,38.3,127.9);
      relation["leisure"="park"](36.9,126.4,38.3,127.9);
      // 자연공원
      way["boundary"="national_park"](36.9,126.4,38.3,127.9);
      relation["boundary"="national_park"](36.9,126.4,38.3,127.9);
      // 도시공원
      way["leisure"="garden"](36.9,126.4,38.3,127.9);
    );
    out center tags;
    """

    try:
        response = requests.post(OVERPASS_URL, data={"data": query}, timeout=180)
        response.raise_for_status()
        data = response.json()

        parks = []
        for element in data.get("elements", []):
            name = element.get("tags", {}).get("name")
            name_ko = element.get("tags", {}).get("name:ko")

            # 이름이 있는 공원만
            park_name = name_ko or name
            if not park_name:
                continue

            # 중심 좌표 가져오기
            if "center" in element:
                lat = element["center"]["lat"]
                lng = element["center"]["lon"]
            elif "lat" in element and "lon" in element:
                lat = element["lat"]
                lng = element["lon"]
            else:
                continue

            parks.append({
                "osm_id": element.get("id"),
                "name": park_name,
                "name_en": name if name != park_name else None,
                "lat": lat,
                "lng": lng,
                "type": element.get("tags", {}).get("leisure") or element.get("tags", {}).get("boundary"),
            })

        print(f"Found {len(parks)} named parks in OSM")
        return parks

    except Exception as e:
        print(f"Error fetching OSM data: {e}")
        return []


def load_current_spots():
    """현재 생성된 스팟 데이터 로드"""
    spots_path = os.path.join(OUTPUT_DIR, "map-spots.json")
    if not os.path.exists(spots_path):
        print("map-spots.json not found")
        return None

    with open(spots_path, "r", encoding="utf-8") as f:
        return json.load(f)


def find_nearest_osm_park(lat, lng, osm_parks, max_distance=0.01):
    """가장 가까운 OSM 공원 찾기 (약 1km 이내)"""
    nearest = None
    min_dist = float("inf")

    for park in osm_parks:
        dist = ((lat - park["lat"]) ** 2 + (lng - park["lng"]) ** 2) ** 0.5
        if dist < min_dist and dist < max_distance:
            min_dist = dist
            nearest = park

    return nearest, min_dist


def map_park_names():
    """기존 스팟에 OSM 공원명 매핑"""
    print("=" * 60)
    print("[Park Name Mapper]")
    print("=" * 60)

    # 1. OSM에서 공원 데이터 가져오기 (캐시 사용)
    osm_cache_path = os.path.join(OUTPUT_DIR, "osm-parks.json")
    if os.path.exists(osm_cache_path):
        print("Loading OSM parks from cache...")
        with open(osm_cache_path, "r", encoding="utf-8") as f:
            osm_data = json.load(f)
            osm_parks = osm_data.get("parks", [])
        print(f"Loaded {len(osm_parks)} parks from cache")
    else:
        osm_parks = fetch_osm_parks_in_gyeonggi()

    if not osm_parks:
        print("No OSM parks found, exiting")
        return

    # 2. 현재 스팟 로드
    spots_data = load_current_spots()
    if not spots_data:
        return

    spots = spots_data.get("spots", [])
    print(f"\nTotal spots to process: {len(spots)}")

    # 3. 공원 타입 스팟만 필터링
    park_spots = [s for s in spots if s.get("category") == "nature"]
    print(f"Nature/Park spots: {len(park_spots)}")

    # 4. 이름 매핑
    mapped_count = 0
    for spot in park_spots:
        loc = spot.get("location", {})
        lat = loc.get("lat")
        lng = loc.get("lng")

        if not lat or not lng:
            continue

        # 이미 고유명칭이 있는 경우 (도립/군립/국립공원)
        current_name = spot.get("name", "")
        if any(keyword in current_name for keyword in ["산", "성", "호", "계곡"]):
            continue  # 이미 의미있는 이름

        # OSM에서 가장 가까운 공원 찾기
        osm_park, dist = find_nearest_osm_park(lat, lng, osm_parks)

        if osm_park:
            old_name = spot["name"]
            spot["name"] = osm_park["name"]
            spot["osm_matched"] = True
            if osm_park.get("name_en"):
                spot["name_en"] = osm_park["name_en"]
            mapped_count += 1
            print(f"  Mapped: {old_name} -> {osm_park['name']}")

    print(f"\nMapped {mapped_count} park names from OSM")

    # 5. 저장
    spots_data["spots"] = spots
    spots_data["osm_mapped_count"] = mapped_count
    spots_data["updated_at"] = datetime.now().isoformat()

    output_path = os.path.join(OUTPUT_DIR, "map-spots.json")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(spots_data, f, ensure_ascii=False, indent=2)

    print(f"\nSaved to {output_path}")

    # 6. OSM 공원 데이터도 별도 저장 (참고용)
    osm_path = os.path.join(OUTPUT_DIR, "osm-parks.json")
    with open(osm_path, "w", encoding="utf-8") as f:
        json.dump({
            "fetched_at": datetime.now().isoformat(),
            "total": len(osm_parks),
            "parks": osm_parks
        }, f, ensure_ascii=False, indent=2)

    print(f"OSM parks saved to {osm_path}")


if __name__ == "__main__":
    map_park_names()
