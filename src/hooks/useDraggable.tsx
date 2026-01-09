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
    e.stopPropagation();
    setIsDragging(true);
    
    // Use page coordinates for consistent positioning
    const rect = dragRef.current.getBoundingClientRect();
    dragOffset.current = {
      x: e.pageX - rect.left - window.scrollX,
      y: e.pageY - rect.top - window.scrollY,
    };
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !dragRef.current) return;
    
    e.preventDefault();
    
    const parent = dragRef.current.parentElement;
    if (!parent) return;
    
    const parentRect = parent.getBoundingClientRect();
    const elementRect = dragRef.current.getBoundingClientRect();
    
    // Calculate new position relative to initial anchor point
    let newX = e.pageX - parentRect.left - dragOffset.current.x - window.scrollX;
    let newY = e.pageY - parentRect.top - dragOffset.current.y - window.scrollY;
    
    // Constrain within parent bounds with some padding
    const padding = 10;
    newX = Math.max(-padding, Math.min(newX, parentRect.width - elementRect.width + padding));
    newY = Math.max(-padding, Math.min(newY, parentRect.height - elementRect.height + padding));
    
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
