package com.codeoftheweb.Salvo;

public final class ResponseMessages {
    //Keys
    public static String KEY_OK = "ok";
    public static String KEY_ERROR = "error";

    //Generic Errors
    public static String ERR_FORBIDDEN = "Forbidden";
    public static String ERR_UNAUTHORIZED = "Unauthorized";
    public static String ERR_PLAYER_NOT_FOUND = "No such player";
    public static String ERR_NOT_THIS_USER = "Wrong user";
    public static String ERR_NONEXISTENT_OPPONENT = "Nonexistent opponent";
    public static String ERR_NOT_SUCH_GAME = "Not such game";
    public static String ERR_FULL_GAME = "Full game";
    public static String ERR_JOINING_OWN_GAME = "Trying to join own game";

    //Generic ok
    public static String OK_CREATED = "created";

    //Ships Errors
    public static String ERR_WRONG_SHIP_QUANTITY = "Wrong pets quantity";
    public static String ERR_NOT_VALID_SHIPS = "Not valid pet types";
    public static String ERR_DUPLICATED_SHIPS = "Duplicated pets";
    public static String ERR_WRONG_SHIP_LENGTH = "Wrong pet length";
    public static String ERR_ALREADY_PLACED_SHIPS = "Already placed pets";

    //Salvo Errors
    public static String ERR_NOT_YOUR_TURN = "Not your turn";
    public static String ERR_WRONG_TURN = "Wrong turn";
    public static String ERR_WRONG_SALVO_QUANTITY = "Wrong salvo quantity";


}
