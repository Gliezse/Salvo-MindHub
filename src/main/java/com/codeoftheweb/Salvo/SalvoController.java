package com.codeoftheweb.Salvo;

import org.apache.coyote.Response;
import org.aspectj.apache.bcel.util.Play;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.*;

import static java.util.stream.Collectors.toList;

@RestController
@RequestMapping("/api")
public class SalvoController {

    //Repositories
    @Autowired
    private GamePlayerRepository gamePlayerRepository;
    @Autowired
    private GameRepository gameRepository;
    @Autowired
    private PlayerRepository playerRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    //GET MAPPINGS
    @RequestMapping("/gameplayer/{id}")
    public Map<String,Object> getGPInfo(@PathVariable("id") long id){
        return gamePlayerRepository.findById(id).orElse(null).toDTO();
    }

    @RequestMapping("/game_view/{id}")
    public ResponseEntity<Map<String,Object>> gameView(@PathVariable("id") long id, Authentication authentication){

        if(authentication == null || authentication instanceof AnonymousAuthenticationToken){
            return new ResponseEntity<>(makeMap(ResponseMessages.KEY_ERROR, ResponseMessages.ERR_UNAUTHORIZED), HttpStatus.UNAUTHORIZED);
        }

        Optional<GamePlayer> auxgp = gamePlayerRepository.findById(id);
        //Si no existe el gameplayer
        if(!auxgp.isPresent()){
            return new ResponseEntity<>(makeMap(ResponseMessages.KEY_ERROR, ResponseMessages.ERR_NOT_SUCH_GAME),HttpStatus.BAD_REQUEST);
        }

        Player player = playerRepository.findByEmail(authentication.getName());
        //Si el gameplayer no le corresponde al player loggeado
        if(player.getId() != auxgp.get().getPlayer().getId()) {
            return new ResponseEntity<>(makeMap(ResponseMessages.KEY_ERROR, ResponseMessages.ERR_NOT_THIS_USER), HttpStatus.FORBIDDEN);
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
    public ResponseEntity<Map<String,Object>> signup(@RequestParam String email, @RequestParam String name, @RequestParam String password){
        Player auxPlayer = playerRepository.findByEmail(email);

        if(auxPlayer!=null){
            return new ResponseEntity<>(makeMap(ResponseMessages.KEY_ERROR,ResponseMessages.ERR_PLAYER_NOT_FOUND), HttpStatus.FORBIDDEN);
        }else{
            playerRepository.save(new Player(email,name,passwordEncoder.encode(password)));
            return new ResponseEntity<>(makeMap(ResponseMessages.KEY_OK, ResponseMessages.OK_CREATED), HttpStatus.CREATED);
        }
    }

    //POST MAPPINGS
    @PostMapping("/games")
    public ResponseEntity<Map<String,Object>> createGame(Authentication auth){
        //Auth Check
        if(auth==null || auth instanceof AnonymousAuthenticationToken){
            return new ResponseEntity<>(makeMap(ResponseMessages.KEY_ERROR, ResponseMessages.ERR_UNAUTHORIZED), HttpStatus.UNAUTHORIZED);
        }

        Player player = playerRepository.findByEmail(auth.getName());
        Game game = new Game();
        game.addGamePlayer(new GamePlayer(game,player));
        gameRepository.save(game);

        Map<String, Object> dto = new LinkedHashMap<>();
        dto.put("gpid", game.getgPlayers().stream().findFirst().get().getId());

        return new ResponseEntity<>(dto, HttpStatus.CREATED);
    }

    @PostMapping("/games/players/{gpid}/ships")
    public ResponseEntity<Map<String,Object>> placeShips(Authentication auth, @PathVariable("gpid") long gpid, @RequestBody Set<Ship> ships){
        //Auth Check
        if(auth==null || auth instanceof AnonymousAuthenticationToken){
            return new ResponseEntity<>(makeMap(ResponseMessages.KEY_ERROR, ResponseMessages.ERR_UNAUTHORIZED), HttpStatus.UNAUTHORIZED);
        }

        //Gameplayer existance check
        Optional<GamePlayer> gamePlayer = gamePlayerRepository.findById(gpid);
        if(!gamePlayer.isPresent()){
            return new ResponseEntity<>(makeMap(ResponseMessages.KEY_ERROR, ResponseMessages.ERR_PLAYER_NOT_FOUND), HttpStatus.UNAUTHORIZED);
        }

        //Check if the logged player has the same id the gameplayer's player has
        if(!gamePlayer.get().getPlayer().getEmail().equals(auth.getName())){
            return new ResponseEntity<>(makeMap(ResponseMessages.KEY_ERROR, ResponseMessages.ERR_NOT_THIS_USER), HttpStatus.UNAUTHORIZED);
        }

        Optional<GamePlayer> opponentGamePlayer = gamePlayer.get().getGame().getgPlayers().stream().filter(gp -> gp.getId()!=gamePlayer.get().getId()).findFirst();

        //Check if there is an opponent
        if(!opponentGamePlayer.isPresent()){
            return new ResponseEntity<>(makeMap(ResponseMessages.KEY_ERROR, ResponseMessages.ERR_NONEXISTENT_OPPONENT), HttpStatus.FORBIDDEN);
        }

        //Checks if the ships haven't been added yet
        if (ships.size() != 5){
            return new ResponseEntity<>(makeMap(ResponseMessages.KEY_ERROR, ResponseMessages.ERR_WRONG_SHIP_QUANTITY), HttpStatus.FORBIDDEN);
        }else if(gamePlayer.get().getShips().size()>0){
            return new ResponseEntity<>(makeMap(ResponseMessages.KEY_ERROR, ResponseMessages.ERR_ALREADY_PLACED_SHIPS), HttpStatus.FORBIDDEN);
        }

        Set<String> shipTypes = new HashSet<>();

        for(ShipTypes sType : ShipTypes.values()){
            shipTypes.add(sType.name());
        }

        //Check if all incoming ships' types are valid
        if(!shipTypes.containsAll(ships.stream().map(Ship::getType).collect(toList()))){
            return new ResponseEntity<>(makeMap(ResponseMessages.KEY_ERROR, ResponseMessages.ERR_NOT_VALID_SHIPS), HttpStatus.FORBIDDEN);
        }

        //Checks the ships are all different
        if(ships.stream().map(Ship::getType).distinct().count() != 5){
            return new ResponseEntity<>(makeMap(ResponseMessages.KEY_ERROR, ResponseMessages.ERR_DUPLICATED_SHIPS), HttpStatus.FORBIDDEN);
        }

        //Check if all ships have the correct length
        for(Ship ship : ships){
            for(ShipTypes sType : ShipTypes.values()){
                if(sType.name().equals(ship.getType())){
                    if(sType.getLength() != ship.getLocations().size()){
                        return new ResponseEntity<>(makeMap(ResponseMessages.KEY_ERROR, ResponseMessages.ERR_WRONG_SHIP_LENGTH), HttpStatus.FORBIDDEN);
                    }
                }
            }
        }

        ships.forEach(ship->gamePlayer.get().addShip(ship));
        gamePlayerRepository.save(gamePlayer.get());
        return new ResponseEntity<>(makeMap(ResponseMessages.KEY_OK, ResponseMessages.OK_CREATED), HttpStatus.CREATED);
    }

    @PostMapping("/games/players/{id}/salvoes")
    public ResponseEntity<Map<String,Object>> postSalvoes(Authentication auth, @PathVariable("id") long id, @RequestBody Salvo salvo){
        //Auth Check
        if(auth==null || auth instanceof AnonymousAuthenticationToken){
            return new ResponseEntity<>(makeMap(ResponseMessages.KEY_ERROR, ResponseMessages.ERR_UNAUTHORIZED), HttpStatus.UNAUTHORIZED);
        }

        //Gameplayer existance check
        Optional<GamePlayer> gamePlayer = gamePlayerRepository.findById(id);
        if(!gamePlayer.isPresent()){
            return new ResponseEntity<>(makeMap(ResponseMessages.KEY_ERROR, ResponseMessages.ERR_PLAYER_NOT_FOUND), HttpStatus.UNAUTHORIZED);
        }

        //Check if the logged player has the same id the gameplayer's player has
        if(!gamePlayer.get().getPlayer().getEmail().equals(auth.getName())){
            return new ResponseEntity<>(makeMap(ResponseMessages.KEY_ERROR, ResponseMessages.ERR_NOT_THIS_USER), HttpStatus.UNAUTHORIZED);
        }

        Optional<GamePlayer> opponentGamePlayer = gamePlayer.get().getGame().getgPlayers().stream().filter(gp -> gp.getId()!=gamePlayer.get().getId()).findFirst();

        //Check if there is an opponent
        if(!opponentGamePlayer.isPresent()){
            return new ResponseEntity<>(makeMap(ResponseMessages.KEY_ERROR, ResponseMessages.ERR_NONEXISTENT_OPPONENT), HttpStatus.FORBIDDEN);
        }

        //Check if it is the players turn to play
        if(gamePlayer.get().getGameState() != GameState.PLACING_SALVOES){
            return new ResponseEntity<>(makeMap(ResponseMessages.KEY_ERROR, ResponseMessages.ERR_NOT_YOUR_TURN), HttpStatus.FORBIDDEN);
        }

        int lastTurn = gamePlayer.get().getSalvos().stream().mapToInt(Salvo::getTurn).max().orElse(0);

        //Checks if the incoming salvo has the correct turn
        if(salvo.getTurn() != lastTurn + 1){
            return new ResponseEntity<>(makeMap(ResponseMessages.KEY_ERROR, ResponseMessages.ERR_WRONG_TURN), HttpStatus.FORBIDDEN);
        }

        //Check if the salvo has only 2 locations
        if(salvo.getLocations().size() != 2){
            return new ResponseEntity<>(makeMap(ResponseMessages.KEY_ERROR, ResponseMessages.ERR_WRONG_SALVO_QUANTITY), HttpStatus.FORBIDDEN);
        }

        //If there are no problems, the salvo is added an saved with its gameplayer
        gamePlayer.get().addSalvo(salvo);
        gamePlayerRepository.save(gamePlayer.get());

        return new ResponseEntity<>(makeMap(ResponseMessages.KEY_OK, ResponseMessages.OK_CREATED), HttpStatus.CREATED);
    }

    @PostMapping("/game/{id}/players")
    public ResponseEntity<Map<String, Object>> joinGame(Authentication auth, @PathVariable("id") long id){
        //Auth Check
        if(auth==null || auth instanceof AnonymousAuthenticationToken){
            return new ResponseEntity<>(makeMap(ResponseMessages.KEY_ERROR, ResponseMessages.ERR_UNAUTHORIZED), HttpStatus.UNAUTHORIZED);
        }

        Player player = playerRepository.findByEmail(auth.getName());
        Optional<Game> game = gameRepository.findById(id);

        if(!game.isPresent()){
            return new ResponseEntity<>(makeMap(ResponseMessages.KEY_ERROR, ResponseMessages.ERR_NOT_SUCH_GAME), HttpStatus.FORBIDDEN);
        }

        if(game.get().getgPlayers().size() > 1){
            return new ResponseEntity<>(makeMap(ResponseMessages.KEY_ERROR, ResponseMessages.ERR_FULL_GAME), HttpStatus.FORBIDDEN);
        }

        if(game.get().getgPlayers().stream().findFirst().get().getPlayer().getId() == player.getId()){
            return new ResponseEntity<>(makeMap(ResponseMessages.KEY_ERROR, ResponseMessages.ERR_JOINING_OWN_GAME), HttpStatus.FORBIDDEN);
        }

        GamePlayer gamePlayer = gamePlayerRepository.save(new GamePlayer(game.get(), player));

        Map<String, Object> dto = new LinkedHashMap<>();
        dto.put("gpid", gamePlayer.getId());

        return new ResponseEntity<>(dto,HttpStatus.CREATED);
    }

    public Map<String,Object> makeMap(String key, Object obj){
        Map<String,Object> dto = new LinkedHashMap<>();
        dto.put(key,obj);
        return dto;
    }
}