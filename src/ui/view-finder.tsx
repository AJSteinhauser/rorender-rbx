import uiConstants from "./ui-constants";
import React, { useState } from "@rbxts/react";

const assetService = game.GetService("AssetService")

export function ViewFinder(props: {
    size: UDim2,
}) {
    const generateViewfinderImage = () => {
        const image = assetService.CreateEditableImage()
    }
	return (
        <frame
            Size={props.size}
            BackgroundColor3={uiConstants.primaryColor}
        >
            <frame
                Size={new UDim2(1,-4, 1, -4)}
                AnchorPoint={new Vector2(.5, .5)}
                Position={UDim2.fromScale(.5,.5)}
                BackgroundColor3={uiConstants.cardColor}
            >
                <imagelabel
                >
                </imagelabel>
            </frame>
        </frame>
	);
}

