package com.codeoftheweb.Salvo;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

import static java.util.stream.Collectors.toList;

@Entity
public class Game {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO, generator = "native")
    @GenericGenerator(name="native", strategy = "native")
    private long id;
    private LocalDateTime date;

    @OneToMany(fetch = FetchType.EAGER , mappedBy = "game", cascade = CascadeType.ALL)
    private Set<GamePlayer> gPlayers = new HashSet<>();

    @OneToMany(fetch = FetchType.EAGER, mappedBy = "game")
    private List<Score> scores = new ArrayList<>();

    public Game(){
        this.date = LocalDateTime.now();
    }

    public Game(GamePlayer gp){
        gp.setGame(this);
        addGamePlayer(gp);
        this.date = LocalDateTime.now();
    }

    public LocalDateTime getDate() {
        return date;
    }

    public void setDate(LocalDateTime date) {
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
    public Set<GamePlayer> getgPlayers(){
        return gPlayers;
    }

    @JsonIgnore
    public List<Player> getPlayers(){
        return gPlayers.stream().map(sub -> sub.getPlayer()).collect(toList());
    }

    public Map<String, Object> toDTO(){
        Map<String, Object> dto = new LinkedHashMap<String, Object>();
        dto.put("id", this.getId());
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MM-dd-yyyy HH:mm:ss");
        dto.put("created", this.getDate().format(formatter));
        dto.put("gamePlayers", this.getgPlayers().stream().map(sub -> sub.toDTO()).collect(toList()));
        return dto;
    }

}
