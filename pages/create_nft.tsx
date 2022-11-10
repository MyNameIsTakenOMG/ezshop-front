import { Form, Button } from '@web3uikit/core'
import { FormDataReturned } from '@web3uikit/core/dist/lib/Form/types';
import axios from 'axios';
import Head from 'next/head';
import React from 'react'
import { useAccount, useContractWrite } from 'wagmi';
import Connect from '../components/Connect';
import addresses from '../contracts/addresses.json'
import EZNftAbi from '../contracts/EZNft.abi.json'

export default function create_nft() {

  const {address : userAddress} = useAccount()
  const {writeAsync: mintNft} = useContractWrite({
    mode:'recklesslyUnprepared',
    abi:EZNftAbi,
    address:addresses.EZNft,
    functionName:'safeMint',
    onError:(err)=>{
      console.log(err)
    }
  })

  const handleSubmit = async(data:FormDataReturned)=>{
    console.log('file: ',((data.data[3].inputResult as unknown) as File).name)
    console.log('api key: ',process.env.NEXT_PUBLIC_PINATA_API_KEY)
    console.log('api secret: ',process.env.NEXT_PUBLIC_PINATA_API_SECRET)
    try {
      const formData = new FormData()
      formData.append('file',(data.data[3].inputResult as string),((data.data[3].inputResult as unknown) as File).name)
      let url = 'https://api.pinata.cloud/pinning/pinFileToIPFS'
      const response = await axios.post(url,formData,{
        maxContentLength: -1,
        headers: {
          "Content-Type": `multipart/form-data;`,
          "pinata_api_key": process.env.NEXT_PUBLIC_PINATA_API_KEY,
          "pinata_secret_api_key": process.env.NEXT_PUBLIC_PINATA_API_SECRET,
          "path": "somename",
        },
      })
      console.log('the response: ',response.data)
      // response.data ={IpfsHash, Timestamp, PinSize}
      let assetAddress = 'ipfs://'+response.data.IpfsHash
      let assetMetadata = JSON.stringify({
        "pinataOptions":{
          "cidVersion":1
        },
        "pinataMetadata":{
          "name":data.data[0].inputResult,
          "keyValues":{
            "attributes":data.data[2].inputResult
          },
          "description":data.data[1].inputResult
        },
        "pinataContent":{
          "name":data.data[0].inputResult,
          "description":data.data[1].inputResult,
          "attributes":data.data[2].inputResult,
          "asset":assetAddress
        }
      })

      const tokenUriResponse = await axios.post('https://api.pinata.cloud/pinning/pinJSONToIPFS',assetMetadata,{
        headers:{
          "Content-Type": "application/json",
          "pinata_api_key": process.env.NEXT_PUBLIC_PINATA_API_KEY,
          "pinata_secret_api_key": process.env.NEXT_PUBLIC_PINATA_API_SECRET,
        }
      })

      console.log('file uploaded successfully------------------------');
      console.log('tokenuri reponse: ', tokenUriResponse.data)
      let tokenUri = 'ipfs://' + tokenUriResponse.data.IpfsHash

      // mint nft
      const tx = await mintNft?.({
        recklesslySetUnpreparedArgs:[userAddress,tokenUri]
      })
      await tx?.wait()
      console.log('nft created successfully----------------------')

    } catch (error) {
      console.log('failed to create nft -------------------------------')
      console.log(error)
    }
  }

  if(!userAddress){
    return <Connect />
  }

  return (
    <>
    <Head>
      <title>Create your own nft</title>
      <meta name="description" content="create your own nft" />
    </Head>
    <div className='mx-auto w-4/5 max-w-screen-sm'>
      <Form 
        onSubmit={(data)=>{handleSubmit(data)}}
        title='Create your nft'
        id='nft_form'
        data={[
          {
            inputWidth:'100%',
            name:'NFT name',
            type:'text',
            value:'',
            validation:{
              required: true,
            }
          },
          {
            inputWidth:'100%',
            name:'description',
            type:'text',
            value:'',
            validation:{
              required:true
            }
          },
          {
            inputWidth:'100%',
            name:'Attributes',
            type:'text',
            value:'',
            validation:{
              required:true
            }
          },
          {
            inputWidth:'100%',
            name:'Your media Asset',
            type:'file',
            value:'',
            validation:{
              required:true
            } 
          },
        ]}
        customFooter={
          <div className='flex flex-row flex-nowrap justify-between'>
            <Button color='yellow' theme='colored' text='Cancel' />
            <Button color='blue' theme='colored' text='Confirm' type='submit'/>
          </div>
        }
      />
    </div>
    </>
  )
}
