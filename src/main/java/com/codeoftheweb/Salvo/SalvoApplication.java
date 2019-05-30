package com.codeoftheweb.Salvo;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import java.util.*;


@SpringBootApplication
public class SalvoApplication {

	public static void main(String[] args) {
		SpringApplication.run(SalvoApplication.class, args);
	}

	@Bean
	public CommandLineRunner initData(GamePlayerRepository repository, PlayerRepository pRepos, GameRepository gRepos, ScoreRepository scoreRepos){
		return(args) -> {

			Game g1 = new Game();
			Game g2 = new Game();
			Game g3 = new Game();
			Game g4 = new Game();
			gRepos.save(g1);
			gRepos.save(g2);
			gRepos.save(g3);
			gRepos.save(g4);


			Player p1 = new Player("j.bauer@ctu.gov", "Jack Bauer", "24");
			Player p2 = new Player("c.obrian@ctu.gov", "Chloe O'Brian", "42");
			Player p3 = new Player("t.almeida@ctu.gov", "Tony Almeida", "kb");
			Player p4 = new Player("ki_bauer@gmail.com", "Kim Bauer", "mole");
			pRepos.save(p1);
			pRepos.save(p2);
			pRepos.save(p3);
			pRepos.save(p4);


			Set<Ship> shipSet1 = new HashSet<>();
			shipSet1.add(new Ship("patrol_boat", new ArrayList<>(Arrays.asList("H1","H2"))));
			shipSet1.add(new Ship("destroyer", new ArrayList<>(Arrays.asList("A2","B2","C2"))));

			Set<Ship> shipSet2 = new HashSet<>();
			shipSet2.add(new Ship("Patrol", new ArrayList<>(Arrays.asList("B5","B6"))));
			shipSet2.add(new Ship("Lanchadebokita", new ArrayList<>(Arrays.asList("B10","C10","D10","E10"))));

			Set<Ship> shipSet3 = new HashSet<>();
			shipSet3.add(new Ship("Patrol", new ArrayList<>(Arrays.asList("B5","B6"))));
			shipSet3.add(new Ship("Rippeadora", new ArrayList<>(Arrays.asList("B2","C2"))));

			Set<Ship> shipSet4 = new HashSet<>();
			shipSet4.add(new Ship("Patrol", new ArrayList<>(Arrays.asList("B5","B6"))));
			shipSet4.add(new Ship("LanchaSuperChino", new ArrayList<>(Arrays.asList("H3","H4","H5","H6","H7"))));

            Set<Ship> shipSet5 = new HashSet<>();
            shipSet5.add(new Ship("UKNOWIHADTODOITTOEM", new ArrayList<>(Arrays.asList("H1","H3"))));
            shipSet5.add(new Ship("SS.Titanic", new ArrayList<>(Arrays.asList("A2","B2","C2"))));

            Set<Ship> shipSet6 = new HashSet<>();
            shipSet6.add(new Ship("YutaMovil", new ArrayList<>(Arrays.asList("B5","B6"))));
            shipSet6.add(new Ship("Lanchaderiverpleit", new ArrayList<>(Arrays.asList("E6","E7","E8"))));

            Set<Ship> shipSet7 = new HashSet<>();
            shipSet7.add(new Ship("wenaloscabrooos", new ArrayList<>(Arrays.asList("B5","B6"))));
            shipSet7.add(new Ship("lancha42", new ArrayList<>(Arrays.asList("B2","C2","D2"))));

            Set<Ship> shipSet8 = new HashSet<>();
            shipSet8.add(new Ship("Fabricadepancho", new ArrayList<>(Arrays.asList("B5","B6"))));
            shipSet8.add(new Ship("Lanchakiosko25", new ArrayList<>(Arrays.asList("H3","H4","H5","H6","H7"))));



			Set<Salvo> salvoSet1 = new HashSet<>();
			salvoSet1.add( new Salvo(1, new ArrayList<>(Arrays.asList("C4","A2"))));
			salvoSet1.add(new Salvo(2, new ArrayList<>(Arrays.asList("H6","D9"))));

			Set<Salvo> salvoSet2 = new HashSet<>();
			salvoSet2.add(new Salvo(1, new ArrayList<>(Arrays.asList("F2", "G3"))));
			salvoSet2.add(new Salvo(2, new ArrayList<>(Arrays.asList("C7","A10"))));

			Set<Salvo> salvoSet3 = new HashSet<>();
			salvoSet3.add(new Salvo(1, new ArrayList<>(Arrays.asList("H2", "H5"))));
			salvoSet3.add(new Salvo(2, new ArrayList<>(Arrays.asList("C6","B6"))));

			Set<Salvo> salvoSet4 = new HashSet<>();
			salvoSet4.add(new Salvo(1, new ArrayList<>(Arrays.asList("D6", "A1"))));
			salvoSet4.add(new Salvo(2, new ArrayList<>(Arrays.asList("C10","F2"))));


            Set<Salvo> salvoSet5 = new HashSet<>();
            salvoSet5.add( new Salvo(1, new ArrayList<>(Arrays.asList("C2","A4"))));
            salvoSet5.add(new Salvo(2, new ArrayList<>(Arrays.asList("H9","D2"))));

            Set<Salvo> salvoSet6 = new HashSet<>();
            salvoSet6.add(new Salvo(1, new ArrayList<>(Arrays.asList("F3", "G3"))));
            salvoSet6.add(new Salvo(2, new ArrayList<>(Arrays.asList("C10","A10"))));

            Set<Salvo> salvoSet7 = new HashSet<>();
            salvoSet7.add(new Salvo(1, new ArrayList<>(Arrays.asList("H1", "J6"))));
            salvoSet7.add(new Salvo(2, new ArrayList<>(Arrays.asList("C7","B4"))));

            Set<Salvo> salvoSet8 = new HashSet<>();
            salvoSet8.add(new Salvo(1, new ArrayList<>(Arrays.asList("D7", "A2"))));
            salvoSet8.add(new Salvo(2, new ArrayList<>(Arrays.asList("C7","F3"))));

			//GamePlayers
			repository.save(new GamePlayer(g1, p1, shipSet1, salvoSet1));
			repository.save(new GamePlayer(g1, p2, shipSet2, salvoSet2));
			repository.save(new GamePlayer(g2, p3, shipSet3, salvoSet3));
			repository.save(new GamePlayer(g2, p1, shipSet4, salvoSet4));
			repository.save(new GamePlayer(g3, p4, shipSet5, salvoSet5));
			repository.save(new GamePlayer(g3, p3, shipSet6, salvoSet6));
			repository.save(new GamePlayer(g4, p2, shipSet7, salvoSet7));
			repository.save(new GamePlayer(g4, p4, shipSet8, salvoSet8));

			//Scores
			scoreRepos.save(new Score(g1, p1,1));
			scoreRepos.save(new Score(g1, p2,0));
			scoreRepos.save(new Score(g2, p3,0.5));
			scoreRepos.save(new Score(g2, p1,0.5));
		};
	}

}
