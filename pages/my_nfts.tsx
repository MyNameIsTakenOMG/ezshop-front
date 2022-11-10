import Head from 'next/head'
import React, { useEffect, useState } from 'react'
import { useAccount, useContractWrite } from 'wagmi'
import Connect from '../components/Connect'
import client from '../apollo/config'
import { gql } from '@apollo/client'
import NftCard from '../components/NftCard'
import { Input, Modal } from '@web3uikit/core'
import {Edit} from '@web3uikit/icons'
import addresses from '../contracts/addresses.json'
import EZMarketplaceAbi from '../contracts/EZMarketplace.abi.json'
import EZNftAbi from '../contracts/EZNft.abi.json'

interface NftProps{
  nftAddress: string,
  price:bigint,
  tokenId:bigint,
  owner:{
    id:string
  }
}

const userQuery = `
query($id: ID!){
  user(id: $id){
    nftNum
    nfts{
      nftAddress
      tokenId
      price
      owner{
        id
      }
    }
  }
}
`

export default function my_nfts() {

  const {address:userAddress,status} = useAccount()
  const [totalNum, setTotalNum] = useState(0)
  const [nftArr, setNftArr] = useState<NftProps[]>([])

  // price form
  const [openPriceForm, setOpenPriceForm] = useState(false)
  const [newNftPrice, setNewNftPrice] = useState('')
  const [nftAddress, setNftAddress] = useState('')
  const [oldNftPrice, setOldNftPrice] = useState<bigint>()
  const [tokenId, setTokenId] = useState<bigint>()
  const handleClosePriceForm = ()=>{
    setOpenPriceForm(false)
  }
  const handleOpenPriceForm =(nftAddress:string,oldNftPrice:bigint,tokenId:bigint)=>{
    setNftAddress(nftAddress)
    setTokenId(tokenId)
    setOldNftPrice(oldNftPrice)
    setOpenPriceForm(true)
  }

  // fetch nfts that the user owns
  const fetchUserNfts = ()=>{
    if(userAddress){
      console.log('fetching--------------------')
      console.log('user address: ',userAddress.toLowerCase())
      client.query({
        query:gql(userQuery),
        variables:{id:userAddress.toLowerCase()}
      }).then(result=>{
        console.log('result: ',result.data)
        // if the user does have nft(s)
        if(result.data.user){
          let newNftArr = (result.data.user.nfts as NftProps[]).map((nft)=>{
            let nftItem = {
              nftAddress: nft.nftAddress,
              tokenId: nft.tokenId,
              price:nft.price,
              owner:{
                id: userAddress.toLowerCase()
              }
            }
            return nftItem
          })
          setNftArr((pre)=>newNftArr)
          console.log('total: ',result.data.user.nftNum)
          setTotalNum(result.data.user.nftNum)
        }
        // if the user has no nft
        else{
          setNftArr(pre=>[])
          setTotalNum(0)
        }
      }).catch(err=>{console.log('error: ',err)})
    }
  }

  // list item call if the price is 0 (get approved first)
  // update item info call when price is not 0
  const {writeAsync: getApproval,isLoading:getApprovalLoading,error:getApprovalError} = useContractWrite({
    mode:'recklesslyUnprepared',
    address:addresses.EZNft,
    abi: EZNftAbi,
    functionName:'approve',
    onError:(err)=>{
      console.log(err)
    }
  })
  const {writeAsync:sellNft,isLoading:sellNftLoading,error:sellNftError} = useContractWrite({
    mode:'recklesslyUnprepared',
    address: addresses.EZMarketplace,
    abi: EZMarketplaceAbi,
    functionName:'listItem',
    onError:(err)=>{
      console.log(err)
    }
  })
  const {writeAsync:updateNft,isLoading:updateNftLoading,error:updateNftError} = useContractWrite({
    mode:'recklesslyUnprepared',
    address: addresses.EZMarketplace,
    abi: EZMarketplaceAbi,
    functionName:'updateItem',
    onError:(err)=>{
      console.log(err)
    }
  })
  const handlePriceConfirm = async()=>{
    try {
      // not listed yet
      if(!oldNftPrice || oldNftPrice <= 0){
        console.log('getting approval ---------------------')
        const getApprovalTx = await getApproval?.({
          recklesslySetUnpreparedArgs:[addresses.EZMarketplace,tokenId]
        })
        await getApprovalTx?.wait(1)
        console.log('approval got successfully -------------------------')
        console.log('getting nft ready for sale----------------------------')
        if(Number(newNftPrice)<=0){
          throw new Error('nft price should be greater than zero')
        }
        const sellNftTx = await sellNft?.({
          recklesslySetUnpreparedArgs:[nftAddress,tokenId,BigInt(Number(newNftPrice)*1e18)]
        })
        await sellNftTx?.wait(1)
        console.log('nft is on sale now ------------------------')
        fetchUserNfts()
      }
      // update the price for the nft
      else{
        if(Number(newNftPrice)<=0){
          throw new Error('nft price should be greater than zero')
        }
        console.log('updating price for nft now ------------------------')
        const updateNftTx = await updateNft?.({
          recklesslySetUnpreparedArgs:[nftAddress,tokenId,BigInt(Number(newNftPrice)*1e18)]
        })
        await updateNftTx?.wait(1)
        console.log('updated price for nft successfully ------------------------')
        fetchUserNfts()
      }
    } catch (error) {
      console.log('error: ',error)
      console.log('failed to update the price for the nft or failed to sell the nft')
    }
  }
  // cancel sale for the item
  const {writeAsync:cancelSale,isLoading:cancelSaleLoading,error:cancelSaleError} = useContractWrite({
    mode:'recklesslyUnprepared',
    address: addresses.EZMarketplace,
    abi: EZMarketplaceAbi,
    functionName:'cancelItem',
    onError:(err)=>{
      console.log(err)
    }
  })
  const handleCancelSale = async()=>{
    try {
      if(!oldNftPrice || oldNftPrice <=0){
        console.log('old nft price: ',oldNftPrice)
        console.log('the item is not for sale yet...') 
      }
      else{
        console.log('cancelling sale------------------------')
        const tx = await cancelSale?.({
          recklesslySetUnpreparedArgs:[nftAddress,tokenId]
        })
        await tx?.wait(1)
        console.log('cancelled sale successfully------------------------')
        fetchUserNfts()
      }
    } catch (error) {
      console.log('error: ',error)
    }
  }



  useEffect(()=>{
    if(userAddress!==undefined){
      fetchUserNfts()
    }
  },[userAddress])

  return (
    <>
    {(userAddress == undefined) 
    ? <Connect /> 
    :
      <div className='w-full flex flex-col mt-4 p-2'>
        <Head>
          <title>My NFTs</title>
          <meta name="description" content="user's nfts" />
        </Head>
        <div className='text-3xl font-bold mb-3'>My NFTs</div>
        <div className='text-1xl font-bold mb-2'>Total: {totalNum} nfts</div>
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6'>
          {nftArr.length!==0 && 
            nftArr.map((nft,index)=>{
              return <div className='relative overflow-hidden' key={index}>
                <NftCard key={index} handleOpenPriceForm={handleOpenPriceForm} nftAddress={nft.nftAddress} tokenId={nft.tokenId} price={nft.price} seller={nft.owner.id}/>
                {nft.price > 0 && 
                <div className='absolute top-0 left-0 text-white bg-red-500/75 px-5 -rotate-45 -translate-x-6 translate-y-3'>On Sale</div>}
              </div>
            })
          }
        </div>
        
        {openPriceForm &&
        <Modal
          cancelText='Cancel sale'
          okButtonColor='blue'
          id='Price Form'
          width='400px'
          isVisible
          onCancel={handleCancelSale}
          onCloseButtonPressed={handleClosePriceForm}
          onOk={handlePriceConfirm}
          okText='Update price'
          title={<div className='flex gap-4'>
            <Edit fontSize='28px'/>
            <p className='text-xl text-current'>Set new price / Cancel sale</p>
          </div>}
        >
          <div className='mb-4'>
            <Input 
              label='set nft price'
              placeholder='**Decimals are acceptable**'
              onChange={(e)=>{setNewNftPrice(e.target.value)}}
              value={newNftPrice}
            />
          </div>
        </Modal>}
      </div>
    }
    </>
  )
}


// 0x1dD36177C003aA32E3bb8d0e39818ce6808Ee8ad -->❌
// 0x1dd36177c003aa32e3bb8d0e39818ce6808ee8ad -->✅
// the graph differenciating the uppercase and lowercase characters