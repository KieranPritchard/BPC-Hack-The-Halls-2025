// Function to open instructions
function openInstructions() {
        // Gets the modal element and removes hidden from the list
        document.getElementById("modal").classList.remove("hidden");
        // adds the class to start entry animation
        document.querySelector('#modal > div').classList.add('animate__zoomIn');
        // adds the class to start remove animation
        document.querySelector('#modal > div').classList.remove('animate__zoomOut');
    }

// Closes the instructions
function closeInstructions() {
    // gets the model content
    const modalContent = document.querySelector('#modal > div');
    // adds the class to start entry animation
    modalContent.classList.remove('animate__zoomIn');
    // adds the class to start remove animation
    modalContent.classList.add('animate__zoomOut');

    // Hide modal after animation completes
    setTimeout(() => {
        // Gets the modal id and hides it
        document.getElementById("modal").classList.add("hidden");
        // adds the class to start remove animation
        modalContent.classList.remove('animate__zoomOut');
    }, 500); // 500ms matches Animate.css duration
}

/* ------------------------------------
      UNO GAME LOGIC
------------------------------------- */
// --- Cooldown setup ---
let actionCooldown = false;
const COOLDOWN_TIME = 1500; // milliseconds

// --- Player places a card ---
function playerPlaceCard(cardIndex) {
    if (actionCooldown) return; // ignore spamming

    const card = playerHand[cardIndex];

    // Check if the card can be played (your existing logic)
    if (!canPlayCard(card)) return;

    // Place the card on the pile
    placeCard(cardIndex);

    // Play sound if needed
    if (card.type === "PLUS2") {
        playSound("PLUS2.mp3");
    } else if (card.type === "PLUS4") {
        playSound("PLUS4.mp3");
    }

    // Activate cooldown
    activateCooldown();
}

// --- Player draws a card ---
function playerDrawCard() {
    if (actionCooldown) return; // ignore spamming

    drawCard(); // your existing draw logic

    // Activate cooldown
    activateCooldown();
}

// --- Cooldown helper function ---
function activateCooldown() {
    if (actionCooldown) return; // extra safety
    actionCooldown = true;      // LOCK IMMEDIATELY
    updateUI();

    setTimeout(() => {
        actionCooldown = false;
        updateUI();
    }, COOLDOWN_TIME);
}
function endPlayerCooldown() {
    actionCooldown = false;
    updateUI();
}
// --- Optional UI feedback ---
function updateUI() {
    const cards = document.querySelectorAll('.card-img');
    const drawBtn = document.getElementById('drawBtn');

    cards.forEach(card => {
        card.style.pointerEvents = actionCooldown ? "none" : "auto";
        card.style.opacity = actionCooldown ? "0.6" : "1";
    });

    drawBtn.disabled = actionCooldown;
}

// Defines the core types of cards
const COLORS = ["red", "green", "blue", "yellow"]; // Stores the colours used in the program
const NUMBER_VALUES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]; // Stores the numbers of main cards
const ACTION_VALUES = ["+2", "miss", "wild", "+4"];  // Stores the original action values for the game

// --- NEW PRESENT CARD CONSTANTS ---
const SNOWBALL_VALUE = "snowball"; // Stores the value of the snowball
const PRESENT_VALUE = "present";  // Stores the present value of the game
// --- UPDATED WILD VALUES TO INCLUDE SNOWBALL AND PRESENT ---
const WILD_VALUES = ["wild", "+4", SNOWBALL_VALUE, PRESENT_VALUE]; // Stores all the wildcards values

const CARD_BACK_IMAGE_PATH = "cards/card_back.png"; // Gets the card back image  

// Stores the current deck
let deck = [];
// Stores the player hand (Single Player Mode)
let playerHand = [];
// Stores the computer hand (Single Player Mode)
let computerHand = [];
// stores the current top card
let topCard = null;

// --- STATE VARIABLES (Single Player Mode) ---

// Flags for if the special cards are active
let plusTwoActive = false; 
let skipActive = false;
let snowballActive = false;
let presentActive = false;
// tracks if the game is over
let gameOver = false;
// tracks the next card in the deck
let pendingPlayIndex = -1; 
// Tracks the current colours
let currentColor = null;

/* ------------------------------------
      🎵 AUDIO HELPER FUNCTIONS 🎵
------------------------------------- */

// function that plays the start sound
function playStartSound() { 
    // Gets the audio element of the start sound
    document.getElementById("start-sound").play().catch(e => console.error("Start sound failed:", e)); 
}
// function that plays the play card sound
function playCardSound() { 
    // Gets the audio element of the play card sound
    document.getElementById("play-card-sound").play().catch(e => console.error("Play card sound failed:", e)); 
}
// function that plays the draw card sound
function playDrawSound() { 
    // Gets the audio element of the draw card sound
    document.getElementById("draw-card-sound").play().catch(e => console.error("Draw card failed:", e)); 
}
// function that plays the plus two card sound
function playPlusTwoSound() { 
    // Gets the audio element of the plus two card sound
    document.getElementById("plus-two-sound").play().catch(e => console.error("Plus two sound failed:", e)); 
}
// function that plays the plus four card sound
function playPlusFourSound() { 
    // Gets the audio element of the plus four card sound
    document.getElementById("plus-four-sound").play().catch(e => console.error("Plus four sound failed:", e)); 
}
// function that plays the wild card sound
function playWildSound() { 
    // Gets the audio element of the wild card sound
    document.getElementById("wild-sound").play().catch(e => console.error("Wild sound failed:", e)); 
}
// function that plays the win sound
function playWinSound() { 
    // Gets the audio element of the win sound
    document.getElementById("win-sound").play().catch(e => console.error("Win sound failed:", e)); 
}
// function that plays the loose sound
function playLoseSound() { 
    // Gets the audio element of the lose sound
    document.getElementById("lose-sound").play().catch(e => console.error("Lose sound failed:", e)); 
}


/* -------------------------------------
  Generate Deck Function
------------------------------------- */

function generateDeck() {
  // Stores the deck of cards which will be generated
  deck = [];
  
  // Loops through each of the colours in the colours list
  COLORS.forEach(color => {
    // Loops through the number values
    NUMBER_VALUES.forEach(value => {
      // gets the filename from the colour and the value in the current iteration
      const fileName = `${color}_${value}.png`;
      // Uses the filename variable to get the image path
      const imagePath = `cards/${fileName}`;
      // Stores the card as a dictionary
      const card = { color, value: value.toString(), image: imagePath, type: 'number' };
      // Adds the card to the deck
      deck.push(card); 
      // Checks if the card value is not zero
      if (value !== 0) {
        // Pushs the card to the deck
        deck.push(card); 
      }
    });

    // Loops over the action values and filters out the non wild card values
    ACTION_VALUES.filter(v => !WILD_VALUES.includes(v)).forEach(value => {
      // gets the filename from the colour and the value in the current iteration
      const fileName = `${color}_${value}.png`;
      // Uses the filename variable to get the image path
      const imagePath = `cards/${fileName}`;
      // Stores the card as a dictionary
      const card = { color, value, image: imagePath, type: 'action' };
      // Pushes the cards to the deck
      deck.push(card); 
      deck.push(card); 
    });
  });

  // Loops over the wild values
  WILD_VALUES.forEach(value => {
    // initalises the file name as an empty array  
    let fileName = "";
      // Checks if the value is 'wild'
      if (value === "wild") {
          // Sets the file name to wildcard_1.png
          fileName = "wildcard_1.png";
      // Checks if the value is +4
      } else if (value === "+4") {
          // sets the file name to the plus four file name
          fileName = "card_+4_1.png";
      // Checks if the value is the snow ball value
      } else if (value === SNOWBALL_VALUE) {
          // Sets the file path to be the snowball card path
          fileName = "snowball_card_1.png"; 
      // Checks if the card is the present value
      } else if (value === PRESENT_VALUE) {
        // Sets the file name to the present card path  
        fileName = "present_card_1.png";
      }
      
      // Sets the image path
      const imagePath = `cards/${fileName}`;
      // Sets the wild card infomation as a dictionary
      const card = { color: 'black', value, image: imagePath, type: 'wild' }; 
      
      // Loops through and pushes the cards
      for(let i = 0; i < 4; i++) {
          deck.push({...card, isWild: true}); 
      }
  });
  
  // Randomises the deck
  deck = deck.sort(() => Math.random() - 0.5);
}

/* -------------------------------------
  2. Image Rendering Function
------------------------------------- */
// Gets the image card
function getCardImagePath(card, isFaceUp = true) {
  // Checks if the card is face up
  if (isFaceUp && card) {
    // returns the cards image
    return card.image;
  } else {
    // Returns the cards back image
    return CARD_BACK_IMAGE_PATH;
  }
}

/* Draw card */
function drawCard(hand) {
  // Checks if the card length is zero and genrates the deck
  if (deck.length === 0) {
    // calls the generate deck function
    generateDeck(); 
  }
  // gets the drawncard from the last item in the deck
  const drawnCard = deck.pop();
  // Checks the drawn card
  if (drawnCard) {
      // Adds the drawn card to the hand
      hand.push(drawnCard);
  }
}

/* -------------------------------------
  3. Render Function (Single Player Mode)
------------------------------------- */

function render() {
  // gets the top Card
  const top = document.getElementById("topCard");
  // Sets the inner html to nothing
  top.innerHTML = "";
  // Checks if there is a top card
  if (topCard) {
    // Creates the top image elemetn
    const topImg = document.createElement("img");
    // Gets the src of of of the top image using the get image path function
    topImg.src = getCardImagePath(topCard, true);
    // sets the top image class name  
    topImg.className = "card-img";
    
    // Checks the display colour
    const displayColor = topCard.isWild && currentColor ? currentColor : topCard.color;
    // Sets the alt text
    topImg.alt = `Top Card: ${displayColor} ${topCard.value}`;

    // Checks if the card is wild if there is a current colour
    if (topCard.isWild && currentColor) {
        // Use Christmas colors for wild border
        let borderColor = 'white'; // Sets the border colour to white
        if (currentColor === 'red') borderColor = '#cc0000'; // Sets the border colour to red
        if (currentColor === 'green') borderColor = '#006600'; // sets the border colour to green
        if (currentColor === 'yellow') borderColor = '#ffcc00'; // sets the border colour to yellow
        if (currentColor === 'blue') borderColor = '#004c99'; // sets the border colour to blue

        // Creates a border around the image 
        topImg.style.border = `4px solid ${borderColor}`;
    } else {
        // Sets the border to none
        topImg.style.border = 'none';
    }
    // Adds the top card image to the top card element
    top.appendChild(topImg);
  }


  // Player Hand
  const handDiv = document.getElementById("playerHand");
  // Makes the player hand empty
  handDiv.innerHTML = "";
  
  // Checks if the present is active and the game is not over
  const isGifting = presentActive && !gameOver;

  // Loops through the player hand
  playerHand.forEach((card, index) => {
    // Creates a new image
    const img = document.createElement("img");
    // Sets the image source to the correct path with the function
    img.src = getCardImagePath(card, true); 
    // Adds the class name for the image
    img.className = "card-img";
    
    // Checks if the player is gifting a card
    if (isGifting) {
        // Sets the onclick value to the card you select
        img.onclick = () => selectCardToGift(index);
        img.style.border = "4px solid #ffcc00"; // Gold highlight for gifting
    // Checks if the game is not over and there is a card pending
    } else if (!gameOver && pendingPlayIndex === -1) {
      // Sets play card to index  
      img.onclick = () => playCard(index);
    }
    // Sets the alt text for the card
    img.alt = `${card.color} ${card.value}`; 
    // Adds the card to the hand
    handDiv.appendChild(img);
  });
  
  // Gets the draw button by id and diasbles it while gifting is true
  document.getElementById("drawBtn").disabled = isGifting;

  // Computer Hand 
  const compDiv = document.getElementById("computerHand");
  // sets the computer hand to empty
  compDiv.innerHTML = "";
  
  // Checks if the snowball is active
  if (snowballActive) {
      // Sets a placeholder element as a div
      const placeholder = document.createElement("div");
      // Sets the tailwind class names
      placeholder.className = "text-2xl font-bold text-yellow-400 p-4 border border-yellow-400 rounded christmas-container";
      // Sets the inner text
      placeholder.innerText = "❄️ Computer's cards are hidden by the Snowball!";
      // Addss the placeholder to their hand
      compDiv.appendChild(placeholder);
  } else {
      // Loops over the computer hand
      computerHand.forEach(() => {
        // creates a image element
        const img = document.createElement("img");
        // sets the image background path
        img.src = CARD_BACK_IMAGE_PATH; 
        // Applies the class name to it
        img.className = "card-img";
        // Sets the alt text
        img.alt = "Card Back";
        // Adds the image to the computers hand
        compDiv.appendChild(img);
      });
  }
}

// Check if card playable
function canPlay(card) {
  // Checks if the card is wild  
  if (card.isWild) {
        // Returns true
        return true; 
    }
    // Checks if the top colour is effective
    const effectiveTopColor = topCard.isWild && currentColor ? currentColor : topCard.color;

    // Returns the result
    return card.color === effectiveTopColor || card.value === topCard.value;
}

// Action Card Logic Helpers (Single Player Mode)

// Function to apply the plus two card
function applyPlusTwoEffect(targetHand, targetName) {
    // Checks if the game is over
    if (gameOver) return;
    
    // Draws the cards
    drawCard(targetHand);
    drawCard(targetHand);
    
    // Sets the plus to effect to th false
    plusTwoActive = false;
    
    // Checks if the snowball effect is active and the target code
    if (snowballActive && targetName === "Computer") {
        // Sets the snowball active to false
        snowballActive = false;
        // Sets a message
        setMessage(`Snowball effect cleared! 💀 ${targetName} draws 2 cards and skips turn!`);
    } else {
        // Sets the message
        setMessage(`💀 ${targetName} draws 2 cards and skips turn!`);
    }
    
    // calls the render function
    render();
    
    // Checks if the target is the user
    if (targetName === "You") {
        // Sets the computers time out to ten seconds
        setTimeout(computerTurn, 1000); 
    } else {
        // Sets time out to 10 seconds
        setTimeout(() => {
            // Sets the players message
            endPlayerCooldown();
            endPlayerCooldown();
            setMessage("Your turn now!");
        }, 1000); 
    }
}

// Applies the plus four effect to the target in the parameters
function applyPlusFourEffect(targetHand, targetName) {
    // Checks if the game is over
    if (gameOver) return;

    // Loops over a range of four to draw four cards
    for (let i = 0; i < 4; i++) {
        // Calls the draw card function
        drawCard(targetHand);
    }
    
    // sets plus to not active
    plusTwoActive = false; 
    
    // Checks if the snowball effect is active and the target is the computer
    if (snowballActive && targetName === "Computer") {
        // Sets the snowball to false
        snowballActive = false;
        // sets the message
        setMessage(`Snowball effect cleared! 💀 ${targetName} draws 4 cards and skips turn! New Color: ${currentColor.toUpperCase()}`);
    } else {
        // sets the message
        setMessage(`💀 ${targetName} draws 4 cards and skips turn! New Color: ${currentColor.toUpperCase()}`);
    }
    
    // Calls the renderimg function
    render();
    
    // Checks if the user is the target
    if (targetName === "You") {
        // Sets the timeout to 10 seconds
        setTimeout(computerTurn, 1000); 
    } else {
        // Sets the timeout to 10 seconds
        setTimeout(() => {
            // Sets the message
            endPlayerCooldown();
            setMessage("Your turn now!");
        }, 1000); 
    }
}

// Function to apply skip effect
function applySkipEffect(targetName) {
    // Checks if the game is over
    if (gameOver) return;

    // Checks if the skip is active
    skipActive = false;
    
    // Checks if the snowball effect and target is the computer
    if (snowballActive && targetName === "Computer") {
        // sets the snowball to not active
        snowballActive = false;
        // Sets the message
        setMessage(`Snowball effect cleared! ⏩ ${targetName}'s turn is skipped!`);
    } else {
        // Sets the message
        setMessage(`⏩ ${targetName}'s turn is skipped!`);
    }
    
    // Calls the render function
    render();
     
    if (targetName === "You") {
        // Sets the computer turn timeout to 10 seconds
        setTimeout(computerTurn, 1000); 
    } else {
        // Sets the message
        setTimeout(() => {
            endPlayerCooldown();
            setMessage("Your turn now!");
        }, 1000); 
    }
}

/* Player plays card (UNCHANGED) */
function playCard(index) {
  // Checks if the game is over or there is a pending play or present active
    if (actionCooldown) return;

    const card = playerHand[index];

    if (!canPlay(card)) {
        setMessage("❌ You can't play that card!");
        return;
    }

    // 🔒 lock ONLY after validation
    actionCooldown = true;
    updateUI();
  // Checks if the card is wild
  if (card.isWild) {
      // Sets the pending play index to the index
      pendingPlayIndex = index; 
      showColorSelector(); 
      playCardSound(); 
      return; 
  }
  // Sets the  top card to the card
  topCard = card;
  // Sets the current colour to the card colour
  currentColor = card.color; 
  // Checks if the snowball is active
  if (snowballActive) {
    // Sets the snowball to not active
      snowballActive = false; 
  }
  
  // Removes the card from the player hand
  playerHand.splice(index, 1);

  
  playCardSound();
  // Sets the message
  setMessage("You played a card. Computer's turn...");
  // Calls the render function
  render();
  // Checks if there is a winner
  if (checkWinner()) return;
  // Checks if the card value is +2
  if (card.value === "+2") {
    // Sets the plus two to active
    plusTwoActive = true; 
    // Plays the plus two sound
    playPlusTwoSound(); 
    // Sets the message
    setMessage(`You played a +2. Computer must draw 2!`);
  } else if (card.value === "miss") {
    // Sets the skip active to true
    skipActive = true;
    // Sets the message
    setMessage(`You played a Skip. Computer's turn is skipped!`);
  }
  // Sets the computer turn timeout to 900 milliseconds
  activateCooldown();
  setTimeout(computerTurn, 900);
}

/* Player selects a card to gift (UNCHANGED) */
function selectCardToGift(index) {
  // Checks if the game is over or present is not active
    if (!presentActive) return;
    // Gets the gifted card from the player hand
    const giftedCard = playerHand[index];
    
    // Sets the top card to the gifted card
    playerHand.splice(index, 1);

    // Adds the gifted card to the computer hand
    computerHand.push(giftedCard);
    
    // Sets present active to false
    presentActive = false;
    
    // Sets the message
    setMessage(`🎁 You gifted a ${giftedCard.color} ${giftedCard.value} to the Computer! Computer's turn is skipped! New Color: ${currentColor.toUpperCase()}`);

    // Calls the render function
    render();
    
    // Checks for a winner
    if (checkWinner()) return;
    // Sets the computer turn timeout to 900 milliseconds
    setTimeout(computerTurn, 900);
}


/* Color Selection Logic for Wild Cards (UNCHANGED) */
function showColorSelector() {
  // Shows the color selector modal
    document.getElementById("colorSelector").classList.remove('hidden');
    // Disables the draw button
    document.getElementById("drawBtn").disabled = true;
}

function hideColorSelector() {
  // Hides the color selector modal
    document.getElementById("colorSelector").classList.add('hidden');
  // Enables the draw button
    document.getElementById("drawBtn").disabled = false;
    // Resets the pending play index
    pendingPlayIndex = -1;
}

window.handleColorSelect = function(selectedColor) {
    // Checks if we are in 2-Player mode
    if (document.getElementById("player1Hand") && !document.getElementById("playerHand")) {
        handleColorSelect2P(selectedColor);
        return;
    }

    // --- Single Player Logic ---
    // Checks if there is a pending play index
    if (pendingPlayIndex === -1) return;
    
    // Gets the card from the player hand
    const card = playerHand[pendingPlayIndex];
    
    // Sets the top card and current color
    topCard = card;
    currentColor = selectedColor; 
    // Removes the card from the player hand
    playerHand.splice(pendingPlayIndex, 1);
    
    // *** FIX 1: Reset pendingPlayIndex after card is played ***
    pendingPlayIndex = -1;
    // *** END FIX 1 ***
    
    // Hides the color selector
    hideColorSelector();
    
    // Displays the message
    let messageText = `You played a Wild and chose ${selectedColor.toUpperCase()}. Computer's turn...`;

    if (card.value === "+4") {
        // Plays the plus four sound
        playPlusFourSound(); 
        // Updates the message text
        messageText = `You played a Wild +4! Computer must draw 4! New Color: ${currentColor.toUpperCase()}`;
        setMessage(messageText);
        render();
        // Checks for a winner
        if (checkWinner()) return;
        // Sets the timeout to apply the plus four effect
        setTimeout(() => {
            applyPlusFourEffect(computerHand, "Computer");
        }, 500);
        return;
    // Checks if the card value is snowball
    } else if (card.value === SNOWBALL_VALUE) {
        // Sets the snowball active to true
        snowballActive = true; 
        // Sets the skip active to true
        skipActive = true;
        // Updates the message text
        messageText = `❄️ You played a **Snowball**! Computer's cards are hidden, and their turn is skipped! New Color: ${currentColor.toUpperCase()}`;
    // Checks if the card value is present
    } else if (card.value === PRESENT_VALUE) {
        // Sets the present active to true
        presentActive = true; 
        // Sets the skip active to true
        skipActive = true; 
        // Updates the message text
        messageText = `🎁 You played a **Present Card**! Choose a card to gift to the Computer. Turn is skipped! New Color: ${currentColor.toUpperCase()}`;
        // Sets the message
        setMessage(messageText);
        render();
        // The game will now proceed to the turn advancement logic below
    }

    // --- Standard Wild Card/Snowball/Present Cleanup and Turn Advance ---
    
    // Sets the message (for Wild, Snowball, and now Present)
    setMessage(messageText);
    
    // Render the updated game state
    render();

    // Checks for a winner
    if (checkWinner()) return;
    
    // Advance the turn (computerTurn will respect skipActive = true)
    setTimeout(computerTurn, 1000);
};


/* Player draws (UNCHANGED) */
document.getElementById("drawBtn").onclick = () => {
    if (actionCooldown) return;
    actionCooldown = true;
  // Check if we are in 2-Player mode
    if (document.getElementById("player1Hand") && !document.getElementById("playerHand")) {
        drawCard2P();
        return;
    }

    // --- Single Player Logic ---
  // Checks if the game is over or present is active
  if (gameOver || presentActive) return; 
  // Checks if plus two is active
  if (plusTwoActive) {
    // Gets the top card 
    const isPlusFour = topCard && topCard.value === "+4";
    // Determines the draw amount
    const drawAmount = isPlusFour ? 4 : 2;
    // Loops over the draw amount to draw the cards
    for (let i = 0; i < drawAmount; i++) {
        // Calls the draw card function
        drawCard(playerHand);
    }
    // Plays the draw sound
    playDrawSound(); 
    // Sets the message
    setMessage(`You drew ${drawAmount} cards due to the +${drawAmount} penalty. Computer's turn...`);
    // Sets plus two active to false
    plusTwoActive = false; 
  } else {
    // Calls the draw card function
    drawCard(playerHand);
    // Plays the draw sound
    playDrawSound(); 
    // Sets the message
    setMessage("You drew a card. Computer's turn...");
  }
  // Checks if snowball is active
  if (snowballActive) {
    // Sets snowball active to false
      snowballActive = false;
  }
  // Calls the render function
  render();
  // Sets the computer turn timeout to 900 milliseconds
  activateCooldown();
  setTimeout(computerTurn, 900);
};

/* Computer turn logic (UNCHANGED) */
function computerTurn() {
  // Checks if the game is over
    if (gameOver) return;
    actionCooldown = true;
    // Checks if skip is active
    if (skipActive) {
        // Applies the skip effect to the computer
        applySkipEffect("Computer");
        return; 
    }
    // Checks if plus two is active
    if (plusTwoActive) {
        // Gets if the top card is plus four
        const isPlusFour = topCard && topCard.value === "+4";
        // Applies the plus two or plus four effect to the computer
        if (isPlusFour) {
            applyPlusFourEffect(computerHand, "Computer");
        } else {
            applyPlusTwoEffect(computerHand, "Computer");
        }
        return; 
    }
    // Checks if snowball is active
    if (snowballActive) {
      // Sets snowball active to false
        snowballActive = false;
        // Sets the message
        setMessage("Snowball effect cleared! Computer's turn now.");
        // Calls the render function
        render();
    }
    // Finds a playable card in the computer hand
    let playable = computerHand.find(c => canPlay(c));
    // Checks if there is a playable card
    if (playable) {
        // Checks if the card is wild
        if (playable.isWild) {
          // Plays the wild sound
            playWildSound(); 
            
            // Computer chooses the best color based on its hand
            const colorCounts = {};
            // Initialises the color counts
            COLORS.forEach(c => colorCounts[c] = computerHand.filter(card => card.color === c && !card.isWild).length);
            
            // Finds the color with the maximum count
            let bestColor = 'red'; 
            let maxCount = -1;

            COLORS.forEach(c => {
              // Checks if the color count is greater than the max count
                if (colorCounts[c] > maxCount) {
                  // Updates the max count and best color
                    maxCount = colorCounts[c];
                    bestColor = c;
                }
            });
            // Sets the top card to the playable card
            topCard = playable;
            currentColor = bestColor; 

            // Removes the played card from the computer hand
            const playedIndex = computerHand.findIndex(c => c.image === playable.image);
            computerHand.splice(playedIndex, 1);

            // Displays the message
            let messageText = `🤖 Computer played a Wild Card and chose ${bestColor.toUpperCase()}`;
            
            // Checks if the playable value is snowball
            if (playable.value === SNOWBALL_VALUE) {
                // Sets snowball active to true
                snowballActive = true; 
                // Sets skip active to true
                skipActive = true;
                // Updates the message text
                messageText = `❄️ 🤖 Computer played a **Snowball**! Your cards are hidden, and your turn is skipped! New Color: ${currentColor.toUpperCase()}`;

              // Checks if the playable value is present
            } else if (playable.value === PRESENT_VALUE) {
                skipActive = true;
                
                // Computer selects the best card to give away: a low-value card
                let giftedCardIndex = -1;
                let lowestValue = 10;
                
                // Loops through the computer hand to find the lowest value card
                computerHand.forEach((card, index) => {
                  // Parses the card value to an integer
                    const value = parseInt(card.value);
                    // Checks if the value is a number and less than the lowest value
                    if (!isNaN(value) && value < lowestValue) {
                      // Updates the lowest value and gifted card index
                        lowestValue = value;
                        // Sets the gifted card index
                        giftedCardIndex = index;
                    }
                });
                // Gets the gifted card from the computer hand 
                const giftedCard = giftedCardIndex !== -1 ? computerHand[giftedCardIndex] : computerHand[0]; 
                // Checks if there is a gifted card
                if (giftedCard) {
                    // Removes the gifted card from the computer hand and adds it to the player hand
                    computerHand.splice(giftedCardIndex !== -1 ? giftedCardIndex : 0, 1);
                    // Adds the gifted card to the player hand
                    playerHand.push(giftedCard);
                    // Updates the message text
                    messageText = `🎁 🤖 Computer played a **Present Card** and gifted you a ${giftedCard.color} ${giftedCard.value}! Computer's turn is skipped! New Color: ${currentColor.toUpperCase()}`;
                } else {
                    messageText = `🎁 🤖 Computer played a **Present Card** but had no card to gift! Turn is skipped! New Color: ${currentColor.toUpperCase()}`;
                }
            }
            // Displays the message
            setMessage(messageText);
            render();
            // Checks for a winner
            if (checkWinner()) return;
            // Handles +4 effect
            if (playable.value === "+4") {
                playPlusFourSound(); 
                setTimeout(() => {
                  // Applies the plus four effect to the player
                    applyPlusFourEffect(playerHand, "You");
                }, 500);
                return; 
            }
            
            setTimeout(() => {
                endPlayerCooldown();
                setMessage("Your turn now!");
            }, 500);
            return; 
        }
        // Sets the top card and current color to the playable card 
        topCard = playable;
        currentColor = playable.color; 
        
        // Removes the played card from the computer hand
        const playedIndex = computerHand.findIndex(c => c.image === playable.image);
        computerHand.splice(playedIndex, 1);
        // Plays the play card sound
        playCardSound(); 
        // Sets the message
        setMessage(`🤖 Computer played ${playable.color} ${playable.value}`);
        
        render();
        // Checks for a winner
        if (checkWinner()) return;

        // Checks if the playable value is +2
        if (playable.value === "+2") {
          // Sets plus two active to true
            plusTwoActive = true; 
            playPlusTwoSound(); 
            setTimeout(() => {
                applyPlusTwoEffect(playerHand, "You");
            }, 500);
            return; 
        // Checks if the playable value is miss
        } else if (playable.value === "miss") {
            // Sets skip active to true
             skipActive = true; 
             setTimeout(() => {
                 applySkipEffect("You");
             }, 500);
             return; 
        }
    // No playable card found, computer draws a card
    } else {
        drawCard(computerHand);
        playDrawSound(); 
        setMessage("🤖 Computer drew a card");
        render();
    }
    setTimeout(() => {
        actionCooldown = false;
        endPlayerCooldown();
        setMessage("Your turn now!");
    }, 500);
}

/* Winner check */
function checkWinner() {
  if (playerHand.length === 0) {
    setMessage("🎉 You win the Festive Challenge! Play again?");
    playWinSound(); 
    // Disables the game
    disableGame();
    return true;
  }
  if (computerHand.length === 0) {
    setMessage("💀 Computer wins! Better luck next Christmas! Play again?");
    playLoseSound(); 
    // Disables the game
    disableGame();
    return true;
  }
  return false;
}

/* Disable inputs - MODIFIED STYLING */
function disableGame() {
  // Sets game over to true
  gameOver = true;
  
  // Disables the draw button
  document.getElementById("drawBtn").disabled = true;
  // Clears the player hand div
  const handDiv = document.getElementById("playerHand");
  handDiv.innerHTML = "";
  // Creates a new button element
  const button = document.createElement("button");
  button.id = "playAgainBtn";
  // Apply Christmas button styling and add text
  button.className = "christmas-btn px-6 py-3 rounded-xl text-2xl font-bold shadow-xl mt-4";
  button.innerText = "🎅 Start New Game";
  // Sets the onclick to reload the page
  button.onclick = () => {
      // Restarts the game
      playStartSound(); 
      setTimeout(() => window.location.reload(), 100); 
  };
  // Appends the button to the hand div
  handDiv.appendChild(button);
}

/* Message helper (UNCHANGED) */
function setMessage(msg) {
  document.getElementById("message").innerText = msg;
}

/* ------------------------------------
      🎶 MUSIC MANAGER LOGIC 🎶 (UNCHANGED)
------------------------------------- */

// List of theme IDs
const themes = ["wonder", "voyage", "relax", "tense"];
let currentThemeIndex = -1;
let currentAudio = null;
let isMusicEnabled = false; 
// Gets the toggle button element
const TOGGLE_BUTTON = document.getElementById('musicToggleBtn');
let rotationIntervalId = null; 

// Music Manager Object
const MusicManager = {
    // Function to play the next theme
    playNextTheme() {
        // Checks if music is enabled
        if (!isMusicEnabled) return; 
        // Stops the current music
        this.stopMusic(); 
        // Updates the theme index
        currentThemeIndex = (currentThemeIndex + 1) % themes.length;
        const nextThemeId = themes[currentThemeIndex] + "-theme";
        currentAudio = document.getElementById(nextThemeId);
        
        // Plays the current audio
        if (currentAudio) {
            currentAudio.volume = 0.5; 
            currentAudio.play().catch(error => console.error("Music playback failed:", error));
        }
    },
    // Function to stop the music
    stopMusic() {
        if (currentAudio) {
            currentAudio.pause();
            currentAudio.currentTime = 0; 
        }
    },
    // Function to start the rotation
    startRotation() {
        if (rotationIntervalId) {
            clearInterval(rotationIntervalId);
        }
        this.playNextTheme();
        rotationIntervalId = setInterval(() => this.playNextTheme(), 60000); 
    },
    // Function to stop the rotation
    stopRotation() {
        if (rotationIntervalId) {
            clearInterval(rotationIntervalId);
            rotationIntervalId = null;
        }
    },
    // Function to toggle music on/off
    toggleMusic() {
        isMusicEnabled = !isMusicEnabled;
        
        if (isMusicEnabled) {
            TOGGLE_BUTTON.innerHTML = '<i class="fas fa-volume-up"></i> Music';
            this.startRotation();
        } else {
            TOGGLE_BUTTON.innerHTML = '<i class="fas fa-volume-mute"></i> Music';
            this.stopRotation();
            this.stopMusic(); 
        }
    }
};
// Event listener for the music toggle button
TOGGLE_BUTTON.addEventListener('click', () => {
    MusicManager.toggleMusic();
});


/* -------------------------------------
  START GAME FUNCTION (Single Player Mode)
------------------------------------- */
// Function to start the game
function startGame() {
  // Initializes the game state
  generateDeck();
  playerHand = [];
  computerHand = [];
  gameOver = false; 
  plusTwoActive = false;
  skipActive = false; 
  snowballActive = false;
  presentActive = false;
  pendingPlayIndex = -1; 
  // Deals 7 cards to each player
  for (let i = 0; i < 7; i++) {
    drawCard(playerHand);
    drawCard(computerHand);
  }
  // Sets the initial top card
  topCard = deck.pop();
  while (topCard && topCard.isWild) {
      topCard = deck.pop();
  }
  // Sets the current color to the top card color
  if (topCard) {
      currentColor = topCard.color; 
  }
  // Calls the  render function
  render();
  // Sets the starting message
  setMessage("Game started! Your turn.");
}


/* -------------------------------------
  2-PLAYER GAME LOGIC (NEW CODE)
------------------------------------- */

// --- 2-Player State Variables ---
let player1Hand = [];
let player2Hand = [];
let currentPlayer = 1; // 1 or 2
let p2_plusTwoActive = false; 
let p2_skipActive = false;
let p2_snowballActive = false;
let p2_presentActive = false;
let p2_gameOver = false;
let p2_pendingPlayIndex = -1; // -1: no pending, index: index of card played

// --- Message/Status Helpers for 2-Player ---

function getTargetHand(player) {
    return player === 1 ? player1Hand : player2Hand;
}

function getCurrentHand() {
    return currentPlayer === 1 ? player1Hand : player2Hand;
}

function getNextPlayer() {
    return currentPlayer === 1 ? 2 : 1;
}

function getCurrentPlayerName() {
    return `Player ${currentPlayer}`;
}

function getNextPlayerName() {
    return `Player ${getNextPlayer()}`;
}

function setStatusMessage(msg) {
    document.getElementById("message").innerText = msg;
    const playerStatus = document.getElementById("playerStatus");
    playerStatus.innerText = `${getCurrentPlayerName()}'s Turn!`;
}

function showPlayerTurnMessage() {
    setStatusMessage(`${getCurrentPlayerName()}'s turn.`);
}

// --- Render Function for 2-Player ---

function render2P() {
    /* ---------- TOP CARD ---------- */
    const top = document.getElementById("topCard");
    top.innerHTML = "";

    if (topCard) {
        const topImg = document.createElement("img");
        topImg.src = getCardImagePath(topCard, true);
        topImg.className = "card-img";

        const displayColor =
            topCard.isWild && currentColor ? currentColor : topCard.color;

        topImg.alt = `Top Card: ${displayColor} ${topCard.value}`;

        if (topCard.isWild && currentColor) {
            let borderColor = "white";
            if (currentColor === "red") borderColor = "#cc0000";
            if (currentColor === "green") borderColor = "#006600";
            if (currentColor === "yellow") borderColor = "#ffcc00";
            if (currentColor === "blue") borderColor = "#004c99";
            topImg.style.border = `4px solid ${borderColor}`;
        } else {
            topImg.style.border = "none";
        }

        top.appendChild(topImg);
    }

    /* ---------- TURN FLAGS ---------- */
    const isP1Turn = currentPlayer === 1;
    const isP2Turn = currentPlayer === 2;

    /* ---------- PLAYER 1 HAND ---------- */
    const p1Div = document.getElementById("player1Hand");
    p1Div.innerHTML = "";

    player1Hand.forEach((card, index) => {
        const img = document.createElement("img");

        // Card BACK if not Player 1's turn
        img.src = isP1Turn
            ? card.image
            : CARD_BACK_IMAGE_PATH;

        img.className = "card-img";
        img.alt = isP1Turn ? `${card.color} ${card.value}` : "Card Back";

        // Click only if it's Player 1's turn
        if (
            isP1Turn &&
            !p2_gameOver &&
            p2_pendingPlayIndex === -1 &&
            !p2_presentActive
        ) {
            img.onclick = () => playCard2P(index);
        }

        // Present gifting highlight
        if (isP1Turn && p2_presentActive) {
            img.style.border = "4px solid #cc0000";
            img.onclick = () => selectCardToGift2P(index, 1);
        }

        p1Div.appendChild(img);
    });

    /* ---------- PLAYER 2 HAND ---------- */
    const p2Div = document.getElementById("player2Hand");
    p2Div.innerHTML = "";

    // Snowball: hide Player 2 cards when Player 1 is active
    if (p2_snowballActive && isP1Turn) {
        const placeholder = document.createElement("div");
        placeholder.className =
            "text-xl font-bold text-yellow-400 p-4 border border-yellow-400 rounded christmas-container";
        placeholder.innerText =
            "❄️ Player 2's cards are hidden by the Snowball!";
        p2Div.appendChild(placeholder);
    } else {
        player2Hand.forEach((card, index) => {
            const img = document.createElement("img");

            // Card BACK if not Player 2's turn
            img.src = isP2Turn
                ? card.image
                : CARD_BACK_IMAGE_PATH;

            img.className = "card-img";
            img.alt = isP2Turn ? `${card.color} ${card.value}` : "Card Back";

            // Click only if it's Player 2's turn
            if (
                isP2Turn &&
                !p2_gameOver &&
                p2_pendingPlayIndex === -1 &&
                !p2_presentActive
            ) {
                img.onclick = () => playCard2P(index);
            }

            // Present gifting highlight
            if (isP2Turn && p2_presentActive) {
                img.style.border = "4px solid #006600";
                img.onclick = () => selectCardToGift2P(index, 2);
            }

            p2Div.appendChild(img);
        });
    }

    /* ---------- UI UPDATES ---------- */
    document.getElementById(
        "p1_hand_label"
    ).innerText = `Player 1's Hand (${player1Hand.length} cards)`;

    document.getElementById(
        "p2_hand_label"
    ).innerText = `Player 2's Stocking (${player2Hand.length} cards)`;

    document.getElementById("drawBtn").disabled =
        p2_gameOver || p2_presentActive || p2_pendingPlayIndex !== -1;
}

// --- Game Logic for 2-Player ---

function advanceTurn() {
    if (p2_gameOver) return;

    currentPlayer = getNextPlayer();

    // Reset single-player active flags
    p2_plusTwoActive = false;
    p2_skipActive = false;
    p2_snowballActive = false;
    p2_presentActive = false;

    render2P();
    checkWinner2P();
    showPlayerTurnMessage();
}

function applyActionEffect2P(cardValue) {
    const targetHand = getTargetHand(getNextPlayer());
    const targetName = getNextPlayerName();
    const isPlusFour = cardValue === "+4";

    if (cardValue === "+2" || isPlusFour) {
        const drawAmount = isPlusFour ? 4 : 2;
        playPlusFourSound(); 

        for (let i = 0; i < drawAmount; i++) {
            drawCard(targetHand);
        }

        p2_plusTwoActive = true; 
        p2_skipActive = true; // Draw penalty also skips turn

        setStatusMessage(`💀 ${targetName} must draw ${drawAmount} cards and is skipped! New Color: ${currentColor.toUpperCase()}`);
        
    } else if (cardValue === "miss") {
        p2_skipActive = true;
        setStatusMessage(`⏩ ${targetName}'s turn is skipped!`);
        
    } else if (cardValue === SNOWBALL_VALUE) {
        p2_snowballActive = true;
        p2_skipActive = true;
        setStatusMessage(`❄️ ${getCurrentPlayerName()} played a **Snowball**! ${targetName}'s cards are hidden, and their turn is skipped! New Color: ${currentColor.toUpperCase()}`);
        
    } else if (cardValue === PRESENT_VALUE) {
        p2_presentActive = true; 
        p2_skipActive = true;
        setStatusMessage(`🎁 ${getCurrentPlayerName()} played a **Present Card**! ${targetName}, choose a card to gift to ${getCurrentPlayerName()}. Turn is skipped! New Color: ${currentColor.toUpperCase()}`);
        // Render to show gifting UI
        render2P();
        return; 
    }
    
    // For all other actions, advance the turn
    render2P();
    advanceTurn();
}

function playCard2P(index) {
    if (p2_gameOver || p2_pendingPlayIndex !== -1 || p2_presentActive) return;

    const currentHand = getCurrentHand();
    const card = currentHand[index];
    
    if (!canPlay(card)) {
        setStatusMessage("❌ You can't play that card!");
        return;
    }

    if (card.isWild) {
        p2_pendingPlayIndex = index; 
        showColorSelector();
        playCardSound();
        return; 
    }

    // Play Card
    topCard = card;
    currentColor = card.color; 
    currentHand.splice(index, 1);
    
    playCardSound();
    
    render2P();
    if (checkWinner2P()) return;

    if (card.value === "+2" || card.value === "miss" || card.value === SNOWBALL_VALUE || card.value === PRESENT_VALUE) {
        applyActionEffect2P(card.value);
    } else {
        advanceTurn();
    }
}

function selectCardToGift2P(index, giverPlayer) {
    if (!p2_presentActive || giverPlayer !== currentPlayer) return;

    const currentHand = getCurrentHand();
    const nextHand = getTargetHand(getNextPlayer());
    const giftedCard = currentHand[index];
    
    currentHand.splice(index, 1);
    nextHand.push(giftedCard);
    
    p2_presentActive = false;
    
    setStatusMessage(`🎁 ${getCurrentPlayerName()} gifted a ${giftedCard.color} ${giftedCard.value} to ${getNextPlayerName()}!`);

    render2P();
    if (checkWinner2P()) return;

    // Turn was skipped by the present card, so advance the turn now.
    advanceTurn();
}

window.handleColorSelect2P = function(selectedColor) {
    if (p2_pendingPlayIndex === -1) return;
    
    const currentHand = getCurrentHand();
    const card = currentHand[p2_pendingPlayIndex];
    
    topCard = card;
    currentColor = selectedColor; 
    currentHand.splice(p2_pendingPlayIndex, 1);
    p2_pendingPlayIndex = -1;
    
    hideColorSelector();
    playWildSound();
    
    render2P();
    if (checkWinner2P()) return;
    
    // Wild action effects
    if (card.value === "+4" || card.value === SNOWBALL_VALUE || card.value === PRESENT_VALUE) {
        applyActionEffect2P(card.value);
    } else {
        advanceTurn();
    }
};

function drawCard2P() {
    if (p2_gameOver || p2_presentActive || p2_pendingPlayIndex !== -1) return; 

    const currentHand = getCurrentHand();
    let drawAmount = 1;
    let messageText = `${getCurrentPlayerName()} drew a card.`;
    
    if (p2_plusTwoActive) {
        const isPlusFour = topCard && topCard.value === "+4";
        drawAmount = isPlusFour ? 4 : 2;
        messageText = `${getCurrentPlayerName()} drew ${drawAmount} cards due to the +${drawAmount} penalty.`;
        p2_plusTwoActive = false;
    } 

    for (let i = 0; i < drawAmount; i++) {
        drawCard(currentHand);
    }
    
    playDrawSound(); 
    setStatusMessage(messageText);
    render2P();
    checkWinner2P();
    
    // Draw also ends the turn
    advanceTurn();
}

function checkWinner2P() {
    if (player1Hand.length === 0) {
        setStatusMessage("🎉 Player 1 wins the Festive Challenge! Play again?");
        playWinSound(); 
        disableGame2P();
        return true;
    }
    if (player2Hand.length === 0) {
        setStatusMessage("🎉 Player 2 wins the Festive Challenge! Play again?");
        playWinSound(); 
        disableGame2P();
        return true;
    }
    return false;
}

function disableGame2P() {
    p2_gameOver = true;
    document.getElementById("drawBtn").disabled = true;
    
    // Replace both hands with the 'Play Again' button
    const p1Div = document.getElementById("player1Hand");
    const p2Div = document.getElementById("player2Hand");
    p1Div.innerHTML = "";
    p2Div.innerHTML = "";
    document.getElementById("playerStatus").innerText = "Game Over!";
    
    const button = document.createElement("button");
    button.id = "playAgainBtn2P";
    button.className = "christmas-btn px-6 py-3 rounded-xl text-2xl font-bold shadow-xl mt-4";
    button.innerText = "🎅 Start New Game";
    button.onclick = () => {
        playStartSound(); 
        setTimeout(() => window.location.reload(), 100); 
    };
    
    // Append to the container element around the hands, or just one of the hand elements
    p1Div.appendChild(button);
}

// --- Start Game Function for 2-Player ---
function startGame2P() {
    generateDeck();
    player1Hand = [];
    player2Hand = [];
    p2_gameOver = false; 
    p2_plusTwoActive = false;
    p2_skipActive = false; 
    p2_snowballActive = false;
    p2_presentActive = false;
    p2_pendingPlayIndex = -1; 
    currentPlayer = 1; // Start with Player 1

    for (let i = 0; i < 7; i++) {
        drawCard(player1Hand);
        drawCard(player2Hand);
    }
    
    topCard = deck.pop();
    while (topCard && topCard.isWild) {
        topCard = deck.pop();
    }
    
    if (topCard) {
        currentColor = topCard.color; 
    }

    render2P();
    setStatusMessage("Game started! Your turn.");
    document.getElementById("playerStatus").innerText = "Player 1's Turn!";
}


/* -------------------------------------
  INITIALIZATION (FIXED/MODIFIED)
------------------------------------- */

// Crucial fix: Wait for the entire page to load before starting the game
document.addEventListener('DOMContentLoaded', () => {
    // Check if we are in the 2-Player game page (by checking for a unique element)
    if (document.getElementById("player1Hand")) {
        startGame2P();
    } else {
        // Assume Single Player mode for original index.html
        startGame();
    }
    playStartSound();
});