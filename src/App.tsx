import { useEffect, useState } from "react";

import { BaseOBRProvider } from "./providers/BaseOBRProvider";
import { NoScene } from "./NoScene";
import OBR from "@owlbear-rodeo/sdk";
import { OBRMessageProvider } from "./providers/MessageProvider";
import { SceneItemsProvider } from "./providers/SceneItemsProvider";
import { WallOfForce } from "./views/WallOfForce";

export default function App() {
    const [sceneReady, setSceneReady] = useState(false);

    useEffect(() => {
        OBR.scene.isReady().then(setSceneReady);
        return OBR.scene.onReadyChange(setSceneReady);
    }, []);

    if (sceneReady) {
        return (
            <BaseOBRProvider>
                <OBRMessageProvider>
                    <SceneItemsProvider>
                        <WallOfForce />
                    </SceneItemsProvider>
                </OBRMessageProvider>
            </BaseOBRProvider>
        );
    } else {
        return <NoScene />;
    }
}
