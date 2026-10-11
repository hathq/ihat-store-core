// Web placement accepts a finite owner observation, not remote renderer code.
// Its reader is provided by the Crowsi/delivery host; this package owns no auth.
import {createStore,limits} from '@hathq/ihat-store-core'
export async function webStore(read,{signal}={}){
 const value=await read({maximumBytes:limits.documentBytes,signal})
 if(!(value instanceof Uint8Array)||value.byteLength>limits.documentBytes)throw Object.assign(Error('StoreLimitExceeded'),{code:'StoreLimitExceeded'})
 let observation;try{observation=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(value))}catch{throw Object.assign(Error('InvalidStoreObservation'),{code:'InvalidStoreObservation'})}
 return createStore(observation)
}
