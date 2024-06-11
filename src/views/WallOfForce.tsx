import { GameMasterView } from "./GameMasterView";
import { PlayerView } from "./PlayerView";
import { ThreeDots } from "react-loader-spinner";
import { useOBR } from "../providers/BaseOBRProvider";

export function WallOfForce() {
    const { player } = useOBR();

    if (player === null) {
        return <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ThreeDots
                color="var(--OBR-Purple-Select)"
            />
        </div>;
    }

    if (player.role === "GM") {
        return <GameMasterView />;
    }

    if (player.role === "PLAYER") {
        return <PlayerView />;
    }
}
