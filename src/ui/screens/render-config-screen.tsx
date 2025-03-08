import React, { useBinding, useEffect, useRef, useState } from "@rbxts/react";
import { runRender } from "server/render-runner";
import { Settings } from "shared/settings/settings.model";
import { Button, ButtonType } from "ui/button";
import {
  autoConfigureBoundingBox,
  getCurrentRender,
  QuickSelect,
  quickSelectModule,
  setUpdaters,
  unloadRender,
} from "ui/config-helper";
import { Screens } from "ui/constants";
import { Textarea } from "ui/text-area";
import uiConstants from "ui/ui-constants";
import { ProgressUpdateData, ProgressUpdateHooks } from "./main";
import { RenderProperty } from "ui/render-property";
import { ViewFinder } from "ui/view-finder";

function isUUIDv4(input: string): boolean {
  return (
    input
      .match(
        "^%x%x%x%x%x%x%x%x%-%x%x%x%x%-4%x%x%x%-[89abAB]%x%x%x%-%x%x%x%x%x%x%x%x%x%x%x%x$",
      )
      .size() > 0
  );
}

export function RenderConfigScreen(props: {
  changeScreen: (screen: Screens) => void;
  progressHooks: ProgressUpdateHooks;
  errorOccured: (message: string) => void;
}) {
  const scrollingFrameRef = useRef<ScrollingFrame>(undefined!);
  const [renderId, setRenderId] = useState<undefined | string>(undefined);
  const [imageSize, setImageSize] = useState<string>("");
  const [scale, setScale] = useState<string>("");
  const [data, setData] = useState<string>("");
  const [needsScroll, setNeedsScroll] = useState(false);

  useEffect(() => {
    const scrollingFrame = scrollingFrameRef.current;
    if (!scrollingFrame) return;

    const checkScrolling = () => {
      const contentHeight = scrollingFrame.AbsoluteCanvasSize.Y;
      const frameHeight = scrollingFrame.AbsoluteSize.Y;
      setNeedsScroll(contentHeight > frameHeight);
    };

    const NameToLayoutOrder = () => {
      const children = scrollingFrame.GetChildren();
      children.forEach((child, index) => {
        if (child.IsA("GuiObject")) {
          child.LayoutOrder = index;
        }
      });
    };

    const sizeConnection = scrollingFrame
      .GetPropertyChangedSignal("AbsoluteSize")
      .Connect(checkScrolling);
    const canvasConnection = scrollingFrame
      .GetPropertyChangedSignal("AbsoluteCanvasSize")
      .Connect(checkScrolling);

    // Initial check with a small delay to let the layout calculations complete
    task.delay(0.1, checkScrolling);
    task.delay(0.1, NameToLayoutOrder);

    return () => {
      sizeConnection.Disconnect();
      canvasConnection.Disconnect();
    };
  }, []);

  const closeScreen = () => {
    props.changeScreen(Screens.Home);
  };

  useEffect(() => {
    setUpdaters(setImageSize, setScale, setData, closeScreen);
  }, []);

  const validateUUID = (id: string | undefined): boolean => {
    if (!id) {
      return false;
    }
    return isUUIDv4(id);
  };

  const textChanged = (text: string) => {
    setRenderId(text);
  };

  return (
    <scrollingframe
      ref={scrollingFrameRef}
      Size={UDim2.fromScale(1, 1)}
      BackgroundTransparency={1}
      CanvasSize={UDim2.fromScale(1, 0)}
      AutomaticCanvasSize={Enum.AutomaticSize.Y}
      ScrollBarThickness={8}
      ScrollBarImageColor3={uiConstants.borderColor}
      BorderSizePixel={0}
      ScrollingDirection={Enum.ScrollingDirection.Y}
    >
      <uipadding
        PaddingLeft={new UDim(0, 1)}
        PaddingTop={new UDim(0, 10)}
        PaddingBottom={new UDim(0, 10)}
        PaddingRight={new UDim(0, needsScroll ? 14 : 1)}
      />
      <uilistlayout
        HorizontalAlignment={Enum.HorizontalAlignment.Center}
        VerticalAlignment={
          needsScroll
            ? Enum.VerticalAlignment.Top
            : Enum.VerticalAlignment.Center
        }
        Padding={new UDim(0, uiConstants.spacingNormal)}
        SortOrder={Enum.SortOrder.LayoutOrder}
      />

      <textlabel
        TextColor3={uiConstants.secondayText}
        BackgroundTransparency={1}
        Font={uiConstants.boldFont}
        Text={"Quick Select"}
        Size={new UDim2(1, 0, 0, 15)}
        TextSize={uiConstants.fontSizeNormal}
        TextXAlignment={Enum.TextXAlignment.Left}
        AnchorPoint={new Vector2(0.5, 0.5)}
      />
      <frame BackgroundTransparency={1} Size={new UDim2(1, 0, 0, 110)}>
        <uilistlayout
          HorizontalAlignment={Enum.HorizontalAlignment.Center}
          VerticalAlignment={Enum.VerticalAlignment.Center}
          Padding={new UDim(0, uiConstants.spacingNormal)}
        />
        <frame BackgroundTransparency={1} Size={new UDim2(1, 0, 0, 30)}>
          <uilistlayout
            HorizontalAlignment={Enum.HorizontalAlignment.Center}
            VerticalAlignment={Enum.VerticalAlignment.Center}
            FillDirection={Enum.FillDirection.Horizontal}
            Padding={new UDim(0, uiConstants.spacingNormal)}
          />
          <Button
            label="Corner 0"
            buttonType={ButtonType.outline}
            size={new UDim2(0.5, -5, 0, 30)}
            clicked={() => quickSelectModule(QuickSelect.C0)}
          />
          <Button
            label="Corner 1"
            buttonType={ButtonType.outline}
            size={new UDim2(0.5, -5, 0, 30)}
            clicked={() => quickSelectModule(QuickSelect.C1)}
          />
        </frame>
        <Button
          label="Settings Module"
          buttonType={ButtonType.outline}
          size={new UDim2(1, 0, 0, 30)}
          clicked={() => quickSelectModule(QuickSelect.Module)}
        />
        <Button
          label="Auto Configure"
          buttonType={ButtonType.outline}
          size={new UDim2(1, 0, 0, 30)}
          clicked={() => autoConfigureBoundingBox()}
        />
      </frame>
      <frame BackgroundTransparency={1} Size={new UDim2(1, 0, 0, 5)} />

      <textlabel
        TextColor3={uiConstants.secondayText}
        BackgroundTransparency={1}
        Font={uiConstants.boldFont}
        Text={"Viewfinder"}
        Size={new UDim2(1, 0, 0, 15)}
        TextSize={uiConstants.fontSizeNormal}
        TextXAlignment={Enum.TextXAlignment.Left}
        AnchorPoint={new Vector2(0.5, 0.5)}
      />
      <ViewFinder size={new UDim2(1, 0, 0, 100)} />
      <Textarea
        label="Render Id"
        placeholder="Paste the render id here"
        size={new UDim2(1, 0, 0, 60)}
        textChanged={textChanged}
      />
      <Button
        label="Start Render"
        buttonType={ButtonType.filled}
        size={new UDim2(1, 0, 0, 30)}
        clicked={() => {
          if (validateUUID(renderId)) {
            props.changeScreen(Screens.Rendering);
            try {
              runRender(
                require(
                  (getCurrentRender() as ModuleScript).Clone(),
                ) as Settings,
                renderId as string,
                props.progressHooks,
              );
            } catch (e) {
              props.errorOccured(e as string);
            }
          } else {
            props.errorOccured(
              `${renderId} is not a valid UUID. Use the copy button to ensure the entire UUID is copied into your clipboard.`,
            );
          }
        }}
      />
      <Button
        label="Detach Configuration"
        buttonType={ButtonType.outline}
        size={new UDim2(1, 0, 0, 30)}
        clicked={() => {
          unloadRender();
          props.changeScreen(Screens.Home);
        }}
      />
      <textlabel
        TextColor3={uiConstants.secondayText}
        BackgroundTransparency={1}
        Font={uiConstants.boldFont}
        Text={"Stats"}
        Size={new UDim2(1, 0, 0, 15)}
        TextSize={uiConstants.fontSizeNormal}
        TextXAlignment={Enum.TextXAlignment.Left}
        AnchorPoint={new Vector2(0.5, 0.5)}
      />
      <frame
        BackgroundColor3={uiConstants.cardColor}
        Size={new UDim2(1, 0, 0, 85)}
      >
        <uicorner CornerRadius={new UDim(0, uiConstants.cornerRadius)} />
        <frame
          Size={new UDim2(1, -15, 1, -15)}
          BackgroundTransparency={1}
          AnchorPoint={new Vector2(0.5, 0.5)}
          Position={UDim2.fromScale(0.5, 0.5)}
        >
          <uilistlayout
            HorizontalAlignment={Enum.HorizontalAlignment.Center}
            VerticalAlignment={Enum.VerticalAlignment.Top}
            Padding={new UDim(0, uiConstants.spacingSmall)}
          />
          <RenderProperty
            size={new UDim2(1, 0, 0, 20)}
            property="Image Size"
            value={imageSize}
          />
          <RenderProperty
            size={new UDim2(1, 0, 0, 20)}
            property="Scale"
            value={scale}
          />
          <RenderProperty
            size={new UDim2(1, 0, 0, 20)}
            property="Raw Data"
            value={data}
          />
        </frame>
      </frame>
    </scrollingframe>
  );
}
