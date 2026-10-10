import sys, asyncio
from playwright.async_api import async_playwright
async def main(src,out):
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await b.new_page(viewport={'width':1500,'height':900})
        await pg.goto('file://'+src); h=await pg.evaluate('document.body.scrollHeight')
        i=0; y=0
        while y<h:
            await pg.screenshot(path=f'{out}-{i}.png',full_page=True,clip={'x':0,'y':y,'width':1500,'height':min(900,h-y)}); i+=1; y+=900
        print(i,'captures'); await b.close()
asyncio.run(main(sys.argv[1],sys.argv[2]))
