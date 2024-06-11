import { LineSegment, addVectors, distance, intersect, scaleVector, subtractVectors, vectorNorm } from "../utils/math";
import OBR, { Curve, Item, Vector2 } from "@owlbear-rodeo/sdk";
import { useCallback, useEffect, useState } from "react";

import { Checkbox } from "@mui/material";
import { WallOfForceMessage } from "../types/Message";
import { generateMetadataKey } from "../utils";
import { useOBRMessaging } from "../providers/MessageProvider";
import { useSceneItems } from "../providers/SceneItemsProvider";

type MoveEvent = {
    newPosition: Vector2;
    oldPosition?: Vector2;
    user: string;
    item: Item;
};

function getLineSegments(lines: Item[]) {
    const result: LineSegment[] = [];
    for (const line of (lines as Curve[])) {
        const linePosition = line.position;
        result.push(...line.points.slice(0, -1).map((point, index) => (
            { start: addVectors(point, linePosition), end: addVectors(line.points[index + 1], linePosition) }
        )));
    }
    return result;
}

export function GameMasterView() {
    const { items, changedItems, clearChangedItems } = useSceneItems();
    const { sendMessage, registerMessageHandler } = useOBRMessaging();

    const [lines, setLines] = useState<Item[]>([]);
    const [tokens, setTokens] = useState<Item[]>([]);
    const [modifiedTokens, setModifiedTokens] = useState<Item[]>([]);
    const recordedPosition = generateMetadataKey("recordedPosition");

    // Keep track of tokens and lines
    useEffect(() => {
        const actualChangedItems = changedItems.map(itemId => items.find(item => item.id === itemId));

        const lines = items.filter(item => item.type === "CURVE");
        const tokens = items.filter(item => item.type === "IMAGE");
        const newTokens = actualChangedItems.filter(item => item?.type === "IMAGE") as Item[];

        setTokens(tokens);
        setLines(lines);
        setModifiedTokens(newTokens);
        
        if (changedItems.length === 0) return;

        clearChangedItems();
    }, [changedItems]);

    // Fire events when tokens move
    useEffect(() => {
        const eventsToProcess: MoveEvent[] = [];
        for (const token of tokens) {
            const newPosition = token.position;
            const oldPosition = token.metadata[recordedPosition] as Vector2 | undefined;

            if (oldPosition != undefined && oldPosition.x === newPosition.x && oldPosition.y === newPosition.y) continue;
            
            eventsToProcess.push({item: token, newPosition, oldPosition, user: token.lastModifiedUserId});
        }

        if (!eventsToProcess)
            return; 

        const newItemPositions: {item: Item, position?: Vector2, initialPosition: Vector2}[] = [];
        const walls = getLineSegments(lines);
        const playerCollisions = new Set<string>();            

        for (const event of eventsToProcess) {
            const oldPosition = event.oldPosition;
            const user = event.user;
            let candidateNewPosition: Vector2|undefined = undefined;

            if (oldPosition != undefined) {
                const itemVelocity = { start: oldPosition!, end: event.newPosition };
                
                const intersections = walls
                    .map(wall => intersect(itemVelocity, wall))
                    .filter(intersection => intersection != null) as Vector2[];
                intersections.sort((a, b) => distance(a, oldPosition) - distance(b, oldPosition));

                if (intersections.length > 0) {
                    const velocityVector = subtractVectors(itemVelocity.end, itemVelocity.start);
                    const velocityVectorNorm = vectorNorm(velocityVector);
                    const unitVelocityVector = scaleVector(velocityVector, 1 / velocityVectorNorm);
                    candidateNewPosition = addVectors(intersections[0], scaleVector(unitVelocityVector, -5));
                    playerCollisions.add(user);
                }
            }

            newItemPositions.push({
                item: event.item,
                position: candidateNewPosition,
                initialPosition: event.newPosition
            });
            
            sendMessage({
                action: "collisionNotification",
                payload: "Collision detected: tokens were moved to avoid the walls"
            }, Array.from(playerCollisions));
        }

        OBR.scene.items.updateItems(newItemPositions.map(info => info.item), draft => {
            draft.forEach((item, index) => {
                if (newItemPositions[index].position) {
                    item.position = newItemPositions[index].position;
                    item.metadata[recordedPosition] = newItemPositions[index].position;
                }
                else {
                    item.metadata[recordedPosition] = newItemPositions[index].initialPosition;
                }
            });
        }).then(() => {});       

    }, [modifiedTokens]);

    useEffect(() => {
        return registerMessageHandler(message => {
            const messageData = message.message as WallOfForceMessage;
            if (messageData.action !== "collisionNotification") return;

            // OBR.notification.show(messageData.payload, "WARNING");            
        });
    }, []);

    const Menu = useCallback(() => {
        return (
            <div style={{paddingLeft: "1rem", paddingRight: "1rem"}}>
                <h3>Wall of Force - Configuration</h3>
                <hr></hr>
                <div style={{display: "flex", justifyContent: "space-between"}}>
                    <div style={{textAlign: "left"}}>Enable Wall of Force</div>
                    <div style={{textAlign: "right"}}>
                        <Checkbox />
                    </div>
                </div>
                <div style={{display: "flex", justifyContent: "space-between"}}>
                    <div style={{textAlign: "left"}}>Show Collision Messages</div>
                    <div style={{textAlign: "right"}}>
                        <Checkbox />
                    </div>
                </div>
            </div>
        );
    }, []);

    return <Menu />;
}
