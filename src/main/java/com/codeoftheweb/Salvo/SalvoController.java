package com.codeoftheweb.Salvo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

import static java.util.stream.Collectors.toList;

@RestController
@RequestMapping("/api")
public class SalvoController {

    @Autowired
    private GamePlayerRepository gamePlayerRepository;

    @Autowired
    private GameRepository gameRepository;

    @Autowired
    PlayerRepository playerRepository;

    @RequestMapping("/gameplayer/{id}")
    public Map<String,Object> getGPInfo(@PathVariable("id") long id){
        return gamePlayerRepository.findById(id).orElse(null).toDTO();
    }



    @RequestMapping("/game_view/{id}")
    public Map<String,Object> gameView(@PathVariable("id") long id){
        return gamePlayerRepository.findById(id).orElse(null).gameViewDTO();
    }

    @RequestMapping("/games")
    public List<Object> games(){
        return gameRepository.findAll().stream().map(sub -> sub.toDTO()).collect(toList());
    }

    @RequestMapping("/players")
    public List<Object> players(){
        return playerRepository.findAll().stream().map(sub->sub.toDTO()).collect(toList());
    }

    @RequestMapping("/gameplayers")
    public List<Object> gameplayers(){
        return gamePlayerRepository.findAll().stream().map(sub->sub.toDTO()).collect(toList());
    }
}