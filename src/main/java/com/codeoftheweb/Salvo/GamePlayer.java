package com.codeoftheweb.Salvo;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;
import java.util.*;

import static java.util.stream.Collectors.toList;


@Entity
public class GamePlayer {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO, generator = "native")
    @GenericGenerator(name="native", strategy = "native")
    private long id;

    //Many to one
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name="game_id")
    private Game game;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name="player_id")
    private Player player;

    //One to many
    @OneToMany(fetch = FetchType.EAGER , mappedBy = "gamePlayer", cascade = CascadeType.ALL)
    private Set<Ship> ships = new HashSet<>();


    @OneToMany(fetch = FetchType.EAGER , mappedBy = "gamePlayer", cascade = CascadeType.ALL)
    private Set<Salvo> salvos = new HashSet<>();

    private Date joined;


    public GamePlayer(){}

    public GamePlayer(Game game, Player player){
        this.game = game;
        this.player = player;
        this.joined = new Date();
    }

    public GamePlayer(Game game, Player player, Set<Ship> ships, Set<Salvo> salvos){
        this.game = game;
        this.player = player;
        ships.forEach(sub-> this.addShip(sub));

        salvos.forEach(sub->this.addSalvo(sub));

        this.joined = new Date();
    }

    @JsonIgnore
    public Game getGame() {
        return game;
    }

    public void setGame(Game game) {
        this.game = game;
    }

    @JsonIgnore
    public Player getPlayer() {
        return player;
    }

    public void setPlayer(Player player) {
        this.player = player;
    }

    public Date getJoined() {
        return joined;
    }

    public void setJoined(Date joined) {
        this.joined = joined;
    }

    @JsonIgnore
    public Set<Salvo> getSalvos() {
        return salvos;
    }

    public void setSalvos(Set<Salvo> salvos) {
        this.salvos = salvos;
    }

    @JsonIgnore
    public Set<Ship> getShips(){
        return ships;
    }

    public void addShip(Ship s){
        s.setGamePlayer(this);
        this.ships.add(s);
    }

    public void addSalvo(Salvo salvo){
        salvo.setGp(this);
        this.salvos.add(salvo);
    }

    public long getId(){
        return id;
    }

    public Score getScore(){
        return getPlayer().getScore(this.getGame());
    }

    public Map<String,Object> toDTO(){
        Map<String,Object> dto = new LinkedHashMap<String,Object>();

        dto.put("id",getId());
        dto.put("joined",getJoined());

        Map<String,Object> dtoAUX = getPlayer().toDTO();
        dtoAUX.remove("scores");
        dtoAUX.put("score", getPlayer().getScore(this.getGame()));

        dto.put("player", dtoAUX);

        return dto;
    }

    public Map<String,Object> getGPlayerInfo(){
        Map<String,Object> dto = new LinkedHashMap<String,Object>();

        dto.put("id",getId());



        return dto;
    }

    public Map<String,Object> getSalvoesDTO(){
        Map<String,Object> dto = new LinkedHashMap<>();
        Map<String,Object> dtoAUX = new LinkedHashMap<>();

        dto.put("turn", "avr");

        /*getSalvos().forEach(sub -> dtoAUX.put(Integer.toString(sub.getTurn()),sub.getLocations()));
        dto.put("gplayerid",Long.toString(getId()));
        dto.put("shots", dtoAUX);*/
        return dto;
    }


    public Map<String, Object> gameViewDTO(){
        Map<String,Object> dto = new LinkedHashMap<String,Object>();

        dto.put("id", getGame().getId());
        dto.put("created", getGame().getDate());
        dto.put("gameplayers", getGame().getgPlayers().stream().map(sub -> sub.toDTO()).collect(toList()));
        dto.put("ships", getShips().stream().map(ss-> ss.getShipDTO()).collect(toList()));
        dto.put("salvoes", getGame().getgPlayers().stream().flatMap(gp->gp.getSalvos().stream().map(sub -> sub.toDTO())));

        return dto;
    }
}
