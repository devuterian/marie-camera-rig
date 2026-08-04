#target aftereffects
#targetengine "mcrFfxButtonLab"

/*
marierie Camera Rig — FFX Button Lab

목적
- .ffx 안의 pseudo effect는 예쁜 값 UI를 맡는다.
- 실제 실행 버튼은 ScriptUI 패널이 맡는다.
- Effect Controls 안의 체크박스도 버튼처럼 쓸 수 있는지 실험한다.
  패널이 열려 있는 동안 scheduleTask가 체크박스를 감시하고,
  체크되면 작업을 실행한 뒤 자동으로 다시 끈다.

이 파일은 카메라 리그 본체가 아니라 버튼 동작 검증용 프로토타입이다.
*/

(function mcrFfxButtonLab(thisObj) {
    var SCRIPT_NAME = "MCR FFX Button Lab";
    var VERSION = "0.1.0";
    var CONTROLLER_NAME = "[MCR LAB] 카메라 컨트롤";
    var CONTROLLER_SIGNATURE = "MCR_FFX_BUTTON_LAB_V1";
    var PSEUDO_MATCH_NAME = "Pseudo/marierie_camera_rig_v1";
    var PSEUDO_DISPLAY_NAME = "marierie Camera Rig";
    var POLL_INTERVAL_MS = 300;

    var ACTION = {
        IMPACT: "⚡ 충격 추가",
        RESET: "↺ 값 초기화",
        BAKE: "● Bake 요청",
        REMOVE: "✕ 리그 지우기"
    };

    var DEFAULTS = {
        "리그 켜기": 1,
        "이동 기준": 1,
        "위치 더하기": [0, 0, 0],
        "회전 X": 0,
        "회전 Y": 0,
        "회전 Z": 0,
        "타깃 섞기": 0,
        "타깃 바라보기": 0,
        "자동 초점": 0,
        "초점 보정": 0,
        "느린 흔들림": 0,
        "흔들림 프리셋": 1,
        "흔들림 세기": 100,
        "흔들림 속도": 100,
        "흔들림 시드": 1,
        "렌즈 직접 설정": 0,
        "초점 거리 (mm)": 50,
        "줌 보정": 0,
        "심도 켜기": 0,
        "조리개": 36,
        "블러 양": 100
    };

    var state = {
        panel: null,
        statusText: null,
        listenerButton: null,
        taskId: 0,
        busy: false,
        listenerEnabled: true
    };

    function isComp(item) {
        return item && item instanceof CompItem;
    }

    function activeComp() {
        var item = app.project.activeItem;
        return isComp(item) ? item : null;
    }

    function setStatus(message) {
        if (state.statusText) {
            state.statusText.text = message;
            try { state.panel.layout.layout(true); } catch (e) {}
        }
    }

    function clearSelection(comp) {
        var i;
        for (i = 1; i <= comp.numLayers; i++) {
            comp.layer(i).selected = false;
        }
    }

    function isCamera(layer) {
        try { return layer && layer instanceof CameraLayer; }
        catch (e) { return false; }
    }

    function selectedCamera(comp) {
        var selected = comp.selectedLayers;
        var i;
        for (i = 0; i < selected.length; i++) {
            if (isCamera(selected[i])) return selected[i];
        }
        return null;
    }

    function activeCamera(comp) {
        try {
            var camera = comp.activeCamera;
            return isCamera(camera) ? camera : null;
        } catch (e) {
            return null;
        }
    }

    function ensureCamera(comp) {
        var camera = selectedCamera(comp) || activeCamera(comp);
        if (camera) return camera;
        return comp.layers.addCamera(
            "MCR 카메라",
            [comp.width / 2, comp.height / 2]
        );
    }

    function isController(layer) {
        if (!layer) return false;
        if (layer.name === CONTROLLER_NAME) return true;
        try {
            return String(layer.comment).indexOf(CONTROLLER_SIGNATURE) >= 0;
        } catch (e) {
            return false;
        }
    }

    function findController(comp) {
        var selected = comp.selectedLayers;
        var i;
        for (i = 0; i < selected.length; i++) {
            if (isController(selected[i])) return selected[i];
        }
        for (i = 1; i <= comp.numLayers; i++) {
            if (isController(comp.layer(i))) return comp.layer(i);
        }
        return null;
    }

    function addFallbackEffect(layer, matchName, displayName, defaultValue, items) {
        var parade = layer.property("ADBE Effect Parade");
        var existing = parade.property(displayName);
        if (existing) return existing;
        if (!parade.canAddProperty(matchName)) {
            throw new Error("컨트롤을 만들 수 없어: " + displayName);
        }

        var fx = parade.addProperty(matchName);
        fx.name = displayName;

        if (items && matchName === "ADBE Dropdown Control") {
            var menu = fx.property(1);
            menu = menu.setPropertyParameters(items);
            menu.setValue(defaultValue);
        } else {
            fx.property(1).setValue(defaultValue);
        }
        return fx;
    }

    function makeControllerArtwork(layer) {
        try {
            var root = layer.property("ADBE Root Vectors Group");
            var group = root.addProperty("ADBE Vector Group");
            group.name = "MCR LAB";
            var contents = group.property("ADBE Vectors Group");

            var path = contents.addProperty("ADBE Vector Shape - Group");
            var shape = new Shape();
            shape.vertices = [[-70, 0], [70, 0], [0, 0], [0, -70], [0, 70]];
            shape.inTangents = [[0,0],[0,0],[0,0],[0,0],[0,0]];
            shape.outTangents = [[0,0],[0,0],[0,0],[0,0],[0,0]];
            shape.closed = false;
            path.property("ADBE Vector Shape").setValue(shape);

            var stroke = contents.addProperty("ADBE Vector Graphic - Stroke");
            stroke.property("ADBE Vector Stroke Color").setValue([1, 0.42, 0.64]);
            stroke.property("ADBE Vector Stroke Width").setValue(5);
        } catch (e) {}
    }

    function ensureFallbackControls(controller, camera) {
        addFallbackEffect(controller, "ADBE Layer Control", "카메라", camera.index);
        addFallbackEffect(controller, "ADBE Checkbox Control", "리그 켜기", 1);
        addFallbackEffect(controller, "ADBE Dropdown Control", "이동 기준", 1, ["월드", "카메라 기준"]);
        addFallbackEffect(controller, "ADBE Point3D Control", "위치 더하기", [0, 0, 0]);
        addFallbackEffect(controller, "ADBE Angle Control", "회전 X", 0);
        addFallbackEffect(controller, "ADBE Angle Control", "회전 Y", 0);
        addFallbackEffect(controller, "ADBE Angle Control", "회전 Z", 0);
        addFallbackEffect(controller, "ADBE Dropdown Control", "흔들림 프리셋", 1, [
            "없음", "은은하게", "핸드헬드", "강하게", "지진", "직접 설정"
        ]);
        addFallbackEffect(controller, "ADBE Slider Control", "흔들림 세기", 100);
        addFallbackEffect(controller, "ADBE Slider Control", "흔들림 속도", 100);
        addFallbackEffect(controller, "ADBE Slider Control", "흔들림 시드", 1);
        addFallbackEffect(controller, "ADBE Checkbox Control", ACTION.IMPACT, 0);
        addFallbackEffect(controller, "ADBE Checkbox Control", ACTION.RESET, 0);
        addFallbackEffect(controller, "ADBE Checkbox Control", ACTION.BAKE, 0);
        addFallbackEffect(controller, "ADBE Checkbox Control", ACTION.REMOVE, 0);
    }

    function buildController() {
        var comp = activeComp();
        if (!comp) {
            alert(SCRIPT_NAME + "\n\n컴포지션을 하나 열어줘.");
            return null;
        }

        app.beginUndoGroup(SCRIPT_NAME + " - 컨트롤 만들기");
        try {
            var camera = ensureCamera(comp);
            var controller = findController(comp);

            if (!controller) {
                controller = comp.layers.addShape();
                controller.name = CONTROLLER_NAME;
                controller.comment = CONTROLLER_SIGNATURE;
                controller.guideLayer = true;
                controller.threeDLayer = true;
                controller.label = 14;
                makeControllerArtwork(controller);
            }

            ensureFallbackControls(controller, camera);
            clearSelection(comp);
            controller.selected = true;
            setStatus("컨트롤 준비 끝. Effect Controls의 실행 체크박스도 눌러봐.");
            return controller;
        } catch (error) {
            alert(SCRIPT_NAME + "\n\n컨트롤을 만드는 중에 문제가 생겼어:\n" + error.toString());
            return null;
        } finally {
            app.endUndoGroup();
        }
    }

    function applyFfxPreset() {
        var comp = activeComp();
        if (!comp) {
            alert(SCRIPT_NAME + "\n\n컴포지션을 하나 열어줘.");
            return;
        }

        var controller = findController(comp) || buildController();
        if (!controller) return;

        var preset = File.openDialog("적용할 .ffx를 골라줘", "After Effects Preset:*.ffx");
        if (!preset) return;

        app.beginUndoGroup(SCRIPT_NAME + " - FFX 적용");
        try {
            clearSelection(comp);
            controller.selected = true;
            controller.applyPreset(preset);
            setStatus("FFX 적용 완료. 이름이 맞는 실행 체크박스는 바로 감시할게.");
        } catch (error) {
            alert(SCRIPT_NAME + "\n\nFFX를 적용하지 못했어:\n" + error.toString());
        } finally {
            app.endUndoGroup();
        }
    }

    function recursiveProperty(group, name) {
        if (!group) return null;
        var i, prop;
        try {
            if (group.name === name) return group;
        } catch (e0) {}

        for (i = 1; i <= group.numProperties; i++) {
            prop = group.property(i);
            try {
                if (prop.name === name) return prop;
            } catch (e1) {}
            try {
                if (prop.numProperties > 0) {
                    var nested = recursiveProperty(prop, name);
                    if (nested) return nested;
                }
            } catch (e2) {}
        }
        return null;
    }

    function findPseudoEffect(controller) {
        var parade = controller.property("ADBE Effect Parade");
        var i, fx;
        for (i = 1; i <= parade.numProperties; i++) {
            fx = parade.property(i);
            try {
                if (fx.matchName === PSEUDO_MATCH_NAME || fx.name === PSEUDO_DISPLAY_NAME) {
                    return fx;
                }
            } catch (e) {}
        }
        return null;
    }

    function controlProperty(controller, name) {
        var pseudo = findPseudoEffect(controller);
        var prop;
        if (pseudo) {
            prop = recursiveProperty(pseudo, name);
            if (prop && prop.propertyValueType !== PropertyValueType.NO_VALUE) return prop;
        }

        var parade = controller.property("ADBE Effect Parade");
        var fx = parade.property(name);
        if (fx) {
            try { return fx.property(1); } catch (e) {}
        }
        return null;
    }

    function setControl(controller, name, value) {
        var prop = controlProperty(controller, name);
        if (!prop) return false;
        try {
            prop.setValue(value);
            return true;
        } catch (e) {
            return false;
        }
    }

    function isPressed(controller, name) {
        var prop = controlProperty(controller, name);
        if (!prop) return false;
        try { return Number(prop.value) >= 0.5; }
        catch (e) { return false; }
    }

    function addImpact(comp, controller) {
        var marker = new MarkerValue("MCR_IMPACT");
        try { marker.label = 9; } catch (e) {}
        controller.property("ADBE Marker").setValueAtTime(comp.time, marker);
        setStatus("현재 프레임에 MCR_IMPACT 마커를 넣었어.");
    }

    function resetValues(controller) {
        var key;
        for (key in DEFAULTS) {
            if (DEFAULTS.hasOwnProperty(key)) {
                setControl(controller, key, DEFAULTS[key]);
            }
        }
        setStatus("기본값으로 돌렸어.");
    }

    function requestBake(comp, controller) {
        var frames = Math.max(1, Math.round(comp.workAreaDuration / comp.frameDuration));
        var marker = new MarkerValue("MCR_BAKE_REQUEST " + frames + "f");
        try { marker.label = 10; } catch (e) {}
        controller.property("ADBE Marker").setValueAtTime(comp.time, marker);
        setStatus("Bake 버튼 전달 확인: 작업 영역 " + frames + "프레임.");
    }

    function runAction(actionName) {
        var comp = activeComp();
        if (!comp) return;
        var controller = findController(comp);
        if (!controller) return;

        app.beginUndoGroup(SCRIPT_NAME + " - " + actionName);
        try {
            setControl(controller, actionName, 0);
            if (actionName === ACTION.IMPACT) {
                addImpact(comp, controller);
            } else if (actionName === ACTION.RESET) {
                resetValues(controller);
            } else if (actionName === ACTION.BAKE) {
                requestBake(comp, controller);
            } else if (actionName === ACTION.REMOVE) {
                controller.remove();
                setStatus("실험용 컨트롤을 지웠어.");
            }
        } finally {
            app.endUndoGroup();
        }
    }

    function pollActionControls() {
        if (!state.listenerEnabled || state.busy) return;
        state.busy = true;
        try {
            var comp = activeComp();
            if (!comp) return;
            var controller = findController(comp);
            if (!controller) return;

            if (isPressed(controller, ACTION.IMPACT)) {
                runAction(ACTION.IMPACT);
                return;
            }
            if (isPressed(controller, ACTION.RESET)) {
                runAction(ACTION.RESET);
                return;
            }
            if (isPressed(controller, ACTION.BAKE)) {
                runAction(ACTION.BAKE);
                return;
            }
            if (isPressed(controller, ACTION.REMOVE)) {
                runAction(ACTION.REMOVE);
            }
        } catch (error) {
        } finally {
            state.busy = false;
        }
    }

    function stopListener() {
        if (state.taskId) {
            try { app.cancelTask(state.taskId); } catch (e) {}
            state.taskId = 0;
        }
    }

    function startListener() {
        stopListener();
        state.taskId = app.scheduleTask(
            "$.global.__mcrFfxButtonLab.poll()",
            POLL_INTERVAL_MS,
            true
        );
    }

    function updateListenerButton() {
        if (!state.listenerButton) return;
        state.listenerButton.text = state.listenerEnabled
            ? "Effect Controls 버튼 감시: 켜짐"
            : "Effect Controls 버튼 감시: 꺼짐";
    }

    function toggleListener() {
        state.listenerEnabled = !state.listenerEnabled;
        updateListenerButton();
        setStatus(state.listenerEnabled
            ? "실행 체크박스를 버튼처럼 감시하고 있어."
            : "실행 체크박스 감시를 잠깐 껐어.");
    }

    function makeButton(parent, label, helpTip, onClick) {
        var button = parent.add("button", undefined, label);
        button.helpTip = helpTip || "";
        button.onClick = onClick;
        return button;
    }

    function buildUI() {
        var panel = thisObj instanceof Panel
            ? thisObj
            : new Window("palette", SCRIPT_NAME, undefined, {resizeable: true});

        state.panel = panel;
        panel.orientation = "column";
        panel.alignChildren = ["fill", "top"];
        panel.spacing = 8;
        panel.margins = 10;

        var header = panel.add("group");
        header.orientation = "row";
        header.alignChildren = ["left", "center"];
        var title = header.add("statictext", undefined, "marierie Camera Rig");
        try { title.graphics.font = ScriptUI.newFont(title.graphics.font.name, "BOLD", 14); } catch (e) {}
        var version = header.add("statictext", undefined, "FFX Button Lab v" + VERSION);
        version.alignment = ["right", "center"];

        state.statusText = panel.add(
            "statictext",
            undefined,
            "진짜 버튼은 패널에, 예쁜 값 UI는 FFX에 두는 구조를 시험해.",
            {multiline: true}
        );
        state.statusText.alignment = ["fill", "top"];

        var setupPanel = panel.add("panel", undefined, "준비");
        setupPanel.orientation = "column";
        setupPanel.alignChildren = ["fill", "top"];
        setupPanel.margins = 10;

        makeButton(setupPanel, "실험용 카메라 컨트롤 만들기", "카메라가 없으면 만들고 테스트 컨트롤을 추가해.", buildController);
        makeButton(setupPanel, "FFX 골라서 컨트롤에 적용", "검사할 FFX를 직접 골라 적용해.", applyFfxPreset);

        var actionPanel = panel.add("panel", undefined, "실행 버튼");
        actionPanel.orientation = "column";
        actionPanel.alignChildren = ["fill", "top"];
        actionPanel.margins = 10;

        var row1 = actionPanel.add("group");
        row1.orientation = "row";
        row1.alignChildren = ["fill", "center"];
        makeButton(row1, "충격 추가", "현재 프레임에 충격 마커를 넣어.", function () { runAction(ACTION.IMPACT); });
        makeButton(row1, "값 초기화", "컨트롤 값을 기본값으로 돌려.", function () { runAction(ACTION.RESET); });

        var row2 = actionPanel.add("group");
        row2.orientation = "row";
        row2.alignChildren = ["fill", "center"];
        makeButton(row2, "Bake 전달 시험", "실제 Bake 대신 요청 마커를 만들어 버튼 전달만 확인해.", function () { runAction(ACTION.BAKE); });
        makeButton(row2, "실험용 리그 지우기", "실험용 컨트롤 레이어를 지워.", function () { runAction(ACTION.REMOVE); });

        state.listenerButton = makeButton(
            actionPanel,
            "",
            "FFX 안의 실행 체크박스를 0.3초마다 확인하고 버튼처럼 처리해.",
            toggleListener
        );
        updateListenerButton();

        var note = panel.add(
            "statictext",
            undefined,
            "핵심: FFX 안에는 실행형 버튼이 없어서 체크박스를 순간 스위치로 쓰고, " +
            "열려 있는 ScriptUI 패널이 작업을 받아 실행한 뒤 체크를 자동으로 풀어.",
            {multiline: true}
        );
        note.alignment = ["fill", "top"];

        panel.onResizing = panel.onResize = function () {
            this.layout.resize();
        };

        if (panel instanceof Window) {
            panel.onClose = function () {
                stopListener();
                return true;
            };
            panel.center();
            panel.show();
        } else {
            panel.layout.layout(true);
        }
        return panel;
    }

    if ($.global.__mcrFfxButtonLab && $.global.__mcrFfxButtonLab.stop) {
        try { $.global.__mcrFfxButtonLab.stop(); } catch (e) {}
    }

    $.global.__mcrFfxButtonLab = {
        poll: pollActionControls,
        stop: stopListener
    };

    buildUI();
    startListener();
})(this);
