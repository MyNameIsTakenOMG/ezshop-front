import { gql } from '@apollo/client'
import client from '../apollo/config'
import Head from 'next/head'
import { useEffect, useState } from 'react'
import NftCard from '../components/NftCard'
import { useAccount, useContractReads, useContractWrite } from 'wagmi'
import {IPosition, Modal, notifyType, useNotification} from '@web3uikit/core'
import addresses from '../contracts/addresses.json'
import EZMarketplace from '../contracts/EZMarketplace.abi.json'
import EZNftAbi from '../contracts/EZNft.abi.json'
import EZTokenAbi from '../contracts/EZToken.abi.json'
import Connect from '../components/Connect'

interface NftProps{
  nftAddress: string,
  price:bigint,
  tokenId:bigint,
  owner:{
    id:string
  }
}

export default function Home() {

  const [nftArr, setNftArr] = useState<NftProps[]>([])
  const {address: userAddress,status} = useAccount()

  // notifications
  const dispatch = useNotification()
  const handleNotifications = (type:notifyType,position:IPosition,message?:string)=>{
    dispatch({type,position,message})
  } 

  // perchase form
  const [nftAddress, setNftAddress] = useState('')
  const [tokenId, setTokenId] = useState<bigint>()
  const [openPurchaseForm, setOpenPurchaseForm] = useState(false)
  const [price, setPrice] = useState<bigint>()
  const handleOpenPurchaseForm = (nftAddress:string,tokenId:bigint,price:bigint)=>{
    setNftAddress(nftAddress)
    setTokenId(tokenId)
    setPrice(price)
    setOpenPurchaseForm(true)
  }
  const handleClosePurchaseForm = ()=>{
    setOpenPurchaseForm(false)
  }

  const {writeAsync: buyNft,isLoading,error} = useContractWrite({
    mode:'recklesslyUnprepared',
    address: addresses.EZMarketplace,
    abi: EZMarketplace,
    functionName:'buyItem',
    onError:(err)=>{
      console.log('error: ',err)
    }
  })

  const {refetch} = useContractReads({
    contracts:[
      {
        address:addresses.EZNft,
        abi:EZNftAbi,
        functionName:'ownerOf',
        args:[tokenId]
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

  const handleConfirmPurchase = async()=>{
    try {
      const result = await refetch({throwOnError:true})
      console.log('result: '+ result.data)
      // first check the owner of the nft
      console.log('user address: ',userAddress)
      if(result.data && result.data[0] == userAddress){
        throw new Error('You are the owner of the nft')
      }
      // second check the allowance of the buyer
      if(result.data && (result.data[1] as bigint) < price! ){
        throw new Error('Not enough allowance')
      }
      // then start the process of purchasing
      console.log('purchasing the nft ----------------------')
      const buyNftTx = await buyNft?.({
        recklesslySetUnpreparedArgs:[addresses.EZToken,nftAddress,tokenId]
      })
      handleNotifications('info','topR','processing...')
      await buyNftTx?.wait()
      handleNotifications('success','topR','Bought the nft!')
      console.log('purchased the nft successfully------------------------')
    } catch (error) {
      handleNotifications('error','topR','Error...')
      console.log('failed to purchase the nft --------------------')
      console.log('error: ',error)
    }
  }

  // fetch nfts for sale
  useEffect(()=>{
    let query = `
      {
        nfts(where:{price_gt:0}){
          owner{
            id
          }
          nftAddress
          tokenId
          price
        }
      }
    `
    client.query({
      query: gql(query)
    }).then(result=>{
      console.log('all nfts result: ', result)
      let newNftArr = [...result.data.nfts]
      setNftArr((pre)=>newNftArr)
    })
    .catch(err=>{console.log('error:',err)})
  },[])


  return (
    <div className='w-full flex flex-col mt-4 p-2'>
      <Head>
        <title>EZ shop</title>
        <meta name="description" content="ez shop market place" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className='text-3xl font-bold mb-3'>Welcome to EZ Shop</div>
      <div className='text-xl font-semibold mb-3'>Explore the world of NFTs</div>
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6'>
        {nftArr.length!==0 && 
          nftArr.map((nft,index)=>{
            return <div className='relative overflow-hidden' key={index}>
              <NftCard key={index} handleOpenPurchaseForm={handleOpenPurchaseForm}  nftAddress={nft.nftAddress} tokenId={nft.tokenId} price={nft.price} seller={nft.owner.id}/>
            </div>
          })
        }
      </div>

      {openPurchaseForm && userAddress &&
      <Modal 
        width='300px'
        okText='Confirm'
        id='purchase form'
        okButtonColor='blue'
        onCancel={handleClosePurchaseForm}
        onCloseButtonPressed={handleClosePurchaseForm}
        onOk={handleConfirmPurchase}
      >
        <div className='mb-4'>
          <p className='text-2xl text-current text-center'>Sure to buy the NFT?</p>
        </div>
      </Modal>
      }
      {openPurchaseForm && !userAddress &&
        <Connect handleClosePurchaseForm={handleClosePurchaseForm}/>
      }
    </div>
  )
}
