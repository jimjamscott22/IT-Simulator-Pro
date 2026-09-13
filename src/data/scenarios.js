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
  },
  {
    id: 'default-gateway-missing',
    title: 'Missing Default Gateway',
    category: 'Network Admin',
    difficulty: 'Beginner',
    description: 'A user reports they can access local file shares but cannot browse the internet. Diagnose the network configuration issue.',
    type: 'terminal',
    initialState: 'Client is connected to the network and can reach local resources, but internet access is failing.',
    expectedCommands: ['ping 8.8.8.8', 'ipconfig'],
    solution: "The user's computer is missing a default gateway configuration, preventing traffic from leaving the local subnet.",
    feedback: 'In an interview, mention that if local resources are reachable but external ones are not, the first things to check are the Default Gateway and DNS. Running ipconfig would reveal the missing gateway immediately.'
  },
  {
    id: 'subnet-mask-mismatch',
    title: 'Subnet Mask Mismatch',
    category: 'Network Admin',
    difficulty: 'Advanced',
    description: 'A server with IP 10.0.0.50 was recently deployed, but clients on the 10.0.1.x subnet cannot reach it, whereas clients on the 10.0.0.x subnet can. Diagnose the issue.',
    type: 'terminal',
    initialState: 'Cross-subnet communication to a specific host is failing.',
    expectedCommands: ['ping 10.0.0.50', 'ipconfig /all'],
    solution: 'The server was configured with a /24 (255.255.255.0) subnet mask instead of a /16 (255.255.0.0), causing it to incorrectly treat the 10.0.1.x subnet as external and routing it to the default gateway, which drops the asymmetric traffic.',
    feedback: 'A classic routing/subnetting question! Always mention verifying the subnet mask when communication is successful locally but fails across subnets, especially in statically assigned server environments.'
  }
];
