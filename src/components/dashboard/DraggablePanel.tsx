import { ReactNode } from "react";
import { GripVertical, RotateCcw } from "lucide-react";
import { useDraggable } from "@/hooks/useDraggable";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type AnchorPosition = 'top-left' | 'top-right' | 'top-center' | 'center-left' | 'center-right';

interface DraggablePanelProps {
  children: ReactNode;
  storageKey: string;
  anchor?: AnchorPosition;
  offsetX?: number;
  offsetY?: number;
  className?: string;
}

const getAnchorStyles = (anchor: AnchorPosition, offsetX: number, offsetY: number): React.CSSProperties => {
  const base: React.CSSProperties = { position: 'absolute' };
  
  switch (anchor) {
    case 'top-left':
      return { ...base, left: offsetX, top: offsetY };
    case 'top-right':
      return { ...base, right: offsetX, top: offsetY };
    case 'top-center':
      return { ...base, left: '50%', top: offsetY, transform: 'translateX(-50%)' };
    case 'center-left':
      return { ...base, left: offsetX, top: '50%', transform: 'translateY(-50%)' };
    case 'center-right':
      return { ...base, right: offsetX, top: '50%', transform: 'translateY(-50%)' };
    default:
      return { ...base, left: offsetX, top: offsetY };
  }
};

export const DraggablePanel = ({ 
  children, 
  storageKey, 
  anchor = 'top-left',
  offsetX = 16,
  offsetY = 16,
  className = ""
}: DraggablePanelProps) => {
  const { position, isDragging, dragRef, handleMouseDown, resetPosition } = useDraggable({
    initialPosition: { x: 0, y: 0 },
    storageKey,
  });

  const anchorStyles = getAnchorStyles(anchor, offsetX, offsetY);

  const handleReset = () => {
    resetPosition();
    toast.info("Panel holati tiklandi");
  };

  // Combine anchor transform with drag offset
  const getCombinedTransform = () => {
    const baseTransform = anchor === 'top-center' 
      ? 'translateX(-50%)' 
      : anchor === 'center-left' || anchor === 'center-right'
        ? 'translateY(-50%)'
        : '';
    
    if (position.x === 0 && position.y === 0) {
      return baseTransform || undefined;
    }
    
    return `${baseTransform} translate(${position.x}px, ${position.y}px)`.trim();
  };

  return (
    <div
      ref={dragRef}
      onMouseDown={handleMouseDown}
      style={{
        ...anchorStyles,
        transform: getCombinedTransform(),
      }}
      className={`group transition-shadow ${isDragging ? 'shadow-2xl ring-2 ring-primary/50' : ''} ${className}`}
    >
      {/* Drag Handle */}
      <div 
        data-drag-handle
        className="absolute -top-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing z-50"
      >
        <div className="flex items-center gap-1 bg-primary/90 text-primary-foreground rounded-full px-2 py-0.5 text-xs shadow-lg">
          <GripVertical className="w-3 h-3" />
          <span className="text-[10px]">Suring</span>
        </div>
      </div>

      {/* Reset Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={handleReset}
        className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 bg-secondary rounded-full z-50"
      >
        <RotateCcw className="w-3 h-3" />
      </Button>

      {children}
    </div>
  );
};
