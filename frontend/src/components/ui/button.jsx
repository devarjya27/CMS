// Comic-book styled Button
function Button({ className = '', variant = 'default', size = 'default', ...props }) {
  const variantClass =
    variant === 'destructive' ? 'comic-btn-primary' :  // red-ish
    variant === 'outline'     ? 'comic-btn-outline' :
    variant === 'secondary'   ? 'comic-btn-secondary' :
    variant === 'ghost'       ? 'comic-btn-outline' :
    variant === 'accent'      ? 'comic-btn-accent' :
    'comic-btn-primary'

  const sizeStyle = size === 'sm' ? 'comic-btn-sm' : ''

  return (
    <button
      className={`comic-btn ${variantClass} ${sizeStyle} ${className}`}
      {...props}
    />
  )
}

export { Button }
