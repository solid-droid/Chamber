## Latency Tolerant Network
### Goals - Made for MMO with 10,000 + player base support
>1. Global network coverage
>2. smart network switching architecure
>3. bi-direction communication
>4. Controlled bandwidth usage - using byte level messaging 

### Localization
> 1. GeoH3 - Uses H3 Algorithm on users geo-location (x,y)  
> 2. VirtualH3 - User H3 Algorithm on users virtual/game-location(x,y)  
> 3. Zblock - low resolution hight mapping in virtual/game-location(z)  
(example 1 floor will be 1 unit in Zblock)  
> 4. Vblock- virtual parallel dimensions in virtual/game-location (v)  
(example time can be used as a vblock dimension)  

### Network Channels
>1. Super Express lane - 60hz (16ms) (NATS Cloud)
>2. Express lane - 30hz (33ms) (NATS Cloud)
>3. Normal lane - 5hz (200ms) (NATS Cloud)
>4. Ghost lane - 0.5hz (2sec) (NATS Cloud)
>5. Network lane - 0.5hz (2sec) (NATS Cloud)
>6. Warp lane - 120hz(8ms) (WebRTC lane)

### central/distributed NATS websocket/webtransport 
>1. OVH Cloud - VM (6 vCore + 12 GB RAM) - Europe server (Rs 536/month) -   
  Cheapest option - 1 central server (50k + active connection)  
>2. This act as central transport cloud using NATS
>3. Unlimited Traffic at 1 Gbps

### WebRTC - Pear-Pear Communication  
1. 