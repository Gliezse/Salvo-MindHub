package com.codeoftheweb.Salvo;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

import static java.time.LocalDate.now;
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

    private LocalDateTime joined;


    public GamePlayer(){}

    public GamePlayer(Game game, Player player){
        this.game = game;
        this.player = player;
        this.joined = LocalDateTime.now();
    }


    public GamePlayer(Player player, Set<Ship> ships, Set<Salvo> salvos){
        this.player = player;
        ships.forEach(this::addShip);
        salvos.forEach(this::addSalvo);
        this.joined = LocalDateTime.now();
    }

    public GamePlayer(Game game, Player player, Set<Ship> ships, Set<Salvo> salvos){
        this.game = game;
        this.player = player;
        ships.forEach(this::addShip);

        salvos.forEach(this::addSalvo);

        this.joined =  LocalDateTime.now();
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

    public LocalDateTime getJoined() {
        return joined;
    }

    public void setJoined(LocalDateTime joined) {
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

    public void setShips(Set<Ship> ships){this.ships = ships;}

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

    public Set<Map<String,Object>> getHits(){
        Optional<GamePlayer> opponentGamePlayer = this.getGame().getgPlayers().stream().filter(gp -> gp.getId() != this.getId()).findFirst();

        if(opponentGamePlayer.isPresent()){
            Set<Map<String,Object>> set = new HashSet<>();

            this.getSalvos().stream().forEach( salvo-> {
                salvo.getLocations().stream().forEach( loc -> {
                    opponentGamePlayer.get().getShips().stream().forEach( oppShip -> {
                        oppShip.getLocations().forEach( oppShipLoc -> {
                            if (loc.equals(oppShipLoc)){
                                Map<String,Object> dto = new LinkedHashMap<>();

                                dto.put("gpid",this.getId());
                                dto.put("turn",salvo.getTurn());
                                dto.put("shipHit",oppShip.getType());
                                dto.put("locHit",oppShipLoc);

                                set.add(dto);
                            }
                        });
                    });
                });
            });

            return set;

        }else{
            return null;
        }

    }

    public Set<Map<String,Object>> getSunkAllyShips(){
        Set<Map<String,Object>> sunkShips = new LinkedHashSet<>();

        Optional<GamePlayer> opponentGamePlayer = this.getGame().getgPlayers().stream().filter(gp-> gp.getId() != this.getId()).findFirst();

        if(opponentGamePlayer.isPresent()){
            Set<String> salvoes = new HashSet<>();

            opponentGamePlayer.get().getSalvos().forEach(salvo -> {
                salvoes.addAll(salvo.getLocations());
            });

            this.getShips().forEach(allyShip -> {
                //Map<String, Object> auxdto = new LinkedHashMap<>();

                //auxdto.put(oppShip.getType(), oppShip.getLocations());

                //oppShipsLocations.add(auxdto);

                if(!salvoes.containsAll(allyShip.getLocations())){
                    sunkShips.add(allyShip.getShipDTO());
                }

            });

            return sunkShips;

        }else{
            return null;
        }

    }

    public Set<Map<String,Object>> getSunkEnemyShips(){
        Set<Map<String,Object>> sunkShips = new HashSet<>();

        Optional<GamePlayer> opponentGamePlayer = this.getGame().getgPlayers().stream().filter(gp-> gp.getId() != this.getId()).findFirst();

        if(opponentGamePlayer.isPresent()){
            Set<String> salvoes = new HashSet<>();

            this.getSalvos().forEach(salvo -> {
                salvoes.addAll(salvo.getLocations());
            });

            opponentGamePlayer.get().getShips().forEach(oppShip -> {
                //Map<String, Object> auxdto = new LinkedHashMap<>();

                //auxdto.put(oppShip.getType(), oppShip.getLocations());

                //oppShipsLocations.add(auxdto);

                if(!salvoes.containsAll(oppShip.getLocations())){
                    sunkShips.add(oppShip.getShipDTO());
                }

            });

            return sunkShips;

        }else{
            return null;
        }

    }



    public Map<String,Object> toDTO(){
        Map<String,Object> dto = new LinkedHashMap<String,Object>();

        dto.put("id",getId());
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MM-dd-yyyy HH:mm:ss");
        dto.put("joined",getJoined().format(formatter));

        Map<String,Object> dtoAUX = getPlayer().toDTO();
        dtoAUX.remove("scores");

        dto.put("player", dtoAUX);
        dto.put("score", getPlayer().getScore(this.getGame()));

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
        if(this.getGame().getgPlayers().size()>1){
            dto.put("hits",getGame().getgPlayers().stream().map(gp -> gp.getHits()).collect(toList()));
            dto.put("sunkEnemyShips", this.getSunkEnemyShips());
            dto.put("sunkAllyShips", this.getSunkAllyShips());
        }


        return dto;
    }
}
