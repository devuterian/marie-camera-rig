# ADR 0001: macOS 네이티브 Effect Plug-in으로 실험한다

- 상태: 승인
- 날짜: 2026-08-05

## 상황

JSX 버전은 설치가 쉽고 수정도 빠르지만 Effect Controls 안에 접이식 그룹과 실제 버튼을 만들 수 없어. 같은 UI를 pseudo effect로 만들 수도 있지만 AE 설치 파일이나 별도 등록 과정이 필요하고, 업데이트나 컴퓨터 이동 때 깨질 가능성이 있어.

원하는 사용 흐름은 이래.

- 카메라 컨트롤을 Effect Controls 한곳에서 조절
- 위치, 회전, 흔들림 같은 값에 바로 키프레임 찍기
- Effect Controls 안에서 Bake 실행
- 기존 카메라 애니메이션 유지
- null 레이어 여러 개 만들지 않기

## 결정

macOS Apple Silicon용 After Effects Effect Plug-in을 먼저 만든다.

플러그인은 렌더되지 않는 Shape Controller에 적용하고, 표준 `PF_Param`으로 UI와 애니메이션 값을 보관한다. 카메라 조작, 표현식 설치, Bake 같은 프로젝트 변경은 버튼 이벤트에서 AEGP Suite로 처리한다.

기존 JSX 버전은 `main`에 계속 남겨 두고 네이티브 구현은 `agent/native-plugin-macos` 브랜치에서 따로 개발한다.

## 첫 PR 범위

포함:

- arm64 `.plugin` 빌드
- PiPL, Info.plist, PkgInfo, ad-hoc 서명
- 접이식 그룹
- 3D Point, Angle, Popup, Slider, Button
- 버튼 이벤트 확인
- 패스스루 렌더
- 빌드, 검사, 설치 스크립트

제외:

- AEGP Suite 프로젝트 변경
- 카메라 생성과 연결
- 표현식 설치
- Bake
- 리그 제거
- Intel 빌드
- 서명과 notarization 배포

## 이유

표준 Effect 파라미터를 쓰면 After Effects의 스톱워치, 키프레임, 표현식, 숫자 드래그, 다크 UI를 그대로 쓸 수 있어. 커스텀 Cocoa UI보다 코드가 작고 AE UI 변경에도 덜 민감해.

첫 PR에서 플러그인 로딩과 UI부터 확인하면, SDK 경로·PiPL·번들 구조 문제와 카메라 로직 문제를 섞지 않고 따로 잡을 수 있어.

## 위험

- Adobe SDK는 재배포할 수 없어서 개발자 컴퓨터에 따로 받아야 한다.
- PiPL과 `PF_Cmd_GLOBAL_SETUP`의 플래그가 다르면 로딩 문제가 생길 수 있다.
- macOS 15 이상에서는 개발 빌드도 코드 서명이 필요하다.
- AEGP로 프로젝트를 바꾸는 코드는 UI 스레드와 Undo 처리를 엄격히 지켜야 한다.
- 실제 After Effects에서 로딩하기 전에는 빌드 성공만으로 동작을 보장할 수 없다.

## 중단 조건

아래 중 하나가 확인되면 카메라 로직으로 넘어가지 않고 먼저 플러그인 뼈대를 고친다.

- Effect 메뉴에 플러그인이 나타나지 않음
- Effect Controls 그룹이나 버튼이 깨짐
- Apple Silicon AE에서 로딩 오류 발생
- 패스스루 렌더가 원본 화면을 바꿈
- 버튼 클릭이 `PF_Cmd_USER_CHANGED_PARAM`으로 들어오지 않음
