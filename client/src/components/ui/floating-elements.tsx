export default function FloatingElements() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      <div className="absolute top-10 right-10 w-32 h-32 rounded-full moonlight-glow animate-float"></div>
      <div 
        className="absolute bottom-20 left-10 w-24 h-24 rounded-full moonlight-glow animate-float" 
        style={{ animationDelay: "1s" }}
      ></div>
      <div 
        className="absolute top-1/2 left-1/2 w-40 h-40 rounded-full moonlight-glow animate-float" 
        style={{ animationDelay: "2s" }}
      ></div>
    </div>
  );
}
