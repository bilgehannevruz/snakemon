import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { WorkflowTable } from './components/workflow-table';
import { WorkflowDetail } from './components/workflow-detail';
import { EditWorkflowModal } from './components/EditWorkflowModal';
import { Workflow } from './types/workflow';
import { getWorkflows, updateWorkflow } from './services/api';

function App() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    const fetchWorkflows = async () => {
      setIsLoading(true);
      try {
        const data = await getWorkflows();
        setWorkflows(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch workflows');
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkflows();
    const interval = setInterval(fetchWorkflows, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleEditWorkflow = (workflow: Workflow) => {
    setSelectedWorkflow(workflow);
    setIsEditModalOpen(true);
  };

  const handleSaveWorkflow = async (id: string, name: string, argsJson: string) => {
    await updateWorkflow(id, { name, arguments_json: argsJson });
    // Refresh the workflow list
    const updatedData = await getWorkflows();
    setWorkflows(updatedData);
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <header className="bg-white shadow">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Snakemake Workflow Monitor
            </h1>
          </div>
        </header>
        <main>
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <Routes>
              <Route path="/" element={
                <WorkflowTable 
                  workflows={workflows}
                  isLoading={isLoading}
                  error={error}
                  onEdit={handleEditWorkflow}
                />
              } />
              <Route path="/workflows/:id" element={<WorkflowDetail />} />
            </Routes>
          </div>
        </main>
        
        <EditWorkflowModal
          workflow={selectedWorkflow}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSaveWorkflow}
        />
      </div>
    </Router>
  );
}

export default App;