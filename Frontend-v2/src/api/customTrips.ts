import { apiClient } from './client';

export const customTripsApi = {
    getDestinations: async () => {
        const { data } = await apiClient.get('/custom-trips/destinations');
        return data;
    },
    getItinerariesByDestination: async (destinationId: string) => {
        const { data } = await apiClient.get('/custom-trips/itineraries', {
            params: { destinationId }
        });
        return data;
    },
    getOptions: async () => {
        const { data } = await apiClient.get('/custom-trips/options');
        return data;
    },
    submitRequest: async (payload: any) => {
        const { data } = await apiClient.post('/custom-trips/request', payload);
        return data;
    },
    getAllRequests: async () => {
        const { data } = await apiClient.get('/custom-trips/requests');
        return data;
    },
    createOption: async (payload: any) => {
        const { data } = await apiClient.post('/custom-trips/options', payload);
        return data;
    },
    updateOption: async (id: string, payload: any) => {
        const { data } = await apiClient.put(`/custom-trips/options/${id}`, payload);
        return data;
    },
    deleteOption: async (id: string) => {
        const { data } = await apiClient.delete(`/custom-trips/options/${id}`);
        return data;
    }
};
