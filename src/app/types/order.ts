export type FoodItem = {
    id: string
    name: string
    category: string
}

export type FoodMenu = {
    id: string
    name: string
    foodItems: FoodItem[]
}

export type Order = {
    id: string
    totalAmount: number
    status: string
    paymentStatus: string
    createdAt: string
    activeDates: string[]
    selectedMenus: FoodMenu[]
    address: string
    buildingName: string | null
    flatRoomNumber: string | null
    customer: {
        name: string
        email: string
    }
}
