#pragma once

#include "AEConfig.h"
#include "entry.h"
#include "AE_Effect.h"
#include "AE_EffectCB.h"
#include "AE_Macros.h"
#include "Param_Utils.h"

namespace mcr {

constexpr char kPluginName[] = "marierie Camera Rig";
constexpr char kMatchName[] = "net.marierie.camera-rig";
constexpr char kCategory[] = "marierie";
constexpr char kSupportUrl[] = "https://github.com/devuterian/marie-camera-rig";

constexpr A_long kMajorVersion = 1;
constexpr A_long kMinorVersion = 0;
constexpr A_long kBugVersion = 0;
constexpr A_long kBuildVersion = 1;

enum ParamIndex : A_long {
    kInput = 0,

    kCameraGroupStart,
    kEnabled,
    kPositionOffset,
    kRotationX,
    kRotationY,
    kRotationZ,
    kCameraGroupEnd,

    kMotionGroupStart,
    kShakePreset,
    kShakeIntensity,
    kShakeSpeed,
    kShakeSeed,
    kMotionGroupEnd,

    kFinishGroupStart,
    kConnectButton,
    kBakeButton,
    kRemoveButton,
    kFinishGroupEnd,

    kNumParams
};

enum DiskId : A_long {
    kCameraGroupStartDiskId = 1,
    kEnabledDiskId,
    kPositionOffsetDiskId,
    kRotationXDiskId,
    kRotationYDiskId,
    kRotationZDiskId,
    kCameraGroupEndDiskId,

    kMotionGroupStartDiskId,
    kShakePresetDiskId,
    kShakeIntensityDiskId,
    kShakeSpeedDiskId,
    kShakeSeedDiskId,
    kMotionGroupEndDiskId,

    kFinishGroupStartDiskId,
    kConnectButtonDiskId,
    kBakeButtonDiskId,
    kRemoveButtonDiskId,
    kFinishGroupEndDiskId
};

}  // namespace mcr

extern "C" {

DllExport PF_Err PluginDataEntryFunction2(
    PF_PluginDataPtr inPtr,
    PF_PluginDataCB2 inPluginDataCallBackPtr,
    SPBasicSuite* inSPBasicSuitePtr,
    const char* inHostName,
    const char* inHostVersion);

DllExport PF_Err EffectMain(
    PF_Cmd cmd,
    PF_InData* in_data,
    PF_OutData* out_data,
    PF_ParamDef* params[],
    PF_LayerDef* output,
    void* extra);

}
