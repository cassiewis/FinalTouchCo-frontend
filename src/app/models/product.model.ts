export interface Product {
    type: string;
    productId: string;
    active: boolean;
    custom: boolean;
    quantity: number;
    name: string;
    price: number;
    deposit: number;
    description: string;
    imageUrl: string;
    datesReserved: Date[];
    tags: string[];
    // searchTerms: string[];
    material: string;
    addons?: string[];
}