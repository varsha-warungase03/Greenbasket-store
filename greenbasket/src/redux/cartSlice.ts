import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { stat } from "fs";
import mongoose from "mongoose";


interface IGrocery {
    _id: string,
    name: string,
    category: string,
    price: number,
    quantity: number,
    unit: string,
    image: string,
    createdAt?: Date,
    updatedAt?: Date
}

interface ICartSlice {
    cartData: IGrocery[],
    subTotal: number,
    deliveryFee: number,
    finalTotal: number
}


const initialState: ICartSlice = {
    cartData: [],
    subTotal: 0,
    deliveryFee: 80,
    finalTotal: 80
}

const cartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {
        addToCart: (state, action: PayloadAction<IGrocery>) => {
            
            state.cartData?.push(action.payload)
            cartSlice.caseReducers.calculateTotals(state)
           

        },
        increaseQuantity: (state, action: PayloadAction<string>) => {
            const item = state.cartData.find(i => i._id == action.payload)
            if (item) {
                item.quantity = item.quantity + 1
            }
            cartSlice.caseReducers.calculateTotals(state)
        },
        decreaseQuantity: (state, action: PayloadAction<string>) => {
            const item = state.cartData.find(i => i._id == action.payload)
            if (item?.quantity && item.quantity > 1) {
                item.quantity = item.quantity - 1
            } else {
                state.cartData = state.cartData.filter(i => i._id !== action.payload)
            }
            cartSlice.caseReducers.calculateTotals(state)
        },
        removeFromCart: (state, action: PayloadAction<string>) => {
            state.cartData = state.cartData.filter(i => i._id !== action.payload)
            cartSlice.caseReducers.calculateTotals(state)
        },

        calculateTotals: (state) => {
            state.subTotal = state.cartData.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0)
            state.deliveryFee = state.subTotal > 100 ? 0 : 80
            state.finalTotal = state.subTotal + state.deliveryFee
            
        }
    }
})

export const { addToCart, increaseQuantity, decreaseQuantity, removeFromCart, calculateTotals } = cartSlice.actions

export default cartSlice.reducer