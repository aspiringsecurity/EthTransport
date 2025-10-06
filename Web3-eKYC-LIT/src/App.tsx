import { ConnectButton } from '@rainbow-me/rainbowkit';
import HandleKYC from './components/HandleKYC'; // Make sure the path is correct

function App() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Top Bar */}
      <header
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          padding: '1rem',
          borderBottom: '1px solid #eaeaea',
          backgroundColor: '#fff',
          position: 'sticky',
          top: 0,
          zIndex: 1000,
        }}
      >
        <ConnectButton />
      </header>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '2rem' }}>
        <HandleKYC />
      </main>
    </div>
  );
}

export default App;
