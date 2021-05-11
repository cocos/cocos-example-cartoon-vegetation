import { Game, game, setDisplayStats } from 'cc';

game.on(Game.EVENT_GAME_INITED, () => {
    setDisplayStats(true)
})