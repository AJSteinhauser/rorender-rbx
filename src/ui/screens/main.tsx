import React, { useState } from "@rbxts/react";
import { StartScreen } from "./start-screen";
import { RenderConfigScreen } from "./render-config-screen";
import { Screens } from "ui/constants";
import uiConstants from "ui/ui-constants";
import { RenderProgressScreen } from "./rendering-progress-screen";


export interface ProgressUpdateData {
    currentProgess: number
    currentStatusText: string
}

export interface ProgressUpdateHooks {
    setCurrentProgress: React.Dispatch<React.SetStateAction<number>>
    setCurrentStatusText: React.Dispatch<React.SetStateAction<string>>
    renderComplete: () => void
}

export function Main() {
    const [selectedScreen, setSelectedScreen] = useState(Screens.Home);

    const changeScreen = (screen: Screens) => {
        setSelectedScreen(screen)
    }

    const [currentProgess, setCurrentProgress] = useState(0);
    const [currentStatusText, setCurrentStatusText] = useState("");

    const renderComplete = () => {
        task.wait(5)
        changeScreen(Screens.Configuration)
    }

    const progressUpdateHooks: ProgressUpdateHooks = {
        setCurrentProgress,
        setCurrentStatusText,
        renderComplete
    }

    const progressUpdateData: ProgressUpdateData = {
        currentProgess,
        currentStatusText
    }

    const renderedScreen = () => {
        switch(selectedScreen){
            case Screens.Home:
                return <StartScreen changeScreen={changeScreen} />
            case Screens.Configuration:
                return <RenderConfigScreen changeScreen={changeScreen} progressHooks={progressUpdateHooks} />
            case Screens.Rendering:
                return <RenderProgressScreen changeScreen={changeScreen} progressData={progressUpdateData} />
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
