function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function test(url) {
    console.log('Start to ping');
    while (true) {
        console.log(`Hereee : ${self.location.href}`);
        // if (self.location.href !== url)
        // {
        //     await sleep(10000);
        // }
        // else
        // {
        //     await sleep(1);
        //     console.log(`Hereee : ${self.location.href}`);
        //     console.log(`Hereee : ${self.location.href == url}`); 
        // }
    }
    console.log('Finish worker!')
}

self.onmessage = function(event) {
    const url = event.data.url;
    test(url);
};
