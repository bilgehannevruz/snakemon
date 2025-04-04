import React, { useState, useEffect } from 'react';
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Workflow } from "../types/workflow";

interface EditWorkflowModalProps {
  workflow: Workflow | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, name: string, argsJson: string) => Promise<void>;
}

export function EditWorkflowModal({ workflow, isOpen, onClose, onSave }: EditWorkflowModalProps) {
  const [name, setName] = useState('');
  const [argsJson, setArgsJson] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (workflow) {
      setName(workflow.name || '');
      setArgsJson(workflow.arguments_json || '');
      setError(null); // Reset error when workflow changes
    } else {
      setName('');
      setArgsJson('');
    }
  }, [workflow]);

  const handleSave = async () => {
    if (!workflow) return;
    setIsSaving(true);
    setError(null);
    try {
      await onSave(workflow.id, name, argsJson);
      onClose(); // Close modal on successful save
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save workflow details.");
    } finally {
      setIsSaving(false);
    }
  };

  // Prevent closing modal if clicking outside while saving or if there's an error shown
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg bg-white border border-indigo-100 shadow-lg rounded-lg">
        <DialogHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-t-lg">
          <DialogTitle className="text-xl font-bold text-indigo-800">Edit Workflow Details</DialogTitle>
          <DialogDescription className="text-gray-600">
            Update the name and arguments for workflow: <span className="font-medium text-indigo-600">{workflow?.id}</span>
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 p-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-gray-700">
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
              className="w-full border-indigo-200 focus:border-indigo-400 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 rounded-md"
              placeholder="Enter workflow name"
              disabled={isSaving}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="arguments" className="text-sm font-medium text-gray-700">
              Arguments (JSON)
            </Label>
            <Textarea
              id="arguments"
              value={argsJson}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setArgsJson(e.target.value)}
              className="w-full font-mono border-indigo-200 focus:border-indigo-400 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 rounded-md"
              rows={6}
              placeholder='{\"input\": \"file.txt\", \"output\": \"results/\"}'
              disabled={isSaving}
            />
            <p className="text-sm text-gray-500">Enter the workflow arguments as a valid JSON object.</p>
          </div>
          
          {error && (
            <div className="bg-red-50 p-4 rounded-md border border-red-100">
              <p className="text-sm text-red-600 font-medium">Error: {error}</p>
            </div>
          )}
        </div>
        
        <DialogFooter className="flex justify-end space-x-3 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-b-lg border-t border-indigo-100">
          <Button 
            variant="outline" 
            onClick={onClose} 
            disabled={isSaving}
            className="border-indigo-200 text-indigo-700 hover:bg-indigo-100"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            onClick={handleSave} 
            disabled={isSaving}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 