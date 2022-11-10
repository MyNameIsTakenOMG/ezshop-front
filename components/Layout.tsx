import React, { useState } from 'react'
import { useAccount } from 'wagmi'
import Banner from './Banner'
import Cart from './Cart'
import Connect from './Connect'
import Wallet from './Wallet'

interface LayoutProps{
    children: React.ReactNode
}

export default function Layout({children}:LayoutProps) {

    const [openWallet, setOpenWallet] = useState(false)
    const [openCart, setOpenCart] = useState(false)
    const {address:userAddress} = useAccount()

  return (
    <>
        <Banner setOpenWallet={setOpenWallet} setOpenCart={setOpenCart}/>
        {children}
        {openWallet && 
            <>
                {userAddress ? <Wallet setOpen={setOpenWallet} /> : <Connect />}
            </>
        }
        {openCart && 
            <>
                {userAddress ? <Cart setOpen={setOpenCart} /> : <Connect />}
            </>
        }
    </>
  )
}
