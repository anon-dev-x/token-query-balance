import { address, createSolanaRpc, type Rpc } from "@solana/kit";

/**
 * Get SOL (native token) balance for a wallet
 */
async function getSolBalance(
    walletAddress: string,
    rpcUrl: string = "https://api.mainnet-beta.solana.com"
): Promise<number> {
    const rpc = createSolanaRpc(rpcUrl);
    const owner = address(walletAddress);

    const solBalanceResponse = await rpc.getBalance(owner).send();
    const solBalance = Number(solBalanceResponse.value) / 1e9; // Lamports to SOL

    return solBalance;
}

/**
 * Get token balance for a specific mint address
 * Returns the sum of all token accounts for the given mint
 */
async function getTokenBalance(
    walletAddress: string,
    mintAddress: string,
    rpcUrl: string = "https://api.mainnet-beta.solana.com"
): Promise<number> {
    const rpc = createSolanaRpc(rpcUrl);
    const owner = address(walletAddress);
    const mint = address(mintAddress);
    let tokenBalance = 0;

    try {
        const tokenResponse = await rpc
            .getTokenAccountsByOwner(owner, { mint }, { encoding: "jsonParsed" })
            .send();

        tokenResponse.value.forEach((accountInfo) => {
            const amount = accountInfo.account.data["parsed"]["info"]["tokenAmount"]["amount"];
            const decimals = accountInfo.account.data["parsed"]["info"]["tokenAmount"]["decimals"];
            tokenBalance += Number(amount) / Math.pow(10, decimals);
        });
    } catch (error: any) {
        // Silently handle cases where mint doesn't exist on the network (e.g., mainnet tokens on devnet)
        if (error?.context?.__serverMessage?.includes("Token mint could not be unpacked")) {
            // Mint address doesn't exist on this network - this is expected for devnet
            tokenBalance = 0;
        } else {
            console.error(`Error fetching token balance for mint ${mintAddress}:`, error?.message || error);
        }
    }

    return tokenBalance;
}

/**
 * Get balances for SOL and a list of token mints
 */
async function getBalances(
    walletAddress: string,
    tokenMints: string[] = [],
    rpcUrl: string = "https://api.mainnet-beta.solana.com"
): Promise<Record<string, number>> {
    const balances: Record<string, number> = {};

    // Get SOL balance
    try {
        balances.SOL = await getSolBalance(walletAddress, rpcUrl);
    } catch (error: any) {
        console.error("Error fetching SOL balance:", error?.message || error);
        balances.SOL = 0;
    }

    // Get balances for each token mint
    for (const mintAddress of tokenMints) {
        try {
            const balance = await getTokenBalance(walletAddress, mintAddress, rpcUrl);
            // Use mint address as key, or extract token name if available
            balances[mintAddress] = balance;
        } catch (error: any) {
            console.error(`Error fetching balance for mint ${mintAddress}:`, error?.message || error);
            balances[mintAddress] = 0;
        }
    }

    return balances;
}

// CLI runner
async function main() {
    const wallet = process.argv[2];
    const rpcUrl = process.argv[3] ?? "https://api.mainnet-beta.solana.com";

    if (!wallet) {
        console.error("Usage: tsx get-balances.ts <WALLET_ADDRESS> [RPC_URL] [TOKEN_MINT_1] [TOKEN_MINT_2] ...");
        console.error("\nExamples:");
        console.error("  Mainnet with default tokens:");
        console.error("    tsx get-balances.ts <WALLET_ADDRESS>");
        console.error("  Devnet:");
        console.error("    tsx get-balances.ts <WALLET_ADDRESS> https://api.devnet.solana.com");
        console.error("  Custom tokens:");
        console.error("    tsx get-balances.ts <WALLET_ADDRESS> https://api.mainnet-beta.solana.com EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB");
        console.error("\nNote: USDC/USDT are mainnet tokens. Use mainnet RPC to query them.");
        process.exit(1);
    }

    // Extract token mints from command line arguments (starting from index 3 if RPC URL is provided, else index 2)
    const hasCustomRpc = process.argv[3] && !process.argv[3].startsWith("--");
    const tokenMints = hasCustomRpc
        ? process.argv.slice(4)
        : process.argv.slice(3);

    // Default tokens if none provided
    const defaultTokens = [
        "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // USDC
        "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", // USDT
    ];

    const tokensToQuery = tokenMints.length > 0 ? tokenMints : defaultTokens;

    try {
        const balances = await getBalances(wallet, tokensToQuery, rpcUrl);

        // Create a more readable output with token names
        const tokenNames: Record<string, string> = {
            "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v": "USDC",
            "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB": "USDT",
        };

        console.log("\n=== Wallet Balances ===");
        console.log(`SOL:  ${balances.SOL.toFixed(9)}`);

        for (const [mintAddress, balance] of Object.entries(balances)) {
            if (mintAddress !== "SOL") {
                const tokenName = tokenNames[mintAddress] || mintAddress.slice(0, 8) + "...";
                console.log(`${tokenName}: ${balance.toFixed(6)}`);
            }
        }

        console.log("\n=== JSON Format ===");
        // Format JSON with token names where available
        const formattedBalances: Record<string, number> = { SOL: balances.SOL };
        for (const [mintAddress, balance] of Object.entries(balances)) {
            if (mintAddress !== "SOL") {
                const key = tokenNames[mintAddress] || mintAddress;
                formattedBalances[key] = balance;
            }
        }
        console.log(JSON.stringify(formattedBalances, null, 2));
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

main();
