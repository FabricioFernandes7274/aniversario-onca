// Usa arquivo local preferencialmente (verifique o nome em assets/)
const SOUND_URL = './assets/571287__lewisbm__jaguar_growl_roar.wav'; // substitua por './assets/roar.wav' se renomear o arquivo

const questions = [
  {
    q: 'Prestou atenção na aula de quimica? Espero que isso Neonio, Neonio e Uranio. Boa sorte Onça!',
    type: 'text',
    answers: ['miriam'],
    hint: 'Você na pista'
  },
  {
    q: 'Será que você conhece seu amiguinho? Os titãs estão vindo onça',
    type: 'text',
    answers: ['titanfall 2', 'titanfall2'],
    hint: 'Sei que você não deve saber então procura na minha steam https://steamcommunity.com/profiles/76561199214958192/'
  },
  {
    q: 'Vamo lá né onça, chegou até aqui, que tal por a cuca pra funcionar? Qual é a resposta para e elevado a i vezes pi + 1?',
    type: 'text',
    answers: ['0', 'zero'],
    hint: 'é mais facil que parece, chute numeros baixos'
  },
  {
    q: 'Qual sua principal presa onça? Sei que uns animais não morrem sozinhos não',
    type: 'text',
    answers: ['boi', 'vaca'],
    hint: 'Video de esquerda e choque'
  },
  {
    q: 'Qual a pessoa que mais amo atentar?',
    type: 'text',
    answers: ['eu', 'onça', 'onca']
  }
];

let current = 0;

const questionEl = document.getElementById('question');
const optionsEl = document.getElementById('options');
const progressEl = document.getElementById('progress');
const nextBtn = document.getElementById('nextBtn');
const restartBtn = document.getElementById('restartBtn');
const endScreen = document.getElementById('endScreen');
const quizCard = document.getElementById('quiz-card');
const playAgain = document.getElementById('playAgain');

function sanitize(s){
  return String(s || '').trim().toLowerCase();
}

function render(){
  if(current >= questions.length){
    showEnd();
    return;
  }
  const q = questions[current];
  questionEl.textContent = q.q;
  optionsEl.innerHTML = '';
  progressEl.textContent = `Pergunta ${current+1} / ${questions.length}`;

  // Para perguntas tipo texto: mostrar input, botão de verificar e dica
  if(q.type === 'text'){
    nextBtn.style.display = 'none';

    const input = document.createElement('input');
    input.className = 'text-input';
    input.type = 'text';
    input.id = 'textAnswer';
    input.placeholder = 'Digite sua resposta...';

    const controls = document.createElement('div');
    controls.className = 'text-controls';

    const checkBtn = document.createElement('button');
    checkBtn.className = 'btn primary check-btn';
    checkBtn.type = 'button';
    checkBtn.textContent = 'Verificar';
    checkBtn.disabled = true;

    const hintBtn = document.createElement('button');
    hintBtn.className = 'btn hint-btn';
    hintBtn.type = 'button';
    hintBtn.textContent = 'Dica';
    hintBtn.style.display = q.hint ? 'inline-block' : 'none';

    const feedback = document.createElement('div');
    feedback.className = 'feedback';

    input.addEventListener('input', ()=>{
      checkBtn.disabled = sanitize(input.value).length === 0;
      feedback.textContent = '';
    });

    checkBtn.addEventListener('click', ()=>{
      const val = sanitize(input.value);
      const ok = q.answers.some(a => sanitize(a) === val);
      if(ok){
        feedback.textContent = 'Resposta correta!';
        feedback.classList.add('correct');
        setTimeout(()=>{
          current++;
          render();
        }, 600);
      } else {
        feedback.textContent = 'Resposta incorreta. Tente novamente.';
        feedback.classList.add('wrong');
        input.classList.add('shake');
        setTimeout(()=>input.classList.remove('shake'), 400);
      }
    });

    hintBtn.addEventListener('click', ()=>{
      feedback.innerHTML = q.hint.includes('http') ? `${escapeHtml(q.hint)}` : escapeHtml(q.hint);
      // se houver link, torna clicável (simples)
      if(q.hint.includes('http')){
        const urlMatch = q.hint.match(/https?:\/\/[\S]+/);
        if(urlMatch){
          feedback.innerHTML = `${escapeHtml(q.hint.replace(urlMatch[0], ''))} <a href="${urlMatch[0]}" target="_blank">${urlMatch[0]}</a>`;
        }
      }
    });

    controls.appendChild(checkBtn);
    controls.appendChild(hintBtn);

    optionsEl.appendChild(input);
    optionsEl.appendChild(controls);
    optionsEl.appendChild(feedback);

    input.focus();
    return;
  }

  // Suporte futuro para escolhas
  if(q.opts && Array.isArray(q.opts)){
    nextBtn.style.display = 'inline-block';
    nextBtn.disabled = true;
    q.opts.forEach((opt, i) => {
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.type = 'button';
      btn.textContent = opt;
      btn.addEventListener('click', () => select(i, btn));
      optionsEl.appendChild(btn);
    });
  }
}

function escapeHtml(str){
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function select(i, btn){
  document.querySelectorAll('.option-btn').forEach(b=>b.classList.remove('selected'));
  btn.classList.add('selected');
  nextBtn.disabled = false;
}

nextBtn.addEventListener('click', ()=>{
  // para escolhas apenas
  current++;
  render();
});

restartBtn.addEventListener('click', resetQuiz);
playAgain.addEventListener('click', resetQuiz);

function resetQuiz(){
  current = 0;
  endScreen.classList.add('hidden');
  quizCard.classList.remove('hidden');
  removeConfetti();
  render();
}

function showEnd(){
  quizCard.classList.add('hidden');
  endScreen.classList.remove('hidden');
  createConfetti();

  // Reproduz rugido externo ao desbloquear (tenta autoplay; se bloqueado, mostra botão para tocar manualmente)
  try{
    if(!window.__roarAudio){
      const a = new Audio(SOUND_URL);
      a.preload = 'auto';
      a.volume = 0.9;
      a.crossOrigin = 'anonymous';
      window.__roarAudio = a;

      // tratador de erro para mostrar estado
      a.addEventListener('error', ()=>{
        const status = document.getElementById('roarStatus');
        if(status) status.textContent = 'Erro ao carregar áudio.';
      });
    }
    window.__roarAudio.currentTime = 0;
    const playPromise = window.__roarAudio.play();
    if(playPromise && playPromise.catch){
      playPromise.then(()=>{
        // sucesso, nada a fazer
      }).catch(err => {
        console.warn('Áudio bloqueado pelo navegador:', err);
        const btn = document.getElementById('playRoar');
        const status = document.getElementById('roarStatus');
        if(btn) btn.style.display = 'inline-block';
        if(status) status.textContent = 'Clique para reproduzir o rugido (autoplay bloqueado)';
      });
    }
  }catch(e){
    console.warn('Erro ao tentar reproduzir rugido:', e);
    const btn = document.getElementById('playRoar');
    const status = document.getElementById('roarStatus');
    if(btn) btn.style.display = 'inline-block';
    if(status) status.textContent = 'Clique para reproduzir o rugido (erro)';
  }

  // Ready: se o botão já existir, adiciona evento de click para reproduzir
  const playRoarBtn = document.getElementById('playRoar');
  if(playRoarBtn){
    playRoarBtn.addEventListener('click', ()=>{
      if(!window.__roarAudio){
        window.__roarAudio = new Audio(SOUND_URL);
        window.__roarAudio.preload = 'auto';
        window.__roarAudio.volume = 0.9;
      }
      window.__roarAudio.play().then(()=>{
        const status = document.getElementById('roarStatus');
        if(status) status.textContent = 'Rugido reproduzido!';
        playRoarBtn.style.display = 'none';
      }).catch(err=>{
        console.warn('Erro ao reproduzir após clique:', err);
        const status = document.getElementById('roarStatus');
        if(status) status.textContent = 'Não foi possível reproduzir o áudio.';
      });
    });
  }
} 

// Confetti básico
function createConfetti(){
  const wrapper = document.createElement('div');
  wrapper.className = 'confetti';
  wrapper.id = 'confetti';
  const colors = ['#E08A24','#FDBB34','#F26B38','#1F9A6F','#6C3A2A'];
  for(let i=0;i<120;i++){
    const s = document.createElement('span');
    s.style.background = colors[Math.floor(Math.random()*colors.length)];
    s.style.left = Math.random()*100 + '%';
    s.style.top = -(Math.random()*20) + 'vh';
    s.style.width = (6+Math.random()*12)+'px';
    s.style.height = (8+Math.random()*16)+'px';
    s.style.transform = `rotate(${Math.random()*360}deg)`;
    s.style.animation = `fall ${4+Math.random()*3}s linear ${Math.random()*1}s forwards`;
    s.style.opacity = 0.95;
    wrapper.appendChild(s);
  }
  document.body.appendChild(wrapper);
}

function removeConfetti(){
  const c = document.getElementById('confetti');
  if(c) c.remove();
}

// Inicializa
render();
