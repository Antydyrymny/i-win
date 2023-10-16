import {
    type ApiSocket,
    type ApiBuilder,
    TTTClientToServer,
    TicTacToe,
    TTTServerToClient,
    UpdatedGameState,
    GameWon,
} from '../../../types/types';

export function subscribeToTicTacToe(builder: ApiBuilder, socket: ApiSocket) {
    return builder.query<TicTacToe, void>({
        queryFn: () => {
            return new Promise((resolve) => {
                socket.emit(
                    TTTClientToServer.RequestingGameState,
                    (TTTgame: TicTacToe) => {
                        resolve({ data: TTTgame });
                    }
                );
            });
        },
        async onCacheEntryAdded(
            _,
            { cacheDataLoaded, cacheEntryRemoved, updateCachedData }
        ) {
            try {
                await cacheDataLoaded;
                socket.on(
                    TTTServerToClient.PlayerMoved,
                    (newGameState: UpdatedGameState<TicTacToe>) => {
                        updateCachedData((draft) => {
                            return {
                                ...draft,
                                playerToMove: newGameState.playerToMove,
                                boardState: draft.boardState.map((row, y) =>
                                    y === newGameState.newMove.coordinates[1]
                                        ? row.map((col, x) =>
                                              x === newGameState.newMove.coordinates[1]
                                                  ? newGameState.newMove.type
                                                  : col
                                          )
                                        : row
                                ),
                            };
                        });
                    }
                );
                socket.on(TTTServerToClient.GameWon, (gameWon: GameWon<TicTacToe>) => {
                    updateCachedData((draft) => {
                        return {
                            ...draft,
                            winner: gameWon.winner,
                            winningMove:
                                gameWon.winner !== 'draw'
                                    ? gameWon.winningMove
                                    : undefined,
                        };
                    });
                });
                await cacheEntryRemoved;
                socket.off(TTTServerToClient.PlayerMoved);
                socket.off(TTTServerToClient.GameWon);
            } catch {
                // if cacheEntryRemoved resolved before cacheDataLoaded,
                // cacheDataLoaded throws
            }
        },
        providesTags: ['GameState'],
    });
}
