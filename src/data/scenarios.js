export const scenarios = [
  {
    id: 'dns-troubleshooting',
    title: 'DNS Resolution Failure',
    category: 'Network Admin',
    difficulty: 'Intermediate',
    description: 'A user reports they cannot access the internal intranet portal at "portal.local", but they can access the internet. Troubleshoot the issue using the terminal.',
    type: 'terminal',
    initialState: 'User is connected to the network but DNS is misconfigured on their machine.',
    expectedCommands: ['ping portal.local', 'nslookup portal.local', 'ipconfig /all'],
    solution: "The user's DNS server was manually set to 8.8.8.8 instead of the internal DNS server (10.0.0.5).",
    feedback: 'Good approach checking DNS resolution. In an interview, mention that you would first verify connectivity with ping, then check DNS resolution with nslookup, and finally check the adapter settings with ipconfig/ifconfig to see if the DNS server is pointing to the internal domain controller rather than a public one.'
  },
  {
    id: 'dhcp-exhaustion',
    title: 'DHCP Pool Exhaustion',
    category: 'Network Admin',
    difficulty: 'Hard',
    description: 'Multiple users in the Marketing department are reporting they have "No Internet Access" and are getting 169.254.x.x IP addresses. Diagnose the issue.',
    type: 'terminal',
    initialState: 'Clients are receiving APIPA addresses.',
    expectedCommands: ['ipconfig', 'ping 10.0.0.1'],
    solution: 'The DHCP scope for the Marketing VLAN is exhausted because the lease time is set too high (30 days) for a highly dynamic environment with many mobile devices.',
    feedback: 'In an interview, noticing an APIPA (169.254.x.x) address immediately points to DHCP issues. You should mention checking the DHCP server scopes, lease times, and looking for rogue DHCP servers or exhausted pools.'
  }
];
