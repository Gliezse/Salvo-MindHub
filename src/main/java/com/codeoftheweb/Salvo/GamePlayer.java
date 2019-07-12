package com.codeoftheweb.Salvo;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;
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
    private Set<Pet> pets = new HashSet<>();


    @OneToMany(fetch = FetchType.EAGER , mappedBy = "gamePlayer", cascade = CascadeType.ALL)
    private Set<Salvo> salvos = new HashSet<>();

    private LocalDateTime joined;

    //TODO: add teams when cats adquired xd
    //private String team;


    public GamePlayer(){}

    public GamePlayer(Game game, Player player){
        this.game = game;
        this.player = player;
        this.joined = LocalDateTime.now();
    }

    /*ublic GamePlayer(Game game, Player player, String team){
        this.game = game;
        this.player = player;
        this.team = team;
        this.joined = LocalDateTime.now();
    }*/


    public GamePlayer(Player player, Set<Pet> pets, Set<Salvo> salvos){
        this.player = player;
        pets.forEach(this::addPet);
        salvos.forEach(this::addSalvo);
        this.joined = LocalDateTime.now();
    }

    public GamePlayer(Game game, Player player, Set<Pet> pets, Set<Salvo> salvos){
        this.game = game;
        this.player = player;
        pets.forEach(this::addPet);

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
    public Set<Pet> getPets(){
        return pets;
    }

    public void setPets(Set<Pet> pets){
        this.pets = pets;
    }

    public void addPet(Pet p){
        p.setGamePlayer(this);
        this.pets.add(p);
    }

    public void addSalvo(Salvo salvo){
        salvo.setGp(this);
        this.salvos.add(salvo);
    }

    public long getId(){
        return id;
    }

    public Score getScore(){
        return getPlayer().getScore(this.getGame().getId());
    }

    /*public String getTeam() {
        return team;
    }

    public void setTeam(String team) {
        this.team = team;
    }*/

    public Set<Map<String,Object>> getHits(){
        Optional<GamePlayer> opponentGamePlayer = this.getGame().getgPlayers().stream().filter(gp -> gp.getId() != this.getId()).findFirst();

        if(opponentGamePlayer.isPresent()){
            Set<Map<String,Object>> set = new HashSet<>();

            this.getSalvos().stream().forEach( salvo-> {
                salvo.getLocations().stream().forEach( loc -> {
                    opponentGamePlayer.get().getPets().stream().forEach( oppPet -> {
                        oppPet.getLocations().forEach( oppPetLoc -> {
                            if (loc.equals(oppPetLoc)){
                                Map<String,Object> dto = new LinkedHashMap<>();

                                dto.put("gpid",this.getId());
                                dto.put("turn",salvo.getTurn());
                                dto.put("petHit",oppPet.getType());
                                dto.put("locHit",oppPetLoc);

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

    public Set<Map<String,Object>> getScaredAllyPets(){
        Set<Map<String,Object>> sunkShips = new LinkedHashSet<>();

        Optional<GamePlayer> opponentGamePlayer = this.getGame().getgPlayers().stream().filter(gp-> gp.getId() != this.getId()).findFirst();

        if(opponentGamePlayer.isPresent()){
            Set<String> salvoes = new HashSet<>();

            opponentGamePlayer.get().getSalvos().forEach(salvo -> {
                salvoes.addAll(salvo.getLocations());
            });

            this.getPets().forEach(allyPet -> {
                if(salvoes.containsAll(allyPet.getLocations())){
                    sunkShips.add(allyPet.getPetDTO());
                }

            });

            return sunkShips;

        }else{
            return null;
        }

    }

    public Set<Map<String,Object>> getScaredEnemyPets(){
        Set<Map<String,Object>> sunkShips = new HashSet<>();

        Optional<GamePlayer> opponentGamePlayer = this.getGame().getgPlayers().stream().filter(gp-> gp.getId() != this.getId()).findFirst();

        if(opponentGamePlayer.isPresent()){
            Set<String> salvoes = new HashSet<>();

            this.getSalvos().forEach(salvo -> {
                salvoes.addAll(salvo.getLocations());
            });

            opponentGamePlayer.get().getPets().forEach(oppPets -> {
                if(salvoes.containsAll(oppPets.getLocations())){
                    sunkShips.add(oppPets.getPetDTO());
                }

            });

            return sunkShips;

        }else{
            return null;
        }

    }

    public Enum<GameState> getGameState(){

        Optional<GamePlayer> opponentGamePlayer = this.getGame().getgPlayers().stream().filter(gp -> gp.getId() != this.getId()).findFirst();

        if(!opponentGamePlayer.isPresent()){
            return GameState.WAITING_OPPONENT_TO_JOIN;
        }

        if(this.getPets().size() != 5){
           return GameState.PLACING_PETS;
        }else if(opponentGamePlayer.get().getPets().size() != 5){
            return GameState.OPPONENT_PLACING_PETS;
        }

        int myTurn = this.getSalvos().stream().mapToInt(Salvo::getTurn).max().orElse(0);
        int opponentTurn = opponentGamePlayer.get().getSalvos().stream().mapToInt(Salvo::getTurn).max().orElse(0);

        boolean iCreatedThisGame = this.getId() < opponentGamePlayer.get().getId();
        boolean gameOver = getScaredAllyPets().size() == 5 || getScaredEnemyPets().size() == 5;

        if (iCreatedThisGame) {
            if (myTurn == opponentTurn) {
                if(gameOver){
                    return getGameResult();
                }
                return GameState.PLACING_SALVOES;
            } else {
                return GameState.WAITING_OPPONENT_SALVOES;
            }
        } else {
            if (myTurn == opponentTurn) {
                if(gameOver){
                    return getGameResult();
                }
                return GameState.WAITING_OPPONENT_SALVOES;
            } else {
                return GameState.PLACING_SALVOES;
            }
        }
    }

    public Enum<GameState> getGameResult(){
        if(getScaredAllyPets().size() < getScaredEnemyPets().size()){
            return GameState.WON;
        }else if(getScaredAllyPets().size() > getScaredEnemyPets().size()){
            return GameState.LOST;
        }else{
            return GameState.TIED;
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

        //dto.put("team", this.getTeam());
        dto.put("score", getPlayer().getScore(this.getGame().getId()));

        return dto;
    }

    public Map<String,Object> getGPlayerInfo(){
        Map<String,Object> dto = new LinkedHashMap<String,Object>();

        dto.put("id",getId());



        return dto;
    }


    public Map<String, Object> gameViewDTO(){
        Map<String,Object> dto = new LinkedHashMap<String,Object>();

        dto.put("id", getGame().getId());
        dto.put("created", getGame().getDate());
        dto.put("gameplayers", getGame().getgPlayers().stream().map(sub -> sub.toDTO()).collect(toList()));
        dto.put("pets", getPets().stream().map(p-> p.getPetDTO()).collect(toList()));
        dto.put("salvoes", getGame().getgPlayers().stream().flatMap(gp->gp.getSalvos().stream().map(sub -> sub.toDTO())));
        if(this.getGame().getgPlayers().size()>1){
            dto.put("hits",getGame().getgPlayers().stream().map(gp -> gp.getHits()).collect(toList()));
            dto.put("scaredEnemyPets", this.getScaredEnemyPets());
            dto.put("scaredAllyPets", this.getScaredAllyPets());
        }
        dto.put("gamestate",this.getGameState());


        return dto;
    }
}
