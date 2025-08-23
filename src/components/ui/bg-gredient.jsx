export const Component = ({ 
  className = "",
  gradientFrom = "#fff",
  gradientTo = "#63e",
  gradientSize = "125% 125%",
  gradientPosition = "50% 10%",
  gradientStop = "40%"
}) => {
  return (
    <div
      className={`fixed inset-0 w-full h-full pointer-events-none ${className}`}
      style={{
        background: `radial-gradient(${gradientSize} at ${gradientPosition}, ${gradientFrom} ${gradientStop}, ${gradientTo} 100%)`,
        zIndex: -1
      }} />
  );
};