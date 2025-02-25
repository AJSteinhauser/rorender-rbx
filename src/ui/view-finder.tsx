import uiConstants from "./ui-constants";
import React, { useEffect, useRef, useState } from "@rbxts/react";

const assetService = game.GetService("AssetService")

export function ViewFinder(props: {
    size: UDim2,
}) {

    const editageImageRef = useRef<EditableImage | undefined>(undefined)
    useEffect(() => {
        if (!editageImageRef.current) {
            editageImageRef.current = assetService.CreateEditableImage()
        }
    }, [])

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
                    Size={UDim2.fromScale(1,1)}
                    //ImageContent={editageImageRef.current}
                    BackgroundColor3={new Color3(1, 0, 0)}
                >
                </imagelabel>
            </frame>
        </frame>
	);
}

