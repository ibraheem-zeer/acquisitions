// server.js for all about running that server, implementing some logging and everything else
// to make sure that the server is running properly

import app from './app.js';

const PORT = process.env.PORT || 3000

app.listen(PORT , ()=>{
    console.log(`Listening on http://localhost:${PORT}`);
})