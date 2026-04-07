// Comic-book styled Input
function Input({ className = '', ...props }) {
  return <input className={`comic-input ${className}`} {...props} />
}

export { Input }
