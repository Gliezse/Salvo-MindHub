package com.codeoftheweb.Salvo;

public enum GameState {
    WAITING_OPPONENT_TO_JOIN,
    PLACING_SHIPS,
    OPPONENT_PLACING_SHIPS,
    PLACING_SALVOES,
    WAITING_OPPONENT_SALVOES,
    WON,
    LOST,
    TIED,
    UNDEFINED
}
