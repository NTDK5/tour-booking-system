/* eslint-disable no-unused-vars */
import axios from 'axios';

const base = `${process.env.REACT_APP_API_URL}/api/custom-trips`;

export const createCustomTrip = async (payload) => {
  const { data } = await axios.post(base, payload, { withCredentials: true });
  return data;
};

export const getMyCustomTrips = async () => {
  const { data } = await axios.get(`${base}/my-requests`, { withCredentials: true });
  return data;
};

// Admin
export const getAllCustomTrips = async () => {
  const { data } = await axios.get(base, { withCredentials: true });
  return data;
};

export const getCustomTripById = async (id) => {
  const { data } = await axios.get(`${base}/${id}`, { withCredentials: true });
  return data;
};

export const setProposalAdmin = async (id, payload) => {
  const { data } = await axios.put(`${base}/${id}/proposal`, payload, { withCredentials: true });
  return data;
};

export const updateStatusAdmin = async (id, status) => {
  const { data } = await axios.put(`${base}/${id}/status`, { status }, { withCredentials: true });
  return data;
};

export const deleteCustomTripAdmin = async (id) => {
  const { data } = await axios.delete(`${base}/${id}`, { withCredentials: true });
  return data;
};


