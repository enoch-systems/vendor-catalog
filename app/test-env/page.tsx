'use client'

export default function TestEnv() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Environment Variables Test</h1>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>NEXT_PUBLIC_SUPABASE_URL:</strong> 
        <span style={{ color: supabaseUrl ? 'green' : 'red' }}>
          {supabaseUrl ? '✓ Present' : '✗ Missing'}
        </span>
        {supabaseUrl && <div style={{ fontSize: '12px', color: '#666' }}>{supabaseUrl}</div>}
      </div>

      <div style={{ marginBottom: '10px' }}>
        <strong>NEXT_PUBLIC_SUPABASE_ANON_KEY:</strong> 
        <span style={{ color: supabaseAnonKey ? 'green' : 'red' }}>
          {supabaseAnonKey ? '✓ Present' : '✗ Missing'}
        </span>
        {supabaseAnonKey && <div style={{ fontSize: '12px', color: '#666' }}>{supabaseAnonKey.substring(0, 20)}...</div>}
      </div>

      <div style={{ marginBottom: '10px' }}>
        <strong>SUPABASE_SERVICE_ROLE_KEY:</strong> 
        <span style={{ color: serviceRoleKey ? 'green' : 'red' }}>
          {serviceRoleKey ? '✓ Present' : '✗ Missing'}
        </span>
      </div>

      <div style={{ marginTop: '20px' }}>
        <a href="/" style={{ color: 'blue', textDecoration: 'underline' }}>Back to Home</a>
      </div>
    </div>
  )
}
