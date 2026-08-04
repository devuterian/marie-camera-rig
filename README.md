# marie-camera-rig

After Effects 2020 이상용 도킹 ScriptUI 카메라 리그다.

기존 카메라 키프레임을 유지하면서 별도 Position·Rotation 오프셋, 자동 조준, 자동 초점, 드리프트와 카메라 흔들림을 추가한다. 여러 null을 쌓지 않고 렌더되지 않는 3D Guide Shape Layer 하나를 컨트롤러로 사용한다.

## 주요 기능

- 기존 Position·Rotation 키프레임에 가산되는 오프셋
- World / Camera Local Position 공간
- Rotation X / Y / Z 추가 채널
- Target A / B와 키프레임 가능한 Target Blend
- One-node / Two-node 카메라 Auto Aim
- Target 기반 Auto Focus와 Manual Focus
- Focal Length 기반 Lens Override와 Zoom Offset
- DOF, Aperture, Blur Level
- 저주파 Drift
- Subtle / Handheld / Action / Quake / Custom Shake
- 현재 프레임에 감쇠 충격을 넣는 Impact Marker
- 기존 카메라 표현식 백업과 Remove Rig 복원
- Build / Update를 이용한 리그 생성·복구
- 렌더되지 않는 카메라·타깃 Shape Controller

## 설치

저장소 전체를 내려받은 뒤 다음 구조를 그대로 유지한다.

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

이 폴더를 After Effects의 `Scripts/ScriptUI Panels` 아래에 넣는다.

macOS:

```text
/Applications/Adobe After Effects <버전>/Scripts/ScriptUI Panels/marierie Camera Rig/
```

Windows:

```text
Adobe After Effects <버전>/Support Files/Scripts/ScriptUI Panels/marierie Camera Rig/
```

After Effects를 다시 실행하고 `Window > marierie Camera Rig`를 연다.

## 사용

1. 카메라를 선택한다.
2. 패널에서 `Build / Update Rig`를 누른다.
3. 생성된 `[MCR] ... | Controls` 레이어를 선택한다.
4. Effect Controls에서 Position Offset, Rotation, Drift, Shake, Lens 값을 조정한다.
5. 자동 조준이나 초점이 필요하면 Target A / B를 생성하거나 기존 레이어를 지정한다.
6. 충격이 필요한 프레임에서 `Add Impact`를 누른다.

선택된 카메라가 없으면 새 카메라를 만들지 묻는다. 카메라에 기존 표현식이 있으면 교체 전에 경고하며, 원본 표현식은 컨트롤러 Comment에 백업한다. 컨트롤러를 직접 삭제하지 말고 `Remove Rig`로 제거해야 복원이 적용된다.

## 컨트롤 구조

### Rig

- `MCR | Enable Rig`
- `MCR | Offset Space`
- `MCR | Position Offset`
- `MCR | Rotation X / Y / Z`

### Targets & Focus

- `MCR | Target A / B`
- `MCR | Target Blend`
- `MCR | Auto Aim`
- `MCR | Auto Focus`
- `MCR | Focus Offset`
- `MCR | Manual Focus`

### Motion

- Drift Position / Rotation / Speed / Seed
- Shake Preset / Intensity / Speed / Seed
- Custom Position / Rotation / Frequency
- Impact Position / Rotation / Decay / Frequency

### Lens

- Lens Override
- Focal Length
- Zoom Offset
- Enable DOF
- Aperture
- Blur Level

## 구현 방침

첨부 예시처럼 Effect Controls 안에 여러 접이식 그룹을 만드는 UI는 custom pseudo effect 등록이 필요하다. 일반 JSX만으로는 런타임 등록이 불가능하고 `PresetEffects.xml` 수정이나 설치형 리소스가 필요해 AE 업데이트와 다른 컴퓨터 이전에서 깨지기 쉽다.

이 프로젝트는 설치 파일을 수정하지 않고 다음 조합을 쓴다.

- 섹션형 도킹 ScriptUI 패널
- 표준 Expression Controls
- 프로젝트 안에 저장되는 3D Guide Shape Controller
- 카메라 네이티브 키프레임을 보존하는 가산 표현식

## 소스 구조

- `marierie_camera_rig.jsx`: After Effects가 여는 진입점
- `src/core.jsxinc`: 상수, Effect Controls, 공통 유틸리티
- `src/rig.jsxinc`: Shape Controller, 카메라 탐색, 표현식 백업
- `src/expressions.jsxinc`: 위치·회전·타깃·초점·렌즈 표현식 생성
- `src/actions.jsxinc`: Build, Target, Preset, Impact, Reset, Remove
- `src/ui.jsxinc`: 도킹 패널 UI

## 주의

- AE 2020 미만은 Dropdown Menu Control 스크립팅 차이로 지원하지 않는다.
- Camera Local Offset은 카메라의 현재 회전축을 기준으로 계산한다.
- Cinema 4D renderer 등 카메라 DOF가 제한되는 렌더러에서는 결과가 다를 수 있다.
- 표현식 부하를 제한하기 위해 타깃은 2개, 흔들림은 2옥타브 노이즈로 제한했다.
- 실제 After Effects 런타임 검증 전까지는 프리릴리스로 취급한다.

## 라이선스

MIT License.
