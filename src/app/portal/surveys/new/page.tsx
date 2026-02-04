'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api/client';
import { Button, Card, Input, Select, Label, Textarea, PageHeader, Alert } from '@/components/ui';

export default function NewSurveyPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_active: true,
  });
  const [questions, setQuestions] = useState<any[]>([
    { id: 1, question: '', type: 'text' },
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      // Filter out empty questions
      const validQuestions = questions.filter(q => q.question.trim() !== '');
      
      if (validQuestions.length === 0) {
        setError('Please add at least one question');
        setSaving(false);
        return;
      }

      const payload = {
        ...formData,
        questions: validQuestions,
        description: formData.description || null,
      };
      
      const response = await apiClient.post('/surveys', payload);
      router.push('/portal/surveys');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to create survey');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value,
    });
  };

  const handleQuestionChange = (index: number, field: string, value: any) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
    setQuestions(updatedQuestions);
  };

  const addQuestion = () => {
    setQuestions([...questions, { id: questions.length + 1, question: '', type: 'text' }]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create New Survey"
        description="Create a new customer feedback survey"
      />

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <Alert variant="error">{error}</Alert>}

          <div className="grid gap-6 md:grid-cols-2">
            <div className="md:col-span-2">
              <Label htmlFor="name" required>Survey Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-foreground">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="rounded border-border bg-background text-primary focus:ring-primary"
                />
                <span className="text-sm font-medium">Active</span>
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Questions *</Label>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={addQuestion}
              >
                + Add Question
              </Button>
            </div>

            {questions.map((question, index) => (
              <Card key={index} variant="elevated" className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-3">
                    <Input
                      type="text"
                      placeholder="Enter question"
                      value={question.question}
                      onChange={(e) => handleQuestionChange(index, 'question', e.target.value)}
                    />
                    <Select
                      value={question.type}
                      onChange={(e) => handleQuestionChange(index, 'type', e.target.value)}
                    >
                      <option value="text">Text</option>
                      <option value="textarea">Long Text</option>
                      <option value="number">Number</option>
                      <option value="email">Email</option>
                      <option value="rating">Rating (1-5)</option>
                      <option value="yesno">Yes/No</option>
                    </Select>
                  </div>
                  {questions.length > 1 && (
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      onClick={() => removeQuestion(index)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={saving}
            >
              {saving ? 'Creating...' : 'Create Survey'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

