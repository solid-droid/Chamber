let rawData = process.env.ChamberMsg;
let data = JSON.parse(rawData);
switch(data.type){
    case 'echo' : console.log(rawData)
}
process.exit(1);