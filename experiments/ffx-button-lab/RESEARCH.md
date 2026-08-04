# Button research notes

## 확인한 사례

- self-contained pseudo effect `.ffx`는 match name이 `Pseudo/`로 시작하면 최종 사용자의 `PresetEffects.xml`에 정의가 없어도 적용되는 제작 방식이 널리 쓰인다.
- `.ffx`는 효과, 속성, 키프레임, 표현식을 저장할 수 있고 JSX에서는 `Layer.applyPreset()`으로 적용할 수 있다.
- After Effects의 pseudo effect 정의에서 쓸 수 있는 일반 컨트롤은 Slider, Checkbox, Color, Layer, Point, Point3D, Popup, Angle, Group 계열이다.
- Effect Controls에서 직접 JSX 함수를 호출하는 네이티브 Button 파라미터는 C++ Effect Plug-in API 쪽 기능이다.

## 검토한 버튼 대안

1. 모든 실행을 ScriptUI 패널에 둠
   - 가장 안정적
   - Effect Controls에서 바로 누를 수 없다는 단점
2. pseudo effect 체크박스를 순간 스위치로 사용
   - 패널이 열려 있을 때 `app.scheduleTask()`로 감시 가능
   - 실행 뒤 자동으로 체크 해제
   - 패널이 닫혀 있으면 동작하지 않음
3. pseudo effect Popup에 작업을 고르고 패널의 실행 버튼을 누름
   - 감시 루프가 필요 없음
   - 클릭 수가 늘고 버튼처럼 직관적이지 않음
4. 체크박스 변경을 표현식으로 감지
   - 표현식은 프로젝트 구조 변경이나 Bake 같은 스크립트 작업을 실행할 수 없어서 제외

## 선택

ScriptUI의 진짜 버튼을 기본으로 유지하고, Effect Controls에는 짧고 안전한 작업만 체크박스형 빠른 실행으로 제공한다.
