package com.codeoftheweb.Salvo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.authentication.configuration.GlobalAuthenticationConfigurerAdapter;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.WebAttributes;
import org.springframework.security.web.authentication.logout.HttpStatusReturningLogoutSuccessHandler;


import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.util.*;


@SpringBootApplication
public class SalvoApplication extends SpringBootServletInitializer {

	public static void main(String[] args) {
		SpringApplication.run(SalvoApplication.class, args);
	}

	@Bean
	public PasswordEncoder passwordEncoder(){
		return PasswordEncoderFactories.createDelegatingPasswordEncoder();
	}

	@Bean
	public CommandLineRunner initData(GamePlayerRepository repository, PlayerRepository pRepos, GameRepository gRepos, ScoreRepository scoreRepos){
		return(args) -> {
			Player p1 = new Player("j.bauer@ctu.gov", "Jack Bauer", passwordEncoder().encode("24"));
			Player p2 = new Player("c.obrian@ctu.gov", "Chloe O'Brian", passwordEncoder().encode("42"));
			Player p3 = new Player("t.almeida@ctu.gov", "Tony Almeida", passwordEncoder().encode("kb"));
			Player p4 = new Player("ki_bauer@gmail.com", "Kim Bauer", passwordEncoder().encode("mole"));
			pRepos.save(p1);
			pRepos.save(p2);
			pRepos.save(p3);
			pRepos.save(p4);

	/*


			Game g1 = new Game();
			Game g2 = new Game();
			Game g3 = new Game();
			Game g4 = new Game();

			Set<Ship> shipSet1 = new HashSet<>();
			shipSet1.add(new Ship("patrol_boat", new HashSet<>(Arrays.asList("H1","H2"))));
			shipSet1.add(new Ship("destroyer", new HashSet<>(Arrays.asList("A2","B2","C2"))));

			Set<Ship> shipSet2 = new HashSet<>();
			shipSet2.add(new Ship("Patrol", new HashSet<>(Arrays.asList("B5","B6"))));
			shipSet2.add(new Ship("Lanchadebokita", new HashSet<>(Arrays.asList("B10","C10","D10","E10"))));

			Set<Ship> shipSet3 = new HashSet<>();
			shipSet3.add(new Ship("Patrol", new HashSet<>(Arrays.asList("B5","B6"))));
			shipSet3.add(new Ship("Rippeadora", new HashSet<>(Arrays.asList("B2","C2"))));

			Set<Ship> shipSet4 = new HashSet<>();
			shipSet4.add(new Ship("Patrol", new HashSet<>(Arrays.asList("B5","B6"))));
			shipSet4.add(new Ship("LanchaSuperChino", new HashSet<>(Arrays.asList("H3","H4","H5","H6","H7"))));

			Set<Ship> shipSet5 = new HashSet<>();
			shipSet5.add(new Ship("UKNOWIHADTODOITTOEM", new HashSet<>(Arrays.asList("H1","H3"))));
			shipSet5.add(new Ship("SS.Titanic", new HashSet<>(Arrays.asList("A2","B2","C2"))));

			Set<Ship> shipSet6 = new HashSet<>();
			shipSet6.add(new Ship("YutaMovil", new HashSet<>(Arrays.asList("B5","B6"))));
			shipSet6.add(new Ship("Lanchaderiverpleit", new HashSet<>(Arrays.asList("E6","E7","E8"))));

			Set<Ship> shipSet7 = new HashSet<>();
			shipSet7.add(new Ship("wenaloscabrooos", new HashSet<>(Arrays.asList("B5","B6"))));
			shipSet7.add(new Ship("lancha42", new HashSet<>(Arrays.asList("B2","C2","D2"))));

			Set<Ship> shipSet8 = new HashSet<>();
			shipSet8.add(new Ship("Fabricadepancho", new HashSet<>(Arrays.asList("B5","B6"))));
			shipSet8.add(new Ship("Lanchakiosko25", new HashSet<>(Arrays.asList("H3","H4","H5","H6","H7"))));



			Set<Salvo> salvoSet1 = new HashSet<>();
			salvoSet1.add( new Salvo(1, new HashSet<>(Arrays.asList("C4","A2"))));
			salvoSet1.add(new Salvo(2, new HashSet<>(Arrays.asList("H6","D9"))));

			Set<Salvo> salvoSet2 = new HashSet<>();
			salvoSet2.add(new Salvo(1, new HashSet<>(Arrays.asList("F2", "G3"))));
			salvoSet2.add(new Salvo(2, new HashSet<>(Arrays.asList("C7","A10"))));

			Set<Salvo> salvoSet3 = new HashSet<>();
			salvoSet3.add(new Salvo(1, new HashSet<>(Arrays.asList("H2", "H5"))));
			salvoSet3.add(new Salvo(2, new HashSet<>(Arrays.asList("C6","B6"))));

			Set<Salvo> salvoSet4 = new HashSet<>();
			salvoSet4.add(new Salvo(1, new HashSet<>(Arrays.asList("D6", "A1"))));
			salvoSet4.add(new Salvo(2, new HashSet<>(Arrays.asList("C10","F2"))));


			Set<Salvo> salvoSet5 = new HashSet<>();
			salvoSet5.add( new Salvo(1, new HashSet<>(Arrays.asList("C2","A4"))));
			salvoSet5.add(new Salvo(2, new HashSet<>(Arrays.asList("H9","D2"))));

			Set<Salvo> salvoSet6 = new HashSet<>();
			salvoSet6.add(new Salvo(1, new HashSet<>(Arrays.asList("F3", "G3"))));
			salvoSet6.add(new Salvo(2, new HashSet<>(Arrays.asList("C10","A10"))));

			Set<Salvo> salvoSet7 = new HashSet<>();
			salvoSet7.add(new Salvo(1, new HashSet<>(Arrays.asList("H1", "J6"))));
			salvoSet7.add(new Salvo(2, new HashSet<>(Arrays.asList("C7","B4"))));

			Set<Salvo> salvoSet8 = new HashSet<>();
			salvoSet8.add(new Salvo(1, new HashSet<>(Arrays.asList("D7", "A2"))));
			salvoSet8.add(new Salvo(2, new HashSet<>(Arrays.asList("C7","F3"))));

			g1.addGamePlayer(new GamePlayer(p1, shipSet1, salvoSet1));
			g1.addGamePlayer(new GamePlayer(p2, shipSet2, salvoSet2));
			g2.addGamePlayer(new GamePlayer(p1, shipSet3, salvoSet3));
			g2.addGamePlayer(new GamePlayer(p4, shipSet4, salvoSet4));
			g3.addGamePlayer(new GamePlayer(p4, shipSet5, salvoSet5));
			g3.addGamePlayer(new GamePlayer(p3, shipSet6, salvoSet6));
			g4.addGamePlayer(new GamePlayer(p2, shipSet7, salvoSet7));
			g4.addGamePlayer(new GamePlayer(p4, shipSet8, salvoSet8));

			gRepos.save(g1);
			gRepos.save(g2);
			gRepos.save(g3);
			gRepos.save(g4);

			//GamePlayers
			/*repository.save(new GamePlayer(g1, p1, shipSet1, salvoSet1));
			repository.save(new GamePlayer(g1, p2, shipSet2, salvoSet2));
			repository.save(new GamePlayer(g2, p3, shipSet3, salvoSet3));
			repository.save(new GamePlayer(g2, p1, shipSet4, salvoSet4));
			repository.save(new GamePlayer(g3, p4, shipSet5, salvoSet5));
			repository.save(new GamePlayer(g3, p3, shipSet6, salvoSet6));
			repository.save(new GamePlayer(g4, p2, shipSet7, salvoSet7));//

			//Scores
			scoreRepos.save(new Score(g1, p1,1));
			scoreRepos.save(new Score(g1, p2,0));
			scoreRepos.save(new Score(g2, p3,0.5));
			scoreRepos.save(new Score(g2, p1,0.5));
			scoreRepos.save(new Score(g3, p4, 0.5));
			scoreRepos.save(new Score(g3, p3, 0.5));
			*/
		};
	}

}

@Configuration
class WebSecurityConfiguration extends GlobalAuthenticationConfigurerAdapter {

	@Autowired
	PlayerRepository playerRepository;

	@Override
	public void init(AuthenticationManagerBuilder auth) throws Exception {
		auth.userDetailsService(inputName-> {
			Player person = playerRepository.findByEmail(inputName);
			if (person != null) {
				return new User(person.getEmail(), person.getPassword(),
						AuthorityUtils.createAuthorityList("ADMIN"));
			} else {
				throw new UsernameNotFoundException("Unknown user: " + inputName);
			}
		});
	}
}

@EnableWebSecurity
@Configuration
class WebSecurityConfig extends WebSecurityConfigurerAdapter{
	@Override
	protected void configure(HttpSecurity http) throws Exception{
		http.authorizeRequests()
				.antMatchers("/rest/**").hasAuthority("ADMIN")
				.antMatchers("/api/game_view/**").hasAnyAuthority("USER", "ADMIN")
				.and()
				.formLogin();

		http.formLogin().
				usernameParameter("email").
				passwordParameter("password").
				loginPage("/api/login");

		http.logout().logoutUrl("/api/logout");

		http.headers().frameOptions().sameOrigin();

		// turn off checking for CSRF tokens
		http.csrf().disable();

		// if user is not authenticated, just send an authentication failure response
		http.exceptionHandling().authenticationEntryPoint((req, res, exc) -> res.sendError(HttpServletResponse.SC_UNAUTHORIZED));

		// if login is successful, just clear the flags asking for authentication
		http.formLogin().successHandler((req, res, auth) -> clearAuthenticationAttributes(req));

		// if login fails, just send an authentication failure response
		http.formLogin().failureHandler((req, res, exc) -> res.sendError(HttpServletResponse.SC_UNAUTHORIZED));

		// if logout is successful, just send a success response
		http.logout().logoutSuccessHandler(new HttpStatusReturningLogoutSuccessHandler());
	}

	private void clearAuthenticationAttributes(HttpServletRequest request) {
		HttpSession session = request.getSession(false);
		if (session != null) {
			session.removeAttribute(WebAttributes.AUTHENTICATION_EXCEPTION);
		}
	}
}
