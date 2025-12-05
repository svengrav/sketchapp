type ProgressBarProps = {
  progress: number;
};

export function ProgressBar({ progress }: ProgressBarProps) {
  // Verbleibende Zeit: 100% - Fortschritt = von rechts nach links abnehmend
  const remaining = 100 - progress;
  
  return (
    <div className="absolute bottom-0 left-0 right-0 h-2 bg-black/30">
      <div
        className="h-full bg-white/80 transition-all duration-1000 ease-linear ml-auto"
        style={{ width: `${remaining}%` }}
      />
    </div>
  );
}
