import { Link } from 'react-router-dom';
import type { Workflow } from '../types/workflow';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

interface WorkflowTableProps {
  workflows: Workflow[];
  isLoading: boolean;
  error: string | null;
  onEdit: (workflow: Workflow) => void;
}

// Helper function to format date/time
const formatDateTime = (dateTimeString: string | null) => {
  if (!dateTimeString) return "-";
  try {
    return new Date(dateTimeString).toLocaleString();
  } catch (e) {
    return "Invalid Date";
  }
};

// Helper function to determine Badge variant based on status
const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
  const lowerStatus = status.toLowerCase();
  switch (lowerStatus) {
    case 'successful':
      return "default"; // Greenish (default)
    case 'error':
    case 'failed':
      return "destructive"; // Red
    case 'running':
    case 'finished (unknown)':
      return "secondary"; // Bluish/Grayish
    default:
      // Handle running (X%) pattern
      if (lowerStatus.startsWith('running (') && lowerStatus.endsWith('%)')) {
        return "secondary"; // Also use secondary for running with percentage
      }
      return "outline"; // Default outline for anything else
  }
};

export function WorkflowTable({ workflows, isLoading, error, onEdit }: WorkflowTableProps) {
  return (
    <div className="card">
      <div className="card-header">
        <h2 className="text-xl font-bold text-indigo-800">Workflow Runs</h2>
      </div>
      <div className="overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <caption className="text-center py-2 text-gray-500">
            {isLoading ? "Loading workflows..." : 
            error ? `Error loading workflows: ${error}` : 
            workflows.length === 0 ? "No workflow runs found." : "A list of recent workflow runs."}
          </caption>
          <thead className="bg-indigo-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 w-[250px]">Workflow ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Start Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">End Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="h-24 text-center">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                    <span className="ml-2 text-indigo-600">Loading...</span>
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={6} className="h-24 text-center">
                  <div className="bg-red-50 text-red-600 p-4 rounded-md border border-red-100">
                    <p className="font-medium">Error</p>
                    <p>{error}</p>
                  </div>
                </td>
              </tr>
            ) : workflows.length === 0 ? (
              <tr>
                <td colSpan={6} className="h-24 text-center">
                  <div className="text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p>No workflows found.</p>
                  </div>
                </td>
              </tr>
            ) : (
              workflows.map((workflow) => (
                <tr key={workflow.id} className="hover:bg-indigo-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap font-medium max-w-[250px] truncate">
                    <Link to={`/workflows/${workflow.id}`} className="text-indigo-600 hover:text-indigo-800 hover:underline">
                      {workflow.id}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{workflow.name ?? "(Unnamed)"}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={getStatusVariant(workflow.status)}>{workflow.status}</Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{formatDateTime(workflow.start_time)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{formatDateTime(workflow.end_time)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => onEdit(workflow)}
                      className="hover:bg-indigo-100 hover:text-indigo-700 transition-colors border-indigo-200 text-indigo-600"
                    >
                      Edit
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}