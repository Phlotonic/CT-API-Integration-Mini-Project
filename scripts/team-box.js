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
