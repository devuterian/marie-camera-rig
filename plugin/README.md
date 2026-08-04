# macOS 네이티브 플러그인

이 폴더는 `.plugin` 버전 실험용이야. 기존 JSX 리그는 건드리지 않고 따로 개발해.

이번 첫 단계에서 하는 일은 딱 여기까지야.

- Apple Silicon용 `MarieCameraRig.plugin` 빌드
- After Effects가 플러그인을 읽는지 확인
- Effect Controls에 접이식 그룹, 3D Point, Angle, Popup, Slider, Button 표시
- 버튼 클릭 이벤트가 들어오는지 확인
- 입력 화면은 그대로 내보내는 패스스루 렌더

카메라 자동 생성, 표현식 연결, Bake, 리그 제거는 아직 실제로 동작하지 않아. 버튼을 누르면 입력 확인 메시지만 떠.

## 필요한 것

- Apple Silicon Mac
- Xcode와 Xcode Command Line Tools
- CMake 3.24 이상
- Adobe After Effects C++ SDK

Adobe SDK는 저장소에 올리지 않아. 직접 받은 SDK 폴더를 `AE_SDK_ROOT`로 지정해야 해.

SDK 폴더는 아래 둘 중 하나면 돼.

```text
AfterEffectsSDK/
└── Examples/
    ├── Headers/
    ├── Resources/
    └── Util/
```

또는 `Examples` 폴더 자체를 바로 지정해도 돼.

## 빌드

```bash
cd plugin
export AE_SDK_ROOT="$HOME/Developer/AfterEffectsSDK"
bash ./scripts/build.sh
```

빌드 스크립트는 Xcode 프로젝트를 만들고 arm64 Debug 플러그인을 빌드한 다음 번들 구조, PiPL, export symbol, 코드 서명을 확인해.

빌드 결과는 `plugin/build` 아래에 생겨.

## 설치

```bash
cd plugin
bash ./scripts/install.sh
```

기본 설치 위치는 여기야.

```text
/Library/Application Support/Adobe/Common/Plug-ins/7.0/MediaCore/
```

다른 폴더에 넣고 싶으면 환경변수로 바꿀 수 있어.

```bash
MCR_PLUGIN_DESTINATION="/원하는/폴더" bash ./scripts/install.sh
```

설치한 다음 After Effects를 완전히 껐다가 다시 켜.

## 확인 순서

1. 새 컴프를 만들어.
2. Shape Layer나 Solid를 하나 만들어.
3. `Effect > marierie > marierie Camera Rig`를 적용해.
4. 아래 그룹이 보이는지 확인해.
   - 카메라 움직임
   - 자동 움직임
   - 마무리
5. `연결하기`, `작업 영역 Bake`, `지우기` 버튼을 눌러.
6. 각 버튼의 확인 메시지가 뜨면 이번 단계는 성공이야.

플러그인은 아직 픽셀을 바꾸지 않아서 화면은 원래대로 보여야 해.

## 안 뜰 때

After Effects를 완전히 종료한 뒤 다시 켜고 Plugin Loading 로그를 확인해.

먼저 아래를 확인하면 돼.

- `MarieCameraRig.plugin/Contents/MacOS/MarieCameraRig`가 arm64인지
- `Contents/Resources/MarieCameraRig.rsrc`가 있는지
- `Contents/PkgInfo`가 `AEgxFXTC`인지
- 플러그인 번들에 ad-hoc 서명이 들어갔는지

```bash
bash ./scripts/verify.sh /절대/경로/MarieCameraRig.plugin
```

## 다음 단계

플러그인 로딩과 UI가 확인되면 다음 순서로 진행해.

1. 버튼 이벤트에서 AEGP Suite 연결
2. 선택 카메라 찾기, 없으면 새 카메라 만들기
3. 컨트롤러 Shape Layer와 카메라 연결
4. 기존 카메라 애니메이션을 살리는 표현식 설치
5. 작업 영역 Bake
6. 리그 제거와 원상 복구
