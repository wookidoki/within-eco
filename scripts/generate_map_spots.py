"""
Re:Earth 지도 표시용 스팟 데이터 생성
- 이름이 명확한 장소만 추출
- 주요 공원 (도립/군립/국립) 우선
- 일반 공원은 대형만 (10만㎡ 이상)
"""

import os
import json
from datetime import datetime
from collections import Counter

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROCESSED_DIR = os.path.join(SCRIPT_DIR, "..", "data", "climate_processed")
OUTPUT_DIR = os.path.join(SCRIPT_DIR, "..", "src", "data", "spots")

# 카테고리 설정
CATEGORIES = {
    "nature": {"icon": "tree", "color": "#27ae60", "label": "자연/공원"},
    "water": {"icon": "water", "color": "#3498db", "label": "하천/습지"},
    "ecology": {"icon": "leaf", "color": "#16a085", "label": "생태보호"},
}

# 경기도 시군 중심 좌표
GYEONGGI_CITIES = [
    {"id": "수원시", "lat": 37.2636, "lng": 127.0286},
    {"id": "성남시", "lat": 37.4200, "lng": 127.1267},
    {"id": "용인시", "lat": 37.2411, "lng": 127.1776},
    {"id": "화성시", "lat": 37.1995, "lng": 126.8313},
    {"id": "고양시", "lat": 37.6584, "lng": 126.8320},
    {"id": "안산시", "lat": 37.3219, "lng": 126.8309},
    {"id": "남양주시", "lat": 37.6360, "lng": 127.2165},
    {"id": "안양시", "lat": 37.3943, "lng": 126.9568},
    {"id": "평택시", "lat": 36.9921, "lng": 127.1129},
    {"id": "시흥시", "lat": 37.3800, "lng": 126.8030},
    {"id": "파주시", "lat": 37.7126, "lng": 126.7618},
    {"id": "김포시", "lat": 37.6153, "lng": 126.7156},
    {"id": "광주시", "lat": 37.4294, "lng": 127.2551},
    {"id": "광명시", "lat": 37.4786, "lng": 126.8646},
    {"id": "군포시", "lat": 37.3614, "lng": 126.9352},
    {"id": "하남시", "lat": 37.5393, "lng": 127.2148},
    {"id": "오산시", "lat": 37.1499, "lng": 127.0773},
    {"id": "이천시", "lat": 37.2723, "lng": 127.4348},
    {"id": "안성시", "lat": 37.0080, "lng": 127.2798},
    {"id": "의왕시", "lat": 37.3449, "lng": 126.9683},
    {"id": "양평군", "lat": 37.4917, "lng": 127.4873},
    {"id": "여주시", "lat": 37.2984, "lng": 127.6373},
    {"id": "과천시", "lat": 37.4292, "lng": 126.9876},
    {"id": "포천시", "lat": 37.8949, "lng": 127.2003},
    {"id": "의정부시", "lat": 37.7381, "lng": 127.0337},
    {"id": "양주시", "lat": 37.7853, "lng": 127.0458},
    {"id": "구리시", "lat": 37.5944, "lng": 127.1295},
    {"id": "가평군", "lat": 37.8315, "lng": 127.5095},
    {"id": "연천군", "lat": 38.0966, "lng": 127.0750},
    {"id": "동두천시", "lat": 37.9035, "lng": 127.0605},
]


def detect_district(lat, lng):
    """좌표를 기반으로 가장 가까운 시군 찾기"""
    if not lat or not lng:
        return ""
    min_distance = float('inf')
    nearest_city = ""
    for city in GYEONGGI_CITIES:
        d = ((lat - city["lat"]) ** 2 + (lng - city["lng"]) ** 2) ** 0.5
        if d < min_distance:
            min_distance = d
            nearest_city = city["id"]
    return nearest_city


def convert_coords(x, y):
    """EPSG:5186 -> WGS84 변환"""
    if x == 0 and y == 0:
        return None
    try:
        lng = 127.0 + (x - 200000) / 89000
        lat = 38.0 + (y - 600000) / 111000
        if 36.0 <= lat <= 39.0 and 125.0 <= lng <= 129.0:
            return {"lat": round(lat, 6), "lng": round(lng, 6)}
    except:
        pass
    return None


def load_json(filename):
    """JSON 파일 로드"""
    filepath = os.path.join(PROCESSED_DIR, filename)
    if not os.path.exists(filepath):
        return None
    with open(filepath, "r", encoding="utf-8") as f:
        return json.load(f)


def process_major_parks():
    """도립/군립/국립공원 - 모두 이름 있음"""
    spots = []

    for filename, park_type in [
        ("provincial_park.json", "도립공원"),
        ("county_park.json", "군립공원"),
        ("national_park.json", "국립공원"),
    ]:
        data = load_json(filename)
        if not data:
            continue

        for park in data.get("features", []):
            center = park.get("center", {})
            location = convert_coords(center.get("x", 0), center.get("y", 0))
            if not location:
                continue

            name = park.get("name_kr") or park.get("name") or park_type

            spots.append({
                "id": park.get("id", ""),
                "name": name,
                "name_en": park.get("name", ""),
                "type": park_type,
                "category": "nature",
                "location": location,
                "area_sqm": (park.get("area_sqkm", 0) or 0) * 1000000,
                "designated_year": park.get("designated_year"),
                "priority": True,
            })

    return spots


def process_large_parks():
    """대형 공원 (3만㎡ 이상) - 지역+타입+번호로 이름 생성"""
    data = load_json("park.json")
    if not data:
        return []

    # 지역+타입별로 그룹화
    parks_by_key = {}

    for park in data.get("features", []):
        area = park.get("area_sqm", 0) or 0
        # 3만㎡(3ha) 이상만
        if area < 30000:
            continue

        center = park.get("center", {})
        location = convert_coords(center.get("x", 0), center.get("y", 0))
        if not location:
            continue

        district = park.get("district", "")
        park_type = park.get("name", "공원")  # name이 사실상 타입

        # 지역+타입 조합으로 키 생성
        key = f"{district}_{park_type}"

        if key not in parks_by_key:
            parks_by_key[key] = []

        parks_by_key[key].append({
            "id": park.get("id", ""),
            "type": park_type,
            "category": "nature",
            "location": location,
            "area_sqm": area,
            "district": district,
        })

    # 이름 생성 (같은 타입이 여러 개면 번호 추가)
    spots = []
    for key, parks in parks_by_key.items():
        # 면적 순으로 정렬
        parks.sort(key=lambda x: -x["area_sqm"])

        for i, park in enumerate(parks):
            if len(parks) == 1:
                name = f"{park['district']} {park['type']}"
            else:
                name = f"{park['district']} {park['type']} {i+1}"

            park["name"] = name
            park["priority"] = park["area_sqm"] >= 100000  # 10만㎡ 이상은 우선순위
            spots.append(park)

    return spots


def process_rivers():
    """국가하천 - 이름 명확함"""
    data = load_json("ntn_rvr.json")
    if not data:
        return []

    # 경기도 주요 하천
    RIVER_NAMES = [
        "한강", "임진강", "북한강", "남한강", "경안천",
        "안양천", "중랑천", "탄천", "왕숙천", "공릉천",
        "신천", "곡릉천", "문산천", "사천", "청평천",
        "조종천", "홍천강", "소양강", "섬강", "복하천"
    ]

    spots = []
    for i, feature in enumerate(data.get("features", [])):
        center = feature.get("center", {})
        location = convert_coords(center.get("x", 0), center.get("y", 0))
        if not location:
            continue

        name = RIVER_NAMES[i] if i < len(RIVER_NAMES) else f"하천 {i+1}"

        spots.append({
            "id": f"river_{i}",
            "name": name,
            "type": "국가하천",
            "category": "water",
            "location": location,
            "priority": True,
        })

    return spots


def process_wetlands():
    """습지 - 지역명 활용"""
    data = load_json("ricefld_wetln.json")
    if not data:
        return []

    # 지역+타입별로 그룹화
    wetlands_by_key = {}

    for wetland in data.get("features", []):
        center = wetland.get("center", {})
        location = convert_coords(center.get("x", 0), center.get("y", 0))
        if not location:
            continue

        area = wetland.get("area_sqm", 0) or 0
        if area < 5000:  # 5천㎡ 이상
            continue

        wetland_type = wetland.get("type_small") or wetland.get("type_medium") or "습지"
        district = wetland.get("district", "") or detect_district(location["lat"], location["lng"])

        key = f"{district}_{wetland_type}"

        if key not in wetlands_by_key:
            wetlands_by_key[key] = []

        wetlands_by_key[key].append({
            "id": wetland.get("id", ""),
            "type": wetland_type,
            "category": "water",
            "location": location,
            "area_sqm": area,
            "district": district,
        })

    # 이름 생성
    spots = []
    for key, wetlands in wetlands_by_key.items():
        wetlands.sort(key=lambda x: -x["area_sqm"])

        for i, w in enumerate(wetlands):
            if len(wetlands) == 1:
                name = f"{w['district']} {w['type']}"
            else:
                name = f"{w['district']} {w['type']} {i+1}"

            w["name"] = name
            w["priority"] = w["area_sqm"] >= 30000  # 3만㎡ 이상은 우선순위
            spots.append(w)

    return spots


def process_special_areas():
    """특별 보호구역 - 이름 있음"""
    spots = []

    # 경관보호지역
    data = load_json("landscape.json")
    if data:
        for feature in data.get("features", []):
            center = feature.get("center", {})
            location = convert_coords(center.get("x", 0), center.get("y", 0))
            if not location:
                continue

            name = feature.get("name_kr") or feature.get("name") or "경관보호지역"
            spots.append({
                "id": feature.get("id", ""),
                "name": name,
                "type": "경관보호지역",
                "category": "ecology",
                "location": location,
                "priority": True,
            })

    # 산림유전자원보호구역
    data = load_json("forest_genetic_resource.json")
    if data:
        for feature in data.get("features", []):
            center = feature.get("center", {})
            location = convert_coords(center.get("x", 0), center.get("y", 0))
            if not location:
                continue

            name = feature.get("name_kr") or feature.get("name") or "산림유전자원보호구역"
            spots.append({
                "id": feature.get("id", ""),
                "name": name,
                "type": "산림보호구역",
                "category": "ecology",
                "location": location,
                "priority": True,
            })

    return spots


def main():
    print("=" * 60)
    print("[Map Spots Generator - v2]")
    print("=" * 60)

    all_spots = []

    print("\n1. Loading data...")

    # 주요 공원 (이름 있음)
    major_parks = process_major_parks()
    print(f"   - Major parks (도립/군립/국립): {len(major_parks)}")
    all_spots.extend(major_parks)

    # 대형 공원 (지역+타입)
    large_parks = process_large_parks()
    print(f"   - Large parks (10ha+): {len(large_parks)}")
    all_spots.extend(large_parks)

    # 하천
    rivers = process_rivers()
    print(f"   - Rivers: {len(rivers)}")
    all_spots.extend(rivers)

    # 습지
    wetlands = process_wetlands()
    print(f"   - Wetlands: {len(wetlands)}")
    all_spots.extend(wetlands)

    # 특별 보호구역
    special = process_special_areas()
    print(f"   - Special areas: {len(special)}")
    all_spots.extend(special)

    print(f"\n   Total: {len(all_spots)} spots")

    # 중복 제거
    print("\n2. Removing duplicates...")
    seen = set()
    unique_spots = []
    for spot in all_spots:
        loc = spot.get("location", {})
        key = f"{round(loc.get('lat', 0), 4)}_{round(loc.get('lng', 0), 4)}"
        if key not in seen:
            seen.add(key)
            unique_spots.append(spot)
    print(f"   After dedup: {len(unique_spots)} spots")

    # 지역 추가
    print("\n3. Adding district info...")
    district_stats = Counter()
    for spot in unique_spots:
        loc = spot.get("location", {})
        if not spot.get("district"):
            spot["district"] = detect_district(loc.get("lat"), loc.get("lng"))
        district_stats[spot["district"]] += 1

    print(f"   Districts: {len(district_stats)}")
    for dist, count in district_stats.most_common(5):
        print(f"   - {dist}: {count}")

    # 통계
    print("\n4. Category stats:")
    cat_stats = Counter(s["category"] for s in unique_spots)
    for cat, count in cat_stats.most_common():
        print(f"   - {cat}: {count}")

    priority_count = sum(1 for s in unique_spots if s.get("priority"))
    print(f"\n   Priority spots: {priority_count}")

    # 저장
    print("\n5. Saving...")
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    output = {
        "generated_at": datetime.now().isoformat(),
        "total": len(unique_spots),
        "priority_count": priority_count,
        "categories": CATEGORIES,
        "stats": dict(cat_stats),
        "spots": unique_spots,
    }

    output_path = os.path.join(OUTPUT_DIR, "map-spots.json")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    size = os.path.getsize(output_path)
    print(f"   Saved: {output_path}")
    print(f"   Size: {size / 1024:.1f} KB")

    # 샘플
    print("\n6. Sample spots:")
    for spot in unique_spots[:10]:
        loc = spot["location"]
        print(f"   - {spot['name']} ({spot['type']}) [{spot.get('district', '')}]")

    print("\n" + "=" * 60)
    print("DONE!")
    print("=" * 60)


if __name__ == "__main__":
    main()
