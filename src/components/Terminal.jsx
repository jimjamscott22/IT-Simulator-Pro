import { useState, useRef, useEffect } from 'react';

const mockFileSystem = {
  ping: 'Pinging portal.local [10.0.0.5] with 32 bytes of data:\nReply from 10.0.0.5: bytes=32 time=14ms TTL=117\nReply from 10.0.0.5: bytes=32 time=15ms TTL=117\n\nPing statistics for 10.0.0.5:\n    Packets: Sent = 2, Received = 2, Lost = 0 (0% loss)',
  nslookup: "Server:  UnKnown\nAddress:  8.8.8.8\n\n*** UnKnown can't find portal.local: Non-existent domain",
  ipconfig: 'Windows IP Configuration\n\nEthernet adapter Ethernet:\n   Connection-specific DNS Suffix  . : localdomain\n   IPv4 Address. . . . . . . . . . . : 192.168.1.100\n   Subnet Mask . . . . . . . . . . . : 255.255.255.0\n   Default Gateway . . . . . . . . . : 192.168.1.1\n   DNS Servers . . . . . . . . . . . : 8.8.8.8\n                                       8.8.4.4',
  help: 'Available commands: ping, nslookup, ipconfig, help, clear'
};

const dhcpMock = {
  ipconfig: 'Windows IP Configuration\n\nEthernet adapter Ethernet:\n   Connection-specific DNS Suffix  . : \n   Autoconfiguration IPv4 Address. . : 169.254.88.22\n   Subnet Mask . . . . . . . . . . . : 255.255.0.0\n   Default Gateway . . . . . . . . . : ',
  ping: 'Pinging 10.0.0.1 with 32 bytes of data:\nRequest timed out.\nRequest timed out.'
};

const gatewayMock = {
  ipconfig: 'Windows IP Configuration\n\nEthernet adapter Ethernet:\n   Connection-specific DNS Suffix  . : localdomain\n   IPv4 Address. . . . . . . . . . . : 192.168.1.105\n   Subnet Mask . . . . . . . . . . . : 255.255.255.0\n   Default Gateway . . . . . . . . . : \n   DNS Servers . . . . . . . . . . . : 192.168.1.1',
  ping: 'Pinging 8.8.8.8 with 32 bytes of data:\nTransmit failed. General failure.\nTransmit failed. General failure.'
};

const subnetMock = {
  ipconfig: 'Windows IP Configuration\n\nEthernet adapter Ethernet:\n   Connection-specific DNS Suffix  . : localdomain\n   IPv4 Address. . . . . . . . . . . : 10.0.1.25\n   Subnet Mask . . . . . . . . . . . : 255.255.255.0\n   Default Gateway . . . . . . . . . : 10.0.1.1',
  ping: 'Pinging 10.0.0.50 with 32 bytes of data:\nReply from 10.0.1.1: Destination host unreachable.\nReply from 10.0.1.1: Destination host unreachable.'
};

export default function Terminal({ expectedCommands }) {
  const [history, setHistory] = useState([
    { type: 'system', text: 'Terminal ready. Type "help" for available commands.' }
  ]);
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleCommand = (e) => {
    if (e.key === 'Enter') {
      const cmd = input.trim().toLowerCase();
      setInput('');
      
      if (!cmd) return;

      const newHistory = [...history, { type: 'input', text: `C:\\Users\\Admin> ${cmd}` }];

      if (cmd === 'clear') {
        setHistory([]);
        return;
      }

      // Check for partial matches
      let output = 'Command not recognized.';
      const baseCmd = cmd.split(' ')[0];
      
      // Determine which mock to use based on expected commands
      const useDhcpMock = expectedCommands.includes('ping 10.0.0.1');
      const useGatewayMock = expectedCommands.includes('ping 8.8.8.8');
      const useSubnetMock = expectedCommands.includes('ping 10.0.0.50');
      
      let mockSrc = mockFileSystem;
      if (useDhcpMock) mockSrc = dhcpMock;
      if (useGatewayMock) mockSrc = gatewayMock;
      if (useSubnetMock) mockSrc = subnetMock;

      if (mockSrc[baseCmd]) {
        output = mockSrc[baseCmd];
      }

      newHistory.push({ type: 'output', text: output });
      setHistory(newHistory);
    }
  };

  return (
    <div className="terminal-container glass-panel">
      <div className="terminal-header">
        <span className="dot red"></span>
        <span className="dot yellow"></span>
        <span className="dot green"></span>
        <span className="title">Command Prompt</span>
      </div>
      <div className="terminal-body" onClick={() => document.getElementById('term-input').focus()}>
        {history.map((line, i) => (
          <div key={i} className={`terminal-line ${line.type}`}>
            {line.text}
          </div>
        ))}
        <div className="terminal-input-line">
          <span className="prompt">C:\Users\Admin&gt;</span>
          <input 
            id="term-input"
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleCommand}
            autoFocus
            autoComplete="off"
            spellCheck="false"
          />
        </div>
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
