const yourTeamContainer = document.getElementById('your-team-container');
const opponentTeamContainer = document.getElementById('opponent-team-container');
const startBattleButton = document.getElementById('start-battle');
const battleLog = document.getElementById('battle-log');
const yourTeamSearch = document.getElementById('your-team-search');
const yourTeamResults = document.getElementById('your-team-results');
const opponentTeamSearch = document.getElementById('opponent-team-search');
const opponentTeamResults = document.getElementById('opponent-team-results');

let yourTeam = []; // Array to store your team
let opponentTeam = []; // Array to store the opponent's team

// Function to load teams from local storage (or create default teams)
async function loadTeams() {
  try {
    // Try to load teams from local storage
    const storedYourTeam = localStorage.getItem('yourTeam');
    const storedOpponentTeam = localStorage.getItem('opponentTeam');

    if (storedYourTeam) {
      // Fetch full data for each Pokémon in the stored team
      const yourTeamPromises = JSON.parse(storedYourTeam).map(pokemonName => fetchPokemonData(pokemonName));
      yourTeam = await Promise.all(yourTeamPromises);
    } else {
      // If no teams are stored, fetch Pikachu and Charmander data from PokeAPI
      const pikachuData = await fetchPokemonData('pikachu');
      yourTeam = [pikachuData];
    }

    if (storedOpponentTeam) {
      // Fetch full data for each Pokémon in the stored team
      const opponentTeamPromises = JSON.parse(storedOpponentTeam).map(pokemonName => fetchPokemonData(pokemonName));
      opponentTeam = await Promise.all(opponentTeamPromises);
    } else {
      const charmanderData = await fetchPokemonData('charmander');
      opponentTeam = [charmanderData];
    }

    // Display the teams in the UI
    displayTeams(yourTeam, yourTeamContainer);
    displayTeams(opponentTeam, opponentTeamContainer);
  } catch (error) {
    console.error('Error loading teams:', error);
  }
}

// Function to fetch Pokemon data with all necessary details
async function fetchPokemonData(pokemonName) {
  try {
    const pokemonResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);
    const pokemonData = await pokemonResponse.json();


    const speciesResponse = await fetch(pokemonData.species.url);
    const speciesData = await speciesResponse.json();


    // Fetch move data for each move
    const movePromises = pokemonData.moves.map(move => fetch(move.move.url).then(res => res.json()));
    const movesData = await Promise.all(movePromises);

    // Extract relevant data and return
    return {
      name: pokemonData.name,
      sprites: pokemonData.sprites,
      types: pokemonData.types.map(type => type.type.name),
      stats: pokemonData.stats.reduce((stats, stat) => {
        stats[stat.stat.name] = stat.base_stat;
        return stats;
      }, {}),
      moves: movesData
        .filter(move => move.power && move.accuracy) // Filter out moves with no power or accuracy
        .map(move => ({
          name: move.name,
          power: move.power,
          type: move.type.name,
          accuracy: move.accuracy,
          pp: move.pp,
          priority: move.priority,
        })),
    };
  } catch (error) {
    console.error(`Error fetching data for ${pokemonName}:`, error);
    return null;
  }
}

// Function to display teams (more detailed)
function displayTeams(team, container) {
  container.innerHTML = ''; // Clear the container

  team.forEach(pokemon => {
    const pokemonDiv = document.createElement('div');
    pokemonDiv.classList.add('pokemon-card');

    const pokemonName = document.createElement('h3');
    pokemonName.textContent = pokemon.name;
    pokemonDiv.appendChild(pokemonName);

    const pokemonImage = document.createElement('img');
    pokemonImage.src = pokemon.sprites.front_default; 
    pokemonImage.alt
 = pokemon.name;
    pokemonDiv.appendChild(pokemonImage);


    const pokemonTypes = document.createElement('p');
    pokemonTypes.textContent = `Type: ${pokemon.types.join(', ')}`; 
    pokemonDiv.appendChild(pokemonTypes);

    container.appendChild(pokemonDiv);
  });
}

// Function to handle search input
async function handleSearch(event, team, resultsContainer) {
  const searchTerm = event.target.value.toLowerCase();

  if (searchTerm.length >= 3) {
    try {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${searchTerm}`);
      if (!response.ok) {
        throw new Error('Pokémon not found');
      }
      const data = await response.json();

      resultsContainer.innerHTML = '';
      const pokemonDiv = document.createElement('div');
      pokemonDiv.classList.add('pokemon-card');
      pokemonDiv.textContent = data.name;

      pokemonDiv.addEventListener('click', async () => {
        const pokemonData = await fetchPokemonData(data.name);
        team.push(pokemonData);

        if (team === yourTeam) {
          displayTeams(yourTeam, yourTeamContainer);
        } else {
          displayTeams(opponentTeam, opponentTeamContainer);
        }

        resultsContainer.innerHTML = '';
      });

      resultsContainer.appendChild(pokemonDiv);
    } catch (error) {
      resultsContainer.innerHTML = 'Pokémon not found';
    }
  } else {
    resultsContainer.innerHTML = '';
  }
}

// Add event listeners for search input
yourTeamSearch.addEventListener('input', (event) => handleSearch(event, yourTeam, yourTeamResults));
opponentTeamSearch.addEventListener('input', (event) => handleSearch(event, opponentTeam, opponentTeamResults));

// Function to simulate a battle (more robust with AI and interactive UI)
async function simulateBattle() {
  battleLog.innerHTML = "Battle started!<br>";

  let yourCurrentPokemon = yourTeam[0];
  let opponentCurrentPokemon = opponentTeam[0];

  displayCurrentPokemon(yourCurrentPokemon, opponentCurrentPokemon);

  while (yourTeam.length > 0 && opponentTeam.length > 0) {
    const yourMove = await getYourMove(yourCurrentPokemon);
    const opponentMove = await getOpponentMove(opponentCurrentPokemon, yourCurrentPokemon);

    const yourMoveData = yourCurrentPokemon.moves.find(move => move.name === yourMove);
    const opponentMoveData = opponentCurrentPokemon.moves.find(move => move.name === opponentMove);

    if (yourMoveData.priority > opponentMoveData.priority) {
      await simulateTurn(yourCurrentPokemon, opponentCurrentPokemon, yourMoveData, opponentMoveData);
      if (opponentCurrentPokemon.stats.hp > 0) {
        await simulateTurn(opponentCurrentPokemon, yourCurrentPokemon, opponentMoveData, yourMoveData);
      }
    } else if (yourMoveData.priority < opponentMoveData.priority) {
      await simulateTurn(opponentCurrentPokemon, yourCurrentPokemon, opponentMoveData, yourMoveData);
      if (yourCurrentPokemon.stats.hp > 0) {
        await simulateTurn(yourCurrentPokemon, opponentCurrentPokemon, yourMoveData, opponentMoveData);
      }
    } else {
      await simulateTurn(yourCurrentPokemon, opponentCurrentPokemon, yourMoveData, opponentMoveData);
      await simulateTurn(opponentCurrentPokemon, yourCurrentPokemon, opponentMoveData, yourMoveData);
    }

    if (yourCurrentPokemon.stats.hp <= 0) {
      battleLog.innerHTML += `${yourCurrentPokemon.name} fainted!<br>`;
      yourTeam.shift();
      if (yourTeam.length > 0) {
        yourCurrentPokemon = yourTeam[0];
        battleLog.innerHTML += `You send out ${yourCurrentPokemon.name}!<br>`;
      }
    }
    if (opponentCurrentPokemon.stats.hp <= 0) {
      battleLog.innerHTML += `${opponentCurrentPokemon.name} fainted!<br>`;
      opponentTeam.shift();
      if (opponentTeam.length > 0) {
        opponentCurrentPokemon = opponentTeam[0];
        battleLog.innerHTML += `Opponent sends out ${opponentCurrentPokemon.name}!<br>`;
      }
    }

    displayCurrentPokemon(yourCurrentPokemon, opponentCurrentPokemon);

    await new Promise(resolve => setTimeout(resolve, 1000)); 
  }

  if (yourTeam.length > 0) {
    battleLog.innerHTML += "You win!<br>";
  } else {
    battleLog.innerHTML += "Opponent wins!<br>";

  }
}

// Function to get your move (interactive)
async function getYourMove(pokemon) {
  return new Promise(resolve => {
    const moveButtonsDiv = document.createElement('div');
    pokemon.moves.forEach(move => {
      const moveButton = document.createElement('button');
      moveButton.textContent = move.name;
      moveButton.addEventListener('click', () => {
        moveButtonsDiv.remove();
        resolve(move.name);
      });
      moveButtonsDiv.appendChild(moveButton);
    });
    battleLog.appendChild(moveButtonsDiv);
  });
}

// Function to get opponent's move (AI)
async function getOpponentMove(opponentPokemon, yourPokemon) {
  // 1. Prioritize super effective moves
  for (const move of opponentPokemon.moves) {
    const effectiveness = await calculateTypeEffectiveness(move.type, yourPokemon.types);
    if (effectiveness > 1) {
      return move.name;
    }
  }

  // 2. If no super effective moves, prioritize high-power moves
  let highestPowerMove = opponentPokemon.moves[0];
  for (const move of opponentPokemon.moves) {
    if (move.power > highestPowerMove.power) {
      highestPowerMove = move;
    }
  }
  if (highestPowerMove.power > 50) {
    return highestPowerMove.name;
  }

  // 3. If no high-power moves, use a random move
  const randomIndex = Math.floor(Math.random() * opponentPokemon.moves.length);
  return opponentPokemon.moves[randomIndex].name;
}

// Helper function to calculate type effectiveness
async function calculateTypeEffectiveness(attackingType, defendingTypes) {
  let effectiveness = 1;
  const typeEffectivenessPromises = defendingTypes.map(type =>
    fetch(`https://pokeapi.co/api/v2/type/${type}`)
      .then(res => res.json())
      .then(typeData => typeData.damage_relations)
  );
  const typeEffectivenessData = await Promise.all(typeEffectivenessPromises);

  typeEffectivenessData.forEach(relations => {
    if (relations.double_damage_from.some(entry => entry.name === attackingType)) {
      effectiveness *= 2;
    }
    if (relations.half_damage_from.some(entry => entry.name === attackingType)) {
      effectiveness *= 0.5;
    }
    if (relations.no_damage_from.some(entry => entry.name === attackingType)) {
      effectiveness *= 0;
    }
  });

  return effectiveness;
}

// Function to simulate a turn
async function simulateTurn(yourPokemon, opponentPokemon, yourMove, opponentMove) {
  const yourDamage = await calculateDamage(yourPokemon, opponentPokemon, yourMove, opponentMove);
  const opponentDamage = await calculateDamage(opponentPokemon, yourPokemon, opponentMove, yourMove);

  opponentPokemon.stats.hp -= yourDamage;
  yourPokemon.stats.hp -= opponentDamage;

  battleLog.innerHTML += `${yourPokemon.name} used ${yourMove.name}! (Damage: ${yourDamage})<br>`;
  battleLog.innerHTML += `${opponentPokemon.name} used ${opponentMove.name}! (Damage: ${opponentDamage})<br>`;
}

// Function to calculate damage
async function calculateDamage(attacker, defender, moveData, defenderMoveData) {
  let typeEffectiveness = 1;
  for (const defenderType of defender.types) {
    const typeEffectivenessResponse = await fetch(`https://pokeapi.co/api/v2/type/${defenderType}`);
    const typeEffectivenessData = await typeEffectivenessResponse.json();

    if (typeEffectivenessData.damage_relations.double_damage_from.some(entry => entry.name === moveData.type)) {
      typeEffectiveness *= 2;
    }
    if (typeEffectivenessData.damage_relations.half_damage_from.some(entry => entry.name === moveData.type)) {
      typeEffectiveness *= 0.5;
    }
    if (typeEffectivenessData.damage_relations.no_damage_from.some(entry => entry.name === moveData.type)) {
      typeEffectiveness *= 0;
    }
  }

  let damage = Math.floor(((2 * 100 / 5 + 2) * attacker.stats.attack * moveData.power / defender.stats.defense) / 50 + 2);
  damage *= typeEffectiveness;

  if (attacker.types.includes(moveData.type)) {
    damage *= 1.5;
  }

  if (moveData.name === "Quick Attack" && defenderMoveData.name !== "Quick Attack") {
    damage *= 1.5;
  }

  return damage;
}

// Function to display current Pokémon with HP
function displayCurrentPokemon(yourPokemon, opponentPokemon) {
  yourTeamContainer.innerHTML = '';
  opponentTeamContainer.innerHTML = '';

  const yourPokemonDiv = document.createElement('div');
  yourPokemonDiv.classList.add('pokemon-card');
  yourPokemonDiv.innerHTML = `
    <h3>${yourPokemon.name}</h3>
    <img src="${yourPokemon.sprites.front_default}" alt="${yourPokemon.name}">
    <p>HP: ${yourPokemon.stats.hp}</p>
  `;
  yourTeamContainer.appendChild(yourPokemonDiv);

  const opponentPokemonDiv = document.createElement('div');
  opponentPokemonDiv.classList.add('pokemon-card');
  opponentPokemonDiv.innerHTML = `
    <h3>${opponentPokemon.name}</h3>
    <img src="${opponentPokemon.sprites.front_default}" alt="${opponentPokemon.name}">
    <p>HP: ${opponentPokemon.stats.hp}</p>
  `;
  opponentTeamContainer.appendChild(opponentPokemonDiv);
}

// Load teams when the page loads
if (window.location.pathname.endsWith('battle.html')) {
  loadTeams();
}

// Add event listener to the "Start Battle" button
startBattleButton.addEventListener('click', simulateBattle);