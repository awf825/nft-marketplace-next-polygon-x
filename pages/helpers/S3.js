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

export const getRequestedMetadata = async (requested, s3) => {
    let output = [];
    for (let i=0; i < requested.length; i++) {
        const params = { Bucket: 'turtleverse.albums', Key: requested[i].Key }
        const resp = await s3.getObject(params).promise();
        //console.log('raw resp @ getRequestedMetadata: ', resp)
        const metadata = JSON.parse(resp.Body.toString('utf-8'))
        metadata.key = requested[i].Key
        const png = await s3.getObject({ Bucket: 'turtleverse.albums', Key: metadata.image.split('turtleverse.albums/')[1]}).promise()

        output.push({
            metadata: metadata,
            turtle: png
        })
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


