declare module '@paypal/checkout-server-sdk' {
    export const core: any;
    export const orders: any;
}

declare module '../utils/paypalClient' {
    const client: any;
    export default client;
}
