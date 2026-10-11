// Controlled placement conformance. The command spy is NOT installed Hatter
// acceptance: actual installation is covered separately at the product boundary.
import test from 'node:test'
import assert from 'node:assert/strict'
import http from 'node:http'
import net from 'node:net'
import {createHash} from 'node:crypto'
import {build} from 'esbuild'
import {chromium,expect} from '@playwright/test'
import {localStore} from '@hathq/ihat-store-local'
import {webStore} from '@hathq/ihat-store-web'
import {storeScene} from '@hathq/ihat-store-scenes'
import {createDeliveryServer} from '@hathq/delivery-server'

const observation={source:{sourceId:'fixture',revision:7,logicalOrigin:'https://fixture.invalid/',signingKeyId:'test-key',publicKeyHex:'a'.repeat(64)},catalog:{sourceId:'fixture',catalogDigestSha256:'b'.repeat(64),artifactAcquisitionAvailable:true,
 categories:[{id:'development',termId:'term:development',name:'Development',summary:'Source category'}],candidates:[{repositoryId:'hat-example',packageId:'hat/example',version:'0.10.0',packageSha256:'c'.repeat(64),name:'Controlled package',summary:'<script>globalThis.injected=true</script>',categoryId:'development',assurance:'source-pinned',installed:false,residenceScopes:[]}]}}
const listen=server=>new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',()=>resolve(server.address().port))})
test('real loopback source and offline local placement share exact rendered Scenes, provenance and user-confirmed install reference on desktop/mobile',{timeout:45000},async()=>{
 const bytes=Buffer.from(JSON.stringify(observation)),remote=http.createServer((req,res)=>{res.writeHead(200,{'content-type':'application/json','content-length':bytes.length});res.end(bytes)})
 const remotePort=await listen(remote),rpc=async method=>method==='hat/catalog/list'?{catalog:structuredClone(observation.catalog)}:{registry:{revision:7,selectedSourceId:'fixture',sources:[structuredClone(observation.source)]}}
 let web
 try{web=await webStore(async({maximumBytes,signal})=>{
  const response=await fetch(`http://127.0.0.1:${remotePort}/catalog`,{signal});assert.equal(response.status,200)
  const length=Number(response.headers.get('content-length'));assert(length<=maximumBytes)
  const chunks=[];let total=0;for await(const chunk of response.body){total+=chunk.length;assert(total<=maximumBytes);chunks.push(chunk)}
  assert.equal(total,length);return Buffer.concat(chunks,total)
 })}finally{await new Promise(r=>remote.close(r))}
 // No online fallback remains available for the local adapter or either renderer.
 const local=await localStore(rpc);assert.deepEqual(storeScene(local),storeScene(web))
 const built=await build({stdin:{contents:"import {startDelivery} from '@hathq/delivery-client';window.client=startDelivery(document.getElementById('app'),JSON.parse(document.getElementById('delivery-state').textContent));",resolveDir:process.cwd()},bundle:true,platform:'browser',format:'esm',minify:true,write:false,logLevel:'silent'})
 assert.deepEqual(built.warnings,[]);const script=Buffer.from(built.outputFiles[0].contents)
 const assets=[{path:'/assets/store.js',bytes:script,bytesLength:script.length,kind:'script',digest:createHash('sha256').update(script).digest('hex')}],results=[]
 const browser=await chromium.launch({headless:true})
 try{for(const [placement,store]of [['local',local],['web',web]]){
  const probe=net.createServer(),port=await listen(probe);await new Promise(r=>probe.close(r))
  const {snapshot}=storeScene(store),actions=snapshot.data.actions,calls=[],errors=[]
  const server=createDeliveryServer({origin:`http://localhost:${port}`,assets,site:{
   document:async(url,{assets})=>({envelope:{contract:'hatter/delivery/1',site:{id:'ihat:fixture',revision:store.revision},initial:{key:snapshot.key,revision:snapshot.revision,lineage:snapshot.lineage},snapshot,readiness:{state:'Ready',requirements:[]},assets,transport:{path:'/api/projection-live',classes:['STATE']}},bootstrap:{input:{key:snapshot.key,revision:snapshot.revision}}}),
   read:async()=>assert.fail('unexpected read'),
   command:async(url,value)=>{assert.equal(url.pathname,'/api/interactions');const action=actions.find(a=>a.id===value.actionId);assert.equal(value.projectionRevision,snapshot.revision);assert.equal(value.interactionRef,action.interaction.ref);assert.equal(value.generation,store.revision);assert.deepEqual(value.values,{});calls.push(JSON.parse(action.interaction.ref));return {state:'Confirmed'}},
   live:async()=>({kind:'NoChange',revision:snapshot.revision})}})
  await server.listen()
  try{for(const viewport of [{width:1280,height:850},{width:390,height:844}]){
   const context=await browser.newContext({viewport}),page=await context.newPage();page.setDefaultTimeout(6000)
   page.on('pageerror',e=>errors.push(e.stack));page.on('console',m=>{
    // SwiftShader reports readback performance diagnostics during pixel checks.
    const readback=m.type()==='warning'&&/^\[\.WebGL-[^\]]+\]GL Driver Message \(OpenGL, Performance, GL_CLOSE_PATH_NV, High\): GPU stall due to ReadPixels(?: \(this message will no longer repeat\))?$/.test(m.text())
    if(['error','warning'].includes(m.type())&&!readback)errors.push(m.text())
   })
   await page.goto(`http://localhost:${port}`);await expect(page.locator('[data-render-revision]')).toHaveAttribute('data-render-revision',snapshot.revision)
   await expect(page.locator('#app')).toHaveAttribute('data-initial-revision',snapshot.revision)
   const values=await page.locator('[data-projection-scalar]').evaluateAll(ns=>ns.map(n=>n.dataset.projectionScalar))
   for(const exact of ['hat/example','0.10.0','c'.repeat(64),'source-pinned','https://fixture.invalid/'])assert(values.includes(JSON.stringify(exact)))
   assert.equal(await page.evaluate(()=>globalThis.injected),undefined)
   await page.locator('.frame-dock [data-panel=settings]').click();
   await page.getByRole('button',{name:'Review this view',exact:true}).click();
   await page.getByRole('button',{name:'Install Controlled package',exact:true}).click();assert.equal(calls.length,viewport.width===1280?0:1)
   await expect(page.locator('form')).toBeVisible();await page.getByRole('button',{name:'Submit',exact:true}).click()
   await expect(page.getByText('Submitted.',{exact:true})).toBeVisible();assert.equal(await page.evaluate(()=>typeof window.client),'object',JSON.stringify(errors));await page.evaluate(()=>window.client.close());await context.close()
  }
  assert.deepEqual(errors,[]);results.push(calls)
  }finally{await server.close()}
  assert.equal(server.inspect().activeRequests,0);assert.equal(server.inspect().transport.connections,0);assert.equal(server.inspect().transport.sessions,0)
 }}finally{await browser.close()}
 assert.deepEqual(results[0],results[1]);assert.equal(results[0].length,2)
 assert.deepEqual(results[0][0],{method:'hat/catalog/install',params:{repositoryId:'hat-example',expected:{sourceId:'fixture',sourceRevision:7,catalogDigestSha256:'b'.repeat(64),packageSha256:'c'.repeat(64)}}})
})
