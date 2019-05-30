package com.codeoftheweb.Salvo;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import static java.util.stream.Collectors.toList;

@Entity
public class Player {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO, generator = "native")
    @GenericGenerator(name="native", strategy = "native")
    private long id;
    private String email;
    private String name;
    private String password;

    @OneToMany(fetch = FetchType.EAGER , mappedBy = "player")
    private List<GamePlayer> gPlayers = new ArrayList<>();

    @OneToMany(fetch = FetchType.EAGER, mappedBy = "player")
    private List<Score> scores = new ArrayList<>();

    public Player() {}

    public Player(String email, String name) {
        this.email = email;
        this.name = name;
    }

    public Player(String email, String name, String password){
        this.email=email;
        this.name=name;
        this.password=password;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public long getId(){return id;}

    public void setId(long id){
        this.id = id;
    }

    @JsonIgnore
    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    @JsonIgnore
    public List<Score> getScores() {
        return scores;
    }

    public void setScores(List<Score> scores) {
        this.scores = scores;
    }

    public void addGamePlayer(GamePlayer gp){
        gp.setPlayer(this);
        this.gPlayers.add(gp);
    }

    @JsonIgnore
    public List<Game> getGames(){
        return this.gPlayers.stream().map(sub -> sub.getGame()).collect(toList());
    }

    @JsonIgnore
    public Score getScore(Game game){
        return getScores().stream().filter(sc -> sc.getGame() == game).findFirst().orElse(null);
    }

    @JsonIgnore
    public Map<String,Object> toDTO(){
        Map<String,Object> dto = new LinkedHashMap<>();

        dto.put("id", this.getId());
        dto.put("email", this.getEmail());
        dto.put("name", this.getName());
        dto.put("scores", this.getScores());
        return dto;
    }
}
