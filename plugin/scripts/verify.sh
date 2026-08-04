#!/bin/bash
set -euo pipefail

if [[ $# -ne 1 ]]; then
    echo "사용법: $0 /절대/경로/MarieCameraRig.plugin"
    exit 1
fi

BUNDLE_PATH="$1"
PLIST_PATH="${BUNDLE_PATH}/Contents/Info.plist"
EXECUTABLE_PATH="${BUNDLE_PATH}/Contents/MacOS/MarieCameraRig"
RESOURCE_PATH="${BUNDLE_PATH}/Contents/Resources/MarieCameraRig.rsrc"
PKGINFO_PATH="${BUNDLE_PATH}/Contents/PkgInfo"

for path in \
    "${PLIST_PATH}" \
    "${EXECUTABLE_PATH}" \
    "${RESOURCE_PATH}" \
    "${PKGINFO_PATH}"
do
    if [[ ! -e "${path}" ]]; then
        echo "필요한 파일이 없어: ${path}"
        exit 1
    fi
done

/usr/bin/plutil -lint "${PLIST_PATH}" >/dev/null

if [[ "$(/usr/bin/plutil -extract CFBundlePackageType raw -o - "${PLIST_PATH}")" != "AEgx" ]]; then
    echo "CFBundlePackageType이 AEgx가 아니야."
    exit 1
fi

if [[ "$(/usr/bin/plutil -extract CFBundleSignature raw -o - "${PLIST_PATH}")" != "FXTC" ]]; then
    echo "CFBundleSignature가 FXTC가 아니야."
    exit 1
fi

if [[ "$(/bin/cat "${PKGINFO_PATH}")" != "AEgxFXTC" ]]; then
    echo "PkgInfo 값이 맞지 않아."
    exit 1
fi

if ! /usr/bin/file "${EXECUTABLE_PATH}" | /usr/bin/grep -q "Mach-O 64-bit bundle arm64"; then
    echo "실행 파일이 arm64 Mach-O bundle이 아니야."
    /usr/bin/file "${EXECUTABLE_PATH}"
    exit 1
fi

EXPORTED_SYMBOLS="$(/usr/bin/nm -gU "${EXECUTABLE_PATH}")"

if ! /usr/bin/grep -q "_EffectMain" <<<"${EXPORTED_SYMBOLS}"; then
    echo "EffectMain이 export되지 않았어."
    exit 1
fi

if ! /usr/bin/grep -q "_PluginDataEntryFunction2" <<<"${EXPORTED_SYMBOLS}"; then
    echo "PluginDataEntryFunction2가 export되지 않았어."
    exit 1
fi

DEREZ_PATH="$(/usr/bin/xcrun --find DeRez)"
if ! "${DEREZ_PATH}" -useDF "${RESOURCE_PATH}" | /usr/bin/grep -q "data 'PiPL' (16000)"; then
    echo "PiPL 리소스를 못 찾았어."
    exit 1
fi

/usr/bin/codesign --verify --strict --verbose=2 "${BUNDLE_PATH}"

echo "플러그인 번들 검사 통과."
