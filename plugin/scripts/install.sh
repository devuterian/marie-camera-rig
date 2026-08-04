#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGIN_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
BUILD_DIR="${PLUGIN_DIR}/build"
DESTINATION="${MCR_PLUGIN_DESTINATION:-/Library/Application Support/Adobe/Common/Plug-ins/7.0/MediaCore}"

BUNDLE_PATH="$(
    find "${BUILD_DIR}" \
        -type d \
        -name 'MarieCameraRig.plugin' \
        -print \
        -quit
)"

if [[ -z "${BUNDLE_PATH}" ]]; then
    echo "설치할 MarieCameraRig.plugin이 없어."
    echo "먼저 bash ./scripts/build.sh를 실행해 줘."
    exit 1
fi

bash "${SCRIPT_DIR}/verify.sh" "${BUNDLE_PATH}"

echo "설치 위치:"
echo "${DESTINATION}/MarieCameraRig.plugin"
echo

sudo /bin/mkdir -p "${DESTINATION}"
sudo /bin/rm -rf "${DESTINATION}/MarieCameraRig.plugin"
sudo /usr/bin/ditto "${BUNDLE_PATH}" "${DESTINATION}/MarieCameraRig.plugin"

echo "설치 끝. After Effects를 완전히 껐다가 다시 켜 줘."
