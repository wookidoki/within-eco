"""
한국관광공사 Tour API에서 경기도 관광지 데이터 수집
- 공원, 생태관광지, 자연명소 등
- 두물머리, 팔당물안개공원 같은 유명 장소 포함
"""

import os
import json
import time
import requests
from datetime import datetime

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_DIR = os.path.join(SCRIPT_DIR, "..", "data", "tour_api")

# 공공데이터포털 Tour API
API_KEY = "6357fc28649954745e2f695ee63a9b4e1a468448f3aa89fec0e2e098f0cc1994"
BASE_URL = "https://apis.data.go.kr/B551011/KorService2"

# 경기도 지역코드
GYEONGGI_CODE = "31"

# 콘텐츠 타입
CONTENT_TYPES = {
    "12": "관광지",
    "14": "문화시설",
    "28": "레포츠",
    "32": "숙박",
    "38": "쇼핑",
    "39": "음식점",
}

# 경기도 시군구 코드
SIGUNGU_CODES = {
    "1": "가평군", "2": "고양시", "3": "과천시", "4": "광명시", "5": "광주시",
    "6": "구리시", "7": "군포시", "8": "김포시", "9": "남양주시", "10": "동두천시",
    "11": "부천시", "12": "성남시", "13": "수원시", "14": "시흥시", "15": "안산시",
    "16": "안성시", "17": "안양시", "18": "양주시", "19": "양평군", "20": "여주시",
    "21": "연천군", "22": "오산시", "23": "용인시", "24": "의왕시", "25": "의정부시",
    "26": "이천시", "27": "파주시", "28": "평택시", "29": "포천시", "30": "하남시",
    "31": "화성시",
}


def fetch_area_based_list(content_type_id="12", num_of_rows=1000):
    """지역 기반 관광정보 조회"""
    url = f"{BASE_URL}/areaBasedList2"

    params = {
        "serviceKey": API_KEY,
        "numOfRows": num_of_rows,
        "pageNo": 1,
        "MobileOS": "ETC",
        "MobileApp": "ReEarth",
        "areaCode": GYEONGGI_CODE,
        "contentTypeId": content_type_id,
        "_type": "json",
    }

    try:
        response = requests.get(url, params=params, timeout=30)
        response.raise_for_status()
        data = response.json()

        items = data.get("response", {}).get("body", {}).get("items", {}).get("item", [])
        if isinstance(items, dict):
            items = [items]
        return items
    except Exception as e:
        print(f"  Error: {e}")
        return []


def fetch_keyword_search(keyword, num_of_rows=100):
    """키워드 검색"""
    url = f"{BASE_URL}/searchKeyword2"

    params = {
        "serviceKey": API_KEY,
        "numOfRows": num_of_rows,
        "pageNo": 1,
        "MobileOS": "ETC",
        "MobileApp": "ReEarth",
        "keyword": keyword,
        "areaCode": GYEONGGI_CODE,
        "_type": "json",
    }

    try:
        response = requests.get(url, params=params, timeout=30)
        response.raise_for_status()
        data = response.json()

        items = data.get("response", {}).get("body", {}).get("items", {}).get("item", [])
        if isinstance(items, dict):
            items = [items]
        return items
    except Exception as e:
        print(f"  Error searching '{keyword}': {e}")
        return []


def process_items(items):
    """Tour API 아이템을 스팟 형식으로 변환"""
    spots = []

    for item in items:
        # 좌표 확인
        lat = item.get("mapy")
        lng = item.get("mapx")
        if not lat or not lng:
            continue

        try:
            lat = float(lat)
            lng = float(lng)
        except:
            continue

        # 경기도 범위 확인
        if not (36.9 <= lat <= 38.3 and 126.4 <= lng <= 127.9):
            continue

        # 시군구 이름 찾기
        sigungu_code = str(item.get("sigungucode", ""))
        district = SIGUNGU_CODES.get(sigungu_code, "")

        spot = {
            "id": f"tour_{item.get('contentid', '')}",
            "name": item.get("title", ""),
            "type": CONTENT_TYPES.get(str(item.get("contenttypeid", "")), "관광지"),
            "category": "nature",  # 기본값
            "location": {
                "lat": lat,
                "lng": lng,
            },
            "district": district,
            "address": item.get("addr1", ""),
            "thumbnail": item.get("firstimage", ""),
            "priority": True,
            "source": "tour_api",
        }

        spots.append(spot)

    return spots


def main():
    print("=" * 60)
    print("[Tour API Data Fetcher]")
    print("경기도 관광지 데이터 수집")
    print("=" * 60)

    os.makedirs(OUTPUT_DIR, exist_ok=True)

    all_items = []

    # 1. 관광지 데이터 가져오기
    print("\n1. 관광지 데이터 조회...")
    items = fetch_area_based_list("12", 1000)
    print(f"   Found: {len(items)} items")
    all_items.extend(items)
    time.sleep(0.5)

    # 2. 키워드 검색으로 추가 데이터
    print("\n2. 키워드 검색...")
    keywords = [
        "공원", "물안개", "두물머리", "팔당", "생태",
        "습지", "수목원", "자연", "호수", "한강",
        "산", "계곡", "폭포", "숲", "하천",
    ]

    for keyword in keywords:
        print(f"   Searching: {keyword}...")
        items = fetch_keyword_search(keyword, 100)
        print(f"   Found: {len(items)} items")
        all_items.extend(items)
        time.sleep(0.3)

    # 3. 중복 제거
    print("\n3. 중복 제거...")
    seen_ids = set()
    unique_items = []
    for item in all_items:
        content_id = item.get("contentid")
        if content_id and content_id not in seen_ids:
            seen_ids.add(content_id)
            unique_items.append(item)

    print(f"   Unique items: {len(unique_items)}")

    # 4. 스팟 형식으로 변환
    print("\n4. 스팟 형식으로 변환...")
    spots = process_items(unique_items)
    print(f"   Valid spots: {len(spots)}")

    # 5. 저장
    print("\n5. 저장...")
    output = {
        "fetched_at": datetime.now().isoformat(),
        "source": "한국관광공사 Tour API",
        "total": len(spots),
        "spots": spots,
    }

    output_path = os.path.join(OUTPUT_DIR, "gyeonggi_tour.json")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"   Saved: {output_path}")

    # 6. 샘플 출력
    print("\n6. 샘플 데이터:")
    for spot in spots[:15]:
        print(f"   - {spot['name']} ({spot['district']})")

    # 7. 두물머리, 물안개 확인
    print("\n7. 주요 장소 확인:")
    important = ["두물머리", "물안개", "팔당", "자라섬", "율동"]
    for keyword in important:
        matches = [s for s in spots if keyword in s["name"]]
        if matches:
            for m in matches[:3]:
                print(f"   ✓ {m['name']} ({m['district']})")
        else:
            print(f"   ✗ '{keyword}' 없음")

    print("\n" + "=" * 60)
    print("DONE!")
    print("=" * 60)


if __name__ == "__main__":
    main()
