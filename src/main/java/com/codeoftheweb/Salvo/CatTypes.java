package com.codeoftheweb.Salvo;

@SuppressWarnings("ALL")
public enum CatTypes {
    Meowrice(5),
    Nashiro(4),
    George(3),
    Coaly(3),
    Oreo(2);

    private int length;

    CatTypes(int length){
        this.length = length;
    }

    public int getLength(){
        return length;
    }
}
