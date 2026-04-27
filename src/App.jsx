import React, { useState } from 'react';
import './App.css'
import ImagePage from './pages/ImagePage';
import TextPage from './pages/TextPage';
import ManualPage from './pages/ManualPage';
import CommunityPage from './pages/CommunityPage';

function App() {
  const [mainTab, setMainTab] = useState('home'); // 'home', 'generation', 'community'
  const [mode, setMode] = useState('image');

  return (
    <div className="app-wrapper">
      {/* 상단 네비게이션 헤더 */}
      <header className="app-header">
        <div className="header-container">
          <h1 className="logo" onClick={() => setMainTab('home')}>S-Knitting</h1>
          <nav className="header-nav">
            <button className={`nav-btn ${mainTab === 'generation' ? 'active' : ''}`} onClick={() => setMainTab('generation')}>도안 만들기</button>
            <button className={`nav-btn ${mainTab === 'community' ? 'active' : ''}`} onClick={() => setMainTab('community')}>도안 자랑하기</button>
          </nav>
        </div>
      </header>

      {/* 메인 콘텐츠 영역 */}
      <main className="app-main">
        {mainTab === 'home' && (
          <div className="hero-section">
            <h2>나만의 뜨개 도안, 쉽고 빠르게</h2>
            <p>
              이미지를 변환하거나 글자를 입력해서 나만의 뜨개 도안을 만들어보세요.<br/>
              내가 만든 도안을 자랑하고, 다른 사람들의 멋진 도안도 구경할 수 있어요!
            </p>
            <div className="hero-buttons">
              <button className="primary-btn" onClick={() => setMainTab('generation')}>도안 만들기 시작</button>
              <button className="secondary-btn" onClick={() => setMainTab('community')}>도안 자랑하기 구경</button>
            </div>

            {/* 사이트 이용 방법 섹션 */}
            <div className="how-to-use">
              <h3>💡 이렇게 사용해보세요!</h3>
              <div className="steps-container">
                <div className="step-card">
                  <div className="step-icon">1️⃣</div>
                  <h4>모드 선택</h4>
                  <p>이미지 변환, 글자 입력, 또는 직접 그리기 중 원하는 방식을 선택하세요.</p>
                </div>
                <div className="step-card">
                  <div className="step-icon">2️⃣</div>
                  <h4>도안 편집</h4>
                  <p>생성된 도안을 캔버스에서 수정하고, 팔레트에서 색상을 변경해보세요.</p>
                </div>
                <div className="step-card">
                  <div className="step-icon">3️⃣</div>
                  <h4>저장 및 공유</h4>
                  <p>완성된 도안을 기기에 다운로드하거나 커뮤니티에 자랑해보세요!</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {mainTab === 'generation' && (
          <div className="container" style={{ margin: '0 auto' }}>
            {/* 불필요한 박스를 지우고 탭만 깔끔하게 가운데 정렬 */}
            <div className="tabs" style={{ justifyContent: 'center', marginBottom: '20px' }}>
              <button className={`tab-btn ${mode === 'image' ? 'active' : ''}`} onClick={() => setMode('image')}>이미지로 만들기</button>
              <button className={`tab-btn ${mode === 'text' ? 'active' : ''}`} onClick={() => setMode('text')}>글자로 만들기</button>
              <button className={`tab-btn ${mode === 'manual' ? 'active' : ''}`} onClick={() => setMode('manual')}>직접 만들기</button>
            </div>
            {mode === 'image' && <ImagePage />}
            {mode === 'text' && <TextPage />}
            {mode === 'manual' && <ManualPage />}
          </div>
        )}

        {mainTab === 'community' && (
          <div className="container" style={{ margin: '0 auto' }}><CommunityPage /></div>
        )}
      </main>
    </div>
  )
}

export default App
