# IT Simulator Pro

IT Simulator Pro is a browser-based practice environment for technical IT interviews. It gives help desk professionals, network administrators, and aspiring IT support engineers realistic troubleshooting prompts, a simulated Windows command prompt, and concise interview-focused feedback.

The application is intentionally lightweight: there is no backend or account system, and terminal responses are mocked locally for each scenario. This makes it easy to run locally, use offline after the app is loaded, and extend with additional practice cases.

## Features

- Scenario dashboard with category and difficulty labels
- Four networking troubleshooting scenarios from beginner to advanced
- Simulated command prompt with `ping`, `nslookup`, `ipconfig`, `help`, and `clear`
- Scenario-specific command output that exposes realistic diagnostic clues
- Resolution flow with an explanation of the root cause and an interview tip
- Responsive React UI with light and dark color-scheme support
- Data-driven scenario definitions that can be extended without changing the dashboard

## Scenario Catalog

| Scenario | Category | Difficulty | Main concepts |
| --- | --- | --- | --- |
| DNS Resolution Failure | Network Admin | Intermediate | DNS servers, name resolution, `nslookup` |
| DHCP Pool Exhaustion | Network Admin | Hard | APIPA addresses, DHCP scopes, leases |
| Missing Default Gateway | Network Admin | Beginner | Local versus external connectivity, routing |
| Subnet Mask Mismatch | Network Admin | Advanced | Subnetting, cross-subnet communication, routing |

The application currently contains four scenario cards in the source data. The DNS scenario also demonstrates the expected command sequence most directly; all scenarios accept the shared simulated command set and provide tailored output where applicable.

## How It Works

1. Open the dashboard and choose a scenario.
2. Read the initial state and task in the scenario sidebar.
3. Use the simulated terminal to investigate the issue. Try explaining your reasoning out loud as you work.
4. Run commands such as `ipconfig`, `ping`, or `nslookup` to inspect the mock system response.
5. Select **Mark as Resolved** when you have formed a diagnosis.
6. Review the intended solution and the interview tip, then return to the dashboard for another scenario.

> The **Mark as Resolved** action reveals the reference answer; it does not validate a command sequence or score the commands entered.

## Getting Started

### Prerequisites

- Node.js 18 or newer
- npm 9 or newer

### Installation

```bash
git clone https://github.com/jimjamscott22/IT-Simulator-Pro.git
cd IT-Simulator-Pro
npm install
```

### Start the development server

```bash
npm run dev
```

Vite will print the local URL, usually `http://localhost:5173`.

### Create a production build

```bash
npm run build
npm run preview
```

The build output is written to `dist/`. `npm run preview` serves that build locally for verification.

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Starts the Vite development server with hot module replacement |
| `npm run build` | Creates an optimized production build |
| `npm run preview` | Serves the production build locally |
| `npm run lint` | Runs Oxlint against the project |

## Project Structure

```text
.
├── docs/
│   └── user_guide.md       # Learner-focused usage guide
├── public/                 # Static public assets
├── src/
│   ├── components/
│   │   ├── Dashboard.jsx   # Scenario selection screen
│   │   ├── ScenarioPlayer.jsx
│   │   └── Terminal.jsx     # Mock command prompt
│   ├── data/
│   │   └── scenarios.js     # Scenario definitions and feedback
│   ├── App.jsx              # Top-level view and scenario state
│   ├── App.css              # Legacy/template styles
│   └── index.css            # Main application styles and theme tokens
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## Adding a Scenario

Scenarios are defined in [`src/data/scenarios.js`](src/data/scenarios.js) as objects in the exported `scenarios` array. A scenario should include:

```js
{
	id: 'unique-scenario-id',
	title: 'Short scenario title',
	category: 'Network Admin',
	difficulty: 'Beginner',
	description: 'The user-facing problem statement.',
	type: 'terminal',
	initialState: 'The starting condition visible to the learner.',
	expectedCommands: ['ipconfig'],
	solution: 'The underlying cause of the issue.',
	feedback: 'Advice for explaining the diagnosis in an interview.'
}
```

`expectedCommands` currently influences which mock response set the terminal uses. When adding a new command or a new response pattern, update the mock data and command-selection logic in [`src/components/Terminal.jsx`](src/components/Terminal.jsx) as well as the scenario definition.

## Design Notes and Limitations

- Terminal output is simulated and does not execute commands on the host machine.
- Command recognition is intentionally limited to the commands implemented in `Terminal.jsx`.
- The app does not persist progress, completed scenarios, or entered commands between sessions.
- Resolution is self-assessed: the current UI reveals the reference solution when the learner clicks the resolution button.
- There is currently no automated test suite or backend API.

## Learning Tips

- Start with the simplest layer: connectivity, addressing, routing, then name resolution.
- Look for high-signal clues such as a `169.254.x.x` address, a blank default gateway, or a public DNS server when an internal name fails.
- Explain why each command narrows the problem space instead of listing commands without context.
- Compare your diagnosis with the feedback after each scenario and practice stating the next real-world verification step.

For a shorter learner walkthrough, see [`docs/user_guide.md`](docs/user_guide.md).

## Contributing

Contributions are welcome. For a new scenario or UI improvement:

1. Create a branch for the change.
2. Keep scenario content in `src/data/scenarios.js` where possible.
3. Run `npm run lint` and `npm run build` before opening a pull request.
4. Describe the troubleshooting concept and the intended learner outcome in the pull request.

## License

This project is distributed under the license in [`LICENSE`](LICENSE).
