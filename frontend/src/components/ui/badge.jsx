// Comic-book styled Badge
function Badge({ className = '', variant = 'default', ...props }) {
  const variantClass =
    variant === 'secondary'   ? 'comic-badge-secondary' :
    variant === 'destructive' ? 'comic-badge-danger' :
    variant === 'outline'     ? 'comic-badge-outline' :
    variant === 'accent'      ? 'comic-badge-accent' :
    variant === 'success'     ? 'comic-badge-success' :
    'comic-badge-primary'

  return <div className={`comic-badge ${variantClass} ${className}`} {...props} />
}

export { Badge }
