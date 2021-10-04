// get grid info from main page
var board_size = window.location.search.slice(window.location.search.indexOf("size") + 5, window.location.search.indexOf("&"));
console.log(board_size)
var board_col = parseInt(board_size[0]);
var board_row = parseInt(board_size[board_size.length-1]);
card_size = 100 / (Math.max(board_col, board_row) + 1);
var num_of_images_pairs = board_row * board_col / 2;

// decide on grid size units according to screen dimensions.
function determine_grid_size() {
    var unit = "vw"
    if ($(window).height() < $(window).width()) {
        unit = "vh"
    }
    document.getElementById("cards-container").style.gridTemplateColumns = 'repeat(' + board_col + ', ' + card_size + unit + ')';
    document.getElementById("cards-container").style.gridTemplateRows = 'repeat(' + board_row + ', ' + card_size + unit + ')';
}

// on window resize, adjust the grid units to avoid major overflow.
$(window).resize(function() {
    determine_grid_size()
})


// Randomize array in-place
// for creating a shuffled images list.
function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array
}

function toTimeString(milliseconds) {
  return (new Date(milliseconds)).toUTCString().match(/(\d\d:\d\d:\d\d)/)[0].slice(3);
}

function setUpGame() {
    imgs = imgs.concat(imgs)
    imgs = shuffleArray(imgs)
    determine_grid_size()
    set_game_board()
    update_pairs_cnt()
    activate_timer()
}


// if user chose default images, use them. if a theme was specified, run a google search.
if (window.location.search.indexOf("def") > 0) {
    var imgs = ["cards/apple.jpg", "cards/bear.jpg", "cards/birds.jpg", "cards/blue.jpg", "cards/cake.jpg", "cards/cat.jpg",
     "cards/cheese.jpg", "cards/coffee.jpg", "cards/dog.jpg", "cards/download.jpg", "cards/flower.jpg", "cards/heart.jpg",
      "cards/img1.jpg", "cards/jaffa.jpg", "cards/leaf.jpg", "cards/road.jpg", "cards/veggie.jpg", "cards/whiteflower.jpg"]
    imgs = shuffleArray(imgs).slice(0,num_of_images_pairs)
    setUpGame()

} else {
    // search images from google via serpapi
    var imgs = [];
    var theme = window.location.search.slice(window.location.search.indexOf("theme") + 6);
    console.log(theme)
    const http_req = new XMLHttpRequest();
    const url='https://serpapi.com/search.json?q=' + theme + '&tbm=isch&ijn=0&api_key=83c99a1203b16f1cf30a07b40de0ab453bd7562718202cf6fb3af4aee6cc0346';
    http_req.open("GET", url);
    http_req.send();

    // when request is back, create the board and start the game.
    http_req.onreadystatechange = function get_imgs() {
        if (this.readyState == 4 && this.status == 200) {
            var images_res = JSON.parse(this.responseText).images_results;
            for (i = 0; i < num_of_images_pairs; i++) {
                imgs[i] = images_res[i].thumbnail;
            }

            setUpGame()

            // pre-cache images, to avoid loading time when a card is clicked for the 1st time.
            for (i = 0; i < imgs.length; i++) {
                new Image().src = imgs[i];
            }
        }
    };
}


function update_pairs_cnt() {
    document.getElementById("pairs_cnt").textContent = "Pairs: " + parseInt(document.querySelectorAll(".hidden").length)/2 + "/" + num_of_images_pairs
}

// timer display
var time_passed, timer
function activate_timer() {
    var init_time =  new Date().getTime();
    timer = setInterval(function() {
      time_passed = new Date().getTime() - init_time;
      document.getElementById("time").textContent  = "Time: " + toTimeString(time_passed);
    }, 1000);
}



// create & display all cards on screen, faced down
function set_game_board() {
    var cards_cont = document.getElementById("cards-container")
    for (let i = 0; i < num_of_images_pairs*2; i++) {
        
        var div_par = document.createElement('div'); // div holder for card front & back
        div_par.className = "card-par";
        cards_cont.appendChild(div_par)

        var img = document.createElement('img');
        img.className = "card-front";
        img.src = imgs[i];
        div_par.appendChild(img)    

        var div = document.createElement('div');
        div.className = "card-back";
        div_par.appendChild(div) 
    }
}

// display a card when clicked on, faced up
$("#cards-container").on("click", ".card-par", function() {
    $(this).addClass("up");
    var up_cards = document.querySelectorAll(".up");
    if (up_cards.length == 2) {
        setTimeout(checkPair(up_cards), 1000);
    }
})


// check if 2 cards are a match
function checkPair(up_cards) {
    return function() {
        // if the cards are a pair, hide the cards, and update the pairs count on screen.
        if (up_cards[0].childNodes[0].src == up_cards[1].childNodes[0].src) {
            up_cards[0].className = "hidden";
            up_cards[1].className = "hidden";
            update_pairs_cnt()     
        } else {
            // if not a pair, flip the cards back down.
            up_cards[0].classList.remove("up");
            up_cards[1].classList.remove("up");
        }

    // if all cards are paired, display "win" message
    if (document.querySelectorAll(".hidden").length == imgs.length) {
        document.getElementById("win-message").style.display = "block";
        var end_time = new Date().getTime()
        clearInterval(timer);
        document.getElementById("time-message").textContent += toTimeString(time_passed) + "!";
        }
    }
}
