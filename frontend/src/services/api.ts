import axios from 'axios';
import type { Workflow } from '../types/workflow';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const getWorkflows = async (): Promise<Workflow[]> => {
  const response = await api.get('/api/workflows');
  return response.data;
};

export const getWorkflow = async (id: string): Promise<Workflow> => {
  const response = await api.get(`/api/workflows/${id}`);
  return response.data;
};

export interface WorkflowUpdateData {
  name?: string;
  arguments_json?: string;
}

export const updateWorkflow = async (id: string, data: WorkflowUpdateData): Promise<Workflow> => {
  const response = await api.put(`/api/workflows/${id}`, data);
  return response.data;
};