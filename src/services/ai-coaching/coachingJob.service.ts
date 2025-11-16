import { supabase } from '../../lib/supabase';
import { SYSTEM_TXT, buildPrompt } from './buildPrompt';
import type { AIResponse } from './types';

export interface CoachingJob {
  id: string;
  user_id: string;
  dataset: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  result?: AIResponse;
  error_message?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export async function startCoachingJob(
  dataset: string,
  tradesJson: any,
  hints?: { dateRange?: string; focus?: string }
): Promise<{ jobId: string; status: string }> {
  const userPrompt = buildPrompt({
    tradesJson,
    dateRangeHint: hints?.dateRange,
    focusHint: hints?.focus,
  });

  const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-coaching-job/start`;

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      dataset,
      systemPrompt: SYSTEM_TXT,
      userPrompt,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(`Failed to start job: ${JSON.stringify(error)}`);
  }

  return await response.json();
}

export async function checkCoachingJob(dataset: string): Promise<CoachingJob | null> {
  const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-coaching-job/check`;

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ dataset }),
  });

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  if (!data.exists) {
    return null;
  }

  return {
    id: data.jobId,
    user_id: '',
    dataset,
    status: data.status,
    progress: data.progress,
    result: data.result,
    error_message: data.error,
    created_at: '',
    updated_at: '',
    completed_at: undefined,
  };
}

export async function getJobStatus(jobId: string): Promise<CoachingJob> {
  const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-coaching-job/status`;

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ jobId }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(`Failed to get job status: ${JSON.stringify(error)}`);
  }

  const data = await response.json();

  return {
    id: data.jobId,
    user_id: '',
    dataset: '',
    status: data.status,
    progress: data.progress,
    result: data.result,
    error_message: data.error,
    created_at: '',
    updated_at: '',
    completed_at: undefined,
  };
}

export function useCoachingJobPolling(
  jobId: string | null,
  onComplete: (result: AIResponse) => void,
  onError: (error: string) => void
) {
  let intervalId: number | null = null;

  const startPolling = () => {
    if (!jobId) return;

    intervalId = window.setInterval(async () => {
      try {
        const job = await getJobStatus(jobId);

        if (job.status === 'completed' && job.result) {
          stopPolling();
          onComplete(job.result);
        } else if (job.status === 'failed') {
          stopPolling();
          onError(job.error_message || 'Job failed');
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 3000);
  };

  const stopPolling = () => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  };

  return { startPolling, stopPolling };
}
