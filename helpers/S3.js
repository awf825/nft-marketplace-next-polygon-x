export const listAllObjectsFromS3Bucket = async (s3, bucket, prefix) => {
    let isTruncated = true;
    let marker;
    const elements = [];
    while(isTruncated) {
      let params = { Bucket: bucket };
      if (prefix) params.Prefix = prefix;
      if (marker) params.Marker = marker;
      try {
        const response = await s3.listObjects(params).promise();
        response.Contents.forEach(item => {
            elements.push(item)  
        })
        isTruncated = response.IsTruncated;
        if (isTruncated) {
          marker = response.Contents.slice(-1)[0].Key;
        }
    } catch(error) {
        throw error;
      }
    }
    return elements;
}

export const getRequestedGiveawayMetadata = async (user, s3) => {
  const generation = process.env.NEXT_PUBLIC_GENERATION;
  const wallet = user.attributes.ethAddress;
  const giveawaysJSON = await s3.getObject({ Bucket: 'turtleverse.albums', Key: `${generation}/giveawayStructure.json`}).promise()
  const giveaways = JSON.parse(giveawaysJSON.Body.toString('utf-8'))
  let output = [];
  const giveaway = giveaways.structure.find(s => {
    return (s.wallet.toLowerCase() === wallet)
  })
  if (giveaway !== undefined) {
    const giveawayBatch = giveaway.tokens;
    while (giveawayBatch.length > 0) {
      const resp = await s3.getObject({ Bucket: 'turtleverse.albums', Key: `${generation}/metadata/${giveawayBatch[0]}`}).promise()
      const metadata = JSON.parse(resp.Body.toString('utf-8'))
      metadata.key = `${generation}/metadata/${giveawayBatch[0]}`;
      if (metadata.minted === false) {
        const png = await s3.getObject({ Bucket: 'turtleverse.albums', Key: metadata.image.split('turtleverse.albums/')[1]}).promise()
        output.push({
            metadata: metadata,
            turtle: png
        })
        giveawayBatch.shift();
      } else {
        return [];
      }
    }
  } else {
    return [];
  }
  return output;
}

export const getRequestedMetadata = async (requested, s3, n) => {
    let output = [];
    let i = 0
    while (n > 0) {
      const params = { Bucket: 'turtleverse.albums', Key: requested[i].Key }
      const resp = await s3.getObject(params).promise();
      const metadata = JSON.parse(resp.Body.toString('utf-8'))
      console.log('metadata.minted @ getdata: ', metadata.minted)
      if (metadata.minted === false) {
        metadata.key = requested[i].Key
        const png = await s3.getObject({ Bucket: 'turtleverse.albums', Key: metadata.image.split('turtleverse.albums/')[1]}).promise()
        output.push({
            metadata: metadata,
            turtle: png
        })
        n--;
      } else {
        console.log('turtle already minted!')
      }
      i++;
    }
    return output;
}

export const updateRequestedMetadata = async (requested, s3) => {
  console.log('requested @ updateRequestedMetadata: ', requested)
  const params = { 
    Bucket: 'turtleverse.albums', 
    Key: requested.key, 
    Body: JSON.stringify(requested), 
    ContentType: "application/json" 
  }
  const resp = await s3.putObject(params).promise();
  console.log('resp @ updateRequestedMetadata: ', resp)
}

export const getAbiFromBucket = async (s3, bucket) => {
  const resp = await s3.getObject({ Bucket: bucket, Key: 'abi/Turtleverse.json' }).promise()
  const payload = JSON.parse(resp.Body.toString('utf-8'))
  return payload
}


