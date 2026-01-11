# -*- coding: utf-8 -*-
"""
데이터 상호보완 병합
1. 기존 데이터 (생태점수) + Tour API (관광지명) 병합
2. 위치 기반 매칭으로 중복 제거
3. 새로운 Tour API 스팟에 지역 기준 생태점수 매핑
"""
import json
import math
import os
import sys
from datetime import datetime

sys.stdout.reconfigure(encoding='utf-8')

# 파일 경로
EXISTING_FILE = 'C:/work-space/within-front/src/data/spots/map-spots-cleaned.json'
TOUR_FILE = 'C:/work-space/within-front/data/tour_api/gyeonggi_tour.json'
ECO_FILE = 'C:/work-space/within-front/data/climate_api_raw/ecosys_srvc_scr.json'
OUTPUT_FILE = 'C:/work-space/within-front/src/data/spots/map-spots.json'

MATCH_DISTANCE = 0.3  # 300m 이내면 같은 장소


def haversine(lat1, lon1, lat2, lon2):
    """두 좌표간 거리 (km)"""
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
    return R * 2 * math.asin(math.sqrt(a))


def load_eco_scores():
    """생태계 서비스 점수 로드"""
    with open(ECO_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)

    scores_by_district = {}
    for feat in data.get('features', []):
        props = feat.get('properties', {})
        district = props.get('sgg_nm', '')
        if district not in scores_by_district:
            scores_by_district[district] = []

        scores_by_district[district].append({
            'temp_reduction': props.get('uhtln_dcrs_scr', 0),
            'carbon_storage': props.get('cbn_strg_scr', 0),
            'carbon_absorb': props.get('cbn_abpn_scr', 0),
            'air_quality': props.get('air_ajst_scr', 0),
            'water_quality': props.get('wtqy_purn_scr', 0),
            'biodiversity': props.get('bird_dvsty_scr', 0),
            'habitat_quality': props.get('hbtt_qlty_scr', 0),
            'total_score': props.get('ecosys_srvc_scr', 0),
        })

    # 지역별 평균 계산
    avg_scores = {}
    for district, scores in scores_by_district.items():
        avg = {}
        for key in scores[0].keys():
            values = [s[key] for s in scores if s[key]]
            avg[key] = round(sum(values) / len(values), 1) if values else 0
        avg_scores[district] = avg

    return avg_scores


def find_eco_score(district, eco_scores):
    """지역명으로 생태점수 찾기"""
    if not district:
        return None

    # 정확한 매칭
    if district in eco_scores:
        return eco_scores[district]

    # 부분 매칭
    for key in eco_scores:
        if district.replace('시', '').replace('군', '') in key:
            return eco_scores[key]

    return None


def main():
    print('=' * 60)
    print('데이터 상호보완 병합')
    print('=' * 60)

    # 데이터 로드
    with open(EXISTING_FILE, 'r', encoding='utf-8') as f:
        existing = json.load(f)

    with open(TOUR_FILE, 'r', encoding='utf-8') as f:
        tour = json.load(f)

    eco_scores = load_eco_scores()

    print(f'\n입력 데이터:')
    print(f'  - 기존: {len(existing["spots"])}개 (생태점수 O)')
    print(f'  - Tour API: {len(tour["spots"])}개')
    print(f'  - 생태점수 지역: {len(eco_scores)}개')

    # 1. 기존 데이터를 기반으로 시작
    merged = []
    used_tour_ids = set()

    matched_count = 0
    for spot in existing['spots']:
        lat = spot.get('location', {}).get('lat', 0)
        lng = spot.get('location', {}).get('lng', 0)

        # Tour API에서 매칭되는 장소 찾기
        best_match = None
        best_dist = MATCH_DISTANCE

        for tour_spot in tour['spots']:
            tour_lat = tour_spot.get('location', {}).get('lat', 0)
            tour_lng = tour_spot.get('location', {}).get('lng', 0)

            dist = haversine(lat, lng, tour_lat, tour_lng)
            if dist < best_dist:
                best_dist = dist
                best_match = tour_spot

        # 매칭된 경우 Tour API 정보로 보강
        if best_match:
            if not spot.get('famous'):  # famous는 이름 유지
                spot['name'] = best_match.get('name', spot.get('name'))
            spot['thumbnail'] = best_match.get('thumbnail', '')
            spot['address'] = best_match.get('address', spot.get('address', ''))
            spot['tourApiMatched'] = True
            used_tour_ids.add(best_match.get('id'))
            matched_count += 1

        merged.append(spot)

    print(f'\n1단계 - 기존 데이터 보강:')
    print(f'  - Tour API 매칭: {matched_count}개')

    # 2. Tour API에서 새로운 장소 추가
    new_count = 0
    for tour_spot in tour['spots']:
        if tour_spot.get('id') in used_tour_ids:
            continue

        # 관광지만 추가 (음식점, 숙박 제외)
        if tour_spot.get('type') not in ['관광지', '문화시설', '레포츠']:
            continue

        tour_lat = tour_spot.get('location', {}).get('lat', 0)
        tour_lng = tour_spot.get('location', {}).get('lng', 0)

        # 기존 데이터와 거리 체크
        is_new = True
        for existing_spot in merged:
            ex_lat = existing_spot.get('location', {}).get('lat', 0)
            ex_lng = existing_spot.get('location', {}).get('lng', 0)

            if haversine(tour_lat, tour_lng, ex_lat, ex_lng) < MATCH_DISTANCE:
                is_new = False
                break

        if is_new:
            # 생태점수 매핑
            district = tour_spot.get('district', '')
            eco = find_eco_score(district, eco_scores)
            if eco:
                tour_spot['ecoScores'] = eco

            tour_spot['source'] = 'tour_api'
            tour_spot['category'] = 'nature'
            merged.append(tour_spot)
            new_count += 1

    print(f'\n2단계 - 새 장소 추가:')
    print(f'  - Tour API 추가: {new_count}개')

    # 3. 통계
    print(f'\n=== 최종 결과 ===')
    print(f'총 스팟: {len(merged)}개')

    # 타입별
    types = {}
    for s in merged:
        t = s.get('type', 'unknown')
        types[t] = types.get(t, 0) + 1

    print(f'\n타입별 분포:')
    for t, cnt in sorted(types.items(), key=lambda x: -x[1])[:12]:
        print(f'  {t}: {cnt}개')

    # 생태점수 매핑 현황
    eco_mapped = len([s for s in merged if s.get('ecoScores')])
    print(f'\n생태점수 매핑: {eco_mapped}개 ({eco_mapped*100//len(merged)}%)')

    # 4. 저장
    output = {
        'total': len(merged),
        'merged_at': datetime.now().isoformat(),
        'sources': {
            'existing': len(existing['spots']),
            'tour_api': new_count,
            'matched': matched_count,
        },
        'spots': merged,
    }

    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f'\n저장 완료: {OUTPUT_FILE}')

    # 5. 샘플
    print(f'\n=== 샘플 데이터 ===')
    for spot in merged[:10]:
        eco = spot.get('ecoScores', {})
        temp = eco.get('temp_reduction', '-')
        print(f"  {spot['name']} ({spot.get('district', '')}) - 온도저감: {temp}")


if __name__ == '__main__':
    main()
