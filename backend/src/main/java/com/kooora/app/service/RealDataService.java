package com.kooora.app.service;

import com.kooora.app.entity.*;
import com.kooora.app.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

/**
 * Service for integrating real football data
 * Uses free APIs and creates realistic sample data
 */
@Service
public class RealDataService {
    
    private static final Logger logger = LoggerFactory.getLogger(RealDataService.class);
    
    @Autowired
    private CountryRepository countryRepository;
    
    @Autowired
    private LeagueRepository leagueRepository;
    
    @Autowired
    private TeamRepository teamRepository;
    
    @Autowired
    private MatchRepository matchRepository;
    
    @Autowired
    private PlayerRepository playerRepository;
    
    private final RestTemplate restTemplate = new RestTemplate();
    
    /**
     * Initialize the database with real football data
     */
    public void initializeRealData() {
        logger.info("🚀 Initializing database with real football data...");
        
        try {
            // Clear existing data
            clearExistingData();
            
            // Create realistic countries with real flags
            createRealCountries();
            
            // Create major leagues
            createRealLeagues();
            
            // Create top teams
            createRealTeams();
            
            // Create some sample matches
            createSampleMatches();
            
            // Create sample players
            createSamplePlayers();
            
            logger.info("✅ Real football data initialization completed successfully!");
            
        } catch (Exception e) {
            logger.error("❌ Error initializing real data: ", e);
        }
    }
    
    @Transactional
    private void clearExistingData() {
        logger.info("🧹 Clearing existing data...");
        matchRepository.deleteAll();
        playerRepository.deleteAll();
        teamRepository.deleteAll();
        leagueRepository.deleteAll();
        countryRepository.deleteAll();
        logger.info("✅ Existing data cleared");
    }
    
    @Transactional
    private void createRealCountries() {
        logger.info("🌍 Creating countries with real flags...");
        
        List<Country> countries = Arrays.asList(
            createCountry("England", "ENG", "https://flagcdn.com/w320/gb-eng.png"),
            createCountry("Spain", "ESP", "https://flagcdn.com/w320/es.png"),
            createCountry("Germany", "GER", "https://flagcdn.com/w320/de.png"),
            createCountry("Italy", "ITA", "https://flagcdn.com/w320/it.png"),
            createCountry("France", "FRA", "https://flagcdn.com/w320/fr.png"),
            createCountry("Brazil", "BRA", "https://flagcdn.com/w320/br.png"),
            createCountry("Argentina", "ARG", "https://flagcdn.com/w320/ar.png"),
            createCountry("Netherlands", "NED", "https://flagcdn.com/w320/nl.png"),
            createCountry("Portugal", "POR", "https://flagcdn.com/w320/pt.png"),
            createCountry("Belgium", "BEL", "https://flagcdn.com/w320/be.png")
        );
        
        countryRepository.saveAll(countries);
        logger.info("✅ Created {} countries", countries.size());
    }
    
    private Country createCountry(String name, String code, String flagUrl) {
        Country country = new Country();
        country.setName(name);
        country.setCode(code);
        country.setFlagUrl(flagUrl);
        country.setIsActive(true);
        return country;
    }
    
    @Transactional
    private void createRealLeagues() {
        logger.info("🏆 Creating major football leagues...");
        
        Country england = countryRepository.findByCode("ENG").orElseThrow();
        Country spain = countryRepository.findByCode("ESP").orElseThrow();
        Country germany = countryRepository.findByCode("GER").orElseThrow();
        Country italy = countryRepository.findByCode("ITA").orElseThrow();
        Country france = countryRepository.findByCode("FRA").orElseThrow();
        
        List<League> leagues = Arrays.asList(
            createLeague("Premier League", england, "2024-25", "https://logos.textgiraffe.com/logos/logo-name/Premier-designstyle-boots-m.png"),
            createLeague("La Liga", spain, "2024-25", "https://logoeps.com/wp-content/uploads/2013/03/la-liga-vector-logo.png"),
            createLeague("Bundesliga", germany, "2024-25", "https://logos-world.net/wp-content/uploads/2020/06/Bundesliga-Logo.png"),
            createLeague("Serie A", italy, "2024-25", "https://logos-world.net/wp-content/uploads/2020/06/Serie-A-Logo.png"),
            createLeague("Ligue 1", france, "2024-25", "https://logos-world.net/wp-content/uploads/2020/06/Ligue-1-Logo.png")
        );
        
        leagueRepository.saveAll(leagues);
        logger.info("✅ Created {} leagues", leagues.size());
    }
    
    private League createLeague(String name, Country country, String season, String logoUrl) {
        League league = new League();
        league.setName(name);
        league.setCountry(country);
        league.setSeason(season);
        league.setLogoUrl(logoUrl);
        league.setStartDate(LocalDate.of(2024, 8, 15));
        league.setEndDate(LocalDate.of(2025, 5, 25));
        league.setStatus(League.LeagueStatus.ACTIVE);
        league.setIsActive(true);
        return league;
    }
    
    @Transactional
    private void createRealTeams() {
        logger.info("⚽ Creating top football teams...");
        
        Country england = countryRepository.findByCode("ENG").orElseThrow();
        Country spain = countryRepository.findByCode("ESP").orElseThrow();
        Country germany = countryRepository.findByCode("GER").orElseThrow();
        Country italy = countryRepository.findByCode("ITA").orElseThrow();
        Country france = countryRepository.findByCode("FRA").orElseThrow();
        
        List<Team> teams = Arrays.asList(
            // Premier League Teams
            createTeam("Manchester City", "MCI", england, "https://logos-world.net/wp-content/uploads/2020/06/Manchester-City-Logo.png", "Etihad Stadium", 2008),
            createTeam("Arsenal", "ARS", england, "https://logos-world.net/wp-content/uploads/2020/06/Arsenal-Logo.png", "Emirates Stadium", 1886),
            createTeam("Liverpool", "LIV", england, "https://logos-world.net/wp-content/uploads/2020/06/Liverpool-Logo.png", "Anfield", 1892),
            createTeam("Chelsea", "CHE", england, "https://logos-world.net/wp-content/uploads/2020/06/Chelsea-Logo.png", "Stamford Bridge", 1905),
            createTeam("Manchester United", "MUN", england, "https://logos-world.net/wp-content/uploads/2020/06/Manchester-United-Logo.png", "Old Trafford", 1878),
            
            // La Liga Teams
            createTeam("Real Madrid", "RMA", spain, "https://logos-world.net/wp-content/uploads/2020/06/Real-Madrid-Logo.png", "Santiago Bernabeu", 1902),
            createTeam("FC Barcelona", "BAR", spain, "https://logos-world.net/wp-content/uploads/2020/06/FC-Barcelona-Logo.png", "Camp Nou", 1899),
            createTeam("Atletico Madrid", "ATM", spain, "https://logos-world.net/wp-content/uploads/2020/06/Atletico-Madrid-Logo.png", "Wanda Metropolitano", 1903),
            
            // Bundesliga Teams
            createTeam("Bayern Munich", "BAY", germany, "https://logos-world.net/wp-content/uploads/2020/06/Bayern-Munich-Logo.png", "Allianz Arena", 1900),
            createTeam("Borussia Dortmund", "BVB", germany, "https://logos-world.net/wp-content/uploads/2020/06/Borussia-Dortmund-Logo.png", "Signal Iduna Park", 1909),
            
            // Serie A Teams
            createTeam("Juventus", "JUV", italy, "https://logos-world.net/wp-content/uploads/2020/06/Juventus-Logo.png", "Allianz Stadium", 1897),
            createTeam("AC Milan", "MIL", italy, "https://logos-world.net/wp-content/uploads/2020/06/AC-Milan-Logo.png", "San Siro", 1899),
            createTeam("Inter Milan", "INT", italy, "https://logos-world.net/wp-content/uploads/2020/06/Inter-Milan-Logo.png", "San Siro", 1908),
            
            // Ligue 1 Teams
            createTeam("Paris Saint-Germain", "PSG", france, "https://logos-world.net/wp-content/uploads/2020/06/Paris-Saint-Germain-Logo.png", "Parc des Princes", 1970),
            createTeam("Olympique Marseille", "OLM", france, "https://logos-world.net/wp-content/uploads/2020/06/Olympique-Marseille-Logo.png", "Orange Velodrome", 1899)
        );
        
        teamRepository.saveAll(teams);
        logger.info("✅ Created {} teams", teams.size());
    }
    
    private Team createTeam(String name, String shortName, Country country, String logoUrl, String stadiumName, int foundedYear) {
        Team team = new Team();
        team.setName(name);
        team.setShortName(shortName);
        team.setCountry(country);
        team.setLogoUrl(logoUrl);
        team.setStadiumName(stadiumName);
        team.setFoundedYear(foundedYear);
        team.setWebsite("https://www." + name.toLowerCase().replace(" ", "") + ".com");
        team.setIsActive(true);
        return team;
    }
    
    @Transactional
    private void createSampleMatches() {
        logger.info("🥅 Creating sample matches...");
        
        List<Team> teams = teamRepository.findAll();
        if (teams.size() < 4) return;
        
        League premierLeague = leagueRepository.findByName("Premier League").orElse(null);
        if (premierLeague == null) return;
        
        // Create some sample matches
        Match match1 = createMatch(teams.get(0), teams.get(1), premierLeague, LocalDateTime.now().plusDays(1), null, null, Match.MatchStatus.SCHEDULED);
        Match match2 = createMatch(teams.get(2), teams.get(3), premierLeague, LocalDateTime.now().plusDays(2), null, null, Match.MatchStatus.SCHEDULED);
        Match match3 = createMatch(teams.get(0), teams.get(2), premierLeague, LocalDateTime.now().minusDays(1), 2, 1, Match.MatchStatus.COMPLETED);
        
        matchRepository.saveAll(Arrays.asList(match1, match2, match3));
        logger.info("✅ Created sample matches");
    }
    
    private Match createMatch(Team homeTeam, Team awayTeam, League league, LocalDateTime matchDate, Integer homeScore, Integer awayScore, Match.MatchStatus status) {
        Match match = new Match();
        match.setHomeTeam(homeTeam);
        match.setAwayTeam(awayTeam);
        match.setLeague(league);
        match.setMatchDate(matchDate);
        match.setHomeScore(homeScore);
        match.setAwayScore(awayScore);
        match.setStatus(status);
        match.setVenue(homeTeam.getStadiumName());
        return match;
    }
    
    @Transactional
    private void createSamplePlayers() {
        logger.info("👤 Creating sample players...");
        
        List<Team> teams = teamRepository.findAll();
        if (teams.isEmpty()) return;
        
        Team manCity = teams.stream().filter(t -> t.getName().equals("Manchester City")).findFirst().orElse(teams.get(0));
        Team realMadrid = teams.stream().filter(t -> t.getName().equals("Real Madrid")).findFirst().orElse(teams.get(0));
        
        Country england = countryRepository.findByCode("ENG").orElse(null);
        Country spain = countryRepository.findByCode("ESP").orElse(null);
        
        List<Player> players = Arrays.asList(
            createPlayer("Erling", "Haaland", manCity, england, "Forward", 9, "https://img.a.transfermarkt.technology/portrait/big/418560-1663675370.jpg?lm=1"),
            createPlayer("Kevin", "De Bruyne", manCity, england, "Midfielder", 17, "https://img.a.transfermarkt.technology/portrait/big/88755-1694613605.png?lm=1"),
            createPlayer("Vinicius", "Junior", realMadrid, spain, "Forward", 7, "https://img.a.transfermarkt.technology/portrait/big/371998-1694610602.png?lm=1"),
            createPlayer("Luka", "Modric", realMadrid, spain, "Midfielder", 10, "https://img.a.transfermarkt.technology/portrait/big/27992-1663676819.jpg?lm=1")
        );
        
        playerRepository.saveAll(players);
        logger.info("✅ Created sample players");
    }
    
    private Player createPlayer(String firstName, String lastName, Team team, Country country, String position, int jerseyNumber, String photoUrl) {
        Player player = new Player();
        player.setFirstName(firstName);
        player.setLastName(lastName);
        player.setTeam(team);
        player.setCountry(country);
        player.setPosition(position);
        player.setJerseyNumber(String.valueOf(jerseyNumber));
        player.setPhotoUrl(photoUrl);
        player.setIsActive(true);
        return player;
    }
}
