# Solana Token Balance Query

A simple TypeScript CLI tool to query SOL, USDC, and USDT balances for any Solana wallet address using `@solana/kit`.

## Features

- Query native SOL balance
- Query USDC token balance
- Query USDT token balance
- Support for both mainnet and devnet
- Handles multiple token accounts for the same mint
- Clean CLI output with JSON format

## Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

## Installation

1. Clone or navigate to the project directory:
```bash
cd sol-token-query
```

2. Install dependencies:
```bash
npm install
```

## Usage

### Basic Usage (Mainnet)

Query balances on Solana mainnet:

```bash
npm run start -- <WALLET_ADDRESS>
```

Example:
```bash
npm run start -- 4kg8oh3jdNtn7j2wcS7TrUua31AgbLzDVkBZgTAe44aF
```

### Using Devnet

Query balances on Solana devnet:

```bash
npm run start -- <WALLET_ADDRESS> https://api.devnet.solana.com
```

Example:
```bash
npm run start -- 4kg8oh3jdNtn7j2wcS7TrUua31AgbLzDVkBZgTAe44aF https://api.devnet.solana.com
```

### Using Custom RPC URL

You can specify any Solana RPC endpoint:

```bash
npm run start -- <WALLET_ADDRESS> <CUSTOM_RPC_URL>
```

Example with a custom RPC:
```bash
npm run start -- <WALLET_ADDRESS> https://api.mainnet-beta.solana.com
```

### Alternative Script Command

You can also use the `balances` script:

```bash
npm run balances -- <WALLET_ADDRESS> [RPC_URL]
```

## Output

The tool displays balances in two formats:

### Formatted Output
```
=== Wallet Balances ===
SOL:  511.430647004
USDC: 0.000000
USDT: 0.000000
```

### JSON Format
```json
{
  "SOL": 511.430647004,
  "USDC": 0,
  "USDT": 0
}
```

## Important Notes

### Mainnet vs Devnet

- **USDC and USDT are mainnet tokens** - They exist only on mainnet
- On **devnet**, USDC and USDT balances will always show as `0.000000` because these token mints don't exist on devnet
- To get accurate USDC/USDT balances, use mainnet RPC (`https://api.mainnet-beta.solana.com`)
- SOL balance works on both networks

### Token Mint Addresses

- **USDC**: `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`
- **USDT**: `Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB`

### Multiple Token Accounts

The tool automatically sums balances across all token accounts if a wallet has multiple accounts for the same mint.

## Examples

### Example 1: Query Mainnet Wallet
```bash
npm run start -- 4kg8oh3jdNtn7j2wcS7TrUua31AgbLzDVkBZgTAe44aF
```

### Example 2: Query Devnet Wallet
```bash
npm run start -- 4kg8oh3jdNtn7j2wcS7TrUua31AgbLzDVkBZgTAe44aF https://api.devnet.solana.com
```

### Example 3: Direct tsx execution
```bash
npx tsx get-balances.ts <WALLET_ADDRESS>
```

## Error Handling

The tool gracefully handles:
- Wallet addresses with no token accounts (returns 0)
- Network mismatches (e.g., querying mainnet tokens on devnet)
- Invalid wallet addresses (shows error message)

## Project Structure

```
sol-token-query/
├── get-balances.ts    # Main script
├── package.json       # Dependencies and scripts
├── tsconfig.json      # TypeScript configuration
└── README.md          # This file
```

## Dependencies

- `@solana/kit` - Modern Solana RPC client
- `@solana/spl-token` - SPL Token utilities
- `typescript` - TypeScript compiler
- `tsx` - TypeScript execution engine
- `@types/node` - Node.js type definitions

## License

ISC

