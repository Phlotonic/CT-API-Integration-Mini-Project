const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const searchResults = document.getElementById('search-results');
const   
 typeSelect = document.getElementById('type-select');
const typeList = document.getElementById('type-list');
const abilityList = document.getElementById('ability-list');
const moveList = document.getElementById('move-list');
const generationList = document.getElementById('generation-list');
const generationPokemon = document.getElementById('generation-pokemon');
const pokemonList = document.getElementById('pokemon-list');

// Team Builder elements
const yourTeamContainer = document.getElementById('your-team-container');
const opponentTeamContainer = document.getElementById('opponent-team-container');
const startBattleButton = document.getElementById('start-battle'); 

// Battle Simulator elements (these might be null on other pages)
const battleLog = document.getElementById('battle-log'); 
const yourTeamSearch = document.getElementById('your-team-search');
const yourTeamResults = document.getElementById('your-team-results');
const opponentTeamSearch = document.getElementById('opponent-team-search');
const opponentTeamResults = document.getElementById('opponent-team-results');

let availablePokemon = []; 
let yourTeam = []; 
let opponentTeam = [];

// Search Functionality
if (searchButton) {
  searchButton.addEventListener('click', () => {
    const pokemonName = searchInput.value.toLowerCase();
    searchResults.innerHTML = '';
    fetchPokemonData(pokemonName);
  });
}

if (typeSelect) {
  typeSelect.addEventListener('change', () => {
    const selectedType = typeSelect.value;
    searchResults.innerHTML = '';
    fetchPokemonData("", selectedType);
  });
}

async function fetchPokemonData(pokemonName, typeFilter = "") {
  try {
    let url = `https://pokeapi.co/api/v2/pokemon/${pokemonName}`;
    if (typeFilter) {
      url = `https://pokeapi.co/api/v2/type/${typeFilter}`;
    }

    const response = await fetch(url);
    const data = await response.json();

    if (typeFilter) {
      const pokemonNames = data.pokemon.map(pokemon => pokemon.pokemon.name);
      searchResults.innerHTML = "Loading...";
      const pokemonPromises = pokemonNames.map(name => fetchPokemonData(name));
      await Promise.all(pokemonPromises);
    } else {
      if (window.location.pathname.endsWith('search.html')) {
        displayPokemonData(data);
      } else if (window.location.pathname.endsWith('details.html')) {
        displayPokemonDetails(data);
      }
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    if (searchResults) {
      searchResults.innerHTML = "Pokémon not found!";
    }
  }
}

function displayPokemonData(pokemon) {
  const pokemonDiv = document.createElement('div');
  pokemonDiv.classList.add('pokemon-card');

  const name = document.createElement('h3');
  name.textContent = pokemon.name;

  const image = document.createElement('img');
  image.src = pokemon.sprites.front_default;
  image.alt = pokemon.name;

  const type = document.createElement('p');
  type.textContent = `Type: ${pokemon.types.map(type => type.type.name).join(', ')}`;

  pokemonDiv.addEventListener('click', () => {
    window.location.href = `details.html?name=${pokemon.name}`;
  });

  pokemonDiv.appendChild(name);
  pokemonDiv.appendChild(image);
  pokemonDiv.appendChild(type);

  searchResults.appendChild(pokemonDiv);
}

// Details Page Functionality
function displayPokemonDetails(pokemon) {
  const pokemonDetailsDiv = document.getElementById('pokemon-details');
  pokemonDetailsDiv.innerHTML = ''; // Clear previous details

  const name = document.createElement('h2');
  name.textContent = pokemon.name;
  pokemonDetailsDiv.appendChild(name);

  const image = document.createElement('img');
  image.src = pokemon.sprites.front_default;
  image.alt = pokemon.name;
  pokemonDetailsDiv.appendChild(image);

  const types = document.createElement('p');
  types.textContent = `Type: ${pokemon.types.map(type => type.type.name).join(', ')}`;
  pokemonDetailsDiv.appendChild(types);

  const abilities = document.createElement('div');
  abilities.innerHTML = '<h3>Abilities:</h3>';
  const abilitiesList = document.createElement('ul');
  pokemon.abilities.forEach(ability => {
    const abilityItem = document.createElement('li');
    abilityItem.textContent = ability.ability.name;
    abilitiesList.appendChild(abilityItem);
  });
  abilities.appendChild(abilitiesList);
  pokemonDetailsDiv.appendChild(abilities);

  const stats = document.createElement('div');
  stats.innerHTML = '<h3>Stats:</h3>';
  const statsList = document.createElement('ul');
  pokemon.stats.forEach(stat => {
    const statItem = document.createElement('li');
    statItem.textContent = `${stat.stat.name}: ${stat.base_stat}`;
    statsList.appendChild(statItem);
  });
  stats.appendChild(statsList);
  pokemonDetailsDiv.appendChild(stats);

  const moves = document.createElement('div');
  moves.innerHTML = '<h3>Moves:</h3>';
  const movesList = document.createElement('ul');
  pokemon.moves.slice(0, 10).forEach(move => {
    const moveItem = document.createElement('li');
    moveItem.textContent = move.move.name;
    movesList.appendChild(moveItem);
  });
  moves.appendChild(movesList);
  pokemonDetailsDiv.appendChild(moves);

  const evolutionChainUrl = pokemon.species.url; 
  fetchEvolutionChain(evolutionChainUrl);
}

async function fetchEvolutionChain(evolutionChainUrl) {
  try {
    const response = await fetch(evolutionChainUrl);
    const data = await response.json();
    const evolutionChainResponse = await fetch(data.evolution_chain.url);
    const evolutionChainData = await evolutionChainResponse.json();

    const evolutionChainDiv = document.createElement('div');
    evolutionChainDiv.innerHTML = '<h3>Evolution Chain:</h3>';
    displayEvolutionChain(evolutionChainData.chain, evolutionChainDiv);

    const pokemonDetailsDiv = document.getElementById('pokemon-details');
    pokemonDetailsDiv.appendChild(evolutionChainDiv);
  } catch (error) {
    console.error('Error fetching or displaying evolution chain:', error);
  }
}

function displayEvolutionChain(chain, evolutionChainDiv) {
  const pokemonLink = document.createElement('a');
  pokemonLink.href = `details.html?name=${chain.species.name}`;
  pokemonLink.textContent = chain.species.name;
  evolutionChainDiv.appendChild(pokemonLink);

  if (chain.evolves_to.length > 0) {
    evolutionChainDiv.appendChild(document.createTextNode(' -> '));
    chain.evolves_to.forEach(evolution => {
      displayEvolutionChain(evolution, evolutionChainDiv);
    });
  }
}

// Types Page Functionality
async function fetchTypes() {
    try {
      const response = await fetch('https://pokeapi.co/api/v2/type?limit=100000');
      const data = await response.json();
  
      data.results.forEach(type => {
        const option = document.createElement('option');
        option.value = type.name;
        option.textContent = type.name;   
  
        if (typeSelect) {
          typeSelect.appendChild(option);
        }
  
        if (typeList) {
          const typeDiv = document.createElement('div');
          typeDiv.classList.add('type-card');
  
          const typeName = document.createElement('h3');
          typeName.textContent = type.name;
          typeDiv.appendChild(typeName);
  
          const pokemonListContainer = document.createElement('div');
          pokemonListContainer.classList.add('pokemon-list-container');
          pokemonListContainer.style.display = 'none';
  
          typeDiv.appendChild(pokemonListContainer);
  
          typeName.addEventListener('click', async () => {
            try {
              if (pokemonListContainer.style.display === 'none') {
                const typeResponse = await fetch(type.url);
                const typeData = await typeResponse.json();
                const pokemonSpecies = typeData.pokemon;
  
                const pokemonPromises = pokemonSpecies.map(async (species) => {
                  const pokemonResponse = await fetch(species.pokemon.url);
                  const pokemonData = await pokemonResponse.json();
  
                  const pokemonDiv = document.createElement('div');
                  pokemonDiv.classList.add('pokemon-card', 'draggable'); // Add draggable class
                  pokemonDiv.draggable = true; // Make it draggable
  
                  const pokemonImage = document.createElement('img');
                  pokemonImage.src = pokemonData.sprites.front_default;
                  pokemonImage.alt = pokemonData.name;   
  
                  pokemonDiv.appendChild(pokemonImage);
  
                  const pokemonName = document.createElement('h3');
                  pokemonName.textContent = pokemonData.name;
                  pokemonDiv.appendChild(pokemonName);
  
                  const pokemonNumber = document.createElement('p');
                  pokemonNumber.textContent = `#${pokemonData.id}`;
                  pokemonDiv.appendChild(pokemonNumber);
  
                  // Add event listener to navigate to details page (on single click)
                  pokemonDiv.addEventListener('click', () => {
                    window.location.href = `details.html?name=${pokemonData.name}`;
                  });
  
                  // Add event listener for drag start
                  pokemonDiv.addEventListener('dragstart', (event) => {
                    event.dataTransfer.setData('text/plain', pokemonData.name);
                    showTeamBox(); // Show the team box when dragging starts
                  });
  
                  return {
                    pokemonDiv: pokemonDiv,
                    pokemonId: pokemonData.id
                  };
                });
  
                const pokemonDivsWithIds = await Promise.all(pokemonPromises);
  
                pokemonDivsWithIds.sort((a, b) => a.pokemonId - b.pokemonId);
  
                pokemonDivsWithIds.forEach(({ pokemonDiv }) => {
                  pokemonListContainer.appendChild(pokemonDiv);
                });
  
                pokemonListContainer.style.display = 'block';
              } else {
                pokemonListContainer.style.display = 'none';
              }
  
            } catch (error) {
              console.error('Error fetching or displaying Pokémon by type:', error);
            }
          });
  
          typeList.appendChild(typeDiv);
        }
      });
    } catch (error) {
      console.error('Error fetching types:', error);
    }
  }

// Function to show the team box
function showTeamBox() {
    const teamContainer = document.getElementById('team-container');
    if (teamContainer) {
      teamContainer.style.border = "3px solid red";
    } else {
      const newTeamBox = document.createElement('div');
      newTeamBox.id = 'temp-team-container';
      newTeamBox.classList.add('team-container');
      newTeamBox.style.position = 'fixed';
      newTeamBox.style.top = '20px';
      newTeamBox.style.right = '20px';
      newTeamBox.style.border = "3px solid red";
      newTeamBox.style.zIndex = '1000';
  
      // Add the label
      const teamLabel = document.createElement('h2');
      teamLabel.textContent = "Your Team";
      teamLabel.classList.add('team-label'); // Add the same class as in team-builder.html
      newTeamBox.appendChild(teamLabel);
  
      // Add a container for the team members
      const teamMembersContainer = document.createElement('div');
      newTeamBox.appendChild(teamMembersContainer); // Add this container to the team box
  
      // Add event listeners for dragover and drop
      newTeamBox.addEventListener('dragover', handleDragOver);
      newTeamBox.addEventListener('drop', (event) => {
        event.preventDefault();
        const pokemonName = event.dataTransfer.getData('text/plain');
        addPokemonToTeam(pokemonName);
  
        // Display the "caught" message
        const caughtMessage = document.createElement('p');
        caughtMessage.textContent = `${pokemonName} was caught!`;
        caughtMessage.style.color = 'green'; // Style the message (optional)
        newTeamBox.appendChild(caughtMessage); 
  
        // Remove the temporary team box after a short delay
        setTimeout(() => {
          newTeamBox.remove();
        }, 1500); // Adjust the delay as needed
      });
  
      document.body.appendChild(newTeamBox);
    }
  }

// Abilities Page Functionality
async function fetchAndDisplayAbilities() {
    try {
      const response = await fetch('https://pokeapi.co/api/v2/ability?limit=100000');
      const data = await response.json();
  
      data.results.forEach(ability => {
        const abilityDiv = document.createElement('div');
        abilityDiv.classList.add('ability-card');
  
        const abilityName = document.createElement('h3');
        abilityName.textContent = ability.name;
        abilityDiv.appendChild(abilityName);
  
        // Add details container
        const detailsContainer = document.createElement('div');
        detailsContainer.classList.add('details-container');
        detailsContainer.style.display   
   = 'none'; // Initially hide details
        abilityDiv.appendChild(detailsContainer);
  
        // Add event listener to show/hide ability details
        abilityName.addEventListener('click', async () => {
          try {
            if (detailsContainer.style.display === 'none') {
              const abilityResponse = await fetch(ability.url);
              const abilityData = await abilityResponse.json();
  
              // Extract the English effect entry
              const effectEntry = abilityData.effect_entries.find(entry => entry.language.name === 'en');
  
              // Add ability details to the container
              const effectParagraph = document.createElement('p');
              effectParagraph.textContent = effectEntry.effect;
              detailsContainer.appendChild(effectParagraph);
  
              const shortEffectParagraph = document.createElement('p');
              shortEffectParagraph.textContent = `Short Effect: ${effectEntry.short_effect}`;
              detailsContainer.appendChild(shortEffectParagraph);
  
              detailsContainer.style.display = 'block'; // Show details
            } else {
              detailsContainer.style.display = 'none'; // Hide details
            }
          } catch (error) {
            console.error('Error fetching or displaying ability details:', error);
          }
        });
  
        abilityList.appendChild(abilityDiv);
      });
  
    } catch (error) {
      console.error('Error fetching abilities:', error);
    }
  }

async function fetchAbilityDetails(abilityUrl) {
  try {
    const response = await fetch(abilityUrl);
    const data = await response.json();

    const modal = document.createElement('div');
    modal.classList.add('modal');
    modal.innerHTML = `
      <div class="modal-content">
        <span class="close-modal">&times;</span>
        <h2><span class="math-inline">\{data\.name\}</h2\>
<p\></span>{data.effect_entries.find(entry => entry.language.name === 'en').effect}</p>
      </div>
    `;
    document.body.appendChild(modal);

    const closeModal = modal.querySelector('.close-modal');
    closeModal.addEventListener('click', () => {
      modal.remove();
    });

    modal.addEventListener('click', (event) => {
      if (event.target === modal) {
        modal.remove();
      }
    });

  } catch (error) {
    console.error('Error fetching ability details:', error);
  }
}



// Moves Page Functionality
async function fetchAndDisplayMoves() {
    try {
      const response = await fetch('https://pokeapi.co/api/v2/move?limit=100000');
      const data = await response.json();
  
      data.results.forEach(move => {
        const moveDiv = document.createElement('div');
        moveDiv.classList.add('move-card'); 
  
        const moveName = document.createElement('h3');
        moveName.textContent = move.name;
        moveDiv.appendChild(moveName);
  
        // Add details container
        const detailsContainer = document.createElement('div');
        detailsContainer.classList.add('details-container');
        detailsContainer.style.display   
   = 'none'; // Initially hide details
        moveDiv.appendChild(detailsContainer);
  
        // Add event listener to show/hide move details
        moveName.addEventListener('click', async () => {
          try {
            if (detailsContainer.style.display === 'none') {
              const moveResponse = await fetch(move.url);
              const moveData = await moveResponse.json();
  
              // Extract the English effect entry
              const effectEntry = moveData.effect_entries.find(entry => entry.language.name === 'en');
  
              // Extract and format the move details
              const name = moveData.name;
              const type = moveData.type.name;
              const power = moveData.power || "—";
              const accuracy = moveData.accuracy || "—";
              const pp = moveData.pp || "—";
              const priority = moveData.priority || "—";
  
              // Add move details to the container
              detailsContainer.innerHTML = `
                <p><b>Type:</b> ${type}</p>
                <p><b>Power:</b> ${power}</p>
                <p><b>Accuracy:</b> ${accuracy}</p>
                <p><b>PP:</b> ${pp}</p>
                <p><b>Priority:</b> ${priority}</p>
                <p><b>Effect:</b> ${effectEntry.effect}</p>
                <p><b>Short Effect:</b> ${effectEntry.short_effect}</p>
              `;
  
              detailsContainer.style.display = 'block'; // Show details
            } else {
              detailsContainer.style.display = 'none'; // Hide details
            }
          } catch (error) {
            console.error('Error fetching or displaying move details:', error);
          }
        });
  
        moveList.appendChild(moveDiv);
      });
  
    } catch (error) {
      console.error('Error fetching moves:', error);
    }
  }

async function fetchMoveDetails(moveUrl) {
  try {
    const response = await fetch(moveUrl);
    const data = await response.json();

    const modal = document.createElement('div');
    modal.classList.add('modal');

    const name = data.name;
    const type = data.type.name;
    const power = data.power || "—"; 
    const accuracy = data.accuracy || "—"; 
    const effect = data.effect_entries.find(entry => entry.language.name === 'en').short_effect;

    modal.innerHTML = `
      <div class="modal-content">
        <span class="close-modal">&times;</span>
        <h2>${name}</h2>
        <p><b>Type:</b> ${type}</p>
        <p><b>Power:</b> ${power}</p>
        <p><b>Accuracy:</b> ${accuracy}</p>
        <p><b>Effect:</b> ${effect}</p>
      </div>
    `;

    document.body.appendChild(modal);

    const closeModal = modal.querySelector('.close-modal');
    closeModal.addEventListener('click', () => {
      modal.remove();
    });

    modal.addEventListener('click', (event) => {
      if (event.target === modal) {
        modal.remove();
      }
    });

  } catch (error) {
    console.error('Error fetching move details:', error);
  }
}

// Call fetchTypes() when the page loads
fetchTypes();

// Function to get Pokémon details from URL parameters
function getPokemonFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  const pokemonName = urlParams.get('name');
  if (pokemonName) {
    fetchPokemonData(pokemonName);
  }
}

// Call getPokemonFromUrl() when on the details.html page
if (window.location.pathname.endsWith('details.html')) {
  getPokemonFromUrl();
}

// Call fetchAndDisplayAbilities() when on the abilities.html page
if (window.location.pathname.endsWith('abilities.html')) {
  fetchAndDisplayAbilities();
}

// Call fetchAndDisplayMoves() when on the moves.html page
if (window.location.pathname.endsWith('moves.html')) {
  fetchAndDisplayMoves();
}

// Generations Page Functionality
async function fetchAndDisplayGenerations() {
  try {
    const response = await fetch('https://pokeapi.co/api/v2/generation');
    const data = await response.json();
    const generations = data.results;

    generations.forEach(generation => {
      const generationDiv = document.createElement('div');
      generationDiv.classList.add('generation-card'); 

      const generationName = document.createElement('h3');
      generationName.textContent = generation.name;

      generationDiv.appendChild(generationName);

      generationDiv.addEventListener('click', () => {
        fetchPokemonByGeneration(generation.url);
      });

      generationList.appendChild(generationDiv);
    });

  } catch (error) {
    console.error('Error fetching generations:', error);
  }
}

if (window.location.pathname.endsWith('generations.html')) {
  fetchAndDisplayGenerations();
}  

async function fetchPokemonByGeneration(generationUrl) {
  try {
    const response = await fetch(generationUrl);
    const data = await response.json();
    const pokemonSpecies = data.pokemon_species;

    generationPokemon.innerHTML = ''; 

    const pokemonPromises = pokemonSpecies.map(async (species) => {
      const pokemonResponse = await fetch(species.url);
      const pokemonData = await pokemonResponse.json();
      const pokemonDetailsResponse = await fetch(pokemonData.varieties[0].pokemon.url);
      const pokemonDetails = await pokemonDetailsResponse.json();

      const pokemonDiv = document.createElement('div');
      pokemonDiv.classList.add('pokemon-card');

      const pokemonImage = document.createElement('img');
      pokemonImage.src = pokemonDetails.sprites.front_default;
      pokemonImage.alt = species.name;
      pokemonDiv.appendChild(pokemonImage);

      const pokemonName = document.createElement('h3');
      pokemonName.textContent = species.name;
      pokemonDiv.appendChild(pokemonName);

      const pokemonNumber = document.createElement('p');
      pokemonNumber.textContent = `#${pokemonDetails.id}`;
      pokemonDiv.appendChild(pokemonNumber);

      const typesLine = document.createElement('p');
      typesLine.textContent = `Type: ${pokemonDetails.types.map(type => type.type.name).join(', ')}`;
      pokemonDiv.appendChild(typesLine);

      pokemonDetails.stats.forEach(stat => {
        const statLine = document.createElement('p');
        statLine.textContent = `${stat.stat.name}: ${stat.base_stat}`;
        pokemonDiv.appendChild(statLine);
      });

      pokemonDiv.addEventListener('click', () => {
        window.location.href = `details.html?name=${species.name}`;
      });

      return {
        pokemonDiv: pokemonDiv,
        pokemonId: pokemonDetails.id 
      };
    });

    const pokemonDivsWithIds = await Promise.all(pokemonPromises);

    pokemonDivsWithIds.sort((a, b) => a.pokemonId - b.pokemonId);

    pokemonDivsWithIds.forEach(({ pokemonDiv }) => {
      generationPokemon.appendChild(pokemonDiv);
    });

  } catch (error) {
    console.error('Error fetching Pokémon by generation:', error);
  }
}

// Team Builder Functionality
async function fetchPokemonList() {
  try {
    const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=100000'); 
    const data = await response.json();
    availablePokemon = data.results;

    const pokemonPromises = availablePokemon.map(async (pokemon) => {
      const pokemonResponse = await fetch(pokemon.url);
      const pokemonData = await pokemonResponse.json();

      const pokemonDiv = document.createElement('div');
      pokemonDiv.classList.add('pokemon-card', 'draggable');
      pokemonDiv.draggable = true;

      const pokemonName = document.createElement('h3');
      pokemonName.textContent = pokemonData.name;

      const pokemonImage = document.createElement('img');
      pokemonImage.src = pokemonData.sprites.front_default; 
      pokemonImage.alt = pokemonData.name; 

      const pokemonNumber =document.createElement('p');
      pokemonNumber.textContent = `#${pokemonData.id}`; 
      pokemonDiv.appendChild(pokemonNumber);

      const statsContainer = document.createElement('div');
      statsContainer.classList.add('stats-container'); 
      statsContainer.style.display = 'none'; 
      statsContainer.style.opacity = 0; 
      statsContainer.style.transition = 'opacity 0.3s ease'; 

      const typesLine = document.createElement('p');
      typesLine.textContent = `Type: ${pokemonData.types.map(type => type.type.name).join(', ')}`;
      statsContainer.appendChild(typesLine);

      pokemonData.stats.forEach(stat => {
        const statLine = document.createElement('p');
        statLine.textContent = `${stat.stat.name}: ${stat.base_stat}`;
        statsContainer.appendChild(statLine);
      });

      pokemonDiv.appendChild(pokemonImage); 
      pokemonDiv.appendChild(pokemonName);
      pokemonDiv.appendChild(pokemonNumber);
      pokemonDiv.appendChild(statsContainer); 

      pokemonDiv.addEventListener('dragstart', handleDragStart);
      pokemonDiv.addEventListener('click', () => { 
        addPokemonToTeam(pokemonData.name);
      });

      pokemonDiv.addEventListener('mouseover', () => {
        statsContainer.style.display = 'block'; 
        statsContainer.style.opacity = 1; 
      });

      statsContainer.addEventListener('mouseover', (event) => { 
        event.stopPropagation();
        statsContainer.style.display = 'block';
        statsContainer.style.opacity = 1;
      });

      pokemonDiv.addEventListener('mouseout', () => {
        statsContainer.style.opacity = 0; 
        setTimeout(() => { 
          statsContainer.style.display = 'none'; 
        }, 300); 
      });

      pokemonDiv.addEventListener('dragstart', (event) => {
        event.dataTransfer.setData('text/plain', pokemonData.name);
        showTeamBox(); // Show the team box when dragging starts
      });

      return { 
        pokemonData, 
        pokemonDiv 
      }; 
    });

    const pokemonDataAndDivs = await Promise.all(pokemonPromises);

    pokemonDataAndDivs.sort((a, b) => a.pokemonData.id - b.pokemonData.id); 

    pokemonDataAndDivs.forEach(({ pokemonDiv }) => {
      pokemonList.appendChild(pokemonDiv);
    });

  } catch (error) {
    console.error('Error fetching Pokémon list:', error);
  }
}

if (window.location.pathname.endsWith('team-builder.html')) {
    fetchPokemonList();
  }

// Function to add a Pokémon to the team
function addPokemonToTeam(pokemonName) {
    if (team.length < 6 && !team.includes(pokemonName)) {
      team.push(pokemonName);
      updateTeamDisplay();
  
      // Save the team to local storage
      localStorage.setItem('yourTeam', JSON.stringify(team)); 
    }
  }

function handleDragStart(event) {
    event.dataTransfer.setData('text/plain', event.target.firstChild.textContent); // Modified to get Pokemon name
  }

// Function to add a Pokémon to YOUR team
function addPokemonToYourTeam(pokemonName) {
    if (yourTeam.length < 6 && !yourTeam.includes(pokemonName)) {
      yourTeam.push(pokemonName);
      updateYourTeamDisplay();
      localStorage.setItem('yourTeam', JSON.stringify(yourTeam));
    }
  }
  
  // Function to add a Pokémon to the OPPONENT'S team
  function addPokemonToOpponentTeam(pokemonName) {
    if (opponentTeam.length < 6 && !opponentTeam.includes(pokemonName)) {
      opponentTeam.push(pokemonName);
      updateOpponentTeamDisplay();
      localStorage.setItem('opponentTeam', JSON.stringify(opponentTeam));
    }
  }
  
  function removePokemonFromYourTeam(pokemonName) {
    yourTeam = yourTeam.filter(name => name !== pokemonName);
    updateYourTeamDisplay();
    localStorage.setItem('yourTeam', JSON.stringify(yourTeam));
  }
  
  function removePokemonFromOpponentTeam(pokemonName) {
    opponentTeam = opponentTeam.filter(name => name !== pokemonName);
    updateOpponentTeamDisplay();
    localStorage.setItem('opponentTeam', JSON.stringify(opponentTeam));
  }
  
  function updateYourTeamDisplay() {
    yourTeamContainer.innerHTML = '';
    yourTeam.forEach(pokemonName => {
      const pokemonDiv = document.createElement('div');
      pokemonDiv.classList.add('pokemon-card');
      pokemonDiv.textContent = pokemonName;
      pokemonDiv.addEventListener('click', () => {
        removePokemonFromYourTeam(pokemonName);
      });
      yourTeamContainer.appendChild(pokemonDiv);
    });
  }
  
  function updateOpponentTeamDisplay() {
    opponentTeamContainer.innerHTML = '';
    opponentTeam.forEach(pokemonName => {
      const pokemonDiv = document.createElement('div');
      pokemonDiv.classList.add('pokemon-card');
      pokemonDiv.textContent = pokemonName;
      pokemonDiv.addEventListener('click', () => {
        removePokemonFromOpponentTeam(pokemonName);
      });
      opponentTeamContainer.appendChild(pokemonDiv);
    });
  }
  
  // Add event listeners for drag and drop on both team containers
  yourTeamContainer.addEventListener('dragover', handleDragOver);
  yourTeamContainer.addEventListener('drop', handleYourTeamDrop);
  
  opponentTeamContainer.addEventListener('dragover', handleDragOver);
  opponentTeamContainer.addEventListener('drop', handleOpponentTeamDrop);
  
  function handleDragOver(event) {
    event.preventDefault();
  }
  
  // Function to handle drop for YOUR team
  function handleYourTeamDrop(event) {
    event.preventDefault();
    const pokemonName = event.dataTransfer.getData('text/plain');
    addPokemonToYourTeam(pokemonName);
  }
  
  // Function to handle drop for OPPONENT'S team
  function handleOpponentTeamDrop(event) {
    event.preventDefault();
    const pokemonName = event.dataTransfer.getData('text/plain');
    addPokemonToOpponentTeam(pokemonName);
  }
  
  // Function to show the team box
  function showTeamBox() {
    // Check if it's the team builder page
    if (window.location.pathname.endsWith('team-builder.html')) {
      // If it is, highlight the existing team containers
      yourTeamContainer.style.border = "3px solid red";
      opponentTeamContainer.style.border = "3px solid red";
    } else {
      // If it's not, create a temporary team box
      const newTeamBox = document.createElement('div');
      newTeamBox.id = 'temp-team-container';
      newTeamBox.classList.add('team-container');
      newTeamBox.style.position = 'fixed';
      newTeamBox.style.top = '20px';
      newTeamBox.style.right = '20px';
      newTeamBox.style.border = "3px solid red";
      newTeamBox.style.zIndex = '1000';
  
      const teamLabel = document.createElement('h2');
      teamLabel.textContent = "Your Team";
      teamLabel.classList.add('team-label');
      newTeamBox.appendChild(teamLabel);
  
      const teamMembersContainer = document.createElement('div');
      newTeamBox.appendChild(teamMembersContainer);
  
      newTeamBox.addEventListener('dragover', handleDragOver);
      newTeamBox.addEventListener('drop', (event) => {
        event.preventDefault();
        const pokemonName = event.dataTransfer.getData('text/plain');
        addPokemonToTeam(pokemonName);
  
        const caughtMessage = document.createElement('p');
        caughtMessage.textContent = `${pokemonName} was caught!`;
        caughtMessage.style.color = 'green';
        newTeamBox.appendChild(caughtMessage);
  
        setTimeout(() => {
          newTeamBox.remove();
        }, 1500);
      });
  
      document.body.appendChild(newTeamBox);
    }
  }
  
  // Modify the "Go to Battle!" button functionality
  startBattleButton.addEventListener('click', () => {
    // Redirect to the battle simulator page
    window.location.href = 'battle.html'; 
  });

// Battle Simulator Functionality

async function loadTeams() {
    try {
      // Try to load teams from local storage
      let storedYourTeam = localStorage.getItem('yourTeam');
  
      if (storedYourTeam) {
        storedYourTeam = JSON.parse(storedYourTeam); // Parse the stored team
  
        // Fetch full data for each Pokémon in the stored team
        const yourTeamPromises = storedYourTeam.map(pokemonName => fetchPokemonData(pokemonName));
        yourTeam = await Promise.all(yourTeamPromises);
      } else {
      const pikachuData = await fetchPokemonData('pikachu');
      yourTeam = [pikachuData];
    }

    if (storedOpponentTeam) {
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

function displayTeams(team, container) {
  container.innerHTML = '';

  team.forEach(pokemon => {
    const pokemonDiv = document.createElement('div');
    pokemonDiv.classList.add('pokemon-card');

    const pokemonName = document.createElement('h3');
    pokemonName.textContent = pokemon.name;
    pokemonDiv.appendChild(pokemonName);

    const pokemonImage = document.createElement('img');
    pokemonImage.src = pokemon.sprites.front_default; 
    pokemonImage.alt = pokemon.name;
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
  
        // Display search results
        resultsContainer.innerHTML = '';
        const pokemonDiv = document.createElement('div');
        pokemonDiv.classList.add('pokemon-card');
        pokemonDiv.textContent = data.name;
  
        pokemonDiv.addEventListener('click', async () => {
          const pokemonData = await fetchPokemonData(data.name);
          team.push(pokemonData);
  
          // Update the correct team container
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
  
    // Display current Pokémon with HP
    displayCurrentPokemon(yourCurrentPokemon, opponentCurrentPokemon);
  
    while (yourTeam.length > 0 && opponentTeam.length > 0) {
      // Your move selection (interactive)
      const yourMove = await getYourMove(yourCurrentPokemon);
  
      // Opponent's move selection (AI)
      const opponentMove = await getOpponentMove(opponentCurrentPokemon, yourCurrentPokemon); // Use the AI-enhanced function
  
      // Determine who goes first based on move priority
      const yourMoveData = yourCurrentPokemon.moves.find(move => move.name === yourMove);
      const opponentMoveData = opponentCurrentPokemon.moves.find(move => move.name === opponentMove);
  
      if (yourMoveData.priority > opponentMoveData.priority) {
        // Your Pokémon goes first
        await simulateTurn(yourCurrentPokemon, opponentCurrentPokemon, yourMoveData, opponentMoveData);
        if (opponentCurrentPokemon.stats.hp > 0) {
          await simulateTurn(opponentCurrentPokemon, yourCurrentPokemon, opponentMoveData, yourMoveData);
        }
      } else if (yourMoveData.priority < opponentMoveData.priority) {
        // Opponent's Pokémon goes first
        await simulateTurn(opponentCurrentPokemon, yourCurrentPokemon, opponentMoveData, yourMoveData);
        if (yourCurrentPokemon.stats.hp > 0) {
          await simulateTurn(yourCurrentPokemon, opponentCurrentPokemon, yourMoveData, opponentMoveData);
        }
      } else {
        // Execute moves simultaneously if priority is the same
        await simulateTurn(yourCurrentPokemon, opponentCurrentPokemon, yourMoveData, opponentMoveData);
        await simulateTurn(opponentCurrentPokemon, yourCurrentPokemon, opponentMoveData, yourMoveData);
      }
  
      // Check for fainted Pokémon
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
  
      // Update displayed Pokémon after each turn
      displayCurrentPokemon(yourCurrentPokemon, opponentCurrentPokemon);
  
      // Add a delay for better visualization (optional)
      await new Promise(resolve => setTimeout(resolve, 1000)); 
    }
  
    // Determine the winner
    if (yourTeam.length > 0) {
      battleLog.innerHTML += "You win!<br>";
    } else {
      battleLog.innerHTML += "Opponent wins!<br>";
    }
  }

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

async function getOpponentMove(opponentPokemon, yourPokemon) {
for (const move of opponentPokemon.moves) {
  const effectiveness = await calculateTypeEffectiveness(move.type, yourPokemon.types);
  if (effectiveness > 1) { 
    return move.name;
  }
}

let highestPowerMove = opponentPokemon.moves[0];
for (const move of opponentPokemon.moves) {
  if (move.power > highestPowerMove.power) {
    highestPowerMove = move;
  }
}
if (highestPowerMove.power > 50) {
  return highestPowerMove.name;
}

const randomIndex = Math.floor(Math.random() * opponentPokemon.moves.length);
return opponentPokemon.moves[randomIndex].name;
}

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

async function simulateTurn(yourPokemon, opponentPokemon, yourMove, opponentMove) {
const yourDamage = await calculateDamage(yourPokemon, opponentPokemon, yourMove, opponentMove);
const opponentDamage = await calculateDamage(opponentPokemon, yourPokemon, opponentMove, yourMove);

opponentPokemon.stats.hp -= yourDamage;
yourPokemon.stats.hp -= opponentDamage;

battleLog.innerHTML += `${yourPokemon.name} used ${yourMove.name}! (Damage: ${yourDamage})<br>`;
battleLog.innerHTML += `${opponentPokemon.name} used ${opponentMove.name}! (Damage: ${opponentDamage})<br>`;
}

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

