import { useState, useRef, useCallback, useEffect } from "react";

interface Position {
  x: number;
  y: number;
}

interface UseDraggableOptions {
  initialPosition?: Position;
  storageKey?: string;
}

export const useDraggable = (options: UseDraggableOptions = {}) => {
  const { initialPosition = { x: 0, y: 0 }, storageKey } = options;
  
  // Load saved position from localStorage
  const getSavedPosition = (): Position => {
    if (!storageKey) return initialPosition;
    const saved = localStorage.getItem(`panel-position-${storageKey}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return initialPosition;
      }
    }
    return initialPosition;
  };

  const [position, setPosition] = useState<Position>(getSavedPosition);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);
  const dragOffset = useRef<Position>({ x: 0, y: 0 });

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!dragRef.current) return;
    
    // Only start drag if clicking on the drag handle
    const target = e.target as HTMLElement;
    if (!target.closest('[data-drag-handle]')) return;
    
    e.preventDefault();
    setIsDragging(true);
    
    const rect = dragRef.current.getBoundingClientRect();
    dragOffset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !dragRef.current) return;
    
    const parent = dragRef.current.parentElement;
    if (!parent) return;
    
    const parentRect = parent.getBoundingClientRect();
    const elementRect = dragRef.current.getBoundingClientRect();
    
    let newX = e.clientX - parentRect.left - dragOffset.current.x;
    let newY = e.clientY - parentRect.top - dragOffset.current.y;
    
    // Constrain within parent bounds
    newX = Math.max(0, Math.min(newX, parentRect.width - elementRect.width));
    newY = Math.max(0, Math.min(newY, parentRect.height - elementRect.height));
    
    setPosition({ x: newX, y: newY });
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    if (isDragging && storageKey) {
      localStorage.setItem(`panel-position-${storageKey}`, JSON.stringify(position));
    }
    setIsDragging(false);
  }, [isDragging, position, storageKey]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const resetPosition = useCallback(() => {
    setPosition(initialPosition);
    if (storageKey) {
      localStorage.removeItem(`panel-position-${storageKey}`);
    }
  }, [initialPosition, storageKey]);

  return {
    position,
    isDragging,
    dragRef,
    handleMouseDown,
    resetPosition,
    style: {
      position: 'absolute' as const,
      left: position.x,
      top: position.y,
      cursor: isDragging ? 'grabbing' : 'default',
      zIndex: isDragging ? 100 : 10,
    },
  };
};
