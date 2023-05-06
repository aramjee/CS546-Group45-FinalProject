document.querySelectorAll(".filter-option").forEach(checkbox => {
  checkbox.addEventListener("click", filterGyms);
});
function getAllGymsFromDom() {
  let gymList = document.querySelector(".gymList");
  let gymElements = gymList.querySelectorAll(".col");
  let gyms = [];

  for (let gymElement of gymElements) {
    let link = gymElement.querySelector("a.card-link");

    let gymId = link.getAttribute("href").split("/gym/")[1];
    let gymName = gymElement.querySelector(".card-title").textContent;
    let category = gymElement.querySelector(".badge").textContent;
    let rating = parseFloat(gymElement.querySelector("small").textContent);
    let reviewsCount = gymElement.querySelector(".reviews-count");

    gyms.push({
      _id: gymId,
      gymName: gymName,
      category: category,
      rating: rating,
      reviewsCount: reviewsCount
    });

  }

  return gyms;
}

//Saving all gyms when page loads to maintain all gyms in an array.
let allGymsList = getAllGymsFromDom();

function sortRatingHighToLow() {
  let gyms = getAllGymsFromDom();
  gyms.sort((a, b) => b.rating - a.rating);
  updateGymsList(gyms);
}

function sortRatingLowToHigh() {
  let gyms = getAllGymsFromDom();
  gyms.sort((a, b) => a.rating - b.rating);
  updateGymsList(gyms);
}

function updateGymsList(gyms) {
  let gymList = document.querySelector(".gymList");
  gymList.innerHTML = ""; // Clear the current gym list

  // Append the sorted gym elements to the gym list
  for (let gym of gyms) {
    let gymElement = createGymElement(gym);
    gymList.appendChild(gymElement);
  }
}

function createGymElement(gym) {
  let col = document.createElement("div");
  col.className = "col";

  let a = document.createElement("a");
  a.href = `/gym/${gym._id}`;
  a.className = "card-link";

  let card = document.createElement("div");
  card.className = "card shadow-sm";

  let cardBody = document.createElement("div");
  cardBody.className = "card-body";

  let cardTitle = document.createElement("span");
  cardTitle.className = "card-title";
  cardTitle.textContent = gym.gymName;

  let categoryBadge = document.createElement("span");
  categoryBadge.className = "badge rounded-pill text-bg-secondary";
  categoryBadge.textContent = gym.category;

  let ratingWrapper = document.createElement("div");
  ratingWrapper.className = "d-flex justify-content-between align-items-center";

  let categoryDiv = document.createElement("div");
  categoryDiv.appendChild(categoryBadge);

  let ratingDiv = document.createElement("div");

  let small = document.createElement("small");
  small.className = "text-body-secondary";
  small.textContent = gym.rating + " ";

  ratingDiv.appendChild(small);
  let starRatingHTML = generateStarRating(gym.rating);

  let ratingSpan = document.createElement("span");
  ratingSpan.innerHTML = starRatingHTML + " ";
  ratingDiv.appendChild(small);
  ratingDiv.appendChild(ratingSpan);
  ratingDiv.appendChild(gym.reviewsCount);


  ratingWrapper.appendChild(categoryDiv);
  ratingWrapper.appendChild(ratingDiv);

  cardBody.appendChild(cardTitle);
  cardBody.appendChild(ratingWrapper);
  card.appendChild(cardBody);
  a.appendChild(card);
  col.appendChild(a);

  return col;
}

function generateStarRating(rating) {
  let starHTML = "";
  for (let i = 1; i <= 5; i++) {
    if (i <= rating) {
      starHTML += '<span class="fa fa-star checked"></span>';
    } else {
      starHTML += '<span class="fa fa-star"></span>';
    }
  }
  return starHTML;
}

function filterGyms() {
  let checkboxes = document.getElementsByClassName("filter-option");
  let selectedOptions = [];

  for (let checkbox of checkboxes) {
    if (checkbox.checked) {
      selectedOptions.push(checkbox.value);
    }
  }

  let filteredGyms = allGymsList.filter(gym => {
    return selectedOptions.includes(gym.category);
  });

  //Showing no results message when there are no filtered gyms
  if(filteredGyms.length === 0){
    $("#no-results").removeClass("hidden");
  }else if(!$("#no-results").hasClass("hidden")){
    $("#no-results").addClass("hidden");
  }

  updateGymsList(filteredGyms);
}
