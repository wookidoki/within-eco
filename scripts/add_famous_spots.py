"""
경기도 유명 관광지/공원 수동 추가
- Tour API 대신 유명 장소 직접 추가
"""

import os
import json
from datetime import datetime

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
SPOTS_FILE = os.path.join(SCRIPT_DIR, "..", "src", "data", "spots", "map-spots.json")

# 경기도 유명 관광지/공원 목록
FAMOUS_SPOTS = [
    # 남양주
    {"name": "두물머리", "lat": 37.5316, "lng": 127.3094, "district": "남양주시", "type": "자연명소", "desc": "북한강과 남한강이 만나는 곳, 일출 명소"},
    {"name": "팔당물안개공원", "lat": 37.5234, "lng": 127.2947, "district": "남양주시", "type": "생태공원", "desc": "한강변 물안개가 피어오르는 환상적인 풍경"},
    {"name": "물의정원", "lat": 37.6178, "lng": 127.2128, "district": "남양주시", "type": "수변공원", "desc": "한강과 왕숙천이 만나는 곳의 생태공원"},
    {"name": "다산생태공원", "lat": 37.5963, "lng": 127.2085, "district": "남양주시", "type": "생태공원", "desc": "정약용 생가 인근 자연생태공원"},

    # 양평
    {"name": "세미원", "lat": 37.5343, "lng": 127.3211, "district": "양평군", "type": "수생식물원", "desc": "두물머리 인근 수생식물원, 연꽃 명소"},
    {"name": "양평 들꽃수목원", "lat": 37.4521, "lng": 127.5234, "district": "양평군", "type": "수목원", "desc": "경기도 최대 야생화 수목원"},

    # 가평
    {"name": "자라섬", "lat": 37.8201, "lng": 127.5234, "district": "가평군", "type": "섬/공원", "desc": "재즈페스티벌로 유명한 한강의 섬"},
    {"name": "아침고요수목원", "lat": 37.7421, "lng": 127.3523, "district": "가평군", "type": "수목원", "desc": "한국을 대표하는 사계절 정원"},
    {"name": "쁘띠프랑스", "lat": 37.7234, "lng": 127.4921, "district": "가평군", "type": "테마공원", "desc": "프랑스 문화마을, 어린왕자 테마"},
    {"name": "남이섬", "lat": 37.7902, "lng": 127.5256, "district": "가평군", "type": "섬/공원", "desc": "메타세쿼이아 길로 유명한 관광지"},

    # 포천
    {"name": "산정호수", "lat": 38.1127, "lng": 127.3561, "district": "포천시", "type": "호수공원", "desc": "경기도의 숨은 비경, 명성산 기슭"},
    {"name": "허브아일랜드", "lat": 37.9412, "lng": 127.1253, "district": "포천시", "type": "테마공원", "desc": "허브와 조명으로 유명한 테마파크"},

    # 파주
    {"name": "헤이리예술마을", "lat": 37.7623, "lng": 126.6912, "district": "파주시", "type": "예술마을", "desc": "예술가들이 모여 만든 문화예술마을"},
    {"name": "임진각평화누리공원", "lat": 37.8934, "lng": 126.7412, "district": "파주시", "type": "평화공원", "desc": "DMZ 인근 평화와 통일의 상징"},
    {"name": "벽초지문화수목원", "lat": 37.8234, "lng": 126.8123, "district": "파주시", "type": "수목원", "desc": "유럽식 정원과 한국 전통정원"},

    # 수원
    {"name": "광교호수공원", "lat": 37.2823, "lng": 127.0512, "district": "수원시", "type": "호수공원", "desc": "경기도 최대 도심형 호수공원"},
    {"name": "화성행궁", "lat": 37.2867, "lng": 127.0234, "district": "수원시", "type": "문화유산", "desc": "수원화성 내 조선시대 행궁"},

    # 성남
    {"name": "율동공원", "lat": 37.3823, "lng": 127.1234, "district": "성남시", "type": "호수공원", "desc": "분당의 대표적인 호수공원"},
    {"name": "분당중앙공원", "lat": 37.3712, "lng": 127.1123, "district": "성남시", "type": "도시공원", "desc": "분당 중심부의 대규모 도심공원"},

    # 고양
    {"name": "일산호수공원", "lat": 37.6712, "lng": 126.7723, "district": "고양시", "type": "호수공원", "desc": "일산 신도시의 상징, 호수공원"},
    {"name": "서오릉", "lat": 37.6412, "lng": 126.8923, "district": "고양시", "type": "문화유산", "desc": "조선왕릉 UNESCO 세계유산"},

    # 용인
    {"name": "한택식물원", "lat": 37.2234, "lng": 127.2123, "district": "용인시", "type": "식물원", "desc": "국내 최대 규모의 종합식물원"},
    {"name": "에버랜드", "lat": 37.2923, "lng": 127.2012, "district": "용인시", "type": "테마공원", "desc": "한국 대표 테마파크"},

    # 화성
    {"name": "제부도", "lat": 37.2412, "lng": 126.6812, "district": "화성시", "type": "섬/해변", "desc": "모세의 기적, 바다 갈라짐 체험"},
    {"name": "궁평리해수욕장", "lat": 37.1534, "lng": 126.6723, "district": "화성시", "type": "해변", "desc": "서해안 대표 해수욕장"},

    # 시흥
    {"name": "갯골생태공원", "lat": 37.3723, "lng": 126.7823, "district": "시흥시", "type": "생태공원", "desc": "내륙 깊숙이 들어온 바다의 흔적"},
    {"name": "오이도", "lat": 37.3412, "lng": 126.6923, "district": "시흥시", "type": "섬/어촌", "desc": "조개구이와 일몰 명소"},

    # 안산
    {"name": "대부도", "lat": 37.2534, "lng": 126.5934, "district": "안산시", "type": "섬", "desc": "시화호와 서해바다를 품은 섬"},

    # 여주
    {"name": "영릉(세종대왕릉)", "lat": 37.3112, "lng": 127.5823, "district": "여주시", "type": "문화유산", "desc": "세종대왕과 소헌왕후의 능"},
    {"name": "신륵사", "lat": 37.2934, "lng": 127.6312, "district": "여주시", "type": "사찰", "desc": "남한강변의 고찰"},

    # 이천
    {"name": "설봉공원", "lat": 37.2723, "lng": 127.4423, "district": "이천시", "type": "도시공원", "desc": "이천 시민의 휴식 공간"},

    # 광주
    {"name": "화담숲", "lat": 37.3634, "lng": 127.2512, "district": "광주시", "type": "수목원", "desc": "자연과 사람이 공존하는 생태수목원"},

    # 의정부
    {"name": "회룡공원", "lat": 37.7523, "lng": 127.0412, "district": "의정부시", "type": "도시공원", "desc": "도봉산 자락의 시민공원"},

    # 안양
    {"name": "안양예술공원", "lat": 37.4123, "lng": 126.9312, "district": "안양시", "type": "예술공원", "desc": "자연과 예술이 어우러진 공간"},

    # 군포
    {"name": "철쭉동산", "lat": 37.3512, "lng": 126.9223, "district": "군포시", "type": "도시공원", "desc": "봄이면 철쭉이 만개하는 공원"},

    # 하남
    {"name": "미사경정공원", "lat": 37.5623, "lng": 127.1823, "district": "하남시", "type": "수변공원", "desc": "한강변 대규모 수변공원"},
    {"name": "스타필드하남", "lat": 37.5512, "lng": 127.2012, "district": "하남시", "type": "복합시설", "desc": "대형 복합쇼핑몰"},
]


def main():
    print("=" * 60)
    print("[Famous Spots Adder]")
    print("경기도 유명 관광지/공원 추가")
    print("=" * 60)

    # 기존 데이터 로드
    with open(SPOTS_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)

    existing_names = {s["name"] for s in data["spots"]}
    added_count = 0

    print(f"\n기존 스팟: {len(data['spots'])}개")
    print(f"추가할 장소: {len(FAMOUS_SPOTS)}개\n")

    for spot_info in FAMOUS_SPOTS:
        if spot_info["name"] in existing_names:
            print(f"  Skip (이미 있음): {spot_info['name']}")
            continue

        new_spot = {
            "id": f"famous_{spot_info['name'].replace(' ', '_')}",
            "name": spot_info["name"],
            "type": spot_info["type"],
            "category": "nature",
            "location": {
                "lat": spot_info["lat"],
                "lng": spot_info["lng"],
            },
            "district": spot_info["district"],
            "description": spot_info.get("desc", ""),
            "priority": True,
            "famous": True,
        }

        data["spots"].insert(0, new_spot)
        added_count += 1
        print(f"  Added: {spot_info['name']} ({spot_info['district']})")

    # 업데이트
    data["total"] = len(data["spots"])
    data["famous_added"] = added_count
    data["updated_at"] = datetime.now().isoformat()

    # 저장
    with open(SPOTS_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"\n총 {added_count}개 장소 추가됨")
    print(f"현재 총 스팟: {data['total']}개")
    print("=" * 60)


if __name__ == "__main__":
    main()
