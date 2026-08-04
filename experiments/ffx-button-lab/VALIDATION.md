# Validation

- `mcr_ffx_button_lab.jsx`에서 `#target` 지시문을 제외한 JavaScript 구문을 `node --check`로 확인함
- `marierie_camera_rig_pseudo_effect.xml`을 XML 파서로 확인함
- 업로드된 `GlyphGlide.ffx`는 `RIFX / FaFX` 프리셋이며, `sspc` 영역 안에 `Pseudo/...` 정의와 31개 파라미터가 들어 있는 것을 확인함
- 실제 After Effects 런타임에서 `app.scheduleTask()` 감시와 pseudo effect 내부 프로퍼티 재귀 탐색은 아직 확인하지 못함
