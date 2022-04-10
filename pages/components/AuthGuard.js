import { useMoralis } from 'react-moralis';

export default function AuthGuard({ children }) {
  const { isAuthenticated, user } = useMoralis();

  // if moralis initialized with a valid user show protected page
  // if (isAuthenticated && ( user.attributes.ethAddress === process.env.NEXT_PUBLIC_AIDEN )) {
  //   return <>{children}</>
  // } else {
  //   console.log('you must connect to metamask to use this page, or you aren\'t allowed to use it!')
  //   return (
  //     <><h1 style={{textAlign: 'center', fontSize: '180px'}}>HEY, DICKHEAD!</h1></>
  //   )
  // }
  return <>{children}</>
}