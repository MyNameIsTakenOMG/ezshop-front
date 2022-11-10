import { Modal, Form } from '@web3uikit/core'
import {CartBag} from '@web3uikit/icons'
import {Bin} from '@web3uikit/icons'
import { FormDataReturned } from '@web3uikit/core/dist/lib/Form/types'
import React from 'react'

interface CartProps{
    setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export default function Cart({setOpen}: CartProps) {


  const handleAllowanceSubmit = (data:FormDataReturned)=>{
    console.log(data)
  }

  return (
    <div>
        <Modal 
          width='450px'
          isVisible 
          okText='finish purchase'
          okButtonColor='blue'
          hasCancel={false}
          title={          
            <div className='flex flex-row flex-nowrap gap-3'>
              <CartBag fontSize='28px'/>
              <p className='text-xl text-current'>Shopping Cart</p>
            </div>
          }
          onCloseButtonPressed={()=>{setOpen(false)}}>
            <div className='item-list flex flex-col flex-nowrap h-72 overflow-y-auto'>
              <div className='item flex flex-row border-black border-2 border-solid'>
                <div className='w-16 h-16 bg-green-400'>img</div>
                <div className='grow p-2 self-center text-center'>description&price</div>
                <div className='p-2 self-center bg-red-400'><Bin fontSize='28px'/></div>
              </div>
            </div>
        </Modal>
    </div>
  )
}

{/* <Form 
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
  ]}/> */}