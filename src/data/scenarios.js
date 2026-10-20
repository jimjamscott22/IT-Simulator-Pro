// Scenario definitions.
//
// `commands` maps typed commands to simulated output. See src/lib/commands.js:
//   'ping portal.local' - exact match (extra flags are ignored)
//   'ping *'            - any other ping target; {args} is replaced with what was typed
//   'ping'              - bare command (falls back to the shared usage text if omitted)
//
// `expectedCommands` are the key diagnostic steps. The player tracks which ones
// the learner ran and scores them when the scenario is resolved.

export const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

const NET_USAGE = 'The syntax of this command is:\n\nNET\n    [ ACCOUNTS | COMPUTER | CONFIG | CONTINUE | FILE | GROUP | HELP |\n      HELPMSG | LOCALGROUP | PAUSE | SESSION | SHARE | START |\n      STATISTICS | STOP | TIME | USE | USER | VIEW ]';

const pingOk = (target, ip, ttl = 128, ms = '<1ms') =>
  `Pinging ${target}${ip ? ` [${ip}]` : ''} with 32 bytes of data:\nReply from ${ip || target}: bytes=32 time${ms} TTL=${ttl}\nReply from ${ip || target}: bytes=32 time${ms} TTL=${ttl}\n\nPing statistics for ${ip || target}:\n    Packets: Sent = 2, Received = 2, Lost = 0 (0% loss)`;

const pingTimeout = (target, ip) =>
  `Pinging ${target}${ip ? ` [${ip}]` : ''} with 32 bytes of data:\nRequest timed out.\nRequest timed out.\n\nPing statistics for ${ip || target}:\n    Packets: Sent = 2, Received = 0, Lost = 2 (100% loss)`;

export const scenarios = [
  {
    id: 'dns-troubleshooting',
    title: 'DNS Resolution Failure',
    category: 'Network Admin',
    difficulty: 'Intermediate',
    description: 'A user reports they cannot access the internal intranet portal at "portal.local", but they can browse the internet normally. Troubleshoot the issue using the terminal.',
    type: 'terminal',
    initialState: "You are on the user's workstation. The internal DNS server / domain controller is DC01 at 10.0.0.5.",
    expectedCommands: ['ping portal.local', 'nslookup portal.local', 'ipconfig /all'],
    commands: {
      'ping portal.local': 'Ping request could not find host portal.local. Please check the name and try again.',
      'ping 10.0.0.5': pingOk('10.0.0.5', null, 128, '=1ms'),
      'ping 10.0.0.20': pingOk('10.0.0.20', null, 128, '=1ms'),
      'ping *': pingOk('{args}', null, 117, '=18ms'),
      'nslookup portal.local 10.0.0.5': 'Server:  dc01.corp.local\nAddress:  10.0.0.5\n\nName:    portal.local\nAddress:  10.0.0.20',
      'nslookup portal.local': "Server:  dns.google\nAddress:  8.8.8.8\n\n*** dns.google can't find portal.local: Non-existent domain",
      'nslookup *': 'Server:  dns.google\nAddress:  8.8.8.8\n\nNon-authoritative answer:\nName:    {args}\nAddress:  142.250.80.46',
      nslookup: 'Default Server:  dns.google\nAddress:  8.8.8.8\n\n> (interactive mode is not simulated - try "nslookup portal.local")',
      'ipconfig /all': 'Windows IP Configuration\n\n   Host Name . . . . . . . . . . . . : WS-ACCT-14\n   Primary Dns Suffix  . . . . . . . : corp.local\n\nEthernet adapter Ethernet:\n   Connection-specific DNS Suffix  . : corp.local\n   DHCP Enabled. . . . . . . . . . . : Yes\n   IPv4 Address. . . . . . . . . . . : 10.0.0.114\n   Subnet Mask . . . . . . . . . . . : 255.255.255.0\n   Default Gateway . . . . . . . . . : 10.0.0.1\n   DHCP Server . . . . . . . . . . . : 10.0.0.5\n   DNS Servers . . . . . . . . . . . : 8.8.8.8\n                                       8.8.4.4',
      ipconfig: 'Windows IP Configuration\n\nEthernet adapter Ethernet:\n   Connection-specific DNS Suffix  . : corp.local\n   IPv4 Address. . . . . . . . . . . : 10.0.0.114\n   Subnet Mask . . . . . . . . . . . : 255.255.255.0\n   Default Gateway . . . . . . . . . : 10.0.0.1'
    },
    solution: "The user's DNS servers were manually set to Google (8.8.8.8 / 8.8.4.4) instead of the internal DNS server (10.0.0.5). Public DNS can resolve internet names but knows nothing about the internal portal.local zone. Set the adapter back to obtain DNS automatically (or point it at 10.0.0.5).",
    feedback: 'Strong answers narrow it down layer by layer: the portal fails by name, but internet sites work and the DNS server answers ping by IP, so connectivity is fine. nslookup fails against the default server but succeeds when you query 10.0.0.5 directly, and ipconfig /all shows the public DNS servers. Mention that a DHCP-enabled machine with static DNS overrides usually means someone changed it by hand.'
  },
  {
    id: 'dhcp-exhaustion',
    title: 'DHCP Pool Exhaustion',
    category: 'Network Admin',
    difficulty: 'Advanced',
    description: 'Multiple users in the Marketing department are reporting "No Internet Access" and are getting 169.254.x.x IP addresses. Diagnose the issue.',
    type: 'terminal',
    initialState: "You're at an affected Marketing laptop (VLAN 20, scope 10.0.20.0/24). Your admin tools can still reach the DHCP server, DHCP01, over the management network.",
    expectedCommands: ['ipconfig', 'ipconfig /renew', 'netsh dhcp server \\\\dhcp01 show mibinfo', 'netsh dhcp server \\\\dhcp01 scope 10.0.20.0 show optionvalue'],
    commands: {
      'ipconfig /all': 'Windows IP Configuration\n\nEthernet adapter Ethernet:\n   Connection-specific DNS Suffix  . : \n   DHCP Enabled. . . . . . . . . . . : Yes\n   Autoconfiguration Enabled . . . . : Yes\n   Autoconfiguration IPv4 Address. . : 169.254.88.22(Preferred)\n   Subnet Mask . . . . . . . . . . . : 255.255.0.0\n   Default Gateway . . . . . . . . . : \n   DHCP Server . . . . . . . . . . . : \n   DNS Servers . . . . . . . . . . . : ',
      'ipconfig /renew': 'Windows IP Configuration\n\nAn error occurred while renewing interface Ethernet : unable to contact your DHCP server. Request has timed out.',
      'ipconfig /release': 'Windows IP Configuration\n\nThe operation failed as no adapter is in the state permissible for this operation.',
      ipconfig: 'Windows IP Configuration\n\nEthernet adapter Ethernet:\n   Connection-specific DNS Suffix  . : \n   Autoconfiguration IPv4 Address. . : 169.254.88.22\n   Subnet Mask . . . . . . . . . . . : 255.255.0.0\n   Default Gateway . . . . . . . . . : ',
      'ping *': pingTimeout('{args}'),
      'netsh dhcp server \\\\dhcp01 show mibinfo': 'MIBCounts:\n        Discovers = 18422.\n        Offers = 9810.\n        Requests = 9790.\n        Acks = 9788.\n        Naks = 2.\n        Declines = 0.\n        Releases = 41.\n        ServerStartTime = Monday, September 14, 2026 7:02:11 AM\n        Scopes = 3.\n        Subnet = 10.0.10.0.\n                No. of Addresses in use = 88.\n                No. of free Addresses = 165.\n                No. of pending offers = 0.\n        Subnet = 10.0.20.0.\n                No. of Addresses in use = 253.\n                No. of free Addresses = 0.\n                No. of pending offers = 0.\n        Subnet = 10.0.30.0.\n                No. of Addresses in use = 51.\n                No. of free Addresses = 202.\n                No. of pending offers = 0.\n\nCommand completed successfully.',
      'netsh dhcp server \\\\dhcp01 scope 10.0.20.0 show optionvalue': 'Options for the Scope 10.0.20.0:\n\n        DHCP Standard Options :\n        General Option Values:\n        OptionId : 51\n        Option Value:\n                Number of Option Elements = 1\n                Option Element Type = DWORD\n                Option Element Value = 2592000\n        OptionId : 3\n        Option Value:\n                Number of Option Elements = 1\n                Option Element Type = IPADDRESS\n                Option Element Value = 10.0.20.1\n        OptionId : 6\n        Option Value:\n                Number of Option Elements = 1\n                Option Element Type = IPADDRESS\n                Option Element Value = 10.0.0.5\n\nCommand completed successfully.',
      'netsh dhcp *': 'Try:\n  netsh dhcp server \\\\dhcp01 show mibinfo\n  netsh dhcp server \\\\dhcp01 scope <scope> show optionvalue',
      netsh: 'Usage: netsh [-a AliasFile] [-c Context] [-r RemoteMachine] [Command | -f ScriptFile]\n\nThe following commands are available:\n  dhcp  - Changes to the `netsh dhcp\' context.\n  interface - Changes to the `netsh interface\' context.'
    },
    solution: 'The Marketing scope (10.0.20.0) is exhausted: 253 addresses in use and 0 free. Option 51 (lease duration) is 2,592,000 seconds = 30 days, so addresses from visitors and mobile devices that have left are never reclaimed. Shorten the lease (e.g. 8 hours to 1 day for a busy Wi-Fi/mobile VLAN), clean up stale leases, and consider widening the scope.',
    feedback: 'A 169.254.x.x (APIPA) address means the client never got a DHCP offer. Confirm it with a failed ipconfig /renew, then go to the server: check scope statistics for free addresses and the lease duration (option 51). Also mention ruling out a broken DHCP relay (ip helper-address) or a rogue DHCP server, and that other VLANs on the same server still working points to the scope, not the service.'
  },
  {
    id: 'default-gateway-missing',
    title: 'Missing Default Gateway',
    category: 'Network Admin',
    difficulty: 'Beginner',
    description: 'A user reports they can access local file shares but cannot browse the internet. Diagnose the network configuration issue.',
    type: 'terminal',
    initialState: 'Client is connected to the network and can reach local resources (file server FS01 at 192.168.1.20), but internet access is failing.',
    expectedCommands: ['ping 8.8.8.8', 'ipconfig'],
    commands: {
      ipconfig: 'Windows IP Configuration\n\nEthernet adapter Ethernet:\n   Connection-specific DNS Suffix  . : localdomain\n   IPv4 Address. . . . . . . . . . . : 192.168.1.105\n   Subnet Mask . . . . . . . . . . . : 255.255.255.0\n   Default Gateway . . . . . . . . . : \n   DNS Servers . . . . . . . . . . . : 192.168.1.1',
      'ping 192.168.1.1': pingOk('192.168.1.1', null, 64),
      'ping 192.168.1.20': pingOk('192.168.1.20'),
      'ping fs01': pingOk('fs01.localdomain', '192.168.1.20'),
      'ping *': 'Pinging {args} with 32 bytes of data:\nPING: transmit failed. General failure.\nPING: transmit failed. General failure.\n\nPing statistics for {args}:\n    Packets: Sent = 2, Received = 0, Lost = 2 (100% loss)',
      'route print': '===========================================================================\nIPv4 Route Table\n===========================================================================\nActive Routes:\nNetwork Destination        Netmask          Gateway       Interface  Metric\n      192.168.1.0    255.255.255.0         On-link     192.168.1.105    281\n    192.168.1.105  255.255.255.255         On-link     192.168.1.105    281\n        127.0.0.0        255.0.0.0         On-link         127.0.0.1    331\n==========================================================================='
    },
    solution: "The user's computer has a static IP with no default gateway configured, so it has no route for traffic leaving the local 192.168.1.0/24 subnet. Add the gateway (192.168.1.1) or switch the adapter back to DHCP.",
    feedback: 'In an interview, mention that if local resources are reachable but external ones are not, the first things to check are the default gateway and DNS. "General failure" (rather than a timeout) means the PC has nowhere to send the packet, and route print confirms there is no 0.0.0.0 route.'
  },
  {
    id: 'subnet-mask-mismatch',
    title: 'Subnet Mask Mismatch',
    category: 'Network Admin',
    difficulty: 'Advanced',
    description: 'A new server, SRV01 (10.0.0.50), was just deployed on the 10.0.0.0/24 server VLAN. Clients on that same VLAN can reach it, but clients on the 10.0.1.0/24 user VLAN cannot. Diagnose the issue.',
    type: 'terminal',
    initialState: 'You are on a user-VLAN client (10.0.1.25). A colleague at the server console saved the server\'s network config to a text file in your current folder.',
    expectedCommands: ['ipconfig', 'ping 10.0.0.50', 'tracert 10.0.0.50', 'type srv01-ipconfig.txt'],
    commands: {
      ipconfig: 'Windows IP Configuration\n\nEthernet adapter Ethernet:\n   Connection-specific DNS Suffix  . : corp.local\n   IPv4 Address. . . . . . . . . . . : 10.0.1.25\n   Subnet Mask . . . . . . . . . . . : 255.255.255.0\n   Default Gateway . . . . . . . . . : 10.0.1.1',
      'ping 10.0.0.50': pingTimeout('10.0.0.50'),
      'ping srv01': pingTimeout('srv01.corp.local', '10.0.0.50'),
      'ping 10.0.1.1': pingOk('10.0.1.1', null, 255),
      'ping 10.0.0.1': pingOk('10.0.0.1', null, 255, '=1ms'),
      'ping 10.0.0.10': pingOk('10.0.0.10', null, 127, '=1ms'),
      'tracert 10.0.0.50': 'Tracing route to 10.0.0.50 over a maximum of 30 hops\n\n  1    <1 ms    <1 ms    <1 ms  10.0.1.1\n  2     *        *        *     Request timed out.\n  3     *        *        *     Request timed out.\n  4     *        *        *     Request timed out.\n\nTrace complete.',
      dir: ' Volume in drive C is OS\n Directory of C:\\Users\\Admin\n\n10/18/2026  11:31 PM               612 srv01-ipconfig.txt\n               1 File(s)            612 bytes',
      'type srv01-ipconfig.txt': 'SRV01 - ipconfig (pasted from server console)\n\nEthernet adapter Ethernet0:\n   IPv4 Address. . . . . . . . . . . : 10.0.0.50\n   Subnet Mask . . . . . . . . . . . : 255.255.0.0\n   Default Gateway . . . . . . . . . : 10.0.0.1\n   DNS Servers . . . . . . . . . . . : 10.0.0.5',
      'type *': 'The system cannot find the file specified.',
      type: 'The syntax of the command is incorrect.'
    },
    solution: 'SRV01 was configured with a /16 (255.255.0.0) mask on a /24 network. It therefore believes 10.0.1.x clients are on its own local segment, so instead of sending replies to its gateway (10.0.0.1) it ARPs for them directly, gets no answer, and the replies are dropped. Requests arrive but replies never return, so cross-VLAN pings time out while same-VLAN hosts work. Fix the mask to 255.255.255.0.',
    feedback: 'Explain the asymmetry: the client correctly routes to its gateway (hop 1 answers), the request reaches the server, but the server\'s wrong mask breaks the return path. When something works within a subnet but fails across subnets, always compare the masks and gateways on both ends, not just the client. An overly large mask is a classic mistake on manually configured servers.'
  },
  {
    id: 'account-lockout',
    title: 'Repeated Account Lockouts',
    category: 'Help Desk',
    difficulty: 'Beginner',
    description: 'User "jsmith" calls for the third time today saying their domain account keeps getting locked out, even though they changed their password this morning and are typing it correctly. Investigate the account.',
    type: 'terminal',
    initialState: 'You are logged into a domain-joined admin workstation. The user changed their password at 8:02 AM.',
    expectedCommands: ['net user jsmith /domain'],
    commands: {
      'net user jsmith': 'The request will be processed at a domain controller for domain corp.local.\n\nUser name                    jsmith\nFull Name                    John Smith\nAccount active               Locked\nAccount expires              Never\n\nPassword last set            10/18/2026 8:02:14 AM\nPassword expires             1/16/2027 8:02:14 AM\nPassword changeable          10/19/2026 8:02:14 AM\nPassword required            Yes\nUser may change password     Yes\n\nWorkstations allowed         All\nLast logon                   10/18/2026 7:58:41 AM\nBad password count           5\nLast bad password            10/18/2026 2:14:09 PM (source: JSMITH-IPHONE / Exchange ActiveSync)\n\nLocal Group Memberships\nGlobal Group memberships     *Domain Users  *Sales\nThe command completed successfully.',
      'net user *': 'The user name could not be found.\n\nMore help is available by typing NET HELPMSG 2221.',
      'net user': 'User accounts for \\\\DC01\n\n-------------------------------------------------------------------------------\nAdministrator            Guest                    helpdesk-admin\njdoe                     jsmith                   mlee\nThe command completed successfully.',
      'net *': NET_USAGE,
      net: NET_USAGE
    },
    solution: "The user's phone is still configured with the old password for Exchange ActiveSync email. It keeps retrying in the background, racking up bad password attempts and tripping the lockout policy. Unlock the account and have the user update the password on their mobile device.",
    feedback: 'Interviewers love this one. Mention that lockouts right after a password change almost always come from cached credentials: mobile email, mapped drives, saved RDP sessions, or scheduled tasks. Say you would check the bad-password source (event ID 4740 on the PDC emulator, or the Microsoft Account Lockout Tools) rather than just unlocking the account repeatedly.'
  },
  {
    id: 'duplicate-ip-conflict',
    title: 'Duplicate IP Address Conflict',
    category: 'Network Admin',
    difficulty: 'Intermediate',
    description: 'A user says their network connection keeps dropping every few minutes and Windows briefly showed a pop-up about an "IP address conflict." Find out what is going on.',
    type: 'terminal',
    initialState: 'Workstation is configured with a static IP address. Connectivity is intermittent.',
    expectedCommands: ['ipconfig /all', 'arp -a'],
    commands: {
      'ipconfig /all': 'Windows IP Configuration\n\nEthernet adapter Ethernet:\n   Connection-specific DNS Suffix  . : localdomain\n   Physical Address. . . . . . . . . : 3C-52-82-1A-9F-04\n   DHCP Enabled. . . . . . . . . . . : No\n   IPv4 Address. . . . . . . . . . . : 192.168.1.50(Duplicate)\n   Subnet Mask . . . . . . . . . . . : 255.255.255.0\n   Default Gateway . . . . . . . . . : 192.168.1.1\n   DNS Servers . . . . . . . . . . . : 192.168.1.10',
      ipconfig: 'Windows IP Configuration\n\nEthernet adapter Ethernet:\n   Connection-specific DNS Suffix  . : localdomain\n   IPv4 Address. . . . . . . . . . . : 192.168.1.50(Duplicate)\n   Subnet Mask . . . . . . . . . . . : 255.255.255.0\n   Default Gateway . . . . . . . . . : 192.168.1.1',
      getmac: 'Physical Address    Transport Name\n=================== ==========================================================\n3C-52-82-1A-9F-04   \\Device\\Tcpip_{8F2A51C0-7D3E-4B5A-9C1E-2B7F0A3D6E11}',
      arp: 'Interface: 192.168.1.50 --- 0x7\n  Internet Address      Physical Address      Type\n  192.168.1.1           00-1a-2b-3c-4d-01     dynamic\n  192.168.1.10          00-1a-2b-3c-4d-10     dynamic\n  192.168.1.50          b8-27-eb-77-21-c3     dynamic\n  192.168.1.255         ff-ff-ff-ff-ff-ff     static',
      'ping 192.168.1.50': pingOk('192.168.1.50', null, 64, '=2ms'),
      'ping 192.168.1.1': 'Pinging 192.168.1.1 with 32 bytes of data:\nReply from 192.168.1.1: bytes=32 time=1ms TTL=255\nRequest timed out.\n\nPing statistics for 192.168.1.1:\n    Packets: Sent = 2, Received = 1, Lost = 1 (50% loss)',
      'ping *': 'Pinging {args} with 32 bytes of data:\nRequest timed out.\nReply from {args}: bytes=32 time=21ms TTL=117\n\nPing statistics for {args}:\n    Packets: Sent = 2, Received = 1, Lost = 1 (50% loss)'
    },
    solution: 'Another device (MAC b8-27-eb-77-21-c3, a Raspberry Pi based on the OUI, answering with a Linux TTL of 64) was given the same static IP, 192.168.1.50, which is also inside the DHCP pool. The two devices fight over the address. Fix it by assigning a unique IP outside the DHCP scope (or a DHCP reservation) and documenting static assignments in IPAM.',
    feedback: 'Mention that "(Duplicate)" in ipconfig plus an ARP entry for your own IP whose MAC does not match your adapter (getmac / Physical Address) confirms the conflict. Bonus points for using the MAC OUI to identify the vendor and the TTL (64 = Linux, 128 = Windows) to fingerprint the other device, then tracking it down via the switch MAC address table.'
  },
  {
    id: 'printer-offline',
    title: 'Network Printer Unreachable',
    category: 'Help Desk',
    difficulty: 'Intermediate',
    description: 'The whole Accounting team reports the shared printer "PRINTER01" shows as Offline. A coworker walked over and says the printer is powered on with no errors on its display. Figure out why nobody can print.',
    type: 'terminal',
    initialState: 'Printer is physically online. Clients print to it by hostname, PRINTER01. There was a brief power outage over the weekend.',
    expectedCommands: ['ping printer01', 'nslookup printer01', 'arp -a'],
    commands: {
      'ping printer01': pingTimeout('printer01.corp.local', '192.168.1.200'),
      'ping 192.168.1.200': pingTimeout('192.168.1.200'),
      'ping 192.168.1.215': pingOk('192.168.1.215', null, 60, '=3ms'),
      'ping *': pingTimeout('{args}'),
      'nslookup printer01': 'Server:  dc01.corp.local\nAddress:  192.168.1.10\n\nName:    printer01.corp.local\nAddress:  192.168.1.200',
      arp: 'Interface: 192.168.1.112 --- 0x7\n  Internet Address      Physical Address      Type\n  192.168.1.1           00-1a-2b-3c-4d-01     dynamic\n  192.168.1.10          00-1a-2b-3c-4d-10     dynamic\n  192.168.1.215         00-80-77-4e-2a-91     dynamic\n  192.168.1.255         ff-ff-ff-ff-ff-ff     static',
      ipconfig: 'Windows IP Configuration\n\nEthernet adapter Ethernet:\n   IPv4 Address. . . . . . . . . . . : 192.168.1.112\n   Subnet Mask . . . . . . . . . . . : 255.255.255.0\n   Default Gateway . . . . . . . . . : 192.168.1.1\n   DNS Servers . . . . . . . . . . . : 192.168.1.10'
    },
    solution: 'The printer uses DHCP and picked up a new lease (192.168.1.215) after the power outage, but DNS still has a stale static A record pointing PRINTER01 at 192.168.1.200. Create a DHCP reservation (or set a static IP) for the printer and update the DNS record.',
    feedback: 'Walk the interviewer through it: ping by name fails, nslookup shows which IP the name resolves to, and arp -a reveals a device at a different IP whose MAC OUI (00-80-77) belongs to Brother, the printer vendor. The real takeaway is that infrastructure devices like printers should always have reservations or static IPs so their address never changes.'
  },
  {
    id: 'routing-loop',
    title: 'Remote Site Routing Loop',
    category: 'Network Admin',
    difficulty: 'Expert',
    description: 'Users at HQ cannot reach the file server at the branch office (10.20.0.10). The WAN link is up and the branch staff can work locally. A junior admin changed some static routes last night. Trace the path and find the problem.',
    type: 'terminal',
    initialState: 'HQ client is on 10.10.0.0/24. Branch network is 10.20.0.0/24. HQ-CORE is 10.10.0.1, HQ-EDGE (WAN router) is 10.10.0.2. The WAN circuit reports as healthy.',
    expectedCommands: ['ping 10.20.0.10', 'tracert 10.20.0.10', 'route print'],
    commands: {
      'ping 10.20.0.10': 'Pinging 10.20.0.10 with 32 bytes of data:\nReply from 10.10.0.2: TTL expired in transit.\nReply from 10.10.0.2: TTL expired in transit.\n\nPing statistics for 10.20.0.10:\n    Packets: Sent = 2, Received = 2, Lost = 0 (0% loss)',
      'ping 10.10.0.1': pingOk('10.10.0.1', null, 255),
      'ping 10.10.0.2': pingOk('10.10.0.2', null, 255),
      'ping *': pingOk('{args}', null, 116, '=22ms'),
      'tracert 10.20.0.10': 'Tracing route to 10.20.0.10 over a maximum of 30 hops\n\n  1    <1 ms    <1 ms    <1 ms  hq-core.corp.local [10.10.0.1]\n  2     1 ms     1 ms     1 ms  hq-edge.corp.local [10.10.0.2]\n  3     1 ms     1 ms     1 ms  hq-core.corp.local [10.10.0.1]\n  4     2 ms     1 ms     2 ms  hq-edge.corp.local [10.10.0.2]\n  5     2 ms     2 ms     2 ms  hq-core.corp.local [10.10.0.1]\n  6     2 ms     2 ms     3 ms  hq-edge.corp.local [10.10.0.2]\n  ...\n 30     9 ms     9 ms     9 ms  hq-edge.corp.local [10.10.0.2]\n\nTrace complete.',
      'route print': '===========================================================================\nIPv4 Route Table\n===========================================================================\nActive Routes:\nNetwork Destination        Netmask          Gateway       Interface  Metric\n          0.0.0.0          0.0.0.0        10.10.0.1     10.10.0.55     25\n        10.10.0.0    255.255.255.0         On-link      10.10.0.55    281\n       10.10.0.55  255.255.255.255         On-link      10.10.0.55    281\n        127.0.0.0        255.0.0.0         On-link       127.0.0.1    331\n===========================================================================',
      route: 'Manipulates network routing tables.\n\nROUTE [-f] [-p] [-4|-6] command [destination] [MASK netmask] [gateway] [METRIC metric] [IF interface]\n\n  command  One of: PRINT, ADD, DELETE, CHANGE',
      ipconfig: 'Windows IP Configuration\n\nEthernet adapter Ethernet:\n   IPv4 Address. . . . . . . . . . . : 10.10.0.55\n   Subnet Mask . . . . . . . . . . . : 255.255.255.0\n   Default Gateway . . . . . . . . . : 10.10.0.1'
    },
    solution: 'A routing loop exists between HQ-CORE (10.10.0.1) and HQ-EDGE (10.10.0.2). HQ-CORE sends 10.20.0.0/24 to HQ-EDGE, but the junior admin replaced the static route on HQ-EDGE that should send 10.20.0.0/24 across the WAN with one pointing back to HQ-CORE. Packets bounce until their TTL expires. Fix the static route on HQ-EDGE so it uses the WAN next hop.',
    feedback: 'Seeing the same two hops repeat in tracert, plus "TTL expired in transit" in ping, is the textbook sign of a routing loop. The client\'s own route table is fine (default route to HQ-CORE), so the problem is upstream. In an interview, say you would compare "show ip route" on both routers, check recent change logs, and mention that dynamic routing protocols (OSPF/EIGRP) and change-management reviews help prevent this kind of mistake.'
  },
  {
    id: 'time-skew-kerberos',
    title: 'Clock Skew Breaks Domain Logon',
    category: 'Systems Admin',
    difficulty: 'Expert',
    description: 'Several users on one floor suddenly cannot log in or reach file shares. They see errors like "The trust relationship failed" or "There is a time and/or date difference between the client and server." Investigate a client workstation.',
    type: 'terminal',
    initialState: 'You have local admin access on an affected workstation. Network connectivity to the domain controller is fine.',
    expectedCommands: ['ping dc01', 'net time', 'w32tm /query /status'],
    commands: {
      'w32tm /query /status': 'Leap Indicator: 3(not synchronized)\nStratum: 0 (unspecified)\nPrecision: -23 (119.209ns per tick)\nRoot Delay: 0.0000000s\nRoot Dispersion: 0.0000000s\nReferenceId: 0x00000000 (unspecified)\nLast Successful Sync Time: 9/02/2026 4:11:52 PM\nSource: Local CMOS Clock\nPoll Interval: 10 (1024s)',
      'w32tm /query /source': 'Local CMOS Clock',
      'w32tm /resync': 'Sending resync command to local computer\nThe computer did not resync because no time data was available.',
      w32tm: 'w32tm [/? | /register | /unregister ]\n  /config [/computer:<target>] [/update] [/syncfromflags:<source>]\n  /query [/computer:<target>] {/source | /configuration | /peers | /status}\n  /resync [/computer:<computer>] [/nowait] [/rediscover] [/soft]',
      'w32tm *': 'The following arguments were unexpected. Try "w32tm /query /status" or "w32tm /query /source".',
      'net time': 'Current time at \\\\DC01.corp.local is 10/18/2026 11:52:07 PM\n\nLocal time (GMT-04:00) at \\\\WS-FL3-22 is 10/18/2026 11:44:31 PM\n\nThe command completed successfully.',
      'net *': NET_USAGE,
      net: NET_USAGE,
      'ping dc01': pingOk('dc01.corp.local', '192.168.1.10'),
      'ping *': pingOk('{args}', null, 128, '=1ms')
    },
    solution: 'The workstations have drifted about 7.5 minutes behind the domain controller because the Windows Time service is syncing from the "Local CMOS Clock" instead of the domain hierarchy, and it has not synced since September. Kerberos rejects tickets when clock skew exceeds 5 minutes. Run "w32tm /config /syncfromflags:domhier /update" and "w32tm /resync", and check the GPO or image that changed the time source.',
    feedback: 'Always mention the 5-minute Kerberos tolerance. Interviewers want to hear that domain members sync from the domain hierarchy, and that the PDC emulator is the authoritative time source, synced to an external NTP server. Connectivity working while authentication fails is a strong hint to check time.'
  }
];
