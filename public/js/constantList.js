const categories = [
  "Membership Gym",
  "24 hour access gym",
  "CrossFit",
  "Boot Camps",
  "Training gyms",
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