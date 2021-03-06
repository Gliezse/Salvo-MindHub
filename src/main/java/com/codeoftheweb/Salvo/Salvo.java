package com.codeoftheweb.Salvo;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;
import java.util.*;

@Entity
public class Salvo {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO, generator = "native")
    @GenericGenerator(name="native", strategy = "native")
    private long id;


    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "gamePlayer_id")
    private GamePlayer gamePlayer;

    @ElementCollection
    private Set<String> locations = new HashSet<>();

    private int turn;

    public Salvo(){}

    public Salvo(GamePlayer gp){
        this.gamePlayer=gp;
    }

    public Salvo(GamePlayer gp, Set<String> locations, int turn){
        this.gamePlayer = gp;
        this.locations = locations;
        this.turn = turn;
    }

    public Salvo(int turn, Set<String> locations){
        this.turn = turn;
        this.locations = locations;
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    @JsonIgnore
    public GamePlayer getGp() {
        return gamePlayer;
    }

    public void setGp(GamePlayer gp) {
        this.gamePlayer = gp;
    }

    public Set<String> getLocations() {
        return locations;
    }

    public void setLocations(Set<String> locations) {
        this.locations = locations;
    }

    public void addLocations(String location){
        this.locations.add(location);
    }

    public int getTurn() {
        return turn;
    }

    public void setTurn(int turn) {
        this.turn = turn;
    }

    public Map<String,Object> toDTO(){
        Map<String,Object> dto = new LinkedHashMap<>();

        dto.put("turn",getTurn());
        dto.put("player",getGp().getId());
        dto.put("locations", getLocations());

        return dto;
    }
}
