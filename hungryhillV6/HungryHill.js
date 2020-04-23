$(document).ready(function() {
  $("#myCarousel").on("slide.bs.carousel", function(e) {
    var $e = $(e.relatedTarget);
    var idx = $e.index();
    var itemsPerSlide = 3;
    var totalItems = $(".carousel-item").length;

    if (idx >= totalItems - (itemsPerSlide - 1)) {
      var it = itemsPerSlide - (totalItems - idx);
      for (var i = 0; i < it; i++) {
        // append slides to end
        if (e.direction == "left") {
          $(".carousel-item")
            .eq(i)
            .appendTo(".carousel-inner");
        } else {
          $(".carousel-item")
            .eq(0)
            .appendTo($(this).find(".carousel-inner"));
        }
      }
    }
  });
});

//TODO: split and integrate data
var cards = [
  {"id": "0", "title": "Whole Roasted Cauliflower with Smoked Paprika", "desc": "3/4 cup milk, 2 tablespoons white vinegar", "note": "note", "img_src": "https://images.media-allrecipes.com/userphotos/600x600/7745330.jpg", "img_alt": "Card image 0"},
  {"id": "1", "title": "Air Fryer Chicken Taquitos", "desc": "1 teaspoon vegetable oil,2 tablespoons diced onion,1 clove garlic minced,2 tablespoons chopped green chiles (such as Ortega®),2 tablespoons Mexican-style hot tomato sauce (such as El Pato®),1 cup shredded rotisserie chicken,2 tablespoons Neufchatel cheese,1/2 cup shredded Mexican cheese blend,salt and ground black pepper to taste,6 corn tortillas,avocado oil cooking spray", "note": "note", "img_src": "https://images.media-allrecipes.com/userphotos/600x600/7774033.jpg", "img_alt": "Card image 1"},
  {"id": "2", "title": "Easy Peanut Butter Energy Balls", "desc": "2 cups rolled oats,1 cup peanut butter,1 cup crushed walnuts (optional),1/2 cup semisweet chocolate chips,1/4 cup honey, or more as needed", "note": "note", "img_src": "https://images.media-allrecipes.com/userphotos/600x600/7823065.jpg", "img_alt": "Card image 2"}
]


var userInputCounter = 3;
var counter = 0;
var checkout = [];

window.onload = function() {

  document.addEventListener('swiped-left', function(e) {
      console.log(e.type);
      populateRecipe(prev_id);
  });

  document.addEventListener('swiped-right', function(e) {
      console.log(e.type);
      addToCart(current_id);
      populateRecipe(next_id);
  });

  document.addEventListener('swiped-up', function(e) {
      console.log(e.type);
  });

  document.addEventListener('swiped-down', function(e) {
      console.log(e.type);
  });

}

var isInfoVisible = false;

function populateRecipe(id) {
  current_id = id;
  isInfoVisible = false;
  document.getElementById("info").style.visibility = 'hidden';
  document.getElementById("card_img").src = cards[id].img_src;
  document.getElementById("card_img").alt = cards[id].img_alt;
  document.getElementById("card_img").onclick = function() {ToggleRecipe(id)};;
  document.getElementById("title").innerHTML = cards[id].title;
  var ingredients = cards[id].desc.split(",");
  var desc = "<ul align='left'>";
  for (var i=0; i < ingredients.length; i++) {
    desc += "<li>" + ingredients[i] + "</li>";
  }
  desc += "</ul>";
  document.getElementById("desc").innerHTML = desc;

  prev_id = id - 1;
  next_id = id + 1;
  if (prev_id < 0) {
    prev_id = cards.length - 1;
  }
  if (next_id >= cards.length) {
    next_id = 0;
  }
  document.getElementById("prev").onclick = function() {populateRecipe(prev_id)};
  document.getElementById("next").onclick = function() {addToCart(id); populateRecipe(next_id)};
}

//TODO:
function addToCart(id) {
  counter++;
  checkout.push(id);
  console.log("addToCart id=" + id);
  if (counter == userInputCounter) {
    console.log(checkout);
  }
}

//TODO:
function removeCart(id) {
  console.log("removeCart id=" + id);
}


function ToggleRecipe() {
  if (isInfoVisible) {
    document.getElementById("info").style.visibility= 'hidden';
    isInfoVisible = false;
  } else {
    document.getElementById("info").style.visibility = 'visible';
    isInfoVisible = true;
  }
}


var current_id = 0;
var prev_id = cards.length - 1;
var next_id = 1;
populateRecipe(0);