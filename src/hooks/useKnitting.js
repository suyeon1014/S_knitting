import { useState, useRef } from 'react';

function useKnitting() {
  const [gridSize, setGridSize] = useState({ width: 30, height: 30 });
  const [paintColor, setPaintColor] = useState('#ff6b6b');
  const [tool, setTool] = useState('paint');
  const [usedColors, setUsedColors] = useState(new Set());
  const [addedColors, setAddedColors] = useState(new Set());
  
  const canvasBoardRef = useRef();

  const handleGenerate = (data) => canvasBoardRef.current?.generatePattern(data);
  const handleUndo = () => canvasBoardRef.current?.undo();
  const handleDownload = () => canvasBoardRef.current?.download();
  const handleSaveProject = () => canvasBoardRef.current?.saveProject(usedColors, addedColors);
  const handleLoadProject = (data) => {
    setGridSize({ width: data.width, height: data.height });
    setUsedColors(new Set(data.usedColors));
    setAddedColors(new Set(data.addedColors));
    canvasBoardRef.current?.loadProject(data);
  };

  const handleClear = () => {
    if (window.confirm('캔버스를 모두 지우시겠습니까?')) {
      canvasBoardRef.current?.clear && canvasBoardRef.current.clear();
    }
  };

  return {
    gridSize, setGridSize, paintColor, setPaintColor, tool, setTool,
    usedColors, setUsedColors, addedColors, setAddedColors, canvasBoardRef,
    handleGenerate, handleUndo, handleDownload, handleSaveProject, handleLoadProject, handleClear
  };
}

export default useKnitting;