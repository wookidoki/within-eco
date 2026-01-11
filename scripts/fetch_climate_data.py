"""
경기기후플랫폼 API 데이터 크롤링 & 정제 스크립트
- 원본 데이터 저장: data/climate_raw/
- 정제된 데이터 저장: data/climate_processed/

3티어 아키텍처:
- Frontend: React
- Backend: Java
- Data ETL: Python (이 스크립트)
"""

import os
import json
import time
import requests
from datetime import datetime
from typing import List, Dict, Any

# API 설정
BASE_URL = "https://climate.gg.go.kr/ols/api/geoserver/wfs"
API_KEY = "4c58df36-82b2-40b2-b360-6450cca44b1e"

# 저장 경로
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
RAW_DIR = os.path.join(SCRIPT_DIR, "..", "data", "climate_raw")
PROCESSED_DIR = os.path.join(SCRIPT_DIR, "..", "data", "climate_processed")

# 수집할 레이어 목록
LAYERS = {
    # ============================================
    # 공원/녹지 데이터
    # ============================================
    "park": {
        "typeName": "spggcee:park",
        "name": "공원",
        "category": "parks",
        "maxFeatures": None,
    },
    "provincial_park": {
        "typeName": "spggcee:provincial_park",
        "name": "도립공원",
        "category": "parks",
        "maxFeatures": None,
    },
    "county_park": {
        "typeName": "spggcee:county_park",
        "name": "군립공원",
        "category": "parks",
        "maxFeatures": None,
    },
    "national_park": {
        "typeName": "spggcee:national_park",
        "name": "국립공원",
        "category": "parks",
        "maxFeatures": None,
    },
    "green_area": {
        "typeName": "spggcee:green_area",
        "name": "녹지",
        "category": "parks",
        "maxFeatures": None,
    },
    "landscape": {
        "typeName": "spggcee:landscape",
        "name": "경관",
        "category": "parks",
        "maxFeatures": None,
    },

    # ============================================
    # 시설 데이터
    # ============================================
    "culture_sports_facility": {
        "typeName": "spggcee:culture_sports_facility",
        "name": "문화체육시설",
        "category": "facilities",
        "maxFeatures": None,
    },
    "health_facility": {
        "typeName": "spggcee:health_facility",
        "name": "건강시설",
        "category": "facilities",
        "maxFeatures": None,
    },

    # ============================================
    # 생태/환경 데이터
    # ============================================
    "eco1_mgmt_area": {
        "typeName": "spggcee:eco1_mgmt_area",
        "name": "생태자연도_1등급",
        "category": "ecology",
        "maxFeatures": None,
    },
    "ecosys_srvc_scr": {
        "typeName": "spggcee:ecosys_srvc_scr",
        "name": "생태계서비스_점수",
        "category": "ecology",
        "maxFeatures": None,
    },
    "ricefld_wetln": {
        "typeName": "spggcee:ricefld_wetln",
        "name": "묵논습지",
        "category": "ecology",
        "maxFeatures": None,
    },
    "forest_genetic_resource": {
        "typeName": "spggcee:forest_genetic_resource_protection_area",
        "name": "산림유전자원보호구역",
        "category": "ecology",
        "maxFeatures": None,
    },

    # ============================================
    # 수계 데이터
    # ============================================
    "ntn_rvr": {
        "typeName": "spggcee:ntn_rvr",
        "name": "국가하천",
        "category": "water",
        "maxFeatures": None,
    },

    # ============================================
    # 비오톱 (대용량 - 샘플링)
    # ============================================
    "biotop_rls": {
        "typeName": "spggcee:biotop_rls",
        "name": "비오톱",
        "category": "biotop",
        "maxFeatures": 100000,  # 전체 170만개 중 샘플
    },

    # ============================================
    # 탄소 데이터 (대용량 - 샘플링)
    # ============================================
    "forest_cbn_abpvl": {
        "typeName": "spggcee:forest_cbn_abpvl",
        "name": "산림_탄소흡수량",
        "category": "carbon",
        "maxFeatures": 100000,  # 전체 485만개 중 샘플
    },
}


def fetch_layer(type_name: str, max_features: int = None) -> dict:
    """WFS 레이어 데이터 가져오기"""
    params = {
        "apiKey": API_KEY,
        "service": "WFS",
        "version": "1.1.0",
        "request": "GetFeature",
        "typeName": type_name,
        "outputFormat": "application/json",
    }

    if max_features:
        params["maxFeatures"] = max_features

    response = requests.get(BASE_URL, params=params, timeout=600)
    response.raise_for_status()

    return response.json()


def save_json(data: Any, filepath: str) -> str:
    """JSON 파일 저장"""
    os.makedirs(os.path.dirname(filepath), exist_ok=True)

    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    size = os.path.getsize(filepath)
    return f"{size / 1024 / 1024:.2f} MB" if size > 1024 * 1024 else f"{size / 1024:.2f} KB"


# ============================================
# 데이터 정제 함수들
# ============================================

def process_park(features: List[dict]) -> List[dict]:
    """공원 데이터 정제"""
    processed = []
    for f in features:
        props = f.get("properties", {})
        geom = f.get("geometry", {})

        # 중심점 계산 (Polygon의 경우)
        center = calculate_center(geom)

        processed.append({
            "id": f.get("id", ""),
            "uid": props.get("uid", ""),
            "name": props.get("sclsf_nm", "공원"),  # 소분류명
            "type": props.get("mclsf_nm", ""),      # 중분류명
            "category": props.get("lclsf_nm", ""),  # 대분류명
            "district": props.get("sgg_nm", ""),    # 시군구
            "area_sqm": props.get("biotop_area", 0),
            "center": center,
            "geometry": geom,
        })
    return processed


def process_provincial_county_park(features: List[dict]) -> List[dict]:
    """도립/군립공원 데이터 정제"""
    processed = []
    for f in features:
        props = f.get("properties", {})
        geom = f.get("geometry", {})
        center = calculate_center(geom)

        processed.append({
            "id": f.get("id", ""),
            "wdpaid": props.get("wdpaid", ""),
            "name": props.get("name", ""),
            "name_kr": props.get("orig_name", ""),
            "type": props.get("desig_eng", ""),
            "iucn_category": props.get("iucn_cat", ""),
            "area_sqkm": props.get("rep_area", 0),
            "designated_year": props.get("status_yr", ""),
            "authority": props.get("mang_auth", ""),
            "center": center,
            "geometry": geom,
        })
    return processed


def process_culture_sports(features: List[dict]) -> List[dict]:
    """문화체육시설 데이터 정제"""
    processed = []
    for f in features:
        props = f.get("properties", {})
        geom = f.get("geometry", {})
        center = calculate_center(geom)

        processed.append({
            "id": f.get("id", ""),
            "mnum": props.get("mnum", ""),
            "remark": props.get("remark", ""),
            "alias": props.get("alias", ""),
            "admin_code": props.get("col_adm_se", ""),
            "center": center,
            "geometry": geom,
        })
    return processed


def process_ecology(features: List[dict]) -> List[dict]:
    """생태자연도 데이터 정제"""
    processed = []
    for f in features:
        props = f.get("properties", {})
        geom = f.get("geometry", {})
        center = calculate_center(geom)

        processed.append({
            "id": f.get("id", ""),
            "objectid": props.get("objectid", ""),
            "grade": props.get("se_nm", ""),
            "center": center,
            "geometry": geom,
        })
    return processed


def process_ecosystem_score(features: List[dict]) -> List[dict]:
    """생태계서비스 점수 데이터 정제"""
    processed = []
    for f in features:
        props = f.get("properties", {})
        geom = f.get("geometry", {})
        center = calculate_center(geom)

        processed.append({
            "id": f.get("id", ""),
            "district": props.get("stdg_nm", ""),
            "city": props.get("sgg_nm", ""),
            "region": props.get("sigun_nm", ""),
            "scores": {
                "carbon_storage": props.get("cbn_strg_scr", 0),
                "water_purification": props.get("wtqy_purn_scr", 0),
                "air_regulation": props.get("air_ajst_scr", 0),
                "landscape": props.get("scvl_scr", 0),
                "culture": props.get("cult_srvc_scr", 0),
                "sports": props.get("sprt_srvc_scr", 0),
                "biodiversity": props.get("bird_dvsty_scr", 0),
                "total": props.get("ecosys_srvc_scr", 0),
            },
            "center": center,
            "geometry": geom,
        })
    return processed


def process_wetland(features: List[dict]) -> List[dict]:
    """습지 데이터 정제"""
    processed = []
    for f in features:
        props = f.get("properties", {})
        geom = f.get("geometry", {})
        center = calculate_center(geom)

        processed.append({
            "id": f.get("id", ""),
            "uid": props.get("uid", ""),
            "district": props.get("sgg_nm", ""),
            "type_large": props.get("lclsf_nm", ""),
            "type_medium": props.get("mclsf_nm", ""),
            "type_small": props.get("sclsf_nm", ""),
            "area_sqm": props.get("biotop_area", 0),
            "center": center,
            "geometry": geom,
        })
    return processed


def process_biotop(features: List[dict]) -> List[dict]:
    """비오톱 데이터 정제"""
    processed = []
    for f in features:
        props = f.get("properties", {})
        geom = f.get("geometry", {})
        center = calculate_center(geom)

        processed.append({
            "id": f.get("id", ""),
            "uid": props.get("uid", ""),
            "district": props.get("sgg_nm", ""),
            "classification": {
                "large": {"code": props.get("lclsf_cd", ""), "name": props.get("lclsf_nm", "")},
                "medium": {"code": props.get("mclsf_cd", ""), "name": props.get("mclsf_nm", "")},
                "small": {"code": props.get("sclsf_cd", ""), "name": props.get("sclsf_nm", "")},
                "detail": {"code": props.get("dclsf_cd", ""), "name": props.get("dclsf_nm", "")},
            },
            "area_sqm": props.get("biotop_area", 0),
            "survey_year": props.get("fbctn_yr", ""),
            "center": center,
            "geometry": geom,
        })
    return processed


def process_carbon(features: List[dict]) -> List[dict]:
    """탄소흡수량 데이터 정제"""
    processed = []
    for f in features:
        props = f.get("properties", {})
        geom = f.get("geometry", {})
        center = calculate_center(geom)

        processed.append({
            "id": f.get("id", ""),
            "grid_id": props.get("grid_id", ""),
            "carbon_absorption": props.get("cbn_abpvl", 0),
            "computation_year": props.get("cmpttn_yr", ""),
            "center": center,
            "geometry": geom,
        })
    return processed


def process_river(features: List[dict]) -> List[dict]:
    """하천 데이터 정제"""
    processed = []
    for f in features:
        props = f.get("properties", {})
        geom = f.get("geometry", {})
        center = calculate_center(geom)

        processed.append({
            "id": f.get("id", ""),
            "area_code": props.get("sarea_cd", ""),
            "name": props.get("sarea_nm", ""),
            "center": center,
            "geometry": geom,
        })
    return processed


def process_generic(features: List[dict]) -> List[dict]:
    """일반 데이터 정제 (기본)"""
    processed = []
    for f in features:
        props = f.get("properties", {})
        geom = f.get("geometry", {})
        center = calculate_center(geom)

        processed.append({
            "id": f.get("id", ""),
            "properties": props,
            "center": center,
            "geometry": geom,
        })
    return processed


def calculate_center(geometry: dict) -> dict:
    """Polygon/MultiPolygon의 중심점 계산"""
    if not geometry:
        return {"lat": 0, "lng": 0}

    geom_type = geometry.get("type", "")
    coords = geometry.get("coordinates", [])

    try:
        if geom_type == "Polygon" and coords:
            # 첫 번째 링의 좌표들
            ring = coords[0]
            if ring:
                x_sum = sum(c[0] for c in ring)
                y_sum = sum(c[1] for c in ring)
                count = len(ring)
                return {"x": x_sum / count, "y": y_sum / count}

        elif geom_type == "MultiPolygon" and coords:
            # 첫 번째 폴리곤의 첫 번째 링
            if coords[0] and coords[0][0]:
                ring = coords[0][0]
                x_sum = sum(c[0] for c in ring)
                y_sum = sum(c[1] for c in ring)
                count = len(ring)
                return {"x": x_sum / count, "y": y_sum / count}

    except (IndexError, TypeError, ZeroDivisionError):
        pass

    return {"x": 0, "y": 0}


# 레이어별 정제 함수 매핑
PROCESSORS = {
    "park": process_park,
    "provincial_park": process_provincial_county_park,
    "county_park": process_provincial_county_park,
    "national_park": process_generic,
    "green_area": process_generic,
    "landscape": process_generic,
    "culture_sports_facility": process_culture_sports,
    "health_facility": process_generic,
    "eco1_mgmt_area": process_ecology,
    "ecosys_srvc_scr": process_ecosystem_score,
    "ricefld_wetln": process_wetland,
    "forest_genetic_resource": process_generic,
    "ntn_rvr": process_river,
    "biotop_rls": process_biotop,
    "forest_cbn_abpvl": process_carbon,
}


def main():
    print("=" * 60)
    print("[Climate Data Crawling & Processing]")
    print(f"Start: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)

    os.makedirs(RAW_DIR, exist_ok=True)
    os.makedirs(PROCESSED_DIR, exist_ok=True)

    results = []

    for layer_key, layer_info in LAYERS.items():
        print(f"\n{'-' * 50}")
        print(f"[{layer_info['category']}] {layer_info['name']}")
        print(f"   Layer: {layer_info['typeName']}")

        try:
            # 1. 원본 데이터 가져오기
            start_time = time.time()
            raw_data = fetch_layer(
                layer_info["typeName"],
                layer_info.get("maxFeatures")
            )
            fetch_time = time.time() - start_time

            features = raw_data.get("features", [])
            print(f"   OK: {len(features)} features ({fetch_time:.1f}s)")

            # 2. 원본 저장
            raw_path = os.path.join(RAW_DIR, f"{layer_key}.json")
            raw_size = save_json(raw_data, raw_path)
            print(f"   RAW: {raw_path} ({raw_size})")

            # 3. 데이터 정제
            processor = PROCESSORS.get(layer_key, process_generic)
            processed_features = processor(features)

            processed_data = {
                "layer": layer_key,
                "name": layer_info["name"],
                "category": layer_info["category"],
                "count": len(processed_features),
                "fetched_at": datetime.now().isoformat(),
                "features": processed_features,
            }

            # 4. 정제 데이터 저장
            processed_path = os.path.join(PROCESSED_DIR, f"{layer_key}.json")
            processed_size = save_json(processed_data, processed_path)
            print(f"   PROCESSED: {processed_path} ({processed_size})")

            results.append({
                "layer": layer_key,
                "name": layer_info["name"],
                "category": layer_info["category"],
                "count": len(features),
                "raw_size": raw_size,
                "processed_size": processed_size,
                "status": "success"
            })

            # API 부하 방지
            time.sleep(1)

        except Exception as e:
            print(f"   ERROR: {e}")
            results.append({
                "layer": layer_key,
                "name": layer_info["name"],
                "status": "failed",
                "error": str(e)
            })

    # 요약 저장
    summary = {
        "crawled_at": datetime.now().isoformat(),
        "total_layers": len(LAYERS),
        "success": sum(1 for r in results if r["status"] == "success"),
        "failed": sum(1 for r in results if r["status"] == "failed"),
        "results": results
    }
    save_json(summary, os.path.join(PROCESSED_DIR, "_summary.json"))

    # 결과 출력
    print("\n" + "=" * 60)
    print("COMPLETE!")
    print("=" * 60)
    print(f"Success: {summary['success']}/{summary['total_layers']}")
    print(f"\nRAW DATA: {RAW_DIR}")
    print(f"PROCESSED DATA: {PROCESSED_DIR}")

    print("\n[Summary by Category]")
    categories = {}
    for r in results:
        if r["status"] == "success":
            cat = r.get("category", "unknown")
            if cat not in categories:
                categories[cat] = {"count": 0, "features": 0}
            categories[cat]["count"] += 1
            categories[cat]["features"] += r["count"]

    for cat, info in categories.items():
        print(f"   {cat}: {info['count']} layers, {info['features']:,} features")


if __name__ == "__main__":
    main()
