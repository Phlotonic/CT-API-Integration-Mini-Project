// Abilities Page Functionality

const abilityList = document.getElementById('ability-list');

// Call fetchAndDisplayAbilities when the page loads
if (abilityList) {
  fetchAndDisplayAbilities();
}

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
