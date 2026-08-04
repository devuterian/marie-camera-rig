#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGIN_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
BUILD_DIR="${PLUGIN_DIR}/build"
CONFIGURATION="${MCR_BUILD_CONFIGURATION:-Debug}"

if [[ -z "${AE_SDK_ROOT:-}" ]]; then
    echo "AE_SDK_ROOT가 비어 있어."
    echo "After Effects C++ SDK를 받은 다음 SDK 폴더를 지정해 줘."
    echo
    echo '예: export AE_SDK_ROOT="$HOME/Developer/AfterEffectsSDK"'
    exit 1
fi

if ! command -v cmake >/dev/null 2>&1; then
    echo "cmake가 없어. Homebrew나 공식 설치 파일로 먼저 설치해 줘."
    exit 1
fi

if ! /usr/bin/xcrun --find clang++ >/dev/null 2>&1; then
    echo "Xcode Command Line Tools가 없어."
    echo "xcode-select --install 을 먼저 실행해 줘."
    exit 1
fi

cmake \
    -S "${PLUGIN_DIR}" \
    -B "${BUILD_DIR}" \
    -G Xcode \
    -DAE_SDK_ROOT="${AE_SDK_ROOT}" \
    -DCMAKE_OSX_ARCHITECTURES=arm64

cmake \
    --build "${BUILD_DIR}" \
    --config "${CONFIGURATION}" \
    --target MarieCameraRig

BUNDLE_PATH="$(
    find "${BUILD_DIR}" \
        -type d \
        -name 'MarieCameraRig.plugin' \
        -print \
        -quit
)"

if [[ -z "${BUNDLE_PATH}" ]]; then
    echo "빌드는 끝났는데 MarieCameraRig.plugin을 못 찾았어."
    exit 1
fi

"${SCRIPT_DIR}/verify.sh" "${BUNDLE_PATH}"

echo
echo "빌드 끝:"
echo "${BUNDLE_PATH}"
