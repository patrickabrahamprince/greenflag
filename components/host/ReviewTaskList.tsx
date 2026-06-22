import { ReviewTaskCard } from '@/components/host/ReviewTaskCard';

interface Task {
  title: string;
  prompt: string;
  type: string;
}

interface TaskSubmission {
  task_number: number;
  content_type: string;
  text_content?: string;
  media_url?: string;
  submitted_at: string;
}

interface ReviewTaskListProps {
  tasks: Task[];
  submissions: TaskSubmission[];
}

export function ReviewTaskList({ tasks, submissions }: ReviewTaskListProps) {
  return (
    <div className="space-y-3 mb-8">
      {tasks.map((task, idx) => {
        const taskNum = idx + 1;
        const sub = submissions.find((s) => s.task_number === taskNum);
        return (
          <ReviewTaskCard key={taskNum} task={task} taskNumber={taskNum} submission={sub} />
        );
      })}
    </div>
  );
}
