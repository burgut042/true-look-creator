import { ReactNode } from "react";
import { GripVertical, RotateCcw } from "lucide-react";
import { useDraggable } from "@/hooks/useDraggable";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface DraggablePanelProps {
  children: ReactNode;
  storageKey: string;
  initialPosition?: { x: number; y: number };
  className?: string;
}

export const DraggablePanel = ({ 
  children, 
  storageKey, 
  initialPosition = { x: 0, y: 0 },
  className = ""
}: DraggablePanelProps) => {
  const { position, isDragging, dragRef, handleMouseDown, resetPosition, style } = useDraggable({
    initialPosition,
    storageKey,
  });

  const handleReset = () => {
    resetPosition();
    toast.info("Panel holati tiklandi");
  };

  return (
    <div
      ref={dragRef}
      onMouseDown={handleMouseDown}
      style={{
        ...style,
        transform: `translate(${position.x}px, ${position.y}px)`,
        left: 0,
        top: 0,
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
