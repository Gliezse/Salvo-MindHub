package com.codeoftheweb.Salvo;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;
import java.util.*;

import static java.util.stream.Collectors.toList;

@Entity
public class Game {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO, generator = "native")
    @GenericGenerator(name="native", strategy = "native")
    private long id;
    private Date date;

    @OneToMany(fetch = FetchType.EAGER , mappedBy = "game")
    private List<GamePlayer> gPlayers = new ArrayList<>();

    @OneToMany(fetch = FetchType.EAGER, mappedBy = "game")
    private List<Score> scores = new ArrayList<>();

    public Game(){
        this.date = new Date();
    }

    public Date getDate() {
        return date;
    }

    public void setDate(Date date) {
        this.date = date;
    }

    public long getId(){
        return id;
    }

    @JsonIgnore
    public List<Score> getScores(){
        return scores;
    }

    public void setScores(List<Score> scores) {
        this.scores = scores;
    }

    public void addGamePlayer(GamePlayer gp){
        gp.setGame(this);
        this.gPlayers.add(gp);
    }

    public void addScore(Score score){
        this.scores.add(score);
    }

    @JsonIgnore
    public List<GamePlayer> getgPlayers(){
        return gPlayers;
    }

    @JsonIgnore
    public List<Player> getPlayers(){
        return gPlayers.stream().map(sub -> sub.getPlayer()).collect(toList());
    }

    public Map<String, Object> toDTO(){
        Map<String, Object> dto = new LinkedHashMap<String, Object>();
        dto.put("id", this.getId());
        dto.put("created", this.getDate());
        dto.put("gamePlayers", this.getgPlayers().stream().map(sub -> sub.toDTO()).collect(toList()));
        return dto;
    }


}
