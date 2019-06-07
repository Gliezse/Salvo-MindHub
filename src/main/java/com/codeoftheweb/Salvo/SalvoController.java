package com.codeoftheweb.Salvo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

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

    @Autowired
    PasswordEncoder passwordEncoder;

    @RequestMapping("/gameplayer/{id}")
    public Map<String,Object> getGPInfo(@PathVariable("id") long id){
        return gamePlayerRepository.findById(id).orElse(null).toDTO();
    }



    @RequestMapping("/game_view/{id}")
    public ResponseEntity<Map<String,Object>> gameView(@PathVariable("id") long id, Authentication authentication){
        Optional<GamePlayer> auxgp = gamePlayerRepository.findById(id);
        //Si no existe el gameplayer
        if(!auxgp.isPresent()){
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }

        Player player = playerRepository.findByEmail(authentication.getName());
        //Si el gameplayer no le corresponde al player loggeado
        if(player.getId() != auxgp.get().getPlayer().getId()) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }

        return new ResponseEntity<>(auxgp.get().gameViewDTO(), HttpStatus.OK);
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

    @RequestMapping(value="/players", method= RequestMethod.POST)
    public ResponseEntity<String> signup(@RequestParam String email, @RequestParam String name, @RequestParam String password){
        Player auxPlayer = playerRepository.findByEmail(email);

        if(auxPlayer!=null){
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }else{
            playerRepository.save(new Player(email,name,passwordEncoder.encode(password)));
            return new ResponseEntity<>(HttpStatus.CREATED);
        }
    }
}