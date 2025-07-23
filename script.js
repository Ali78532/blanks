let correctAnswers = [];
let times = [];
let words = [];
let finalScore = 0;

const videoScreen = document.getElementById('video-screen');
const quizScreen  = document.getElementById('quiz-screen');
const startBtn    = document.getElementById('start-btn');
const choicesEl   = document.getElementById('choices');
const questionsEl = document.getElementById('questions');
const resultBtn   = document.getElementById('result-button');
const showScoreBtn= document.getElementById('show-score-btn');
const showSolBtn  = document.getElementById('show-sol-btn');
const resultEl    = document.getElementById('result');
const spinner     = document.getElementById('spinner');
const iframe      = document.getElementById('quiz-video');

// تحميل البيانات
const params   = new URLSearchParams(window.location.search);
const testName = params.get('test') || 'test1';
fetch(`tests/${testName}.html`)
  .then(r => r.ok ? r.text() : Promise.reject())
  .then(html => {
    const tmp = document.createElement('div'); tmp.innerHTML = html;
    const data = JSON.parse(tmp.querySelector('#test-data').textContent);
    words = data.words; times = data.questions;
    correctAnswers = times.map(q => q.correct);
  })
  .catch(() => alert('تعذر تحميل الاختبار'));

// إخفاء السبنير عند جاهزية الفيديو
iframe.addEventListener('load', () => spinner.style.display = 'none');

startBtn.onclick = () => {
  spinner.style.display = 'block';
  iframe.src = iframe.src;
  videoScreen.classList.add('hidden');
  quizScreen.classList.remove('hidden');
  renderQuiz();
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

function shuffle(arr) { for(let i=arr.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [arr[i],arr[j]]=[arr[j],arr[i]]; }}

function renderQuiz() {
  finalScore = 0;
  resultBtn.style.display = 'none';
  showScoreBtn.style.display = 'none';
  showSolBtn.style.display = 'none';
  resultEl.style.display = 'none';
  quizScreen.classList.remove('center-screen');
  choicesEl.innerHTML = '';
  questionsEl.innerHTML = '';

  const shuffled = [...words]; shuffle(shuffled);
  shuffled.forEach(w => {
    const btn = document.createElement('div'); btn.className='choice'; btn.textContent=w;
    btn.onclick = () => fillBlank(w);
    choicesEl.appendChild(btn);
  });

  times.forEach(q => {
    const qc = document.createElement('div'); qc.className='question-container';
    qc.innerHTML = q.question.replace(/_/g,'<span class="blank"></span>');
    questionsEl.appendChild(qc);
  });
}

function fillBlank(word) {
  const blank = document.querySelector('.blank:not(.filled)');
  if (!blank) return;
  blank.textContent = word;
  blank.classList.add('filled');
  blank.onclick = () => removeWord(blank);
  checkComplete();
}

function removeWord(blank) {
  blank.textContent = '';
  blank.classList.remove('filled');
  checkComplete();
}

function checkComplete() {
  const all = [...document.querySelectorAll('.blank')].every(b => b.textContent);
  resultBtn.style.display = all ? 'block' : 'none';
}

resultBtn.onclick = () => {
  let score = 0;
  document.querySelectorAll('.correct-answer, .user-correct').forEach(el => el.remove());
  document.querySelectorAll('.blank').forEach((b,i) => {
    if (b.textContent === correctAnswers[i]) {
      score += 2;
      const ok = document.createElement('div'); ok.className='user-correct'; ok.textContent='إجابتك صحيحة';
      b.parentElement.append(ok);
    } else {
      const ko = document.createElement('div'); ko.className='correct-answer';
      ko.textContent = `الإجابة الصحيحة: ${correctAnswers[i]}`;
      b.parentElement.append(ko);
      b.classList.add('incorrect');
    }
  });
  finalScore = score;
  resultBtn.style.display = 'none';
  showScoreBtn.style.display = 'block';
};

showScoreBtn.onclick = () => {
  document.querySelectorAll('.question-container').forEach(el => el.style.display='none');
  choicesEl.style.display = 'none';
  showScoreBtn.style.display = 'none';
  resultEl.textContent = `درجتك ${finalScore}`;
  resultEl.style.display = 'block';
  showSolBtn.style.display = 'inline-block';
  quizScreen.classList.add('center-screen');
};

showSolBtn.onclick = () => {
  document.querySelectorAll('.question-container').forEach(el => el.style.display='block');
  choicesEl.style.display = 'flex';
  resultEl.style.display = 'none';
  showSolBtn.style.display = 'none';
  resultBtn.style.display = 'none';
  showScoreBtn.style.display = 'block';
  quizScreen.classList.remove('center-screen');
};