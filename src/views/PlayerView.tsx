import OBR from "@owlbear-rodeo/sdk";
import { WallOfForceMessage } from "../types/Message";
import { useEffect } from "react";
import { useOBRMessaging } from "../providers/MessageProvider";

export function PlayerView() {
    const { registerMessageHandler } = useOBRMessaging();

    useEffect(() => {
        return registerMessageHandler(message => {
            const messageData = message.message as WallOfForceMessage;
            if (messageData.action !== "collisionNotification") return;

            OBR.notification.show(messageData.payload, "WARNING");            
        });
    }, []);
    
    return <p>This extension is only available for your Game Master.</p>;
}
