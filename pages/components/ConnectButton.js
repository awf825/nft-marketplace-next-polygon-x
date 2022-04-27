import { useEthers, useEtherBalance } from "@usedapp/core";
import { useMoralis, useMoralisWeb3Api } from 'react-moralis';

export default function ConnectButton() {
    const { isAuthenticated, authenticate, user, logout } = useMoralis();

    function handleConnectWallet() {
        authenticate();
    }

    function handleDisconnectWallet() {
        console.log(user.attributes)
        logout();
    }

    return user ? (
        <div>
            <button onClick={handleDisconnectWallet}>Disconnect wallet</button>
        </div>
    ) : (
        <button onClick={handleConnectWallet}>Connect to a wallet</button>
    )
}