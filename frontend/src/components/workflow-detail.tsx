import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Workflow } from '../types/workflow';
import { getWorkflow } from '../services/api';
import { Badge } from './ui/badge';

// Helper function to format date/time
const formatDateTime = (dateTimeString: string | null) => {
  if (!dateTimeString) return "-";
  try {
    return new Date(dateTimeString).toLocaleString();
  } catch (e) {
    return "Invalid Date";
  }
};

// Helper function to get status variant
const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
  const lowerStatus = status.toLowerCase();
  switch (lowerStatus) {
    case 'successful': return "default";
    case 'error': case 'failed': return "destructive";
    case 'running': case 'finished (unknown)': return "secondary";
    default:
      if (lowerStatus.startsWith('running (') && lowerStatus.endsWith('%)')) {
        return "secondary";
      }
      return "outline";
  }
};

export function WorkflowDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("Workflow ID is missing.");
      setIsLoading(false);
      return;
    }

    const fetchDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getWorkflow(id);
        setWorkflow(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load workflow details.');
        setWorkflow(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
    // Add auto refresh if needed
  }, [id]);

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <div className="text-lg font-medium text-indigo-700">Loading workflow details...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-100 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-2 text-red-600">Error</h3>
          <p className="text-red-600">{error}</p>
          <Link to="/" className="mt-4 inline-flex items-center text-indigo-600 hover:text-indigo-800">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Return to Workflow List
          </Link>
        </div>
      </div>
    );
  }

  if (!workflow) {
    return (
      <div className="p-8">
        <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-6">
          <h3 className="text-xl font-bold text-yellow-600">Workflow not found</h3>
          <p className="mt-2 text-yellow-600">The requested workflow could not be found or may have been deleted.</p>
          <Link to="/" className="mt-4 inline-flex items-center text-indigo-600 hover:text-indigo-800">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Return to Workflow List
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <Link to="/" className="inline-flex items-center text-indigo-600 hover:text-indigo-800 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Workflow List
        </Link>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="text-xl font-bold text-indigo-800">Workflow Details</h2>
        </div>
        
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-5 rounded-lg shadow-sm">
              <h3 className="text-sm font-medium text-indigo-800 mb-2">Name</h3>
              <p className="text-lg font-medium">{workflow.name || "(Unnamed)"}</p>
            </div>
            
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-5 rounded-lg shadow-sm">
              <h3 className="text-sm font-medium text-indigo-800 mb-2">ID</h3>
              <p className="text-lg font-medium overflow-auto">{workflow.id}</p>
            </div>
            
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-5 rounded-lg shadow-sm">
              <h3 className="text-sm font-medium text-indigo-800 mb-2">Status</h3>
              <div><Badge variant={getStatusVariant(workflow.status)}>{workflow.status}</Badge></div>
            </div>
            
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-5 rounded-lg shadow-sm">
              <h3 className="text-sm font-medium text-indigo-800 mb-2">Start Time</h3>
              <p className="text-lg font-medium">{formatDateTime(workflow.start_time)}</p>
            </div>
            
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-5 rounded-lg shadow-sm">
              <h3 className="text-sm font-medium text-indigo-800 mb-2">End Time</h3>
              <p className="text-lg font-medium">{formatDateTime(workflow.end_time)}</p>
            </div>
            
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-5 rounded-lg shadow-sm">
              <h3 className="text-sm font-medium text-indigo-800 mb-2">Working Directory</h3>
              <p className="text-lg font-medium">{workflow.workdir || "N/A"}</p>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-bold mb-4 text-indigo-800">Arguments</h3>
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-5 shadow-sm">
              <pre className="overflow-x-auto text-sm font-mono bg-white bg-opacity-70 p-4 rounded">
                {workflow.arguments_json 
                  ? JSON.stringify(JSON.parse(workflow.arguments_json), null, 2) 
                  : "N/A"}
              </pre>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4 text-indigo-800">Logs</h3>
            <div className="bg-white border border-indigo-100 rounded-lg overflow-hidden shadow-sm">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="w-[200px] bg-indigo-50 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Timestamp</th>
                    <th className="bg-indigo-50 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Message</th>
                  </tr>
                </thead>
                <tbody>
                  {workflow.logs && workflow.logs.length > 0 ? (
                    workflow.logs.map((log) => (
                      <tr key={log.id} className="hover:bg-indigo-50/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-indigo-700">{formatDateTime(log.timestamp)}</td>
                        <td className="px-6 py-4 whitespace-pre-wrap font-mono text-sm">{log.message_repr || "(No message)"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={2} className="text-center py-8 text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        No logs found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}