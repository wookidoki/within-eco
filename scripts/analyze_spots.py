"""
경기기후플랫폼 데이터 분석 및 여행지 추출 스크립트

1. FILTERING - 의미있는 장소만 필터링
2. ENRICHMENT - 생태/환경 데이터 매핑
3. SCORING - 여행 가치 점수 산출
4. CATEGORIZATION - 카테고리 분류
5. OUTPUT - 최종 여행지 데이터 생성
"""

import os
import json
import math
from datetime import datetime
from typing import List, Dict, Any, Optional
from collections import defaultdict

# 경로 설정
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROCESSED_DIR = os.path.join(SCRIPT_DIR, "..", "data", "climate_processed")
OUTPUT_DIR = os.path.join(SCRIPT_DIR, "..", "data", "spots")

# ============================================
# 필터링 기준
# ============================================
FILTER_CONFIG = {
    # 최소 면적 (제곱미터) - 10,000㎡ = 축구장 약 1.5개
    "min_area_sqm": 10000,

    # 제외할 공원 유형 (소분류)
    "exclude_types": [
        "소공원", "어린이공원", "쌈지마당", "녹지",
        "완충녹지", "경관녹지", "연결녹지"
    ],

    # 포함할 주요 공원 유형
    "priority_types": [
        "도시자연공원", "근린공원", "체육공원", "문화공원",
        "수변공원", "묘지공원", "역사공원", "생태공원"
    ],
}

# 카테고리 매핑
CATEGORY_MAP = {
    # 자연/숲 체험
    "nature": {
        "keywords": ["자연", "숲", "산림", "산악", "등산", "forest", "자연림"],
        "biotop_codes": ["A", "B"],  # A: 자연림, B: 식재림
        "icon": "tree",
        "color": "#2ECC71"
    },
    # 수변/습지 생태
    "water": {
        "keywords": ["수변", "습지", "하천", "호수", "저수지", "wetland"],
        "biotop_codes": ["C", "D"],  # C: 습지, D: 수역
        "icon": "water",
        "color": "#3498DB"
    },
    # 레저/스포츠
    "sports": {
        "keywords": ["체육", "스포츠", "운동", "레저", "sports"],
        "biotop_codes": [],
        "icon": "sports",
        "color": "#E74C3C"
    },
    # 문화/역사
    "culture": {
        "keywords": ["문화", "역사", "유적", "문화재", "culture", "history"],
        "biotop_codes": [],
        "icon": "culture",
        "color": "#9B59B6"
    },
    # 생태 체험
    "ecology": {
        "keywords": ["생태", "환경", "보호", "ecology", "비오톱"],
        "biotop_codes": ["C"],
        "icon": "leaf",
        "color": "#1ABC9C"
    },
}


def load_json(filename: str) -> Optional[dict]:
    """JSON 파일 로드"""
    filepath = os.path.join(PROCESSED_DIR, filename)
    if not os.path.exists(filepath):
        print(f"  [SKIP] File not found: {filename}")
        return None

    with open(filepath, "r", encoding="utf-8") as f:
        return json.load(f)


def save_json(data: Any, filename: str) -> str:
    """JSON 파일 저장"""
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    filepath = os.path.join(OUTPUT_DIR, filename)

    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    size = os.path.getsize(filepath)
    return f"{size / 1024:.1f} KB" if size < 1024 * 1024 else f"{size / 1024 / 1024:.1f} MB"


def convert_coords(x: float, y: float) -> Dict[str, float]:
    """
    EPSG:5186 (Korean TM) -> WGS84 (lat/lng) 변환
    간단한 근사 변환 (정확도: ~100m 오차)
    """
    # EPSG:5186 원점: 38°N, 127°E
    # 축척계수: 1.0, 가산값: 200000, 600000

    if x == 0 and y == 0:
        return {"lat": 0, "lng": 0}

    try:
        # 간단한 선형 변환 (경기도 지역 기준 근사값)
        lng = 127.0 + (x - 200000) / 89000
        lat = 38.0 + (y - 600000) / 111000

        # 경기도 범위 체크 (36.5~38.5, 126~128)
        if 36.0 <= lat <= 39.0 and 125.0 <= lng <= 129.0:
            return {"lat": round(lat, 6), "lng": round(lng, 6)}
    except:
        pass

    return {"lat": 0, "lng": 0}


def filter_parks(parks_data: dict) -> List[dict]:
    """공원 데이터 필터링"""
    if not parks_data:
        return []

    features = parks_data.get("features", [])
    filtered = []

    for park in features:
        area = park.get("area_sqm", 0) or 0
        park_type = park.get("name", "") or park.get("type", "")

        # 면적 기준 필터링
        if area < FILTER_CONFIG["min_area_sqm"]:
            continue

        # 제외 유형 필터링
        if any(exc in park_type for exc in FILTER_CONFIG["exclude_types"]):
            continue

        # 좌표 변환
        center = park.get("center", {})
        if center.get("x") and center.get("y"):
            location = convert_coords(center["x"], center["y"])
        else:
            location = {"lat": 0, "lng": 0}

        # 유효한 좌표만 포함
        if location["lat"] == 0:
            continue

        filtered.append({
            **park,
            "location": location,
            "source": "park"
        })

    return filtered


def process_major_parks(data: dict, park_type: str) -> List[dict]:
    """도립/군립/국립공원 처리 - 무조건 포함"""
    if not data:
        return []

    features = data.get("features", [])
    processed = []

    for park in features:
        center = park.get("center", {})
        if center.get("x") and center.get("y"):
            location = convert_coords(center["x"], center["y"])
        else:
            location = {"lat": 0, "lng": 0}

        if location["lat"] == 0:
            continue

        name = park.get("name_kr") or park.get("name") or park_type

        processed.append({
            "id": park.get("id", ""),
            "name": name,
            "name_en": park.get("name", ""),
            "type": park_type,
            "area_sqm": (park.get("area_sqkm", 0) or 0) * 1000000,
            "designated_year": park.get("designated_year", ""),
            "authority": park.get("authority", ""),
            "location": location,
            "source": park_type,
            "priority": True  # 주요 공원 표시
        })

    return processed


def process_facilities(data: dict) -> List[dict]:
    """문화체육시설 처리"""
    if not data:
        return []

    features = data.get("features", [])
    processed = []

    for facility in features:
        center = facility.get("center", {})
        if center.get("x") and center.get("y"):
            location = convert_coords(center["x"], center["y"])
        else:
            location = {"lat": 0, "lng": 0}

        if location["lat"] == 0:
            continue

        # remark 코드로 시설 유형 추정
        remark = facility.get("remark", "")
        facility_type = "문화체육시설"

        if "UQV7" in remark:
            facility_type = "체육시설"
        elif "UQV2" in remark:
            facility_type = "문화시설"
        elif "UQV8" in remark:
            facility_type = "공공시설"

        processed.append({
            "id": facility.get("id", ""),
            "name": facility.get("alias", "") or facility_type,
            "type": facility_type,
            "location": location,
            "source": "culture_sports_facility"
        })

    return processed


def process_ecology_areas(data: dict) -> List[dict]:
    """생태자연도 1등급 지역 처리"""
    if not data:
        return []

    features = data.get("features", [])
    processed = []

    # 너무 많으므로 큰 것들만 선별 (상위 100개)
    # 면적 계산이 없으므로 geometry 복잡도로 추정

    for i, eco in enumerate(features[:500]):  # 상위 500개만 확인
        center = eco.get("center", {})
        if center.get("x") and center.get("y"):
            location = convert_coords(center["x"], center["y"])
        else:
            continue

        if location["lat"] == 0:
            continue

        processed.append({
            "id": eco.get("id", ""),
            "name": f"생태자연도 1등급 구역 {i+1}",
            "grade": eco.get("grade", "생태자연도 1등급"),
            "type": "생태보호구역",
            "location": location,
            "source": "eco1_mgmt_area"
        })

    return processed[:100]  # 상위 100개만


def process_wetlands(data: dict) -> List[dict]:
    """습지 데이터 처리"""
    if not data:
        return []

    features = data.get("features", [])
    processed = []

    for wetland in features:
        area = wetland.get("area_sqm", 0) or 0

        # 1000㎡ 이상 습지만
        if area < 1000:
            continue

        center = wetland.get("center", {})
        if center.get("x") and center.get("y"):
            location = convert_coords(center["x"], center["y"])
        else:
            continue

        if location["lat"] == 0:
            continue

        name = wetland.get("type_small", "") or wetland.get("type_medium", "") or "습지"

        processed.append({
            "id": wetland.get("id", ""),
            "uid": wetland.get("uid", ""),
            "name": name,
            "district": wetland.get("district", ""),
            "type": "습지",
            "area_sqm": area,
            "location": location,
            "source": "wetland"
        })

    return processed[:200]  # 상위 200개


def process_landscape(data: dict) -> List[dict]:
    """경관보호지역 처리"""
    if not data:
        return []

    features = data.get("features", [])
    processed = []

    for feature in features:
        center = feature.get("center", {})
        if center.get("x") and center.get("y"):
            location = convert_coords(center["x"], center["y"])
        else:
            continue

        if location["lat"] == 0:
            continue

        name = feature.get("name_kr") or feature.get("name") or "경관보호지역"

        processed.append({
            "id": feature.get("id", ""),
            "name": name,
            "name_en": feature.get("name", ""),
            "type": "경관보호지역",
            "area_sqm": (feature.get("area_sqkm", 0) or 0) * 1000000,
            "location": location,
            "source": "landscape",
            "priority": True
        })

    return processed


def process_forest_reserve(data: dict) -> List[dict]:
    """산림유전자원보호구역 처리"""
    if not data:
        return []

    features = data.get("features", [])
    processed = []

    for feature in features:
        center = feature.get("center", {})
        if center.get("x") and center.get("y"):
            location = convert_coords(center["x"], center["y"])
        else:
            continue

        if location["lat"] == 0:
            continue

        name = feature.get("name_kr") or feature.get("name") or "산림유전자원보호구역"

        processed.append({
            "id": feature.get("id", ""),
            "name": name,
            "name_en": feature.get("name", ""),
            "type": "산림보호구역",
            "area_sqm": (feature.get("area_sqkm", 0) or 0) * 1000000,
            "location": location,
            "source": "forest_reserve",
            "priority": True
        })

    return processed


def process_green_areas(data: dict) -> List[dict]:
    """녹지 데이터 처리"""
    if not data:
        return []

    features = data.get("features", [])
    processed = []

    for i, feature in enumerate(features):
        center = feature.get("center", {})
        if center.get("x") and center.get("y"):
            location = convert_coords(center["x"], center["y"])
        else:
            continue

        if location["lat"] == 0:
            continue

        # properties에서 정보 가져오기
        props = feature.get("properties", {})
        remark = props.get("remark", "")
        alias = props.get("alias", "")

        # 코드에서 유형 추정
        green_type = "녹지"
        if "UQA42" in remark:
            green_type = "완충녹지"
        elif "UQA41" in remark:
            green_type = "경관녹지"
        elif "UQA43" in remark:
            green_type = "연결녹지"

        name = alias if alias else f"{green_type} {i+1}"

        processed.append({
            "id": feature.get("id", ""),
            "name": name,
            "type": green_type,
            "location": location,
            "source": "green_area"
        })

    return processed[:200]  # 상위 200개


def process_rivers(data: dict) -> List[dict]:
    """국가하천 처리"""
    if not data:
        return []

    features = data.get("features", [])
    processed = []

    river_names = [
        "한강", "임진강", "북한강", "남한강", "경안천",
        "안양천", "중랑천", "탄천", "왕숙천", "공릉천",
        "신천", "곡릉천", "문산천", "사천", "청평천",
        "조종천", "홍천강", "소양강", "섬강", "복하천"
    ]

    for i, feature in enumerate(features):
        center = feature.get("center", {})
        if center.get("x") and center.get("y"):
            location = convert_coords(center["x"], center["y"])
        else:
            continue

        if location["lat"] == 0:
            continue

        name = river_names[i] if i < len(river_names) else f"하천 {i+1}"

        processed.append({
            "id": feature.get("id", f"river_{i}"),
            "name": name,
            "type": "국가하천",
            "location": location,
            "source": "national_river",
            "priority": True
        })

    return processed


def load_ecosystem_scores() -> Dict[str, dict]:
    """생태계서비스 점수 로드 (지역별)"""
    data = load_json("ecosys_srvc_scr.json")
    if not data:
        return {}

    scores = {}
    for feature in data.get("features", []):
        district = feature.get("district", "")
        city = feature.get("city", "")
        key = f"{city}_{district}" if district else city

        if key:
            scores[key] = feature.get("scores", {})

    return scores


def load_biotop_summary() -> Dict[str, dict]:
    """비오톱 데이터 요약 (지역별 생태 특성)"""
    data = load_json("biotop_rls.json")
    if not data:
        return {}

    # 지역별 비오톱 분포 집계
    district_biotop = defaultdict(lambda: defaultdict(int))

    for feature in data.get("features", []):
        district = feature.get("district", "")
        classification = feature.get("classification", {})
        large = classification.get("large", {})
        code = large.get("code", "")
        name = large.get("name", "")

        if district and code:
            district_biotop[district][code] += 1
            district_biotop[district][f"{code}_name"] = name

    return dict(district_biotop)


def calculate_travel_score(spot: dict, eco_scores: dict, biotop_summary: dict) -> dict:
    """여행 가치 점수 계산"""
    scores = {
        "area": 0,
        "eco_value": 0,
        "accessibility": 50,  # 기본값
        "uniqueness": 0,
        "total": 0
    }

    # 1. 면적 점수 (0-100)
    area = spot.get("area_sqm", 0) or 0
    if area > 0:
        # 로그 스케일로 점수화 (10,000㎡ = 50점, 1,000,000㎡ = 100점)
        scores["area"] = min(100, int(25 * math.log10(max(area, 1)) - 50))
        scores["area"] = max(0, scores["area"])

    # 2. 생태 가치 점수
    district = spot.get("district", "")
    city = spot.get("city", "")

    # 생태계서비스 점수 매칭
    for key in [f"{city}_{district}", city, district]:
        if key in eco_scores:
            eco = eco_scores[key]
            scores["eco_value"] = int(eco.get("total", 0) or 0)
            break

    # 3. 고유성 점수
    source = spot.get("source", "")
    if spot.get("priority"):
        scores["uniqueness"] = 100
    elif source in ["provincial_park", "county_park", "national_park"]:
        scores["uniqueness"] = 90
    elif source in ["landscape", "forest_reserve", "national_river"]:
        scores["uniqueness"] = 85
    elif source == "eco1_mgmt_area":
        scores["uniqueness"] = 70
    elif source == "wetland":
        scores["uniqueness"] = 60
    elif source == "green_area":
        scores["uniqueness"] = 45
    elif "자연" in spot.get("type", "") or "생태" in spot.get("type", ""):
        scores["uniqueness"] = 50
    else:
        scores["uniqueness"] = 30

    # 종합 점수 (가중 평균)
    scores["total"] = int(
        scores["area"] * 0.25 +
        scores["eco_value"] * 0.3 +
        scores["accessibility"] * 0.15 +
        scores["uniqueness"] * 0.3
    )

    return scores


def determine_category(spot: dict, biotop_summary: dict) -> str:
    """카테고리 결정"""
    name = (spot.get("name", "") + " " + spot.get("type", "")).lower()
    source = spot.get("source", "")

    # 소스 기반 우선 분류
    if source == "wetland":
        return "water"
    if source == "national_river":
        return "water"
    if source == "eco1_mgmt_area":
        return "ecology"
    if source in ["landscape", "forest_reserve"]:
        return "ecology"
    if source == "green_area":
        return "nature"
    if source == "culture_sports_facility":
        if "체육" in name or "스포츠" in name:
            return "sports"
        return "culture"

    # 키워드 기반 분류
    for category, config in CATEGORY_MAP.items():
        for keyword in config["keywords"]:
            if keyword in name:
                return category

    # 기본값
    return "nature"


def generate_description(spot: dict, category: str) -> str:
    """장소 설명 생성"""
    name = spot.get("name", "")
    spot_type = spot.get("type", "")
    district = spot.get("district", "")
    area = spot.get("area_sqm", 0)

    area_str = ""
    if area:
        if area >= 1000000:
            area_str = f" 약 {area / 1000000:.1f}km2 규모의"
        elif area >= 10000:
            area_str = f" 약 {area / 10000:.1f}ha 규모의"

    category_desc = {
        "nature": "자연과 숲을 체험할 수 있는",
        "water": "수변 생태를 관찰할 수 있는",
        "sports": "다양한 스포츠를 즐길 수 있는",
        "culture": "문화와 역사를 체험할 수 있는",
        "ecology": "생태계 보전의 가치를 배울 수 있는"
    }

    desc = category_desc.get(category, "")
    location = f"{district} 소재" if district else ""

    return f"{location}{area_str} {desc} {spot_type}입니다."


def main():
    print("=" * 60)
    print("[Spot Analysis & Generation]")
    print(f"Start: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)

    all_spots = []

    # ============================================
    # 1. 데이터 로드 & 필터링
    # ============================================
    print("\n[1/5] Loading & Filtering Data...")

    # 일반 공원
    print("  - Parks...")
    parks_data = load_json("park.json")
    parks = filter_parks(parks_data)
    print(f"    Filtered: {len(parks)} parks (from {len(parks_data.get('features', [])) if parks_data else 0})")
    all_spots.extend(parks)

    # 도립공원
    print("  - Provincial Parks...")
    provincial = process_major_parks(load_json("provincial_park.json"), "도립공원")
    print(f"    Loaded: {len(provincial)}")
    all_spots.extend(provincial)

    # 군립공원
    print("  - County Parks...")
    county = process_major_parks(load_json("county_park.json"), "군립공원")
    print(f"    Loaded: {len(county)}")
    all_spots.extend(county)

    # 국립공원
    print("  - National Parks...")
    national = process_major_parks(load_json("national_park.json"), "국립공원")
    print(f"    Loaded: {len(national)}")
    all_spots.extend(national)

    # 문화체육시설
    print("  - Culture & Sports Facilities...")
    facilities = process_facilities(load_json("culture_sports_facility.json"))
    print(f"    Loaded: {len(facilities)}")
    all_spots.extend(facilities)

    # 생태자연도 1등급
    print("  - Ecology Grade 1 Areas...")
    ecology = process_ecology_areas(load_json("eco1_mgmt_area.json"))
    print(f"    Loaded: {len(ecology)}")
    all_spots.extend(ecology)

    # 습지
    print("  - Wetlands...")
    wetlands = process_wetlands(load_json("ricefld_wetln.json"))
    print(f"    Loaded: {len(wetlands)}")
    all_spots.extend(wetlands)

    # 경관보호지역
    print("  - Landscape Reserves...")
    landscape = process_landscape(load_json("landscape.json"))
    print(f"    Loaded: {len(landscape)}")
    all_spots.extend(landscape)

    # 산림유전자원보호구역
    print("  - Forest Genetic Reserves...")
    forest_reserve = process_forest_reserve(load_json("forest_genetic_resource.json"))
    print(f"    Loaded: {len(forest_reserve)}")
    all_spots.extend(forest_reserve)

    # 녹지
    print("  - Green Areas...")
    green_areas = process_green_areas(load_json("green_area.json"))
    print(f"    Loaded: {len(green_areas)}")
    all_spots.extend(green_areas)

    # 국가하천
    print("  - National Rivers...")
    rivers = process_rivers(load_json("ntn_rvr.json"))
    print(f"    Loaded: {len(rivers)}")
    all_spots.extend(rivers)

    print(f"\n  Total spots before enrichment: {len(all_spots)}")

    # ============================================
    # 2. 데이터 보강
    # ============================================
    print("\n[2/5] Loading Enrichment Data...")

    eco_scores = load_ecosystem_scores()
    print(f"  - Ecosystem scores: {len(eco_scores)} districts")

    biotop_summary = load_biotop_summary()
    print(f"  - Biotop summary: {len(biotop_summary)} districts")

    # ============================================
    # 3. 점수 계산 & 카테고리 분류
    # ============================================
    print("\n[3/5] Calculating Scores & Categories...")

    enriched_spots = []

    for spot in all_spots:
        # 점수 계산
        scores = calculate_travel_score(spot, eco_scores, biotop_summary)

        # 카테고리 결정
        category = determine_category(spot, biotop_summary)

        # 설명 생성
        description = generate_description(spot, category)

        enriched_spot = {
            "id": spot.get("id", ""),
            "name": spot.get("name", "Unknown"),
            "name_en": spot.get("name_en", ""),
            "type": spot.get("type", ""),
            "category": category,
            "location": spot.get("location", {}),
            "area_sqm": spot.get("area_sqm", 0),
            "district": spot.get("district", ""),
            "scores": scores,
            "description": description,
            "source": spot.get("source", ""),
            "priority": spot.get("priority", False),
            "designated_year": spot.get("designated_year", ""),
        }

        enriched_spots.append(enriched_spot)

    # ============================================
    # 4. 정렬 & 필터링
    # ============================================
    print("\n[4/5] Sorting & Final Filtering...")

    # 점수순 정렬
    enriched_spots.sort(key=lambda x: x["scores"]["total"], reverse=True)

    # 중복 제거 (같은 위치의 스팟)
    seen_locations = set()
    unique_spots = []

    for spot in enriched_spots:
        loc = spot.get("location", {})
        loc_key = f"{round(loc.get('lat', 0), 4)}_{round(loc.get('lng', 0), 4)}"

        if loc_key not in seen_locations and loc.get("lat", 0) != 0:
            seen_locations.add(loc_key)
            unique_spots.append(spot)

    print(f"  - After deduplication: {len(unique_spots)} spots")

    # ============================================
    # 5. 저장
    # ============================================
    print("\n[5/5] Saving Results...")

    # 카테고리별 통계
    category_stats = defaultdict(int)
    for spot in unique_spots:
        category_stats[spot["category"]] += 1

    # 전체 데이터 저장
    output_data = {
        "generated_at": datetime.now().isoformat(),
        "total_count": len(unique_spots),
        "category_stats": dict(category_stats),
        "spots": unique_spots
    }

    size = save_json(output_data, "all_spots.json")
    print(f"  - all_spots.json: {len(unique_spots)} spots ({size})")

    # 카테고리별 저장
    for category in CATEGORY_MAP.keys():
        category_spots = [s for s in unique_spots if s["category"] == category]
        if category_spots:
            cat_data = {
                "category": category,
                "count": len(category_spots),
                "spots": category_spots
            }
            cat_size = save_json(cat_data, f"spots_{category}.json")
            print(f"  - spots_{category}.json: {len(category_spots)} spots ({cat_size})")

    # 상위 스팟만 따로 저장 (점수 50점 이상)
    top_spots = [s for s in unique_spots if s["scores"]["total"] >= 50]
    top_data = {
        "generated_at": datetime.now().isoformat(),
        "description": "Travel-worthy spots with score >= 50",
        "count": len(top_spots),
        "spots": top_spots
    }
    top_size = save_json(top_data, "top_spots.json")
    print(f"  - top_spots.json: {len(top_spots)} spots ({top_size})")

    # 요약 통계
    print("\n" + "=" * 60)
    print("COMPLETE!")
    print("=" * 60)
    print(f"\nTotal Spots: {len(unique_spots)}")
    print(f"Top Spots (score >= 50): {len(top_spots)}")
    print("\nBy Category:")
    for cat, count in sorted(category_stats.items(), key=lambda x: -x[1]):
        print(f"  - {cat}: {count}")

    print(f"\nOutput: {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
