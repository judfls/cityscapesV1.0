// Oregon Trail v1.3 - Pixel Roulette (no money, just fun)
// Simple self-contained logic: spin wheel, travel, save/load

// State
let day = 1;
let miles = 0;
let food = 100;
let health = 5;

// DOM
const dayEl = document.getElementById('day');
const milesEl = document.getElementById('miles');
const foodEl = document.getElementById('food');
const healthEl = document.getElementById('health');
const msgEl = document.getElementById('message');
const wheel = document.getElementById('wheel');
const spinBtn = document.getElementById('spinBtn');
const travelBtn = document.getElementById('travelBtn');
const saveBtn = document.getElementById('saveBtn');
const loadBtn = document.getElementById('loadBtn');

function renderStats(){
  dayEl.innerText = day;
  milesEl.innerText = miles;
  foodEl.innerText = food;
  healthEl.innerText = health;
}

function setMessage(txt){
  msgEl.innerText = txt;
}

/* Wheel spin mechanics
   We simulate 6 equal slices like the classic roulette segments.
   Angle mapping:
     0 - 60     => good food
     60-120     => miles forward
     120-180    => +health
     180-240    => food loss
     240-300    => big health loss
     300-360    => lost miles
*/
function spinWheel(){
  if (spinBtn.disabled) return;
  spinBtn.disabled = true;
  const rotation = Math.floor(Math.random()*360) + 720 + (Math.random()*360|0);
  wheel.style.transform = `rotate(${rotation}deg)`;

  setTimeout(()=>{
    const landed = rotation % 360;
    resolveSpin(landed);
    spinBtn.disabled = false;
  }, 2900);
}

function resolveSpin(angle){
  let msg = '';
  if (angle < 60){
    food += 30;
    msg = 'You found a cache of food +30 Food.';
  } else if (angle < 120){
    const m = 40;
    miles += m;
    msg = `You made good progress on the trail +${m} miles.`;
  } else if (angle < 180){
    health += 1;
    msg = 'A kind traveler patched you up +1 Health.';
  } else if (angle < 240){
    food -= 20;
    msg = 'Some food spoiled -20 Food.';
  } else if (angle < 300){
    health -= 2;
    msg = 'You have the flu -2 Health.';
  } else {
    miles = Math.max(0, miles - 30);
    msg = 'You got lost and retraced your steps -30 miles.';
  }

  // starvation penalty
  if (food <= 0){
    food = 0;
    health -= 1;
    msg += ' (Starving: -1 health)';
  }

  // clamp
  if (health <= 0){
    setMessage('You died on the trail. Game over.');
    spinBtn.disabled = true;
    travelBtn.disabled = true;
    renderStats();
    return;
  }

  if (miles >= 500){
    setMessage('You reached Oregon — victory!');
    spinBtn.disabled = true;
    travelBtn.disabled = true;
    renderStats();
    return;
  }

  setMessage(msg);
  renderStats();
}

// Travel (one day passes)
function travelDay(){
  day++;
  // travel distance random small
  const travel = Math.floor(Math.random()*15) + 8;
  miles += travel;
  food -= 10;
  if (food <= 0){
    food = 0;
    health -= 1;
  }

  // chance of small event
  if (Math.random() < 0.25){
    const ev = Math.random();
    if (ev < 0.33){
      food += 10; setMessage('You foraged some berries. +10 Food.');
    } else if (ev < 0.66){
      health -= 1; setMessage('Swamp fever hits. -1 Health.');
    } else {
      miles += 10; setMessage('A tailwind pushes you forward. +10 Miles.');
    }
  } else {
    setMessage(`Traveled ${travel} miles today.`);
  }

  if (health <= 0){
    setMessage('You died on the trail. Game over.');
    travelBtn.disabled = true;
    spinBtn.disabled = true;
  }

  if (miles >= 500){
    setMessage('You reached Oregon — victory!');
    travelBtn.disabled = true;
    spinBtn.disabled = true;
  }

  renderStats();
}

// Save to localStorage
function saveGame(){
  const save = {day,miles,food,health};
  localStorage.setItem('ot_v1_3_save', JSON.stringify(save));
  setMessage('Game saved locally.');
}

// Load
function loadGame(){
  const raw = localStorage.getItem('ot_v1_3_save');
  if (!raw){ setMessage('No save found.'); return; }
  try {
    const s = JSON.parse(raw);
    day = s.day||1; miles=s.miles||0; food=s.food||100; health=s.health||5;
    renderStats();
    setMessage('Save loaded.');
  } catch(e){
    setMessage('Save corrupted.');
  }
}

// Wire
spinBtn.addEventListener('click', spinWheel);
travelBtn.addEventListener('click', travelDay);
saveBtn.addEventListener('click', saveGame);
loadBtn.addEventListener('click', loadGame);

// init
renderStats();
setMessage('Start your jouney by spinning the wheel');

