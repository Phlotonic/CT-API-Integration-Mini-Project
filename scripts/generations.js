// Generations Page Functionality

const generationList = document.getElementById('generation-list');
const generationPokemon = document.getElementById('generation-pokemon');

// Call fetchAndDisplayGenerations only once when the page loads
if (window.location.pathname.endsWith('generations.html')) {
  fetchAndDisplayGenerations();
} 

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