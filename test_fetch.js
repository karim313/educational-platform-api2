console.log('Start');
fetch('https://google.com').then(r => console.log('Status Check:', r.status)).catch(e => console.error(e));
