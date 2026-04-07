// Comic-book styled Dialog
function Dialog({ open, onClose, children }) {
  if (!open) return null
  return (
    <div className="comic-dialog-overlay" onClick={onClose}>
      <div onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}

function DialogContent({ className = '', children, ...props }) {
  return (
    <div className={`comic-dialog-box ${className}`} {...props}>
      {children}
    </div>
  )
}

function DialogHeader({ children }) {
  return <div style={{ marginBottom: 16 }}>{children}</div>
}

function DialogTitle({ children }) {
  return <div className="comic-dialog-title">{children}</div>
}

function DialogFooter({ children }) {
  return <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>{children}</div>
}

export { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter }
