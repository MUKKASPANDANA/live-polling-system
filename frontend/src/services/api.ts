import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/polls';

export interface CreatePollPayload {
  question: string;
  options: string[];
  duration: number;
}

export const apiService = {
  createPoll: async (data: CreatePollPayload) => {
    return axios.post(`${API_BASE_URL}/create`, data);
  },

  getActivePoll: async () => {
    return axios.get(`${API_BASE_URL}/active`);
  },

  getPollResults: async (pollId: string) => {
    return axios.get(`${API_BASE_URL}/${pollId}/results`);
  },

  getPollHistory: async (limit?: number) => {
    return axios.get(`${API_BASE_URL}/history`, { params: { limit } });
  },

  hasStudentVoted: async (pollId: string, studentId: string) => {
    return axios.get(`${API_BASE_URL}/${pollId}/student/${studentId}/voted`);
  },

  closePoll: async () => {
    return axios.post(`${API_BASE_URL}/close`);
  },
};
