import { VIEWFINDER_IMAGE_SIZE } from "shared/render/render.model";
import { setViewfinderImage } from "./config-helper";
import uiConstants from "./ui-constants";
import React, { useEffect, useRef, useState } from "@rbxts/react";

const assetService = game.GetService("AssetService")

export function ViewFinder(props: {
    size: UDim2,
}) {

    const editageImageRef = useRef<EditableImage | undefined>(undefined)
    const contentRef = useRef<Content | undefined>(undefined)
    useEffect(() => {
        if (!editageImageRef.current) {
            const editableImage = assetService.CreateEditableImage({Size: VIEWFINDER_IMAGE_SIZE})
            editageImageRef.current = editableImage

            const content = Content.fromObject(editableImage)
            contentRef.current = content
            setViewfinderImage(editableImage)
        }
    }, [])

	return (
        <frame
            Size={UDim2.fromOffset(150,150)}
            BackgroundColor3={uiConstants.cardColor}
        >
			<uicorner CornerRadius={new UDim(0, uiConstants.cornerRadius)} />
			<uistroke
				Thickness={uiConstants.borderSize}
				Color={uiConstants.primaryColor}
				ApplyStrokeMode={Enum.ApplyStrokeMode.Border}
			/>

			<uipadding PaddingLeft={new UDim(0, 2)} PaddingRight={new UDim(0, 2)} />
            <imagelabel
                Size={UDim2.fromScale(1,1)}
                ImageContent={contentRef.current}
                BackgroundTransparency={1}
            >
            </imagelabel>
        </frame>
	);
}

