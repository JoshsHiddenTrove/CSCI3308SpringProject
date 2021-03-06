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

var cards = [
  {"id": "0", "title": "Card 0", "desc": "This is a longer card with supporting text below as a natural lead-in to additional content. This content is a little bit longer.", "note": "note", "img_src": "http://placehold.it/800x600/42ebf4/fff", "img_alt": "Card image 0"},
  {"id": "1", "title": "Card 1", "desc": "This is a longer card with supporting text below as a natural lead-in to additional content. This content is a little bit longer.", "note": "note", "img_src": "http://placehold.it/800x600/f44242/fff", "img_alt": "Card image 1"},
  {"id": "2", "title": "Card 2", "desc": "This is a longer card with supporting text below as a natural lead-in to additional content. This content is a little bit longer.", "note": "note", "img_src": "http://placehold.it/800x600/3ed846/fff", "img_alt": "Card image 2"}
]

var userInputCounter = 3;
var counter = 0;
var checkout = [];

window.onload = function() {

  document.addEventListener('swiped-left', function(e) {
      console.log(e.type);
      populateCard(prev_id);
  });

  document.addEventListener('swiped-right', function(e) {
      console.log(e.type);
      addToCart(current_id);
      populateCard(next_id);
  });

  document.addEventListener('swiped-up', function(e) {
      console.log(e.type);
  });

  document.addEventListener('swiped-down', function(e) {
      console.log(e.type);
  });

}

var isInfoVisible = false;

function populateCard(id) {
  current_id = id;
  isInfoVisible = false;
  document.getElementById("info").style.visibility = 'hidden';
  document.getElementById("card_img").src = cards[id].img_src;
  document.getElementById("card_img").alt = cards[id].img_alt;
  document.getElementById("card_img").onclick = function() {displayInfo(id)};;
  document.getElementById("title").innerHTML = cards[id].title;
  document.getElementById("desc").innerHTML = cards[id].desc;
  document.getElementById("note").innerHTML = cards[id].note;
  document.getElementById("btnAddToCart").onclick = function() {addToCart(id)};
  prev_id = id - 1;
  next_id = id + 1;
  if (prev_id < 0) {
    prev_id = cards.length - 1;
  }
  if (next_id >= cards.length) {
    next_id = 0;
  }
  document.getElementById("prev").onclick = function() {populateCard(prev_id)};
  document.getElementById("next").onclick = function() {addToCart(id); populateCard(next_id)};
}

function addToCart(id) {
  counter++;
  checkout.push(id);
  console.log("addToCart id=" + id);
  if (counter == userInputCounter) {
    console.log(checkout);
  }
}


function removeCart(id) {
  console.log("removeCart id=" + id);
}


function displayInfo() {
  if (isInfoVisible) {
    document.getElementById("info").style.visibility = 'hidden';
    isInfoVisible = false;
  } else {
    document.getElementById("info").style.visibility = 'visible';
    isInfoVisible = true;
  }
}

document.getElementById('btnSubmit').onclick = function() {userSubmit();};

function userSubmit() {
  userInputCounter = document.getElementById('userInput').value;
  console.log(userInputCounter);
}



$("#myModal").modal('show');

var current_id = 0;
var prev_id = cards.length - 1;
var next_id = 1;
populateCard(0);