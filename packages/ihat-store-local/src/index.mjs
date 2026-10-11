// Local/offline placement: all package interpretation and trust stay at Hatter.
import {observeCatalog} from '@hathq/ihat-store-source'
import {createStore} from '@hathq/ihat-store-core'
export async function localStore(rpc,options){return createStore(await observeCatalog(rpc,options))}
