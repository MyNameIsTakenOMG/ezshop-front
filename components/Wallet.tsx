import { Form, Modal, TabList, Tab, Button, useNotification, notifyType, IPosition } from '@web3uikit/core'
import { FormDataReturned } from '@web3uikit/core/dist/lib/Form/types'
import {CreditCard} from '@web3uikit/icons'
import React, { useEffect, useRef, useState } from 'react'
import {useAccount,useContractRead, useContractReads, useContractWrite, usePrepareContractWrite} from 'wagmi'
import addresses from '../contracts/addresses.json'
import EZTokenAbi from '../contracts/EZToken.abi.json'
import {ethers} from 'ethers'
import Head from 'next/head'

interface WalletProps{
    setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export default function Wallet({setOpen}: WalletProps) {

  // notifications
  const dispatch = useNotification()
  const handleNotifications = (type:notifyType,position:IPosition,message?:string)=>{
    dispatch({type,position,message})
  } 

  const [openTokenForm, setOpenTokenForm] = useState(false)
  const [openAllowanceForm, setOpenAllowanceForm] = useState(false)
  const {address: userAddress} = useAccount()  

  const {data,isFetching,error} = useContractReads({
    contracts:[
      {
        address:addresses.EZToken,
        abi:EZTokenAbi,
        functionName:'balanceOf',
        args:[userAddress],
      },
      {
        address:addresses.EZToken,
        abi:EZTokenAbi,
        functionName:'allowance',
        args:[userAddress, addresses.EZMarketplace]
      }
    ],
    watch:true
  })


  const tokenAMount = useRef(0)
  const addOrSubtract = useRef('')
  const allowanceToManage = useRef(0)

  const {writeAsync: buyTokens,isError:mintError,isLoading:mintLoading} = useContractWrite({
    abi:EZTokenAbi,
    address:addresses.EZToken,
    functionName:'mint',
    mode:'recklesslyUnprepared',
    onError:(err)=>{
      console.log(err)
    }
  })

  const {writeAsync: addAllowance,isError : addAllowanceError,isLoading: addAllowanceLoading} = useContractWrite({
    abi:EZTokenAbi,
    address:addresses.EZToken,
    functionName:'increaseAllowance',
    mode:'recklesslyUnprepared',
    onError:(err)=>{
      console.log(err)
    }
  })
  const {writeAsync: subtractAllowance,isError : subtractAllowanceError,isLoading: subtractAllowanceLoading} = useContractWrite({
    abi:EZTokenAbi,
    address:addresses.EZToken,
    functionName:'decreaseAllowance',
    mode:'recklesslyUnprepared',
    onError:(err)=>{
      console.log(err)
    }
  })
  

  const handleOpenTokenForm = ()=>{
    if(openAllowanceForm)setOpenAllowanceForm(false)
    setOpenTokenForm(true)
  }
  const handleOpenAllowanceForm = ()=>{
    if(openTokenForm) setOpenTokenForm(false) 
    setOpenAllowanceForm(true)
  }

  const handleTokenSubmit =async (data: FormDataReturned)=>{
    console.log('input result: ',data.data[0].inputResult)
    tokenAMount.current = Number(data.data[0].inputResult)
    console.log('before buying tokens: ', tokenAMount.current)
    console.log('userAddress: ', userAddress)
    try {
        const tx = await buyTokens?.({
            recklesslySetUnpreparedArgs:[userAddress,tokenAMount.current],
            recklesslySetUnpreparedOverrides:{
              from:userAddress,
              value: ethers.utils.parseEther(String(tokenAMount.current/1000))
            }
          })
        handleNotifications('info','topR','processing...')
        await tx?.wait()
        handleNotifications('success','topR','Tokens bought')
        console.log('tokens bought successfully-------------------------')
        setOpenTokenForm(false)
    } catch (error) {
        handleNotifications('error','topR','Failed to buy tokens')
        console.log(error)
        setOpenTokenForm(false)
    }
  }
  
  const handleAllowanceSubmit = async(data: FormDataReturned)=>{
    try {
      console.log(data)
      allowanceToManage.current = Number(data.data[1].inputResult)
      if(Array.isArray(data.data[0].inputResult)){
        addOrSubtract.current = data.data[0].inputResult[0]
      }
      console.log('add or subtract: ',addOrSubtract.current)
      if(addOrSubtract.current == 'add'){
        const tx =await addAllowance?.({
          recklesslySetUnpreparedArgs:[addresses.EZMarketplace,BigInt(allowanceToManage.current*1e18)]  
        })
        handleNotifications('info','topR','processing...')
        await tx?.wait()
        handleNotifications('success','topR','allowance added')
        console.log('allowance added successfully-----------------------')
      }
      if(addOrSubtract.current == 'subtract'){
        const tx =await subtractAllowance?.({
          recklesslySetUnpreparedArgs:[addresses.EZMarketplace,BigInt(allowanceToManage.current*1e18)]
        })
        handleNotifications('info','topR','processing...')
        await tx?.wait()
        handleNotifications('info','topR','allowance subtracted')
        console.log('allowance subtracted successfully-----------------------')
      }
      setOpenAllowanceForm(false)
    } catch (error) {
      console.log(error)
      setOpenAllowanceForm(false)
    }
  }


  return (
    <div>
      <Head>
        <title>User wallet</title>
        <meta name="description" content="user wallet" />
      </Head>
        <Modal 
        width='500px'
        isVisible 
        hasCancel={false}
        onCloseButtonPressed={()=>{
          setOpen(false)
        }}
        onOk={()=>{
          setOpen(false)
        }}
        title={
          <div className='flex flex-row flex-nowrap gap-3'>
            <CreditCard fontSize='28px' />
            <p className='text-xl text-current'>My Wallet</p>
          </div>
        }
        >
          <div className='flex flex-col flex-nowrap gap-3'>
            <div className='flex flex-row flex-nowrap justify-between'>
              <p>Balance:</p>
              <p className='grow pr-2 text-right'>{data?.[0]?.toString()}</p>
              <p>EZT(EZToken)</p>
            </div>
            <div className='flex flex-row flex-nowrap justify-between'>
              <p>Allowance:</p>
              <p className='grow pr-2 text-right'>{data?.[1]?.toString()}</p>
              <p>EZT(EZToken)</p>
            </div>
            <div className='flex flex-row flex-nowrap pb-2'>
              <Button color='blue' theme='colored' text='tokens' onClick={handleOpenTokenForm}/>
              <Button color='green' theme='colored' text='allowance' onClick={handleOpenAllowanceForm}/>
            </div>
            {openTokenForm && 
              <Form 
                id='tokenForm'
                title='Buy tokens'
                onSubmit={handleTokenSubmit}
                buttonConfig={{
                  theme:'colored',
                  color:'blue'
                }}
                data={[
                  {
                    name:'tokens',
                    type:'number',
                    validation:{
                      required: true,
                      numberMin:1
                    },
                    value:'0'
                  }
                ]}
              />
            }
            {openAllowanceForm && 
            <Form 
            id='allowanceForm'
            title='Manage your allowance' 
            onSubmit={handleAllowanceSubmit} 
            buttonConfig={{
              theme:'colored',
              color:'blue'
            }}
            data={[
              {
                name:'allowance',
                options:[
                  'add',
                  'subtract'
                ],
                value:'Add/Subtract allowance',
                type:'radios',
                
              },
              {
                name:'amount',
                type:'number',
                validation:{
                  required:true,
                  numberMin:1
                },
                value:'0'
              }
            ]}/>
            }

          </div>
        </Modal>
    </div>
  )
}
