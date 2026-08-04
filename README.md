# marierie Camera Rig 1.2.0

After Effects 2020 이상에서 사용하는 카메라 리그야.

카메라의 기존 키프레임과 기본값은 그대로 두고, 위치·회전 오프셋, 타깃, 자동 초점, 렌즈, 드리프트, 흔들림과 충격을 Shape Layer 컨트롤러 하나에서 추가해.

## 설치

저장소를 내려받고 아래 구조를 그대로 유지해.

```text
marierie Camera Rig/
├── marierie_camera_rig.jsx
└── src/
    ├── core.jsxinc
    ├── rig.jsxinc
    ├── expressions.jsxinc
    ├── actions.jsxinc
    ├── stability.jsxinc
    └── ui_simple.jsxinc
```

이 폴더를 다음 위치에 넣어.

```text
/Applications/Adobe After Effects <버전>/Scripts/ScriptUI Panels/
```

After Effects를 다시 실행하고 `창(Window) > marierie Camera Rig`를 열면 돼.

## 기본 사용법

1. 카메라가 있으면 선택해. 선택하지 않아도 현재 활성 카메라를 사용해.
2. `리그 만들기 / 새로고침`을 눌러. 카메라가 없으면 새 카메라가 자동으로 생겨.
3. 선택된 `[MCR] ... | 컨트롤` 레이어의 Effect Controls에서 값을 조정해.
4. 최종 결과를 실제 키로 확정하려면 작업 영역을 잡고 `작업 영역을 카메라 키로 Bake`를 눌러.

## 1.2.0 안정화 내용

- 카메라 자동 생성부터 리그 연결까지 하나의 Undo 그룹에 포함했어.
- 기존 표현식의 내용뿐 아니라 켜짐/꺼짐 상태도 백업해.
- MCR 사용 중 다른 표현식이 추가되면 새로고침이 이를 덮어쓰지 않고 멈춰.
- 리그 제거 시 나중에 추가된 다른 표현식은 건드리지 않아.
- `움직임 초기화`가 흔들림, 직접 설정값과 MCR 충격 마커까지 함께 초기화해.
- Bake와 리그 제거 후 MCR이 직접 만든 타깃 레이어만 정리해. 사용자가 지정한 일반 레이어는 지우지 않아.
- 흔들림 프리셋 버튼 여섯 개를 드롭다운과 적용 버튼으로 줄였어.
- 30,000프레임을 넘는 Bake는 실수 방지를 위해 중단해.

## 기존 카메라 애니메이션과 표현식

Position, Rotation, Point of Interest와 렌즈에 이미 찍힌 키프레임은 지우지 않아. MCR 표현식은 해당 값을 기준으로 추가 움직임만 더해.

처음 연결할 때 기존 표현식이 있으면 확인창이 뜨고, 원본 표현식과 켜짐 상태가 컨트롤 레이어 Comment에 백업돼. 제거할 때는 타임라인에서 컨트롤 레이어를 직접 삭제하지 말고 패널의 `리그 지우기`를 사용해줘.

## Bake

Bake는 작업 영역의 최종 결과를 프레임마다 샘플링해서 실제 카메라 키로 바꿔. 해당 구간의 기존 키는 Bake 결과로 교체되고 완료 후 MCR 컨트롤과 MCR이 만든 타깃이 제거돼.

결과가 마음에 들지 않으면 Bake 직후 바로 Undo 하면 돼.

## 제한

일반 JSX만 사용하므로 Effect Controls 안에 실행 버튼이나 사용자 정의 접이식 그룹은 만들지 않아. 실행 버튼은 도킹 패널에 있고 애니메이션 값은 표준 Expression Controls로 표시돼.

실제 After Effects에서 프로젝트별 렌더러와 카메라 설정 조합을 확인하는 과정은 계속 필요해.

## 라이선스

MIT License.
