# -*- coding: utf-8 -*-
"""
경기기후 API 데이터 엑셀 파일 생성
"""
import pandas as pd
import json
import os
import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

# 엑셀에서 허용하지 않는 문자 제거
ILLEGAL_CHARACTERS_RE = re.compile(r'[\000-\010]|[\013-\014]|[\016-\037]')

def clean_value(val):
    """엑셀에서 허용하지 않는 문자 제거"""
    if isinstance(val, str):
        return ILLEGAL_CHARACTERS_RE.sub('', val)
    return val

def clean_dict(d):
    """딕셔너리의 모든 값 정리"""
    return {k: clean_value(v) for k, v in d.items()}

data_dir = 'C:/work-space/within-front/data/climate_api_raw'
output_file = 'C:/work-space/within-front/data/gyeonggi_climate_data.xlsx'

print('엑셀 파일 생성 중...')

# ========== Sheet 1: 요약 ==========
summary_data = []

# ========== Sheet 2: 스팟 데이터 (이름있는 것들) ==========
spots_data = []

# 문화재
with open(os.path.join(data_dir, 'cultural_property.json'), 'r', encoding='utf-8') as f:
    cultural = json.load(f)

for feat in cultural.get('features', []):
    props = feat.get('properties', {})
    geom = feat.get('geometry', {})
    name = props.get('alias', '').strip()
    if name and '구역' not in name and '지역' not in name:
        coords = geom.get('coordinates', [[[]]])
        try:
            if geom.get('type') == 'MultiPolygon':
                c = coords[0][0][0]
            elif geom.get('type') == 'Polygon':
                c = coords[0][0]
            else:
                c = [0, 0]
            spots_data.append(clean_dict({
                '지역': props.get('col_adm_se', '')[:5],
                '데이터타입': '문화재',
                '고유이름': name,
                '좌표X': c[0] if len(c) > 0 else '',
                '좌표Y': c[1] if len(c) > 1 else '',
                '비고': props.get('remark', ''),
            }))
        except:
            pass

summary_data.append({'레이어': '문화재', '전체': 1759, '이름있음': len([s for s in spots_data if s['데이터타입']=='문화재'])})

# 도립공원
with open(os.path.join(data_dir, 'provincial_park.json'), 'r', encoding='utf-8') as f:
    provincial = json.load(f)

for feat in provincial.get('features', []):
    props = feat.get('properties', {})
    geom = feat.get('geometry', {})
    coords = geom.get('coordinates', [[[]]])
    try:
        if geom.get('type') == 'MultiPolygon':
            c = coords[0][0][0]
        else:
            c = coords[0][0]
        spots_data.append(clean_dict({
            '지역': '경기도',
            '데이터타입': '도립공원',
            '고유이름': props.get('orig_name', ''),
            '좌표X': c[0] if len(c) > 0 else '',
            '좌표Y': c[1] if len(c) > 1 else '',
            '비고': f"면적: {props.get('rep_area', '')}km2, 지정: {props.get('status_yr', '')}년",
        }))
    except:
        pass

summary_data.append({'레이어': '도립공원', '전체': 4, '이름있음': 4})

# 군립공원
with open(os.path.join(data_dir, 'county_park.json'), 'r', encoding='utf-8') as f:
    county = json.load(f)

for feat in county.get('features', []):
    props = feat.get('properties', {})
    geom = feat.get('geometry', {})
    coords = geom.get('coordinates', [[[]]])
    try:
        if geom.get('type') == 'MultiPolygon':
            c = coords[0][0][0]
        else:
            c = coords[0][0]
        spots_data.append(clean_dict({
            '지역': '경기도',
            '데이터타입': '군립공원',
            '고유이름': props.get('orig_name', ''),
            '좌표X': c[0] if len(c) > 0 else '',
            '좌표Y': c[1] if len(c) > 1 else '',
            '비고': f"면적: {props.get('rep_area', '')}km2, 지정: {props.get('status_yr', '')}년",
        }))
    except:
        pass

summary_data.append({'레이어': '군립공원', '전체': 2, '이름있음': 2})

# 국가하천
with open(os.path.join(data_dir, 'ntn_rvr.json'), 'r', encoding='utf-8') as f:
    rivers = json.load(f)

for feat in rivers.get('features', []):
    props = feat.get('properties', {})
    geom = feat.get('geometry', {})
    coords = geom.get('coordinates', [[]])
    try:
        if geom.get('type') == 'MultiLineString':
            c = coords[0][0]
        else:
            c = coords[0]
        spots_data.append(clean_dict({
            '지역': '경기도',
            '데이터타입': '국가하천',
            '고유이름': props.get('sarea_nm', ''),
            '좌표X': c[0] if len(c) > 0 else '',
            '좌표Y': c[1] if len(c) > 1 else '',
            '비고': '',
        }))
    except:
        pass

summary_data.append({'레이어': '국가하천', '전체': 10, '이름있음': 10})

print(f'스팟 데이터: {len(spots_data)}개')

# ========== Sheet 3: 생태계 서비스 점수 ==========
with open(os.path.join(data_dir, 'ecosys_srvc_scr.json'), 'r', encoding='utf-8') as f:
    ecosys = json.load(f)

eco_data = []
for feat in ecosys.get('features', []):
    props = feat.get('properties', {})
    eco_data.append(clean_dict({
        '시군구': props.get('sgg_nm', ''),
        '읍면동': props.get('stdg_nm', ''),
        '도시열섬감소점수': props.get('uhtln_dcrs_scr', ''),
        '탄소저장점수': props.get('cbn_strg_scr', ''),
        '탄소흡수점수': props.get('cbn_abpn_scr', ''),
        '대기조절점수': props.get('air_ajst_scr', ''),
        '수질정화점수': props.get('wtqy_purn_scr', ''),
        '생물다양성점수': props.get('bird_dvsty_scr', ''),
        '서식지품질점수': props.get('hbtt_qlty_scr', ''),
        '생태계서비스총점': props.get('ecosys_srvc_scr', ''),
        '경관점수': props.get('scvl_scr', ''),
        '문화서비스점수': props.get('cult_srvc_scr', ''),
    }))

summary_data.append({'레이어': '생태계서비스점수', '전체': 747, '이름있음': 747})
print(f'생태계 서비스 데이터: {len(eco_data)}개')

# ========== Sheet 4: 비오톱 (생태 분류) ==========
with open(os.path.join(data_dir, 'biotop_rls.json'), 'r', encoding='utf-8') as f:
    biotop = json.load(f)

biotop_data = []
for feat in biotop.get('features', []):
    props = feat.get('properties', {})
    biotop_data.append(clean_dict({
        '시군구': props.get('sgg_nm', ''),
        '대분류코드': props.get('lclsf_cd', ''),
        '대분류명': props.get('lclsf_nm', ''),
        '중분류코드': props.get('mclsf_cd', ''),
        '중분류명': props.get('mclsf_nm', ''),
        '소분류코드': props.get('sclsf_cd', ''),
        '소분류명': props.get('sclsf_nm', ''),
        '면적(m2)': props.get('biotop_area', ''),
    }))

summary_data.append({'레이어': '비오톱(생태분류)', '전체': 1727913, '이름있음': 1727913})
print(f'비오톱 데이터: {len(biotop_data)}개 (샘플)')

# ========== Sheet 5: API 레이어 목록 ==========
layers_data = [
    {'레이어명': 'park', '설명': '공원현황도', '데이터수': 35288, '이름유무': '분류만', '프론트엔드사용': 'O'},
    {'레이어명': 'cultural_property', '설명': '문화재', '데이터수': 1759, '이름유무': '있음', '프론트엔드사용': 'O'},
    {'레이어명': 'provincial_park', '설명': '도립공원', '데이터수': 4, '이름유무': '있음', '프론트엔드사용': 'O'},
    {'레이어명': 'county_park', '설명': '군립공원', '데이터수': 2, '이름유무': '있음', '프론트엔드사용': 'O'},
    {'레이어명': 'ntn_rvr', '설명': '국가하천', '데이터수': 10, '이름유무': '있음', '프론트엔드사용': 'O'},
    {'레이어명': 'green_area', '설명': '녹지', '데이터수': 962, '이름유무': '없음', '프론트엔드사용': 'X'},
    {'레이어명': 'landscape', '설명': '경관보호구역', '데이터수': 1, '이름유무': '있음', '프론트엔드사용': 'O'},
    {'레이어명': 'culture_sports_facility', '설명': '문화체육시설', '데이터수': 5633, '이름유무': '없음', '프론트엔드사용': 'X'},
    {'레이어명': 'health_facility', '설명': '건강시설', '데이터수': 115, '이름유무': '일부', '프론트엔드사용': 'X'},
    {'레이어명': 'ecosys_srvc_scr', '설명': '생태계서비스점수(온도저감,탄소,생물다양성)', '데이터수': 747, '이름유무': '지역명', '프론트엔드사용': 'O'},
    {'레이어명': 'biotop_rls', '설명': '비오톱(생태분류)', '데이터수': 1727913, '이름유무': '분류만', '프론트엔드사용': 'O'},
    {'레이어명': 'eco1_mgmt_area', '설명': '생태자연도1등급', '데이터수': 26118, '이름유무': '없음', '프론트엔드사용': 'X'},
    {'레이어명': 'ricefld_wetln', '설명': '묵논습지', '데이터수': 8064, '이름유무': '분류만', '프론트엔드사용': 'O'},
    {'레이어명': 'forest_cbn_abpvl', '설명': '산림탄소흡수량', '데이터수': 4851727, '이름유무': '없음', '프론트엔드사용': 'X'},
]

# ========== Sheet 6: 프론트엔드 사용가능 필드 ==========
frontend_fields = [
    {'카테고리': '기본정보', '필드명': 'name/orig_name/alias', '설명': '장소 고유 이름', '사용레이어': '도립공원,군립공원,문화재'},
    {'카테고리': '기본정보', '필드명': 'coordinates', '설명': '좌표 (EPSG:5186 → WGS84 변환필요)', '사용레이어': '전체'},
    {'카테고리': '기본정보', '필드명': 'sgg_nm', '설명': '시군구명', '사용레이어': '전체'},
    {'카테고리': '환경점수', '필드명': 'uhtln_dcrs_scr', '설명': '도시열섬감소점수 (온도저감효과)', '사용레이어': '생태계서비스점수'},
    {'카테고리': '환경점수', '필드명': 'cbn_strg_scr', '설명': '탄소저장점수', '사용레이어': '생태계서비스점수'},
    {'카테고리': '환경점수', '필드명': 'cbn_abpn_scr', '설명': '탄소흡수점수', '사용레이어': '생태계서비스점수'},
    {'카테고리': '환경점수', '필드명': 'air_ajst_scr', '설명': '대기조절점수', '사용레이어': '생태계서비스점수'},
    {'카테고리': '환경점수', '필드명': 'wtqy_purn_scr', '설명': '수질정화점수', '사용레이어': '생태계서비스점수'},
    {'카테고리': '생태정보', '필드명': 'bird_dvsty_scr', '설명': '생물다양성점수', '사용레이어': '생태계서비스점수'},
    {'카테고리': '생태정보', '필드명': 'hbtt_qlty_scr', '설명': '서식지품질점수', '사용레이어': '생태계서비스점수'},
    {'카테고리': '생태정보', '필드명': 'lclsf_nm/mclsf_nm/sclsf_nm', '설명': '생태분류 (자연림,습지,농경지 등)', '사용레이어': '비오톱'},
    {'카테고리': '면적정보', '필드명': 'rep_area', '설명': '면적 (km2)', '사용레이어': '도립/군립공원'},
    {'카테고리': '면적정보', '필드명': 'biotop_area', '설명': '비오톱 면적 (m2)', '사용레이어': '비오톱,묵논습지'},
    {'카테고리': '기타', '필드명': 'status_yr', '설명': '지정년도', '사용레이어': '도립/군립공원'},
    {'카테고리': '기타', '필드명': 'ecosys_srvc_scr', '설명': '생태계서비스 종합점수', '사용레이어': '생태계서비스점수'},
]

# ========== 엑셀 저장 ==========
with pd.ExcelWriter(output_file, engine='openpyxl') as writer:
    pd.DataFrame(summary_data).to_excel(writer, sheet_name='1_요약', index=False)
    pd.DataFrame(spots_data).to_excel(writer, sheet_name='2_스팟데이터', index=False)
    pd.DataFrame(eco_data).to_excel(writer, sheet_name='3_생태계서비스점수', index=False)
    pd.DataFrame(biotop_data).to_excel(writer, sheet_name='4_비오톱생태분류', index=False)
    pd.DataFrame(layers_data).to_excel(writer, sheet_name='5_API레이어목록', index=False)
    pd.DataFrame(frontend_fields).to_excel(writer, sheet_name='6_프론트엔드필드', index=False)

print(f'\n저장 완료: {output_file}')
print('시트 목록:')
print('  1_요약 - 레이어별 데이터 개수')
print('  2_스팟데이터 - 이름있는 장소들 (문화재, 공원, 하천)')
print('  3_생태계서비스점수 - 온도저감, 탄소저장, 생물다양성 등')
print('  4_비오톱생태분류 - 생태 분류 (자연림, 습지 등)')
print('  5_API레이어목록 - 사용가능한 전체 API 레이어')
print('  6_프론트엔드필드 - 프론트엔드에서 사용할 수 있는 필드 목록')
