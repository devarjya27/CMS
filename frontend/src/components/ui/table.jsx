// Comic-book styled Table components
function Table({ className = '', ...props }) {
  return (
    <div style={{ overflowX: 'auto', width: '100%', borderRadius: '0 0 8px 8px', overflow: 'hidden' }}>
      <table
        className={`comic-table ${className}`}
        style={{ width: '100%', borderCollapse: 'collapse' }}
        {...props}
      />
    </div>
  )
}

function TableHeader({ ...props }) {
  return <thead {...props} />
}

function TableBody({ ...props }) {
  return <tbody {...props} />
}

function TableHead({ className = '', style = {}, ...props }) {
  return (
    <th
      className={className}
      style={{ textAlign: 'center', ...style }}
      {...props}
    />
  )
}

function TableRow({ className = '', ...props }) {
  return <tr className={className} {...props} />
}

function TableCell({ className = '', style = {}, ...props }) {
  return (
    <td
      className={className}
      style={{ textAlign: 'center', ...style }}
      {...props}
    />
  )
}

export { Table, TableHeader, TableBody, TableHead, TableRow, TableCell }
