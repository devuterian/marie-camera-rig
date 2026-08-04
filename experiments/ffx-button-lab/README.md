# MCR FFX Button Lab

`.ffx` 기반 pseudo effect와 ScriptUI 패널을 같이 쓸 때, 실행 버튼을 어디에 둘지 확인하는 작은 프로토타입이야.

## 이번에 확인하려는 구조

- `.ffx`: 접이식 그룹, 슬라이더, 체크박스, 팝업, 3D 포인트처럼 저장되고 키프레임 가능한 값 UI
- ScriptUI 패널: 카메라 만들기, 타깃 만들기, Bake, 제거처럼 프로젝트를 실제로 바꾸는 실행 버튼
- Effect Controls의 `빠른 실행`: 체크박스를 순간 스위치로 쓰고, 열려 있는 패널이 `app.scheduleTask()`로 감시해서 버튼처럼 처리

## 바로 보는 법

1. `mcr_ffx_button_lab.jsx`를 After Effects의 `Scripts/ScriptUI Panels`에 넣어.
2. AE를 다시 켜고 `Window > MCR FFX Button Lab`을 열어.
3. 컴프를 열고 `실험용 카메라 컨트롤 만들기`를 눌러.
4. `[MCR LAB] 카메라 컨트롤`의 Effect Controls에서 아래 체크박스를 눌러 봐.
   - `⚡ 충격 추가`
   - `↺ 값 초기화`
   - `● Bake 요청`
   - `✕ 리그 지우기`
5. 체크박스가 작업을 실행한 뒤 자동으로 다시 꺼지면 버튼 브리지가 동작한 거야.

`Bake 요청`은 이번 실험에서는 실제 카메라 키를 만들지 않고, 작업 영역 프레임 수가 적힌 마커만 추가해. 버튼 전달 방식만 확인하기 위한 안전한 동작이야.

## 버튼에 대해 확인한 결론

### 패널의 버튼이 기본

Bake나 리그 제거는 프로젝트 구조와 키프레임을 바꾸는 작업이라 실제 ScriptUI 버튼이 가장 안정적이야. 명시적인 클릭, 확인창, Undo 그룹, 진행 상태를 자연스럽게 처리할 수 있어.

### Effect Controls 안의 버튼은 보조

pseudo effect가 저장된 `.ffx`는 값과 표현식은 담을 수 있지만 JSX 함수를 직접 실행하는 네이티브 버튼은 제공하지 않아. 그래서 체크박스를 버튼처럼 쓰려면 패널 또는 시작 스크립트가 살아 있으면서 값을 감시해야 해.

이 방식의 장점은 사용자가 Effect Controls를 보다가 바로 `충격 추가` 같은 짧은 작업을 누를 수 있다는 점이야. 단점은 패널이 닫혀 있거나 감시가 꺼져 있으면 실행되지 않는다는 점이야.

### 최종 권장 배치

- Effect Controls: `충격 추가`, `값 초기화` 정도만 빠른 실행으로 제공
- 패널: `리그 만들기`, `타깃 만들기`, `Bake`, `리그 지우기`
- 위험하거나 오래 걸리는 작업은 패널에만 둠

## 파일

- `mcr_ffx_button_lab.jsx`: 실제로 실행 가능한 버튼 브리지 프로토타입
- `authoring/marierie_camera_rig_pseudo_effect.xml`: 최종 MCR FFX를 만들기 위한 원본 pseudo effect 정의

## 아직 하지 않은 것

- 실제 `marierie_camera_rig.ffx` 생성
- 기존 카메라 리그 표현식을 pseudo effect 속성으로 교체
- 실제 Bake와 리그 제거를 빠른 실행 체크박스에 연결

실제 FFX 파일은 After Effects에서 authoring XML로 pseudo effect를 한 번 등록하고, 해당 효과를 선택해 `Animation > Save Animation Preset…`으로 저장하는 제작 패스가 한 번 필요해. 최종 사용자는 XML을 설치하지 않고 저장된 `.ffx`만 받게 돼.
