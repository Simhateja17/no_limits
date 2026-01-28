'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout';
import { useAuthStore } from '@/lib/store';
import { useTranslations } from 'next-intl';
import { dataApi, type Task } from '@/lib/data-api';
import { TaskChat } from '@/components/tasks/TaskChat';

export default function EmployeeTaskDetailPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const params = useParams();
  const taskId = params.taskId as string;
  const tCommon = useTranslations('common');
  const tTasks = useTranslations('tasks');

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  // Auth guard
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'EMPLOYEE') {
      router.push('/');
    }
  }, [isAuthenticated, user, router]);

  // Fetch task details
  useEffect(() => {
    const fetchTask = async () => {
      try {
        setLoading(true);
        setError(null);
        const taskData = await dataApi.getTask(taskId);
        setTask(taskData);
      } catch (err) {
        console.error('Error fetching task:', err);
        setError('Failed to load task details');
      } finally {
        setLoading(false);
      }
    };

    if (taskId) {
      fetchTask();
    }
  }, [taskId]);

  const handleStatusUpdate = async () => {
    if (!task) return;

    try {
      setUpdating(true);
      // Toggle between OPEN and COMPLETED
      const currentStatus = task.status;
      const newStatus = currentStatus === 'OPEN' ? 'COMPLETED' : 'OPEN';

      const updated = await dataApi.updateTask(task.id, { status: newStatus });
      setTask(updated);
    } catch (err) {
      console.error('Error updating task status:', err);
      setError('Failed to update task status');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return { bg: '#FEF08A', text: '#78350F' };
      case 'IN_PROGRESS':
        return { bg: '#DBEAFE', text: '#003450' };
      case 'COMPLETED':
        return { bg: '#DCFCE7', text: '#166534' };
      case 'CLOSED':
        return { bg: '#F3F4F6', text: '#003450' };
      case 'CANCELLED':
        return { bg: '#FEE2E2', text: '#991B1B' };
      default:
        return { bg: '#F3F4F6', text: '#003450' };
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return { bg: '#FEE2E2', text: '#991B1B' };
      case 'HIGH':
        return { bg: '#FED7AA', text: '#92400E' };
      case 'MEDIUM':
        return { bg: '#FEF3C7', text: '#78350F' };
      case 'LOW':
        return { bg: '#DBEAFE', text: '#003450' };
      default:
        return { bg: '#F3F4F6', text: '#003450' };
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      OPEN: 'Open',
      IN_PROGRESS: 'In Progress',
      COMPLETED: 'Completed',
      CLOSED: 'Closed',
      CANCELLED: 'Cancelled',
    };
    return labels[status] || status;
  };

  const getPriorityLabel = (priority: string) => {
    const labels: Record<string, string> = {
      LOW: 'Low',
      MEDIUM: 'Medium',
      HIGH: 'High',
      URGENT: 'Urgent',
    };
    return labels[priority] || priority;
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      INTERNAL_WAREHOUSE: 'Internal Warehouse',
      CLIENT_COMMUNICATION: 'Client Communication',
      ORDER_PROCESSING: 'Order Processing',
      RETURNS: 'Returns',
      INVENTORY_CHECK: 'Inventory Check',
      OTHER: 'Other',
    };
    return labels[type] || type;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (!isAuthenticated || user?.role !== 'EMPLOYEE') {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="w-full px-[5.2%] py-8">
        <div className="flex flex-col gap-6">
          {/* Back Button */}
          <div>
            <button
              onClick={() => router.push('/employee/tasks')}
              style={{
                minWidth: '65px',
                height: '38px',
                borderRadius: '6px',
                border: '1px solid #D1D5DB',
                padding: '9px 17px 9px 15px',
                backgroundColor: '#FFFFFF',
                boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.05)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 12L6 8L10 4" stroke="#374151" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  fontSize: '14px',
                  lineHeight: '20px',
                  color: '#374151',
                }}
              >
                {tCommon('back')}
              </span>
            </button>
          </div>

          {/* Loading State */}
          {loading && (
            <div
              style={{
                borderRadius: '8px',
                padding: '48px',
                backgroundColor: '#FFFFFF',
                boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.06), 0px 1px 3px 0px rgba(0, 0, 0, 0.1)',
                textAlign: 'center',
              }}
            >
              <p style={{ color: '#6B7280', fontFamily: 'Inter, sans-serif' }}>
                {tCommon('loading')}
              </p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div
              style={{
                borderRadius: '8px',
                padding: '24px',
                backgroundColor: '#FEE2E2',
                border: '1px solid #FECACA',
                color: '#991B1B',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              {error}
            </div>
          )}

          {/* Task Details */}
          {task && !loading && (
            <>
              {/* Task Info Card */}
              <div
                style={{
                  borderRadius: '8px',
                  padding: '24px',
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.06), 0px 1px 3px 0px rgba(0, 0, 0, 0.1)',
                }}
              >
                {/* Header with title and badges */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: '16px',
                    marginBottom: '24px',
                    paddingBottom: '16px',
                    borderBottom: '1px solid #E5E7EB',
                  }}
                >
                  <h1
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 600,
                      fontSize: '28px',
                      lineHeight: '36px',
                      color: '#111827',
                      margin: 0,
                    }}
                  >
                    Task #{task.taskId}
                  </h1>
                  <div
                    style={{
                      display: 'flex',
                      gap: '8px',
                      flexShrink: 0,
                    }}
                  >
                    {/* Status Badge */}
                    <div
                      style={{
                        padding: '6px 12px',
                        borderRadius: '12px',
                        backgroundColor: getStatusColor(task.status).bg,
                        color: getStatusColor(task.status).text,
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 500,
                        fontSize: '12px',
                      }}
                    >
                      {getStatusLabel(task.status)}
                    </div>

                    {/* Priority Badge */}
                    <div
                      style={{
                        padding: '6px 12px',
                        borderRadius: '12px',
                        backgroundColor: getPriorityColor(task.priority).bg,
                        color: getPriorityColor(task.priority).text,
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 500,
                        fontSize: '12px',
                      }}
                    >
                      {getPriorityLabel(task.priority)}
                    </div>
                  </div>
                </div>

                {/* Task Title */}
                {task.title && (
                  <h2
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 500,
                      fontSize: '16px',
                      lineHeight: '24px',
                      color: '#374151',
                      margin: '0 0 16px 0',
                    }}
                  >
                    {task.title}
                  </h2>
                )}

                {/* Details Grid */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: '24px',
                    marginBottom: '24px',
                  }}
                >
                  {task.client && (
                    <div>
                      <p
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 500,
                          fontSize: '12px',
                          color: '#6B7280',
                          margin: '0 0 4px 0',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}
                      >
                        Client
                      </p>
                      <p
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 400,
                          fontSize: '14px',
                          color: '#111827',
                          margin: 0,
                        }}
                      >
                        {task.client.companyName || task.client.name}
                      </p>
                    </div>
                  )}

                  <div>
                    <p
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 500,
                        fontSize: '12px',
                        color: '#6B7280',
                        margin: '0 0 4px 0',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      Created
                    </p>
                    <p
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 400,
                        fontSize: '14px',
                        color: '#111827',
                        margin: 0,
                      }}
                    >
                      {formatDate(task.createdAt)}
                    </p>
                  </div>

                  <div>
                    <p
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 500,
                        fontSize: '12px',
                        color: '#6B7280',
                        margin: '0 0 4px 0',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      Type
                    </p>
                    <p
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 400,
                        fontSize: '14px',
                        color: '#111827',
                        margin: 0,
                      }}
                    >
                      {getTypeLabel(task.type)}
                    </p>
                  </div>

                  {task.dueDate && (
                    <div>
                      <p
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 500,
                          fontSize: '12px',
                          color: '#6B7280',
                          margin: '0 0 4px 0',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}
                      >
                        Due Date
                      </p>
                      <p
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 400,
                          fontSize: '14px',
                          color: '#111827',
                          margin: 0,
                        }}
                      >
                        {formatDate(task.dueDate)}
                      </p>
                    </div>
                  )}

                  {task.assignee && (
                    <div>
                      <p
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 500,
                          fontSize: '12px',
                          color: '#6B7280',
                          margin: '0 0 4px 0',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}
                      >
                        Assignee
                      </p>
                      <p
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 400,
                          fontSize: '14px',
                          color: '#111827',
                          margin: 0,
                        }}
                      >
                        {task.assignee.name}
                      </p>
                    </div>
                  )}
                </div>

                {/* Description */}
                {task.description && (
                  <div
                    style={{
                      marginTop: '24px',
                      paddingTop: '24px',
                      borderTop: '1px solid #E5E7EB',
                    }}
                  >
                    <h3
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 500,
                        fontSize: '14px',
                        color: '#6B7280',
                        margin: '0 0 8px 0',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      Description
                    </h3>
                    <p
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 400,
                        fontSize: '14px',
                        lineHeight: '22px',
                        color: '#374151',
                        margin: 0,
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                      }}
                    >
                      {task.description}
                    </p>
                  </div>
                )}

                {/* Status Update Button */}
                <div
                  style={{
                    marginTop: '24px',
                    paddingTop: '24px',
                    borderTop: '1px solid #E5E7EB',
                    display: 'flex',
                    gap: '12px',
                  }}
                >
                  <button
                    onClick={handleStatusUpdate}
                    disabled={updating}
                    style={{
                      height: '40px',
                      borderRadius: '6px',
                      border: 'none',
                      padding: '10px 16px',
                      background: task.status === 'OPEN' ? '#003450' : '#F7CB5B',
                      color: task.status === 'OPEN' ? '#FFFFFF' : '#003450',
                      cursor: updating ? 'not-allowed' : 'pointer',
                      opacity: updating ? 0.5 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 500,
                      fontSize: '14px',
                      lineHeight: '20px',
                      transition: 'opacity 0.15s ease',
                    }}
                    onMouseEnter={(e) => !updating && (e.currentTarget.style.opacity = '0.9')}
                    onMouseLeave={(e) => !updating && (e.currentTarget.style.opacity = '1')}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      {task.status === 'OPEN' ? (
                        <path d="M13.3333 4L6 11.3333L2.66667 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      ) : (
                        <path d="M8 3.33334V12.6667M3.33333 8H12.6667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      )}
                    </svg>
                    <span>
                      {task.status === 'OPEN' ? 'Mark as Complete' : 'Reopen Task'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Task Chat Card */}
              <div
                style={{
                  borderRadius: '8px',
                  padding: '24px',
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.06), 0px 1px 3px 0px rgba(0, 0, 0, 0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  minHeight: '400px',
                }}
              >
                <h2
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 600,
                    fontSize: '16px',
                    lineHeight: '24px',
                    color: '#111827',
                    margin: 0,
                  }}
                >
                  Task Discussion
                </h2>
                <TaskChat taskId={task.id} />
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
