import {
    type ApiSocket,
    type ApiBuilder,
    BSClientToServer,
    BattleShips,
    BSServerToClient,
    UpdatedGameState,
    ClientBattleShips,
    UserType,
    GameWon,
} from '../../../types/types';

export function subscribeToBattleShips(builder: ApiBuilder, socket: ApiSocket) {
    return builder.query<ClientBattleShips, UserType>({
        queryFn: (userType: UserType) => {
            return new Promise((resolve) => {
                socket.emit(
                    BSClientToServer.RequestingGameState,
                    userType,
                    (BSGame: ClientBattleShips) => {
                        resolve({ data: BSGame });
                    }
                );
            });
        },
        async onCacheEntryAdded(
            _userType,
            { cacheDataLoaded, cacheEntryRemoved, updateCachedData }
        ) {
            try {
                await cacheDataLoaded;
                socket.on(BSServerToClient.PlayersReady, () => {
                    updateCachedData((draft) => {
                        return { ...draft, hostReady: true, guestReady: true };
                    });
                });
                socket.on(
                    BSServerToClient.PlayerMoved,
                    (update: UpdatedGameState<BattleShips>) => {
                        updateCachedData((draft) => {
                            draft.playerToMove = update.playerToMove;
                            if (update.newMove.result === 'miss') {
                                draft[
                                    (update.newMove.target + 'Misses') as keyof Pick<
                                        ClientBattleShips,
                                        'hostMisses' | 'guestMisses'
                                    >
                                ].push(update.newMove.coordinates);
                            } else {
                                const ships =
                                    draft[
                                        (update.newMove.target + 'Ships') as keyof Pick<
                                            ClientBattleShips,
                                            'hostShips' | 'guestShips'
                                        >
                                    ];
                                if (!ships) {
                                    draft[
                                        (update.newMove.target + 'Ships') as keyof Pick<
                                            ClientBattleShips,
                                            'hostShips' | 'guestShips'
                                        >
                                    ] = [
                                        {
                                            name: update.newMove.name,
                                            state: 'O',
                                            coords: [
                                                [...update.newMove.coordinates, 'X'],
                                            ],
                                        },
                                    ];
                                } else {
                                    const targetShip = ships.findIndex(
                                        (ship) =>
                                            ship.name ===
                                            (update as { newMove: { name: string } })
                                                .newMove.name //? No idea what is going on here
                                    );
                                    if (targetShip === -1) {
                                        ships.push({
                                            name: update.newMove.name,
                                            state: 'O',
                                            coords: [
                                                [...update.newMove.coordinates, 'X'],
                                            ],
                                        });
                                    } else {
                                        ships[targetShip].coords = ships[
                                            targetShip
                                        ].coords.map((shipBlock) =>
                                            shipBlock[0] ===
                                                update.newMove.coordinates[0] &&
                                            shipBlock[1] === update.newMove.coordinates[1]
                                                ? [shipBlock[0], shipBlock[1], 'X']
                                                : shipBlock
                                        );
                                        if (update.newMove.result === 'destroyed') {
                                            ships[targetShip].state = 'X';
                                        }
                                    }
                                }
                            }
                        });
                    }
                );
                socket.on(BSServerToClient.GameWon, (gameWon: GameWon<BattleShips>) => {
                    updateCachedData((draft) => {
                        return { ...draft, winner: gameWon.winner };
                    });
                });
                await cacheEntryRemoved;
                socket.off(BSServerToClient.PlayersReady);
                socket.off(BSServerToClient.PlayerMoved);
                socket.off(BSServerToClient.GameWon);
            } catch {
                // if cacheEntryRemoved resolved before cacheDataLoaded,
                // cacheDataLoaded throws
            }
        },
        providesTags: ['GameState'],
    });
}
