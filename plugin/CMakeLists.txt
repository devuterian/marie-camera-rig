cmake_minimum_required(VERSION 3.24)

project(
    MarieCameraRig
    VERSION 0.1.0
    LANGUAGES CXX
)

if(NOT APPLE)
    message(FATAL_ERROR "The native plug-in prototype currently supports macOS only.")
endif()

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

set(CMAKE_OSX_ARCHITECTURES "arm64" CACHE STRING "macOS architecture" FORCE)
set(CMAKE_OSX_DEPLOYMENT_TARGET "13.0" CACHE STRING "Minimum macOS version" FORCE)

set(
    AE_SDK_ROOT
    ""
    CACHE PATH
    "Path to the extracted Adobe After Effects C++ SDK or its Examples directory"
)

if(EXISTS "${AE_SDK_ROOT}/Examples/Headers/AE_Effect.h")
    set(AE_SDK_EXAMPLES "${AE_SDK_ROOT}/Examples")
elseif(EXISTS "${AE_SDK_ROOT}/Headers/AE_Effect.h")
    set(AE_SDK_EXAMPLES "${AE_SDK_ROOT}")
else()
    message(
        FATAL_ERROR
        "AE_SDK_ROOT is invalid. Point it at the SDK root or the SDK's Examples directory."
    )
endif()

set(AE_HEADERS_DIR "${AE_SDK_EXAMPLES}/Headers")
set(AE_RESOURCES_DIR "${AE_SDK_EXAMPLES}/Resources")
set(AE_UTIL_DIR "${AE_SDK_EXAMPLES}/Util")

execute_process(
    COMMAND /usr/bin/xcrun --find Rez
    OUTPUT_VARIABLE REZ_EXECUTABLE
    OUTPUT_STRIP_TRAILING_WHITESPACE
    RESULT_VARIABLE REZ_RESULT
)

if(NOT REZ_RESULT EQUAL 0 OR NOT EXISTS "${REZ_EXECUTABLE}")
    message(FATAL_ERROR "Rez was not found. Install the Xcode command line tools.")
endif()

configure_file(
    "${CMAKE_CURRENT_SOURCE_DIR}/resources/Info.plist.in"
    "${CMAKE_CURRENT_BINARY_DIR}/Info.plist"
    @ONLY
)

add_library(
    MarieCameraRig
    MODULE
    src/MarieCameraRig.cpp
)

target_include_directories(
    MarieCameraRig
    PRIVATE
        "${AE_HEADERS_DIR}"
        "${AE_HEADERS_DIR}/SP"
        "${AE_UTIL_DIR}"
        "${AE_RESOURCES_DIR}"
)

target_compile_options(
    MarieCameraRig
    PRIVATE
        -Wall
        -Wextra
        -Wpedantic
        -Wno-unused-parameter
        -Wno-multichar
        -fvisibility=hidden
)

target_link_options(
    MarieCameraRig
    PRIVATE
        "-Wl,-undefined,dynamic_lookup"
)

set_target_properties(
    MarieCameraRig
    PROPERTIES
        BUNDLE TRUE
        BUNDLE_EXTENSION "plugin"
        PREFIX ""
        OUTPUT_NAME "MarieCameraRig"
        MACOSX_BUNDLE_INFO_PLIST "${CMAKE_CURRENT_BINARY_DIR}/Info.plist"
        LIBRARY_OUTPUT_DIRECTORY "${CMAKE_BINARY_DIR}/dist"
        XCODE_ATTRIBUTE_CODE_SIGNING_ALLOWED "NO"
)

set(PIPL_SOURCE "${CMAKE_CURRENT_SOURCE_DIR}/resources/MarieCameraRig.r")
set(PIPL_RESOURCE "${CMAKE_CURRENT_BINARY_DIR}/MarieCameraRig.rsrc")

add_custom_command(
    OUTPUT "${PIPL_RESOURCE}"
    COMMAND
        "${REZ_EXECUTABLE}"
        -useDF
        -o "${PIPL_RESOURCE}"
        "${PIPL_SOURCE}"
        -i "${AE_HEADERS_DIR}"
        -i "${AE_RESOURCES_DIR}"
    DEPENDS "${PIPL_SOURCE}"
    COMMENT "Compiling After Effects PiPL resource"
    VERBATIM
)

add_custom_target(
    MarieCameraRigPiPL
    DEPENDS "${PIPL_RESOURCE}"
)

add_dependencies(MarieCameraRig MarieCameraRigPiPL)

add_custom_command(
    TARGET MarieCameraRig
    POST_BUILD
    COMMAND
        "${CMAKE_COMMAND}" -E make_directory
        "$<TARGET_BUNDLE_DIR:MarieCameraRig>/Contents/Resources"
    COMMAND
        "${CMAKE_COMMAND}" -E copy_if_different
        "${PIPL_RESOURCE}"
        "$<TARGET_BUNDLE_DIR:MarieCameraRig>/Contents/Resources/MarieCameraRig.rsrc"
    COMMAND
        /bin/sh -c
        "printf 'AEgxFXTC' > '$<TARGET_BUNDLE_DIR:MarieCameraRig>/Contents/PkgInfo'"
    COMMAND
        /usr/bin/codesign
        --force
        --sign -
        --timestamp=none
        "$<TARGET_BUNDLE_DIR:MarieCameraRig>"
    COMMENT "Finishing and ad-hoc signing MarieCameraRig.plugin"
    VERBATIM
)
