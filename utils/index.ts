const DECIMAL = 18

const tokenConverter = (bigNum : string)=>{
    // if the number is 19-digit number or larger
    if(bigNum.length >= 19)
        return `${bigNum.slice(0, bigNum.length-DECIMAL)}.${bigNum.slice(-DECIMAL,-(DECIMAL-4))}`
    // if the number is 18-digit number or smaller
    else {
        let actualNum = bigNum
        if(bigNum.length < 18){
            for(let i = 0; i < DECIMAL - bigNum.length; i++){
                actualNum = '0' + actualNum
            }
        }
        return `0.${actualNum.slice(0,4)}`
    }
}

export {tokenConverter}