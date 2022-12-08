import React,{useState, useEffect} from 'react'
import {Card} from '@web3uikit/core'
import { useContractRead } from 'wagmi'
import addresses from '../contracts/addresses.json'
import EZNftAbi from '../contracts/EZNft.abi.json'
import axios from 'axios'
import { tokenConverter } from '../utils'

interface NftCardProps{
  nftAddress: string,
  seller: string,
  tokenId: bigint,
  price: bigint,
  handleOpenPriceForm?:(nftAddress:string,oldNftPrice:bigint,tokenId:bigint)=>void,
  handleOpenPurchaseForm?:(nftAddress:string,tokenId:bigint,price:bigint)=>void
}

export default function NftCard({nftAddress,seller,tokenId,price,handleOpenPriceForm,handleOpenPurchaseForm}:NftCardProps) {

  const [imageUri, setImageUri] = useState('')
  const [imageName, setImageName] = useState('')
  const [imageDescription, setImageDescription] = useState('')
  const [imageAttributes, setImageAttributes] = useState('')

  const {data:tokenUri,isLoading,error,} = useContractRead({
    address: addresses.EZNft,
    abi: EZNftAbi,
    functionName:'tokenURI',
    args:[tokenId]
  })

  console.log('tokenURI: ',tokenUri)

  const fetchAsset = async()=>{
    let metadataUri = (tokenUri as string).replace('ipfs://','https://ipfs.io/ipfs/')
    let metadata = await axios.get(metadataUri)
    console.log('metadata: ' + metadata.data)
    const {name, description, attributes, asset} = metadata.data
    setImageName(name)
    setImageDescription(description)
    setImageAttributes(attributes)
    setImageUri((asset as string).replace('ipfs://','https://ipfs.io/ipfs/'))
  }

  useEffect(() => {
    fetchAsset()
  }, [])

  return (

      <Card 
        onClick={
          handleOpenPriceForm 
          ?()=>{ handleOpenPriceForm?.(nftAddress,price,tokenId)}
          : handleOpenPurchaseForm 
            ? ()=>{handleOpenPurchaseForm(nftAddress,tokenId,price)}
            : undefined} 
        description={price <= 0 ? '':`Price: ${tokenConverter(String(price))}`} 
        isSelected={false} 
        title={imageName} 
        tooltipMoveBody={-90} 
        tooltipMove={80}  
        tooltipText={<span style={{width: 100}}>{imageDescription}</span>}>
          {/* <img src="" className='w-30 h-30 bg-green-300'/> */}
          <div className='w-full h-44 flex flex-col flex-nowrap justify-center items-center'>
            <img src={imageUri} className='h-44 object-cover'></img>
          </div>
      </Card>
  )
}
