import React from 'react';

// 가상의 도안 데이터 (추후 백엔드 데이터로 교체될 부분)
const MOCK_PATTERNS = [
  { id: 1, title: '귀여운 고양이 파우치', author: '뜨개냥', likes: 124, tags: ['동물', '파우치'], image: 'https://via.placeholder.com/300x300/F5E9E2/8B5E3C?text=Cat+Pouch' },
  { id: 2, title: '포근한 겨울 목도리', author: '겨울밤', likes: 89, tags: ['목도리', '겨울'], image: 'https://via.placeholder.com/300x300/C97A63/FFFFFF?text=Winter+Scarf' },
  { id: 3, title: '레트로 체크무늬 담요', author: '빈티지러버', likes: 256, tags: ['담요', '인테리어'], image: 'https://via.placeholder.com/300x300/E5D7CE/4A3E39?text=Check+Blanket' },
  { id: 4, title: '봄꽃 미니 가방', author: '블라썸', likes: 42, tags: ['가방', '꽃'], image: 'https://via.placeholder.com/300x300/F5E9E2/8B5E3C?text=Flower+Bag' },
  { id: 5, title: '알록달록 수세미', author: '주방요정', likes: 18, tags: ['수세미', '소품'], image: 'https://via.placeholder.com/300x300/C97A63/FFFFFF?text=Dish+Sponge' },
  { id: 6, title: '심플 비니 모자', author: '모자장수', likes: 112, tags: ['모자', '가을'], image: 'https://via.placeholder.com/300x300/E5D7CE/4A3E39?text=Simple+Beanie' },
];

function CommunityPage() {
  return (
    <div className="community-container">
      {/* 커뮤니티 상단 헤더 */}
      <div className="community-header">
        <h2>🌐 도안 갤러리</h2>
        <p>다른 사용자들이 만든 멋진 도안을 구경하고 영감을 얻어보세요!</p>
        <div className="community-actions">
          <button className="primary-btn">내 도안 업로드</button>
        </div>
      </div>

      {/* 도안 카드 그리드 */}
      <div className="gallery-grid">
        {MOCK_PATTERNS.map((pattern) => (
          <div key={pattern.id} className="pattern-card">
            <div className="pattern-image-wrapper">
              <img src={pattern.image} alt={pattern.title} className="pattern-image" />
            </div>
            <div className="pattern-info">
              <h3 className="pattern-title">{pattern.title}</h3>
              <p className="pattern-author">by {pattern.author}</p>
              <div className="pattern-meta">
                <span className="pattern-likes">❤️ {pattern.likes}</span>
                <div className="pattern-tags">
                  {pattern.tags.map((tag) => (
                    <span key={tag} className="tag">#{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CommunityPage;