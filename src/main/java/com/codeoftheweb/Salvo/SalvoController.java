package com.codeoftheweb.Salvo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
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
    public Map<String,Object> games(Authentication auth){
        Map<String,Object> dto = new LinkedHashMap<>();

        if(auth == null || auth instanceof AnonymousAuthenticationToken){
            dto.put("user","guest");
        }else{
            dto.put("user", playerRepository.findByEmail(auth.getName()).toDTO());
        }
        dto.put("games", gameRepository.findAll().stream().map(Game::toDTO).collect(toList()));

        return dto;
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