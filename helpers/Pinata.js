import axios from 'axios'

export async function pinFileToIPFS(file) {
    let hash;
    var data = new FormData();
    data.append('file', file);
    const pk = process.env.NEXT_PUBLIC_PINATA_API_KEY;
    const ps = process.env.NEXT_PUBLIC_PINATA_CLIENT_SECRET;
    const base = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
    await axios.post(base,
        data,
        {
            headers: {
                'Content-Type': 'multipart/form-data;',
                'pinata_api_key': pk,
                'pinata_secret_api_key': ps
            }
        }
    ).then(function (response) {
        hash = response.data.IpfsHash
    }).catch(function (error) {
        console.log(error)
    });
    return hash;
};

export async function pinJSONToIPFS(toSend, filename) {
    const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;
    const metadata = {
        pinataMetadata: {
            name: filename,
            keyvalues: {
                isMetadata: "1"
            }
        },
        pinataContent: toSend
    }
    const pk = process.env.NEXT_PUBLIC_PINATA_API_KEY;
    const ps = process.env.NEXT_PUBLIC_PINATA_CLIENT_SECRET;
    return axios
        .post(url, metadata, {
                headers: {
                    'Content-Type': 'application/json',
                    'pinata_api_key': pk,
                    'pinata_secret_api_key': ps
                }
        }).then(function (response) {
            console.log(response)
        }).catch(function (err) {
            console.log(err)
        })
}