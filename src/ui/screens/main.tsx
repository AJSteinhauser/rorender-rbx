import React, { useState } from "@rbxts/react";
import { StartScreen } from "./start-screen";
import { RenderConfigScreen } from "./render-config-screen";
import { Screens } from "ui/constants";
import uiConstants from "ui/ui-constants";


export function Main() {
    const [selectedScreen, setSelectedScreen] = useState(Screens.Home);

    const changeScreen = (screen: Screens) => {
        setSelectedScreen(screen)
    }

    const renderedScreen = () => {
        switch(selectedScreen){
            case Screens.Home:
                return <StartScreen changeScreen={changeScreen} />
            case Screens.Configuration:
                return <RenderConfigScreen changeScreen={changeScreen} />
            case Screens.Rendering:
        }
    }

	return (
        <frame
            Size={UDim2.fromScale(1,1)}
            BackgroundColor3={uiConstants.groundColor}
        >
            <frame
                Size={new UDim2(1,-50,1,-50)}
                Position={UDim2.fromScale(.5,.5)}
                AnchorPoint={new Vector2(.5,.5)}
                BackgroundTransparency={1}
            >
                {renderedScreen()}
            </frame>
        </frame>
	);
}
