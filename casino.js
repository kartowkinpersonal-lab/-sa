// Мини-казино (клиентская симуляция)
// Механика: у каждого "ownerId" в localStorage хранится { spinsLeft, boughtUsed }
// По умолчанию при первом заходе без owner присваивается 10 спинов на сессию.

const DEFAULT_SPINS = 10;
const BUY_LIMIT = 1; // можно купить 1 раз

// UI
const spinsEl = document.getElementById('spins');
const canBuyEl = document.getElementById('canBuy');
const spinBtn = document.getElementById('spinBtn');
const buyBtn = document.getElementById('buyBtn');
const resultEl = document.getElementById('result');
const ownerInput = document.getElementById('owner');
const assignBtn = document.getElementById('assignBtn');

let ownerId = null;
let state = { spinsLeft: DEFAULT_SPINS, boughtUsed: 0 };

function storageKey(id){ return 'minicasino:' + id; }

function loadState(){ 
  if(ownerId){
    const raw = localStorage.getItem(storageKey(ownerId));
    if(raw) state = JSON.parse(raw);
    else { state = { spinsLeft: DEFAULT_SPINS, boughtUsed: 0 }; saveState(); }
  } else {
    // session-only state if no owner
    const raw = sessionStorage.getItem('minicasino:session');
    if(raw) state = JSON.parse(raw);
    else { state = { spinsLeft: DEFAULT_SPINS, boughtUsed: 0 }; sessionStorage.setItem('minicasino:session', JSON.stringify(state)); }
  }
  render();
}

function saveState(){
  if(ownerId) localStorage.setItem(storageKey(ownerId), JSON.stringify(state));
  else sessionStorage.setItem('minicasino:session', JSON.stringify(state));
}

function render(){
  spinsEl.textContent = state.spinsLeft;
  canBuyEl.textContent = Math.max(0, BUY_LIMIT - state.boughtUsed);
  buyBtn.disabled = (state.boughtUsed >= BUY_LIMIT);
  spinBtn.disabled = (state.spinsLeft <= 0);
}

function randomOutcome(){
  // простая рулетка: 0 - потеря, 1 - маленький выигрыш, 2 - большой выигрыш
  const r = Math.random();
  if(r < 0.6) return {type:'loss', text:'К сожалению, ничего не выпало.'};
  if(r < 0.9) return {type:'small', text:'Маленький выигрыш! +10 монет (симуляция).'};
  return {type:'big', text:'Большой выигрыш! +100 монет (симуляция).'};
}

spinBtn.addEventListener('click', ()=>{
  if(state.spinsLeft <= 0){ resultEl.textContent = 'Нет доступных спинов'; return; }
  state.spinsLeft -= 1;
  const out = randomOutcome();
  resultEl.textContent = out.text;
  saveState();
  render();
});

buyBtn.addEventListener('click', ()=>{
  if(state.boughtUsed >= BUY_LIMIT){ resultEl.textContent = 'Покупка недоступна'; return; }
  // Здесь симулируем покупку: просто добавляем 1 спин и отмечаем, что покупка использована.
  state.spinsLeft += 1;
  state.boughtUsed += 1;
  resultEl.textContent = 'Покупка успешна — начислен 1 дополнительный спин (симуляция).';
  saveState();
  render();
});

assignBtn.addEventListener('click', ()=>{
  const id = ownerInput.value.trim();
  if(!id){ alert('Введите идентификатор (например email или номер)'); return; }
  ownerId = id;
  // назначаем 10 спинов данному id в localStorage
  const key = storageKey(ownerId);
  const obj = { spinsLeft: DEFAULT_SPINS, boughtUsed: 0 };
  localStorage.setItem(key, JSON.stringify(obj));
  state = obj;
  resultEl.textContent = 'Назначено ' + DEFAULT_SPINS + ' спинов для ' + ownerId + ' (локально).';
  saveState();
  render();
});

// init
loadState();
