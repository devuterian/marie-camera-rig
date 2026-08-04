# marie-camera-rig

After Effects 2020 이상에서 쓰는 카메라 리그야.

카메라 이동은 그대로 두고, 그 위에 위치·회전 오프셋이나 드리프트, 핸드헬드 흔들림을 더할 수 있어. null을 여러 개 만들지 않고 렌더되지 않는 Shape Layer 하나에 컨트롤을 모아 둬서 타임라인도 덜 복잡해져.

## 뭐가 들어 있나

- 카메라에 이미 찍힌 Position·Rotation 키를 그대로 쓰는 추가 오프셋
- 월드 기준 / 카메라 기준 위치 이동
- 회전 X·Y·Z 추가값
- 타깃 A·B 전환과 중간값 애니메이션
- One-node / Two-node 카메라 타깃 바라보기
- 타깃을 따라가는 자동 초점
- 초점 거리, 줌 보정, 심도, 조리개, 블러
- 느린 드리프트
- 은은하게 / 핸드헬드 / 강하게 / 지진 / 직접 설정 흔들림
- 현재 프레임에 짧은 충격 추가
- 작업 영역을 실제 카메라 키프레임으로 굽는 Bake
- 기존 표현식 백업과 리그 제거 시 복원

## 설치

저장소를 내려받고 폴더 구조를 그대로 둬.

```text
marierie Camera Rig/
├── marierie_camera_rig.jsx
└── src/
    ├── core.jsxinc
    ├── rig.jsxinc
    ├── expressions.jsxinc
    ├── actions.jsxinc
    └── ui.jsxinc
```

이 폴더를 After Effects의 `Scripts/ScriptUI Panels` 폴더 안에 넣으면 돼.

macOS:

```text
/Applications/Adobe After Effects <버전>/Scripts/ScriptUI Panels/marierie Camera Rig/
```

Windows:

```text
Adobe After Effects <버전>/Support Files/Scripts/ScriptUI Panels/marierie Camera Rig/
```

After Effects를 다시 켠 다음 `Window > marierie Camera Rig`를 열어.

## 바로 쓰는 법

1. 카메라가 있으면 그 카메라를 선택해.
2. 카메라가 없어도 괜찮아. 그냥 `리그 만들기 / 새로고침`을 누르면 새 카메라부터 만들어 줘.
3. `[MCR] ... | 컨트롤` 레이어를 선택하고 Effect Controls에서 값을 만지면 돼.
4. 타깃이 필요하면 `타깃 A 만들기`, `타깃 B 만들기`를 누르거나 기존 레이어를 A/B로 지정해.
5. 흔들림은 패널의 프리셋으로 바로 골라도 되고 Effect Controls에서 세부 값을 조절해도 돼.
6. 최종 결과를 카메라 키로 넘기고 싶으면 작업 영역을 잡은 다음 `작업 영역을 키프레임으로 Bake`를 눌러.

카메라를 선택하지 않았는데 컴프 안에 활성 카메라가 있으면 그 카메라를 사용해. 활성 카메라도 없을 때만 새 카메라를 하나 만들어.

## 기존 카메라 애니메이션은 어떻게 되나

Position, Rotation, Point of Interest, 렌즈처럼 카메라에 이미 찍힌 키프레임과 기본값은 지우지 않아. MCR 표현식은 그 값을 기준으로 추가 움직임만 더해.

기존 표현식이 걸린 프로퍼티가 있으면 덮어쓰기 전에 한 번 물어봐. 원본 표현식은 컨트롤 레이어 Comment에 백업되고 `리그 지우기`를 누르면 다시 돌아와. 컨트롤 레이어를 타임라인에서 직접 지우면 복원이 안 되니 제거할 때는 패널 버튼을 써 줘.

## Bake

`작업 영역을 키프레임으로 Bake`는 현재 보이는 최종 결과를 작업 영역 안에서 프레임마다 샘플링해서 실제 카메라 키로 바꿔.

Bake가 끝나면 MCR 컨트롤 레이어는 지워지고 카메라만 남아. 프레임마다 키가 생기기 때문에 키 수가 많아지는 건 정상이고, 결과가 마음에 안 들면 바로 Undo 하면 돼.

Bake는 작업 영역만 건드려. 필요한 구간을 먼저 잡고 실행하는 게 편해.

## 컨트롤 이름

### 기본 이동

- `MCR | 리그 켜기`
- `MCR | 이동 기준`
- `MCR | 위치 더하기`
- `MCR | 회전 X / Y / Z`

### 타깃과 초점

- `MCR | 타깃 A / B`
- `MCR | 타깃 섞기`
- `MCR | 타깃 바라보기`
- `MCR | 자동 초점`
- `MCR | 초점 보정`
- `MCR | 직접 초점 거리`

### 흔들림

- 느린 위치·회전 흔들림
- 흔들림 프리셋, 세기, 속도, 시드
- 직접 위치·회전 흔들림과 빈도
- 충격 위치·회전, 감쇠, 진동수

### 렌즈

- 렌즈 직접 설정
- 초점 거리
- 줌 보정
- 심도 켜기
- 조리개
- 블러 양

## 왜 사진처럼 Effect Controls 안에 접이식 그룹이 없나

사진 같은 UI는 custom pseudo effect를 설치해야 만들 수 있어. 일반 JSX만으로는 Effect Controls 안에 실제 버튼이나 여러 단계 그룹을 바로 등록할 수 없고, `PresetEffects.xml` 같은 AE 설치 파일을 건드려야 해.

이 프로젝트는 컴퓨터를 옮기거나 AE를 업데이트했을 때 덜 깨지게 하려고 아래 방식으로 만들었어.

- 버튼은 도킹 패널에 배치
- 애니메이션 값은 표준 Expression Controls 사용
- 타임라인에는 Shape Controller 하나만 추가
- AE 설치 파일은 수정하지 않음

그래서 Bake 버튼은 Effect Controls가 아니라 패널의 `마무리` 칸에 있어.

## 소스 구조

- `marierie_camera_rig.jsx`: After Effects가 여는 파일
- `src/core.jsxinc`: 공통 값과 Effect Controls
- `src/rig.jsxinc`: 카메라·컨트롤러·타깃 처리
- `src/expressions.jsxinc`: 위치, 회전, 타깃, 초점, 렌즈 표현식
- `src/actions.jsxinc`: 만들기, 타깃, 흔들림, Bake, 초기화, 제거
- `src/ui.jsxinc`: 도킹 패널

## 알아둘 점

- AE 2020 미만은 Dropdown Menu Control 동작이 달라서 지원하지 않아.
- 카메라 기준 이동은 카메라가 현재 바라보는 축을 따라가.
- 렌더러에 따라 카메라 심도 결과가 조금 다를 수 있어.
- 타깃은 A와 B 두 개까지 지원해.
- 실제 After Effects에서 전체 기능을 확인하기 전까지는 프리릴리스로 봐 줘.

## 라이선스

MIT License.
