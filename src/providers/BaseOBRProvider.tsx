import OBR, { Metadata, Permission, Player } from "@owlbear-rodeo/sdk";
import React, { createContext, useContext, useEffect, useState } from "react";

interface BaseOBRContextType {
    party: Player[];
    player: Player|null;
    roomMetadata: Metadata;
    setRoomMetadata: (metadata: Partial<Metadata>) => void;
    roomPermissions: Permission[];
};

const BaseOBRContext = createContext<BaseOBRContextType>({
    party: [],
    player: null,
    roomMetadata: {},
    setRoomMetadata: () => {},
    roomPermissions: [],
});
export const useOBR = () => useContext(BaseOBRContext);

export function BaseOBRProvider({ children }: { children: React.ReactNode }) {
    const [ party, setParty ] = useState<Player[]>([]);
    const [ player, setPlayer ] = useState<Player|null>(null);
    const [ roomMetadata, _setRoomMetadata ] = useState<Metadata>({});
    const [ roomPermissions, setRoomPermissions ] = useState<Permission[]>([]);

    // Subscribe to party changes
    useEffect(() => {
        return OBR.party.onChange(players => {
            setParty(players);
        });
    }, []);
    useEffect(() => {
        OBR.party.getPlayers().then(setParty);
    }, []);

    // Subscribe to player changes
    useEffect(() => {
        return OBR.player.onChange(newPlayer => {
            setPlayer(newPlayer);
        });
    }, []);
    useEffect(() => {
        if (player === null) {
            setPlayer(party.find(player => player.id === OBR.player.id) ?? null);
        }
    }, [party]);

    // Subscribe to metadata changes
    useEffect(() => {
        return OBR.room.onMetadataChange(metadata => {
            _setRoomMetadata(metadata);
        });
    }, []);
    useEffect(() => {
        OBR.room.getMetadata().then(_setRoomMetadata);
    }, []);
    const setRoomMetadata = (metadata: Partial<Metadata>) => {
        OBR.room.setMetadata(metadata);
    }

    // Subscribe to permission changes
    useEffect(() => {
        return OBR.room.onPermissionsChange(permissions => {
            setRoomPermissions(permissions);
        });
    }, []);
    useEffect(() => {
        OBR.room.getPermissions().then(setRoomPermissions);
    }, []);

    return <BaseOBRContext.Provider value={{party, player, roomMetadata, setRoomMetadata, roomPermissions}}>
        { children }
    </BaseOBRContext.Provider>;
}
