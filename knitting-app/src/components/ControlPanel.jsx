import React, { useState } from 'react';
import { getTrimmedTextCanvas } from '../utils/canvasHelpers';

const ControlPanel = ({ 
  mode, gridSize, setGridSize, onGenerate, 
  onUndo, onDownload, onSave, onLoad,
  tool, setTool, paintColor, setPaintColor 
}) => {
  const [imageFile, setImageFile] = useState(null);
  const [textInput, setTextInput] = useState('LOVE');
  const [fontFamily, setFontFamily] = useState('sans-serif');
  const [fontColor, setFontColor] = useState('#000000');

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleRunProcess = () => {
    if (mode === 'image') {
      if (!imageFile) return alert('이미지를 선택해주세요!');
      const img = new Image();
      img.onload = () => onGenerate({ type: 'image', img });
      img.src = URL.createObjectURL(imageFile);
    } else if (mode === 'text') {
      if (!textInput) return alert('텍스트를 입력해주세요!');
      const canvas = getTrimmedTextCanvas(textInput, fontFamily, fontColor);
      const img = new Image();
      img.onload = () => onGenerate({ type: 'text', img, targetColor: fontColor });
      img.src = canvas.toDataURL();
    } else {
      onGenerate({ type: 'manual' });
    }
  };

  const handleLoadFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        onLoad(data);
      } catch (err) {
        alert("파일 오류");
      }
    };
    reader.readAsText(file);
  };

  return (
    <>
      {mode === 'image' && (
        <div className="control-group" style={{ flex: 2 }}>
          <label>이미지 업로드</label>
          <input type="file" accept="image/*" onChange={handleFileChange} />
        </div>
      )}

      {mode === 'text' && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', flex: 2, alignItems: 'flex-end' }}>
          <div className="control-group" style={{ flexGrow: 1 }}>
            <label>텍스트 입력</label>
            <input type="text" value={textInput} onChange={(e) => setTextInput(e.target.value)} />
          </div>
          <div className="control-group">
            <label>글씨체</label>
            <select value={fontFamily} onChange={(e) => setFontFamily(e.target.value)}>
              <option value="sans-serif">기본 (고딕)</option>
              <option value="serif">세리프 (명조)</option>
              <option value="monospace">고정폭</option>
              <option value="cursive">필기체</option>
            </select>
          </div>
          <div className="control-group">
            <label>글씨색</label>
            <input type="color" value={fontColor} onChange={(e) => setFontColor(e.target.value)} />
          </div>
        </div>
      )}

      <div className="control-group">
        <label>가로 코 수</label>
        <input type="number" value={gridSize.width} min="5" max="100" onChange={(e) => setGridSize({...gridSize, width: parseInt(e.target.value) || 5})} />
      </div>
      <div className="control-group">
        <label>세로 코 수</label>
        <input type="number" value={gridSize.height} min="5" max="100" onChange={(e) => setGridSize({...gridSize, height: parseInt(e.target.value) || 5})} />
      </div>

      <div className="control-group">
        <button onClick={handleRunProcess}>도안 생성</button>
      </div>

      <div className="control-group" style={{ display: 'flex', gap: '5px' }}>
        <button className="secondary" onClick={onDownload} style={{ flex: 1 }}>다운로드</button>
        <button className="secondary" onClick={onSave} style={{ flex: 1 }}>저장</button>
        <label className="secondary button-label" style={{ flex: 1, textAlign:'center', cursor:'pointer' }}>
          불러오기
          <input type="file" accept=".json" style={{display:'none'}} onChange={handleLoadFile}/>
        </label>
      </div>

      <div className="control-group" style={{ display: 'flex', gap: '5px' }}>
        <button className="secondary" onClick={onUndo} style={{ flex: 1 }}>실행 취소</button>
        <button 
          className={`secondary ${tool === 'eraser' ? 'active-tool' : ''}`} 
          onClick={() => setTool(tool === 'eraser' ? 'paint' : 'eraser')} 
          style={{ flex: 1 }}
        >
          {tool === 'eraser' ? '지우개 ON' : '지우개'}
        </button>
      </div>

      <div className="control-group">
        <label>칠하기 색상</label>
        <input type="color" value={paintColor} onChange={(e) => setPaintColor(e.target.value)} style={{ padding: '2px', height: '42px', width: '100%', border: '1px solid var(--border)', borderRadius: '5px', boxSizing: 'border-box' }} />
      </div>
    </>
  );
};

export default ControlPanel;
