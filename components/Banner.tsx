import {CgProfile} from 'react-icons/cg'
import {BiWalletAlt, BiPaint} from 'react-icons/bi'
import {AiOutlineShoppingCart} from 'react-icons/ai'
import { Avatar, Tooltip } from '@web3uikit/core'
import { useRouter } from 'next/router'
import React from 'react';
import {useAccount} from 'wagmi'

interface TooltipTextProps{
  text: string
}

const TooltipText = ({text}:TooltipTextProps)=>{
  return <div className='text-xs'>{text}</div>
}


interface BannerProps{
  setOpenWallet:React.Dispatch<React.SetStateAction<boolean>>,
  setOpenCart:React.Dispatch<React.SetStateAction<boolean>>,
}

export default function Banner({setOpenWallet,setOpenCart}:BannerProps) {
  
  const router = useRouter()
  const {status,address,connector} = useAccount()

  console.log('status: ',status)
  console.log('address: ',address)

  const handleLink = (e : React.MouseEvent)=>{
    console.log(e.currentTarget.id)
    const id = e.currentTarget.id

    switch (id) {
      case 'home':
        router.push('/',undefined,{shallow:true})
        break;
      case 'create':
        router.push('/create_nft',undefined,{shallow:true})
        break;
      case 'mynfts':
        router.push('/my_nfts',undefined,{shallow:true})
        break;
      case 'wallet':
        setOpenWallet(true)
        break;
      case 'cart':
        setOpenCart(true)
        break;
      default:
        break;
    }
    
  }

  return (
    <div className="z-50 backdrop-blur sticky top-0 w-full p-4 bg-purple-500/80 text-xl text-white flex flex-row flex-nowrap justify-between items-center shadow">
      <div className="flex flex-row flex-nowrap gap-x-2 cursor-pointer" id='home' onClick={handleLink}>
        <div className='text-purple-500 bg-white p-0.5 rounded-sm' style={{fontFamily:"'Dancing Script', cursive;"}}>EZ</div>
        <div className="text-xl">EZshop</div>
      </div>
      <div className="text-xl flex flex-row flex-nowrap gap-x-6 mr-4">
        <Tooltip position='bottom' content={<TooltipText text='create NFT' />}>
          <div id='create' onClick={handleLink}>
           <BiPaint className='cursor-pointer text-white text-2xl'/>
          </div>
        </Tooltip>
        <Tooltip position='bottom' content={<TooltipText text='My NFTs' />}>
          <div id='mynfts' onClick={handleLink}>
            <CgProfile className='cursor-pointer text-white text-2xl'/>
          </div>
        </Tooltip>
        <Tooltip position='bottom' content={<TooltipText  text='Wallet' />}>
          <div id='wallet' onClick={handleLink}>
            <BiWalletAlt className='cursor-pointer text-white text-2xl'/>
          </div>
        </Tooltip>
        <Tooltip position='bottom' content={<TooltipText  text='Cart'/>}>
          {/* <div id='cart' onClick={handleLink}> */}
          <div id='cart'>
            <AiOutlineShoppingCart className='cursor-pointer text-white text-2xl'/>
          </div>
        </Tooltip>
        {address && 
          <Tooltip position='bottom' content={<TooltipText text={`${address.slice(0,4)}...${address.slice(-5)}`} />}>
            <div className='cursor-pointer'>
              <Avatar theme='image' isRounded size={28}/>
            </div>
          </Tooltip>
        }
      </div>
    </div>
  )
}

