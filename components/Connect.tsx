import React from 'react'
import {Modal} from '@web3uikit/core'
import {Metamask} from '@web3uikit/icons'
import {useConnect} from 'wagmi'
import { useRouter } from 'next/router'

interface ConnectProps{
    handleClosePurchaseForm?:()=>void
}

export default function Connect({handleClosePurchaseForm}:ConnectProps) {

    const router = useRouter()
    const {connect,connectors,isLoading,data,error,status} = useConnect()

    const handleConnect = async(e : React.MouseEvent<HTMLButtonElement, MouseEvent>)=>{
        e.preventDefault()
        console.log('hello world')
        connect({connector:connectors[0]})
    }

    const handleCancelConnect = ()=>{
        console.log('click cancel')
        if(router.pathname!=='/'){
            router.push('/',undefined,{shallow:true})
        }
        else{
            handleClosePurchaseForm?.()
        }
    }

  return (
    <div>
        <Modal
            width='400px'
            isVisible
            okButtonColor='green'
            okText='Connect'
            onCancel={handleCancelConnect}
            onCloseButtonPressed={handleCancelConnect}
            onOk={handleConnect}
        >
            <div className='flex flex-nowrap flex-col justify-center items-center gap-2'>
                <Metamask fontSize='64px'/>
                <p>Connect to MetaMask?</p>
            </div>
        </Modal>
    </div>
  )
}
