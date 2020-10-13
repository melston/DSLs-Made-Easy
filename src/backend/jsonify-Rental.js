const { writeFileSync } = require("fs") 
const { join } = require("path")
const { rental } = require("../../ch03/listingX.js") 

writeFileSync( 
    join(__dirname, "contents.json"),
    JSON.stringify(rental, null, 2),
    { encoding: "utf8" }
)