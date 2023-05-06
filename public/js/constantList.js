const categories = [
  "Membership Gym",
  "24 hour access gym",
  "CrossFit",
  "Boot Camps",
  "Training gyms",
];

const states = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia",
  "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland",
  "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey",
  "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina",
  "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"
];

function populateCategoriesSelect(selectElementId, selectedCategory) {
  const selectElement = document.getElementById(selectElementId);

  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;

    if (category === selectedCategory) {
      option.selected = true;
    }

    selectElement.appendChild(option);
  });
}

function populateStatesSelect(selectElementId, selectedState) {
  const selectElement = document.getElementById(selectElementId);

  states.forEach(state => {
    const option = document.createElement('option');
    option.value = state;
    option.textContent = state;

    if (state === selectedState) {
      option.selected = true;
    }

    selectElement.appendChild(option);
  });
}

function populateStateSelect(selectElementId) {
  const selectElement = document.getElementById(selectElementId);

  states.forEach(state => {
    const option = document.createElement('option');
    option.value = state;
    option.textContent = state;

    selectElement.appendChild(option);
  });
}