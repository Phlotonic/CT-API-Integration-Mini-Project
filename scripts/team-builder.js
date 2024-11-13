// Team Builder elements
const yourTeamContainer = document.getElementById('your-team-container');
const opponentTeamContainer = document.getElementById('opponent-team-container');
const startBattleButton = document.getElementById('start-battle');
const pokemonList = document.getElementById('pokemon-list');

let availablePokemon = [];
let yourTeam = [];
let opponentTeam = [];

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

      const pokemonNumber   
 = document.createElement('p');
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
        addPokemonToYourTeam(pokemonData.name); // Corrected function call
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
        showTeamBox();
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

    // Add event listeners for drag and drop on the pokemonList
    pokemonList.addEventListener('dragover', handleDragOver);
    pokemonList.addEventListener('drop', handlePokemonListDrop);

  } catch (error) {
    console.error('Error fetching Pokémon list:', error);
  }
}

if (window.location.pathname.endsWith('team-builder.html')) {
  fetchPokemonList();
}

function handleDragStart(event) {
  event.dataTransfer.setData('text/plain', event.target.firstChild.textContent);
}

// Function to add a Pokémon to the team (this function is used for the temporary team box)
function addPokemonToTeam(pokemonName) {
  if (team.length < 6 && !team.includes(pokemonName)) {
    team.push(pokemonName);
    // No need to update the display here, as it's handled in the drop event listener

    // Save the team to local storage
    localStorage.setItem('yourTeam', JSON.stringify(team)); 
  }
}

// Function to add a Pokémon to YOUR team
function addPokemonToYourTeam(pokemonName) {
  if (yourTeam.length < 6 && !yourTeam.includes(pokemonName)) {
    yourTeam.push(pokemonName);
    updateYourTeamDisplay();

    // Save the team to local storage
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
  const teamPromises = yourTeam.map(async (pokemonName) => {
    const pokemonResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);
    const pokemonData = await pokemonResponse.json();   


    const pokemonDiv = document.createElement('div');
    pokemonDiv.classList.add('pokemon-card');

    const pokemonNameElement = document.createElement('h3');
    pokemonNameElement.textContent = pokemonData.name;

    const pokemonImage = document.createElement('img');
    pokemonImage.src = pokemonData.sprites.front_default;
    pokemonImage.alt = pokemonData.name;   


    pokemonDiv.appendChild(pokemonImage);
    pokemonDiv.appendChild(pokemonNameElement);

    pokemonDiv.addEventListener('click', () => {
      removePokemonFromYourTeam(pokemonName);
    });

    yourTeamContainer.appendChild(pokemonDiv);
  });

  Promise.all(teamPromises);
}

function updateOpponentTeamDisplay() {
  opponentTeamContainer.innerHTML = '';
  const teamPromises = opponentTeam.map(async (pokemonName) => {
    const pokemonResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);
    const pokemonData = await pokemonResponse.json();   


    const pokemonDiv = document.createElement('div');
    pokemonDiv.classList.add('pokemon-card');

    const pokemonNameElement = document.createElement('h3');
    pokemonNameElement.textContent = pokemonData.name;

    const pokemonImage = document.createElement('img');
    pokemonImage.src = pokemonData.sprites.front_default;
    pokemonImage.alt = pokemonData.name;   


    pokemonDiv.appendChild(pokemonImage);
    pokemonDiv.appendChild(pokemonNameElement);

    pokemonDiv.addEventListener('click', () => {
      removePokemonFromOpponentTeam(pokemonName);
    });

    opponentTeamContainer.appendChild(pokemonDiv);
  });

  Promise.all(teamPromises);
}

// Add event listeners for drag and drop on both team containers
yourTeamContainer.addEventListener('dragover', handleDragOver);
yourTeamContainer.addEventListener('drop', handleYourTeamDrop);

opponentTeamContainer.addEventListener('dragover', handleDragOver);
opponentTeamContainer.addEventListener('drop', handleOpponentTeamDrop);

function handleDragOver(event) {
  event.preventDefault();
}

function handleYourTeamDrop(event) {
  event.preventDefault();
  const pokemonName = event.dataTransfer.getData('text/plain');
  addPokemonToYourTeam(pokemonName);
}

function handleOpponentTeamDrop(event) {
  event.preventDefault();
  const pokemonName = event.dataTransfer.getData('text/plain');
  addPokemonToOpponentTeam(pokemonName);
}

// Function to handle drop for the temporary team box (on other pages)
function handlePokemonListDrop(event) {
  event.preventDefault();
  const pokemonName = event.dataTransfer.getData('text/plain');
  addPokemonToTeam(pokemonName); // This should be addPokemonToYourTeam

  // Display the "caught" message in the temporary team box
  const caughtMessage = document.createElement('p');
  caughtMessage.textContent = `${pokemonName} was caught!`;
  caughtMessage.style.color = 'green';
  const tempTeamContainer = document.getElementById('temp-team-container');
  if (tempTeamContainer) {
    tempTeamContainer.appendChild(caughtMessage);
  }
}

function showTeamBox() {
  if (window.location.pathname.endsWith('team-builder.html')) {
    yourTeamContainer.style.border = "3px solid red";
    opponentTeamContainer.style.border = "3px solid red";
  } else {
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
    
        newTeamBox.addEventListener('drop', (event) => {
          event.preventDefault();
          const pokemonName = event.dataTransfer.getData('text/plain');
          addPokemonToYourTeam(pokemonName);
    
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
  