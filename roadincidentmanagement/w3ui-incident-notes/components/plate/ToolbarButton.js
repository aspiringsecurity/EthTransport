
export default function ToolbarButton ({ className = 'w-7 h-7', active, ...props }) {
  const allClassNames = `${className} ${active ? 'text-blue-700' : ''}`

  return (
    <button
    className={allClassNames}
      {...props}
    />
  );
};