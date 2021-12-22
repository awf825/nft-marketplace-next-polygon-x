import { useState } from 'react';
import { ethers } from 'ethers';
// this is a way for us to interact with ipfs for uploading and downloading
import { create as ipfsHttpClient } from 'ipfs-http-client';
import { useRouter } from 'next/router';
import Web3Modal from 'web3modal';
import axios from 'axios';

/*
API Key: cecb04983d2e9ac1f36e
 API Secret: 8a0a05a60f7e215ad393241ca8ea8954c0b703ce93a5279439ffa97c8bd128dc
 JWT: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI4MDc4NjEyMi1lYjk2LTRmNDMtOTdkNC1lZTM4ZjdiNDBmMTMiLCJlbWFpbCI6ImZhaWRlbjQ1NEBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJpZCI6Ik5ZQzEiLCJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MX1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlfSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiY2VjYjA0OTgzZDJlOWFjMWYzNmUiLCJzY29wZWRLZXlTZWNyZXQiOiI4YTBhMDVhNjBmN2UyMTVhZDM5MzI0MWNhOGVhODk1NGMwYjcwM2NlOTNhNTI3OTQzOWZmYTk3YzhiZDEyOGRjIiwiaWF0IjoxNjQwMTg5MzYyfQ.II_Ulm6VtR8d4H71HIY-DFCN6_hLdZPmaxF5S-5aJKM
 */

export const testAuthentication = () => {
    const url = `https://api.pinata.cloud/data/testAuthentication`;
    return axios
        .get(url, {
            headers: {
                'pinata_api_key': "your pinata api key",
                'pinata_secret_api_key': "your pinata secret api key"
            }
        })
        .then(function (response) {
            console.log(response)
        })
        .catch(function (error) {
            //handle error here
        });
};