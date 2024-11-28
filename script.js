// HTML 요소 선택
const stage = document.getElementById('stage');

const uploadMR = document.getElementById('uploadMR');
const bgVolume = document.getElementById('bgVolume');
const mrVolume = document.getElementById('mrVolume');
const playButton = document.getElementById('playButton');


// load event
window.onload = () => {
  const stage = document.getElementById('stage');
  const imageUrl = './resource/background.webp';

  // 이미지 객체 생성
  const img = new Image();
  img.src = imageUrl;

  // 이미지가 로드된 후 백그라운드로 설정
  img.onload = () => {
    stage.style.backgroundImage = `url(${imageUrl})`;
    stage.style.backgroundSize = 'cover';
    stage.style.backgroundPosition = 'center';
  };

  // 이미지 로드 에러 처리
  img.onerror = () => {
    stage.textContent = '이미지를 불러올 수 없습니다.';
  };
};


// 오디오 객체 생성
let bgAudio = new Audio(); // 배경 소음
let mrAudio = new Audio(); // 노래 MR

// 배경 소음 파일 (예시용 - 온라인 경로 또는 로컬 추가 가능)
bgAudio.src = './resource/crowd_talking.mp3'; // 배경 소음 파일 경로
bgAudio.loop = true; // 배경 소음 반복 재생
bgAudio.volume = bgVolume.value;

// 배경 소음 볼륨 조정 이벤트
bgVolume.addEventListener('input', () => {
  bgAudio.volume = bgVolume.value;
});

// 노래 MR 업로드 처리
uploadMR.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (file) {
    const fileURL = URL.createObjectURL(file);
    mrAudio.src = fileURL;
  }
});

// 노래 MR 볼륨 조정 이벤트
mrVolume.addEventListener('input', () => {
  mrAudio.volume = mrVolume.value;
});

// 재생 버튼 이벤트
playButton.addEventListener('click', () => {
  // 배경 소음과 MR 재생
  if (bgAudio.paused) {
    bgAudio.play();
  }

  if (mrAudio.src) {
    mrAudio.play();
  } else {
    alert('노래 MR 파일을 업로드해주세요.');
  }
});



// 배경 이미지 click event
stage.addEventListener('click', () => {

  // 클릭 시 동작
  loadPopup();

});


// 팝업 닫기 함수
function closePopup() {
  const popup = document.getElementById('popup');
  if (popup) {
    popup.remove();
  }
}

// 탐색 버튼 설정 및 탐색 함수는 기존 코드 유지
let texts = []; // 동적으로 채울 배열
let currentIndex = 0;

function setupNavigation() {
  const content = document.getElementById('content');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');

  prevBtn.addEventListener('click', () => navigate(-1, content, prevBtn, nextBtn));
  nextBtn.addEventListener('click', () => navigate(1, content, prevBtn, nextBtn));

  // 초기 상태 설정
  if (texts.length > 0) {
    content.innerText = texts[currentIndex];
    prevBtn.disabled = true;
    nextBtn.disabled = texts.length === 1;
  }
}

function navigate(direction, content, prevBtn, nextBtn) {
  currentIndex += direction;
  content.innerText = texts[currentIndex];
  prevBtn.disabled = currentIndex === 0;
  nextBtn.disabled = currentIndex === texts.length - 1;
}

function loadTextsFromFile(filePath) {
  return fetch(filePath)
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to load text file');
      }
      return response.text();
    })
    .then(data => {
      // 텍스트를 배열로 변환 (줄바꿈 기준으로 나누기)
      texts = data.split(/<|>/).filter(line => line.trim() !== '');
    });
}

function loadPopup() {
  fetch('./popup/popup.html')
    .then(response => response.text())
    .then(data => {
      // 기존 팝업 제거
      const existingPopup = document.getElementById('popup');
      if (existingPopup) {
        existingPopup.remove();
      }

      // 팝업 삽입
      document.body.insertAdjacentHTML('beforeend', data);

      // 팝업 스타일 동적 추가
      const style = document.createElement('style');
      style.innerHTML = `
        .popup {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 350px;
          padding: 20px;
          border: 2px solid #007BFF;
          border-radius: 15px;
          background-color: #f9f9f9;
          box-shadow: 0 8px 15px rgba(0, 0, 0, 0.3);
          text-align: center;
          font-family: Arial, sans-serif;
        }
        .popup-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }
        .popup-title {
          font-size: 18px;
          font-weight: bold;
          margin: 0;
        }
        .close-btn {
          background: none;
          border: none;
          font-size: 20px;
          font-weight: bold;
          cursor: pointer;
          color: #007BFF;
        }
        .close-btn:hover {
          color: #0056b3;
        }
        .content {
          font-size: 16px;
          margin-bottom: 20px;
        }
        .buttons {
          margin-top: 10px;
        }
        button {
          margin: 0 10px;
          padding: 10px 20px;
          border: none;
          border-radius: 5px;
          background-color: #007BFF;
          color: white;
          cursor: pointer;
          font-size: 14px;
        }
        button:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }
        button:hover:not(:disabled) {
          background-color: #0056b3;
        }
      `;
      document.head.appendChild(style);

      // 텍스트 파일 로드 후 탐색 이벤트 설정
      loadTextsFromFile('./resource/storyboard.txt')
        .then(() => {
          setupNavigation();
        })
        .catch(error => console.error('Error loading texts:', error));
    })
    .catch(error => console.error('Error loading popup:', error));
}