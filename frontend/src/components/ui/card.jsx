function Card({ className = '', style = {}, ...props }) {
  return (
    <div
      className={`comic-card ${className}`}
      style={style}
      {...props}
    />
  )
}

function CardHeader({ className = '', style = {}, ...props }) {
  return (
    <div
      className={className}
      style={{ padding: '16px 20px 8px', ...style }}
      {...props}
    />
  )
}

function CardTitle({ className = '', style = {}, ...props }) {
  return (
    <h3
      className={className}
      style={{
        fontSize: '1.05rem',
        fontWeight: 700,
        color: '#111',
        margin: 0,
        ...style,
      }}
      {...props}
    />
  )
}

function CardDescription({ className = '', style = {}, ...props }) {
  return <p className={className} style={{ color: '#555', fontWeight: 500, ...style }} {...props} />
}

function CardContent({ className = '', style = {}, ...props }) {
  // If className contains 'p-0', apply zero padding; otherwise default padding
  const hasPZero = className.includes('p-0')
  return (
    <div
      className={className}
      style={{ padding: hasPZero ? 0 : '8px 20px 16px', ...style }}
      {...props}
    />
  )
}

function CardFooter({ className = '', style = {}, ...props }) {
  return <div className={className} style={{ padding: '8px 20px 16px', display: 'flex', alignItems: 'center', ...style }} {...props} />
}

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }
