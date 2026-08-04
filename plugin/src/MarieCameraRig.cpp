#include "MarieCameraRig.h"

namespace {

PF_Err About(
    PF_InData* in_data,
    PF_OutData* out_data,
    PF_ParamDef* params[],
    PF_LayerDef* output)
{
    PF_SPRINTF(
        out_data->return_msg,
        "%s v%d.%d\rmacOS 네이티브 플러그인 프로토타입",
        mcr::kPluginName,
        mcr::kMajorVersion,
        mcr::kMinorVersion);

    return PF_Err_NONE;
}

PF_Err GlobalSetup(
    PF_InData* in_data,
    PF_OutData* out_data,
    PF_ParamDef* params[],
    PF_LayerDef* output)
{
    out_data->my_version = PF_VERSION(
        mcr::kMajorVersion,
        mcr::kMinorVersion,
        mcr::kBugVersion,
        PF_Stage_DEVELOP,
        mcr::kBuildVersion);

    out_data->out_flags = PF_OutFlag_NONE;
    out_data->out_flags2 = PF_OutFlag2_PARAM_GROUP_START_COLLAPSED_FLAG;

    return PF_Err_NONE;
}

PF_Err ParamsSetup(
    PF_InData* in_data,
    PF_OutData* out_data,
    PF_ParamDef* params[],
    PF_LayerDef* output)
{
    PF_ParamDef def;

    PF_ADD_TOPICX(
        "카메라 움직임",
        PF_ParamFlag_NONE,
        mcr::kCameraGroupStartDiskId);

    PF_ADD_CHECKBOXX(
        "리그 켜기",
        TRUE,
        PF_ParamFlag_NONE,
        mcr::kEnabledDiskId);

    PF_ADD_POINT_3D(
        "위치 오프셋",
        0.0,
        0.0,
        0.0,
        mcr::kPositionOffsetDiskId);

    AEFX_CLR_STRUCT(def);
    PF_ADD_ANGLE(
        "회전 X",
        0.0,
        mcr::kRotationXDiskId);

    AEFX_CLR_STRUCT(def);
    PF_ADD_ANGLE(
        "회전 Y",
        0.0,
        mcr::kRotationYDiskId);

    AEFX_CLR_STRUCT(def);
    PF_ADD_ANGLE(
        "회전 Z",
        0.0,
        mcr::kRotationZDiskId);

    AEFX_CLR_STRUCT(def);
    PF_END_TOPIC(mcr::kCameraGroupEndDiskId);

    PF_ADD_TOPICX(
        "자동 움직임",
        PF_ParamFlag_START_COLLAPSED,
        mcr::kMotionGroupStartDiskId);

    AEFX_CLR_STRUCT(def);
    PF_ADD_POPUP(
        "흔들림",
        6,
        1,
        "없음|은은하게|핸드헬드|강하게|지진|직접 설정",
        mcr::kShakePresetDiskId);

    PF_ADD_FLOAT_SLIDERX(
        "세기",
        0.0,
        300.0,
        0.0,
        200.0,
        100.0,
        PF_Precision_HUNDREDTHS,
        0,
        PF_ParamFlag_NONE,
        mcr::kShakeIntensityDiskId);

    PF_ADD_FLOAT_SLIDERX(
        "속도",
        0.0,
        300.0,
        0.0,
        200.0,
        100.0,
        PF_Precision_HUNDREDTHS,
        0,
        PF_ParamFlag_NONE,
        mcr::kShakeSpeedDiskId);

    PF_ADD_FLOAT_SLIDERX(
        "시드",
        0.0,
        9999.0,
        0.0,
        100.0,
        1.0,
        PF_Precision_INTEGER,
        0,
        PF_ParamFlag_NONE,
        mcr::kShakeSeedDiskId);

    AEFX_CLR_STRUCT(def);
    PF_END_TOPIC(mcr::kMotionGroupEndDiskId);

    PF_ADD_TOPICX(
        "마무리",
        PF_ParamFlag_START_COLLAPSED,
        mcr::kFinishGroupStartDiskId);

    PF_ADD_BUTTON(
        "카메라 연결",
        "연결하기",
        0,
        PF_ParamFlag_SUPERVISE,
        mcr::kConnectButtonDiskId);

    PF_ADD_BUTTON(
        "Bake",
        "작업 영역 Bake",
        0,
        PF_ParamFlag_SUPERVISE,
        mcr::kBakeButtonDiskId);

    PF_ADD_BUTTON(
        "리그 지우기",
        "지우기",
        0,
        PF_ParamFlag_SUPERVISE,
        mcr::kRemoveButtonDiskId);

    AEFX_CLR_STRUCT(def);
    PF_END_TOPIC(mcr::kFinishGroupEndDiskId);

    out_data->num_params = mcr::kNumParams;
    return PF_Err_NONE;
}

PF_Err Render(
    PF_InData* in_data,
    PF_OutData* out_data,
    PF_ParamDef* params[],
    PF_LayerDef* output)
{
    return PF_COPY(
        &params[mcr::kInput]->u.ld,
        output,
        nullptr,
        nullptr);
}

PF_Err UserChangedParam(
    PF_InData* in_data,
    PF_OutData* out_data,
    PF_ParamDef* params[],
    const PF_UserChangedParamExtra* which_hit)
{
    if (which_hit == nullptr) {
        return PF_Err_NONE;
    }

    const char* message = nullptr;

    switch (which_hit->param_index) {
        case mcr::kConnectButton:
            message =
                "버튼 입력 확인 완료!\r"
                "실제 카메라 연결은 다음 단계에서 붙일게.";
            break;

        case mcr::kBakeButton:
            message =
                "Bake 버튼 입력 확인 완료!\r"
                "실제 키프레임 Bake는 다음 단계에서 붙일게.";
            break;

        case mcr::kRemoveButton:
            message =
                "지우기 버튼 입력 확인 완료!\r"
                "실제 리그 정리는 다음 단계에서 붙일게.";
            break;

        default:
            break;
    }

    if (message != nullptr) {
        PF_SPRINTF(out_data->return_msg, "%s", message);
        out_data->out_flags |= PF_OutFlag_DISPLAY_ERROR_MESSAGE;
    }

    return PF_Err_NONE;
}

}  // namespace

extern "C" DllExport PF_Err PluginDataEntryFunction2(
    PF_PluginDataPtr inPtr,
    PF_PluginDataCB2 inPluginDataCallBackPtr,
    SPBasicSuite* inSPBasicSuitePtr,
    const char* inHostName,
    const char* inHostVersion)
{
    return PF_REGISTER_EFFECT_EXT2(
        inPtr,
        inPluginDataCallBackPtr,
        mcr::kPluginName,
        mcr::kMatchName,
        mcr::kCategory,
        AE_RESERVED_INFO,
        "EffectMain",
        mcr::kSupportUrl);
}

extern "C" DllExport PF_Err EffectMain(
    PF_Cmd cmd,
    PF_InData* in_data,
    PF_OutData* out_data,
    PF_ParamDef* params[],
    PF_LayerDef* output,
    void* extra)
{
    try {
        switch (cmd) {
            case PF_Cmd_ABOUT:
                return About(in_data, out_data, params, output);

            case PF_Cmd_GLOBAL_SETUP:
                return GlobalSetup(in_data, out_data, params, output);

            case PF_Cmd_PARAMS_SETUP:
                return ParamsSetup(in_data, out_data, params, output);

            case PF_Cmd_RENDER:
                return Render(in_data, out_data, params, output);

            case PF_Cmd_USER_CHANGED_PARAM:
                return UserChangedParam(
                    in_data,
                    out_data,
                    params,
                    reinterpret_cast<const PF_UserChangedParamExtra*>(extra));

            default:
                return PF_Err_NONE;
        }
    } catch (const PF_Err& error) {
        return error;
    } catch (...) {
        return PF_Err_INTERNAL_STRUCT_DAMAGED;
    }
}
