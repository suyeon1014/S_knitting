import React from 'react';

const Palette = ({ usedColors, addedColors, onSelectColor }) => {
  const renderSwatch = (color) => (
    <div 
      key={color}
      className="color-swatch"
      style={{ backgroundColor: color }}
      title={color}
      onClick={() => onSelectColor(color)}
    />
  );

  return (
    <div className="control-group" style={{ width: '100%' }}>
      <label>사용된 색상 (클릭하여 선택)</label>
      <div className="palette-container">
        {Array.from(usedColors).map(renderSwatch)}
      </div>
      <label style={{ marginTop: '10px', display: 'block' }}>추가된 색상</label>
      <div className="palette-container">
        {Array.from(addedColors).map(renderSwatch)}
      </div>
    </div>
  );
};

export default Palette;
