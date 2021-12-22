// import { useState } from 'react'
// import { useEtherBalance, useEthers } from '@usedapp/core';

// export default function Deployer() {
//     const { activateBrowserWallet, account, library, chainId } = useEthers()

//     const [ isAwaitingMetaMaskConfirmation, setIsAwaitingMetaMaskConfirmation ] = useState(false)
//     const [ pendingContractDeploymentTransaction, setPendingContractDeploymentTransaction ] = useState(false)
//     const [ contractDeploymentSuccessful, setContractDeploymentSuccessful] = useState(false)

//     const userBalance = useEtherBalance(account);

//     return (
//         <div className="button-container">
//             <button className='metaMaskConnection' color="primary" variant="contained" onClick={() => activateBrowserWallet()}>Connect</button>
//         </div>
//     )
// }
// import Minter from './components/Minter.js';
// import { StaticJsonRpcProvider, Web3Provider } from "@ethersproject/providers";
// import { useState } from 'react'
// import { NETWORKS } from '../constants.js' 
// import { useMoralis } from "react-moralis";
// import { useUserProvider } from '../hooks';

export default function MinterPage() {
    const { authenticate, isAuthenticated, logout, user, account } = useMoralis();
    console.log('account: ', account);
    const targetNetwork = NETWORKS.localhost;
    const localProviderUrl = targetNetwork.rpcUrl;
    const DEBUG = true;
    const [injectedProvider, setInjectedProvider] = useState();
    
    // const localProviderUrlFromEnv = process.env.REACT_APP_PROVIDER ? process.env.REACT_APP_PROVIDER : localProviderUrl;
    const localProviderUrlFromEnv = localProviderUrl;
    if (DEBUG) console.log("🏠 Connecting to provider:", localProviderUrlFromEnv);
    const localProvider = new StaticJsonRpcProvider(localProviderUrlFromEnv);

    // const userProvider = useUserProvider(injectedProvider, localProvider);
    return (
        isAuthenticated ? (
            <button
              onClick={logout}
            >
              Logout
            </button>
          ) : (
            <button
              onClick={() => {
                authenticate({ provider: "metamask" });
              }}
            >
              Sign in with MetaMask
            </button>
        )
    
        // <Minter
        //     signer={null}
        //     provider={localProvider}
        //     address={null}
        //     blockExplorer={null}
        // />
    )
} 
