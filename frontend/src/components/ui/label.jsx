// Comic-book styled Label
function Label({ className = '', ...props }) {
  return <label className={`comic-label ${className}`} {...props} />
}

export { Label }
