import React, { useEffect, useMemo, useState } from 'react';
import { Calendar as CalendarIcon, Check, X, PlusCircle } from 'lucide-react';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../context/AuthContext';
import { getMeetings, createMeeting, updateMeetingStatus } from '../../api/meetings';
import { getUsers } from '../../api/users';
import toast from 'react-hot-toast';

const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date) => startOfWeek(date, { weekStartsOn: 1 }),
  getDay,
  locales
});

export const MeetingsPage: React.FC = () => {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState<any[]>([]);
  const [participants, setParticipants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    participantId: '',
    title: 'Investor Meeting',
    startTime: '',
    endTime: ''
  });

  const events = useMemo(() => {
    return meetings.map(meeting => ({
      id: meeting.id,
      title: meeting.title || 'Meeting',
      start: new Date(meeting.startTime),
      end: new Date(meeting.endTime),
      resource: meeting
    }));
  }, [meetings]);

  useEffect(() => {
    if (!user) return;
    let isMounted = true;

    Promise.all([
      getMeetings(),
      getUsers(user.role === 'entrepreneur' ? 'investor' : 'entrepreneur')
    ])
      .then(([meetingRes, userRes]) => {
        if (!isMounted) return;
        setMeetings(meetingRes.meetings);
        setParticipants(userRes.users);
      })
      .catch(() => toast.error('Failed to load meetings'))
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [user]);

  const handleCreate = async () => {
    if (!form.participantId || !form.startTime || !form.endTime) {
      toast.error('Please complete all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const { meeting } = await createMeeting({
        participantId: form.participantId,
        title: form.title,
        startTime: new Date(form.startTime).toISOString(),
        endTime: new Date(form.endTime).toISOString()
      });
      setMeetings(prev => [...prev, meeting].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()));
      setForm({ participantId: '', title: 'Investor Meeting', startTime: '', endTime: '' });
      toast.success('Meeting scheduled');
    } catch (error) {
      toast.error('Failed to schedule meeting');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatus = async (meetingId: string, status: 'accepted' | 'rejected' | 'cancelled') => {
    try {
      const { meeting } = await updateMeetingStatus(meetingId, status);
      setMeetings(prev => prev.map(item => (item.id === meetingId ? meeting : item)));
    } catch (error) {
      toast.error('Failed to update meeting');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meetings</h1>
          <p className="text-gray-600">Schedule and manage meetings with your network</p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex items-center gap-2">
          <CalendarIcon size={18} className="text-primary-600" />
          <h2 className="text-lg font-medium text-gray-900">Schedule a Meeting</h2>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Participant</label>
              <select
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                value={form.participantId}
                onChange={(e) => setForm(prev => ({ ...prev, participantId: e.target.value }))}
              >
                <option value="">Select participant</option>
                {participants.map(participant => (
                  <option key={participant.id} value={participant.id}>
                    {participant.name}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Title"
              value={form.title}
              onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
            />

            <Input
              label="Start Time"
              type="datetime-local"
              value={form.startTime}
              onChange={(e) => setForm(prev => ({ ...prev, startTime: e.target.value }))}
            />

            <Input
              label="End Time"
              type="datetime-local"
              value={form.endTime}
              onChange={(e) => setForm(prev => ({ ...prev, endTime: e.target.value }))}
            />
          </div>

          <Button leftIcon={<PlusCircle size={16} />} onClick={handleCreate} disabled={isSubmitting}>
            {isSubmitting ? 'Scheduling...' : 'Schedule Meeting'}
          </Button>
        </CardBody>
      </Card>

      <Card>
        <CardHeader className="flex items-center gap-2">
          <CalendarIcon size={18} className="text-primary-600" />
          <h2 className="text-lg font-medium text-gray-900">Calendar View</h2>
        </CardHeader>
        <CardBody>
          <div className="h-[520px]">
            <BigCalendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              defaultView="week"
              views={['week', 'day', 'month', 'agenda']}
              popup
            />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-medium text-gray-900">Upcoming Meetings</h2>
        </CardHeader>
        <CardBody>
          {meetings.length === 0 ? (
            <p className="text-gray-600">No meetings scheduled yet.</p>
          ) : (
            <div className="space-y-3">
              {meetings.map(meeting => {
                const isOrganizer = meeting.organizerId === user?.id;
                const isParticipant = meeting.participantId === user?.id;
                return (
                  <div key={meeting.id} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border border-gray-200 rounded-md p-4">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">{meeting.title}</h3>
                      <p className="text-xs text-gray-500">
                        {new Date(meeting.startTime).toLocaleString()} - {new Date(meeting.endTime).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">Status: {meeting.status}</p>
                    </div>

                    {meeting.status === 'pending' && isParticipant && (
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" leftIcon={<X size={14} />} onClick={() => handleStatus(meeting.id, 'rejected')}>
                          Reject
                        </Button>
                        <Button variant="success" size="sm" leftIcon={<Check size={14} />} onClick={() => handleStatus(meeting.id, 'accepted')}>
                          Accept
                        </Button>
                      </div>
                    )}

                    {meeting.status !== 'cancelled' && isOrganizer && (
                      <Button variant="outline" size="sm" onClick={() => handleStatus(meeting.id, 'cancelled')}>
                        Cancel
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};
