import {
    type ApiSocket,
    type ApiBuilder,
    BSClientToServer,
    BattleShips,
    BSServerToClient,
    UpdatedGameState,
    ClientBattleShips,
    UserType,
    Ship,
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
                            const newState = { ...draft };
                            newState.playerToMove = update.playerToMove;
                            if (update.newMove.result === 'miss') {
                                newState[
                                    (update.newMove.target + 'Misses') as keyof Pick<
                                        ClientBattleShips,
                                        'hostMisses' | 'guestMisses'
                                    >
                                ].push(update.newMove.coordinates);
                                return newState;
                            }
                            const ships =
                                newState[
                                    (update.newMove.target + 'Ships') as keyof Pick<
                                        ClientBattleShips,
                                        'hostShips' | 'guestShips'
                                    >
                                ];
                            const targetShip = ships?.findIndex(
                                (ship) =>
                                    ship.name ===
                                    (update as { newMove: { name: string } }).newMove.name //? No idea what is going on here
                            );

                            (ships as Ship[])[targetShip as number].coords = (
                                ships as Ship[]
                            )[targetShip as number].coords.map((shipBlock) =>
                                shipBlock[0] === update.newMove.coordinates[0] &&
                                shipBlock[1] === update.newMove.coordinates[1]
                                    ? [shipBlock[0], shipBlock[1], 'X']
                                    : shipBlock
                            );
                            if (update.newMove.result === 'destroyed') {
                                (ships as Ship[])[targetShip as number].state = 'X';
                            }

                            return newState;
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
