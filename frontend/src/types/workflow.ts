export type WorkflowStatus = 'running' | 'completed' | 'failed' | 'pending';

export interface Workflow {
  id: string;
  name: string | null;
  status: string;
  arguments_json: string | null;
  start_time: string | null;
  end_time: string | null;
  workdir: string | null;
  logs: WorkflowLog[];
}

export interface WorkflowLog {
  id: string;
  timestamp: string;
  message_repr: string;
}