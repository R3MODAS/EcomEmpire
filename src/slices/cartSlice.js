import { createSlice } from "@reduxjs/toolkit";
import { toast } from "react-hot-toast"

const cartSlice = createSlice({
    name: "cart",
    initialState: {
        cart: JSON.parse(localStorage.getItem("cart")) || [],
        total: JSON.parse(localStorage.getItem("total")) || 0,
        totalItems: JSON.parse(localStorage.getItem("totalItems")) || 0
    },
    reducers: {
        addToCart: (state, action) => {

        },
        removeFromCart: (state, action) => {

        },
        resetCart: (state) => {
            state.cart.length = 0
            state.total = 0
            state.totalItems = 0
            localStorage.removeItem("cart")
            localStorage.removeItem("total")
            localStorage.removeItem("totalItems")
        }
    }
})

export const { addToCart, removeFromCart, resetCart } = cartSlice.actions
export default cartSlice.reducer