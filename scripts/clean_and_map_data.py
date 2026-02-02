# -*- coding: utf-8 -*-
"""
데이터 정리 및 매핑 전략
1. 묵논습지 제외 (관광지 아님)
2. 소규모 공원 필터 (면적 기준)
3. 생태계서비스 점수 매핑 (시군구+읍면동 기준)
4. 좌표 근접 중복 제거
"""
import json
import os
import sys
import math
from collections import defaultdict

sys.stdout.reconfigure(encoding='utf-8')

data_dir = 'C:/work-space/within-front/data/climate_api_raw'
spots_file = 'C:/work-space/within-front/src/data/spots/map-spots.json'

# ========== 1. 제외할 타입 정의 ==========
EXCLUDE_TYPES = [
    '목본 우점 묵논습지',
    '초본 우점 묵논',
    '목본 우점 묵논',
    '초본 우점 묵논습지',
    '산지습지',
]

# 포함할 타입 (관광/탐험 가치있는 것들)
INCLUDE_TYPES = [
    '도립공원', '군립공원', '국립공원',
    '근린 및 주제공원', '도시공원', '호수공원', '생태공원', '수변공원',
    '식물원 및 수목원', '수목원', '식물원', '수생식물원',
    '테마공원', '예술공원', '평화공원',
    '국가하천', '경관보호지역',
    '문화유산', '사찰', '예술마을',
    '자연명소', '섬', '섬/공원', '섬/해변', '섬/어촌', '해변',
]

# ========== 2. 면적 기준 ==========
MIN_AREA_SQM = 5000  # 5000m² 이상만 (작은 어린이공원 제외)

# ========== 3. 좌표 근접 기준 (중복 제거) ==========
DISTANCE_THRESHOLD_KM = 0.1  # 100m 이내면 중복으로 간주

def haversine(lat1, lon1, lat2, lon2):
    """두 좌표간 거리 계산 (km)"""
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
    c = 2 * math.asin(math.sqrt(a))
    return R * c

def load_ecosystem_scores():
    """생태계서비스 점수 로드 (시군구+읍면동 기준)"""
    with open(os.path.join(data_dir, 'ecosys_srvc_scr.json'), 'r', encoding='utf-8') as f:
        data = json.load(f)

    scores = {}
    for feat in data.get('features', []):
        props = feat.get('properties', {})
        key = f"{props.get('sgg_nm', '')}_{props.get('stdg_nm', '')}"
        scores[key] = {
            'temp_reduction': props.get('uhtln_dcrs_scr', 0),  # 도시열섬감소
            'carbon_storage': props.get('cbn_strg_scr', 0),    # 탄소저장
            'carbon_absorb': props.get('cbn_abpn_scr', 0),     # 탄소흡수
            'air_quality': props.get('air_ajst_scr', 0),       # 대기조절
            'water_quality': props.get('wtqy_purn_scr', 0),    # 수질정화
            'biodiversity': props.get('bird_dvsty_scr', 0),    # 생물다양성
            'habitat_quality': props.get('hbtt_qlty_scr', 0),  # 서식지품질
            'total_score': props.get('ecosys_srvc_scr', 0),    # 종합점수
        }
    return scores

def find_best_match_score(district, eco_scores):
    """시군구명으로 가장 적합한 생태점수 찾기"""
    if not district:
        return None

    # 정확한 매칭 시도
    for key, score in eco_scores.items():
        if district in key:
            return score

    # 시군구명만으로 평균 계산
    matching = [s for k, s in eco_scores.items() if district.replace('시', '').replace('군', '') in k]
    if matching:
        avg_score = {}
        for field in matching[0].keys():
            values = [s[field] for s in matching if s[field]]
            avg_score[field] = sum(values) / len(values) if values else 0
        return avg_score

    return None

def main():
    print('=' * 60)
    print('데이터 정리 및 매핑')
    print('=' * 60)

    # 현재 스팟 로드
    with open(spots_file, 'r', encoding='utf-8') as f:
        data = json.load(f)

    original_count = len(data.get('spots', []))
    print(f'\n원본 스팟: {original_count}개')

    # 생태계 점수 로드
    eco_scores = load_ecosystem_scores()
    print(f'생태계 점수 데이터: {len(eco_scores)}개 지역')

    # ========== 필터링 ==========
    filtered_spots = []
    excluded_by_type = 0
    excluded_by_area = 0

    for spot in data.get('spots', []):
        spot_type = spot.get('type', '')
        area = spot.get('area_sqm', 0)

        # 1. 타입 필터
        if spot_type in EXCLUDE_TYPES:
            excluded_by_type += 1
            continue

        # 2. 면적 필터 (famous는 제외)
        if not spot.get('famous') and area and area < MIN_AREA_SQM:
            excluded_by_area += 1
            continue

        filtered_spots.append(spot)

    print(f'\n필터링 결과:')
    print(f'  - 타입 제외: {excluded_by_type}개 (묵논습지 등)')
    print(f'  - 면적 제외: {excluded_by_area}개 (<{MIN_AREA_SQM}m²)')
    print(f'  - 남은 스팟: {len(filtered_spots)}개')

    # ========== 중복 제거 (좌표 근접) ==========
    unique_spots = []
    for spot in filtered_spots:
        lat = spot.get('location', {}).get('lat', 0)
        lng = spot.get('location', {}).get('lng', 0)

        is_duplicate = False
        for existing in unique_spots:
            ex_lat = existing.get('location', {}).get('lat', 0)
            ex_lng = existing.get('location', {}).get('lng', 0)

            if haversine(lat, lng, ex_lat, ex_lng) < DISTANCE_THRESHOLD_KM:
                # 더 좋은 데이터 유지 (famous 우선, 이름 있는 것 우선)
                if spot.get('famous') and not existing.get('famous'):
                    unique_spots.remove(existing)
                    unique_spots.append(spot)
                is_duplicate = True
                break

        if not is_duplicate:
            unique_spots.append(spot)

    print(f'  - 중복 제거 후: {len(unique_spots)}개')

    # ========== 생태계 점수 매핑 ==========
    mapped_count = 0
    for spot in unique_spots:
        district = spot.get('district', '')
        eco_data = find_best_match_score(district, eco_scores)

        if eco_data:
            spot['ecoScores'] = eco_data
            mapped_count += 1

    print(f'  - 생태점수 매핑: {mapped_count}개')

    # ========== 타입별 통계 ==========
    print(f'\n=== 정리 후 타입별 분포 ===')
    types = defaultdict(int)
    for s in unique_spots:
        types[s.get('type', 'unknown')] += 1

    for t, cnt in sorted(types.items(), key=lambda x: -x[1])[:15]:
        print(f'  {t}: {cnt}개')

    # ========== 샘플 출력 ==========
    print(f'\n=== 샘플 데이터 (생태점수 매핑됨) ===')
    for spot in unique_spots[:5]:
        if spot.get('ecoScores'):
            eco = spot['ecoScores']
            print(f"  {spot['name']} ({spot.get('district', '')})")
            print(f"    - 온도저감: {eco['temp_reduction']:.1f}점")
            print(f"    - 탄소저장: {eco['carbon_storage']:.1f}점")
            print(f"    - 생물다양성: {eco['biodiversity']:.1f}점")

    # ========== 저장 ==========
    output = {
        'total': len(unique_spots),
        'filtered_from': original_count,
        'eco_mapped': mapped_count,
        'spots': unique_spots,
    }

    output_file = 'C:/work-space/within-front/src/data/spots/map-spots-cleaned.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f'\n저장 완료: {output_file}')
    print(f'최종: {len(unique_spots)}개 스팟 (원본 {original_count}개에서 정리)')

if __name__ == '__main__':
    main()
