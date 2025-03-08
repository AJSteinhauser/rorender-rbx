import React, { useState } from "@rbxts/react";
import uiConstants from "./ui-constants";

export enum ButtonType {
  outline,
  filled,
}

const getOutlineColor = (buttonType: ButtonType): Color3 => {
  return buttonType === ButtonType.filled
    ? uiConstants.primaryColor.Lerp(Color3.fromHex("FFFFFF"), 0.2)
    : uiConstants.primaryColor;
};

const getBackgroundColor = (buttonType: ButtonType): Color3 => {
  return buttonType === ButtonType.filled
    ? uiConstants.primaryColor
    : uiConstants.groundColor;
};

export function Button(props: {
  label: string;
  buttonType: ButtonType;
  size: UDim2;
  clicked: () => void;
}) {
  return (
    <textbutton
      ZIndex={3}
      Size={props.size}
      BackgroundColor3={getBackgroundColor(props.buttonType)}
      Text={props.label}
      Font={uiConstants.boldFont}
      TextSize={uiConstants.fontSizeNormal}
      TextColor3={
        props.buttonType === ButtonType.filled
          ? uiConstants.blackText
          : uiConstants.primaryColor
      }
      Event={{
        Activated: props.clicked,
      }}
    >
      <uipadding PaddingLeft={new UDim(0, 5)} PaddingRight={new UDim(0, 5)} />
      <uicorner CornerRadius={new UDim(0, uiConstants.cornerRadius)} />
      <uistroke
        Thickness={uiConstants.borderSize}
        Color={getOutlineColor(props.buttonType)}
        ApplyStrokeMode={Enum.ApplyStrokeMode.Border}
      />
    </textbutton>
  );
}
