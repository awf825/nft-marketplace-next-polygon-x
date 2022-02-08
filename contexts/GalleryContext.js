import React from "react";

/* payload = 'boolean' */
export const startLoading = (payload) => ({
    type: "START_LOADING",
    payload: payload,
});

/* payload = 'object' (gallery) */
export const fetchGallery = () => ({
    type: "FETCH_GALLERY"
})

export const setGallery = (payload) => ({
    type: "SET_GALLERY",
    payload: payload
})

/* payload = 'boolean' */
export const stopLoading = (payload) => ({
    type: "STOP_LOADING",
    payload: payload,
});

export const isLoading = () => ({
    type: "IS_LOADING"
})

export const setAccessParams = (payload) => ({
    type: "SET_ACCESS_PARAMS",
    payload: payload
})

export const GalleryContext = React.createContext({});

export const galleryReducer = (state, action) => {
  switch (action.type) {
    case "START_LOADING":
    return { 
        ...state, 
        loading: action.payload
    };
    case "FETCH_GALLERY":
    return state.gallery
    case "SET_GALLERY":
    return {
        ...state,
        gallery: action.payload
    }
    case "STOP_LOADING":
    return {
        ...state,
        loading: action.payload
    }
    case "IS_LOADING":
    return state.loading;
    case "SET_ACCESS_PARAMS":
        console.log('accessParams: ', action.payload)
    return {
        ...state,
        accessParams: action.payload
    }
  }
};