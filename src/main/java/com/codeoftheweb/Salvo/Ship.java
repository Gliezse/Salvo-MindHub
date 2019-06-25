package com.codeoftheweb.Salvo;

import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;
import java.util.*;

@Entity
public class Ship {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO, generator = "native")
    @GenericGenerator(name="native", strategy = "native")
    private long id;

    //FIX
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name="gamePlayer_id")
    private GamePlayer gamePlayer;

    private String type;

    @ElementCollection
    private List<String> locations = new ArrayList<>();

    public Ship(){}

    public Ship(String type, List<String> locations){
        this.type = type;
        this.locations = locations;
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public GamePlayer getGamePlayer() {
        return gamePlayer;
    }

    public void setGamePlayer(GamePlayer gamePlayer) {
        this.gamePlayer = gamePlayer;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public List<String> getLocations() {
        return locations;
    }

    public void setLocations(List<String> locations) {
        this.locations = locations;
    }

    public void addLocations(String loc) {
        this.locations.add(loc);
    }

    public Map<String,Object> getShipDTO(){
        Map<String,Object> dto = new LinkedHashMap<String,Object>();

        dto.put("id",getId());
        dto.put("type", getType());
        dto.put("locations", getLocations());

        return dto;

    }
}
