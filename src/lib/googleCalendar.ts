import { ensureValidAccessToken } from './googleAuth';
import { Appointment } from '../types';

const CALENDAR_API = 'https://www.googleapis.com/calendar/v3';

export interface GoogleCalendarEvent {
  id: string;
  summary?: string;
  description?: string;
  location?: string;
  status?: string;
  start?: { dateTime?: string; date?: string; timeZone?: string };
  end?: { dateTime?: string; date?: string; timeZone?: string };
  htmlLink?: string;
}

async function calendarFetch(path: string, init?: RequestInit): Promise<Response> {
  const token = await ensureValidAccessToken();
  const res = await fetch(`${CALENDAR_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(init?.headers || {})
    }
  });
  return res;
}

function toLocalDateTimeParts(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  const date = d.toISOString().split('T')[0];
  const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  return { date, time };
}

/** Converte um agendamento local em payload de evento do Google Calendar. */
export function appointmentToGoogleEvent(apt: Pick<Appointment, 'patientName' | 'treatmentName' | 'professional' | 'room' | 'date' | 'startTime' | 'endTime' | 'notes' | 'patientPhone'>) {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Sao_Paulo';
  return {
    summary: `${apt.treatmentName} — ${apt.patientName}`,
    description: [
      `Paciente: ${apt.patientName}`,
      apt.patientPhone ? `Telefone: ${apt.patientPhone}` : null,
      `Profissional: ${apt.professional}`,
      `Sala: ${apt.room}`,
      apt.notes ? `Obs: ${apt.notes}` : null,
      '',
      'Criado pelo Integrar Central'
    ].filter(Boolean).join('\n'),
    location: apt.room,
    start: {
      dateTime: `${apt.date}T${apt.startTime}:00`,
      timeZone
    },
    end: {
      dateTime: `${apt.date}T${apt.endTime}:00`,
      timeZone
    }
  };
}

export async function createGoogleCalendarEvent(
  apt: Pick<Appointment, 'patientName' | 'treatmentName' | 'professional' | 'room' | 'date' | 'startTime' | 'endTime' | 'notes' | 'patientPhone'>
): Promise<string> {
  const body = appointmentToGoogleEvent(apt);
  const res = await calendarFetch('/calendars/primary/events', {
    method: 'POST',
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Falha ao criar evento no Google Agenda: ${err}`);
  }

  const data = (await res.json()) as GoogleCalendarEvent;
  return data.id;
}

export async function updateGoogleCalendarEvent(
  eventId: string,
  apt: Pick<Appointment, 'patientName' | 'treatmentName' | 'professional' | 'room' | 'date' | 'startTime' | 'endTime' | 'notes' | 'patientPhone'>
): Promise<void> {
  const body = appointmentToGoogleEvent(apt);
  const res = await calendarFetch(`/calendars/primary/events/${encodeURIComponent(eventId)}`, {
    method: 'PATCH',
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Falha ao atualizar evento no Google Agenda: ${err}`);
  }
}

export async function deleteGoogleCalendarEvent(eventId: string): Promise<void> {
  const res = await calendarFetch(`/calendars/primary/events/${encodeURIComponent(eventId)}`, {
    method: 'DELETE'
  });
  if (!res.ok && res.status !== 404 && res.status !== 410) {
    const err = await res.text();
    throw new Error(`Falha ao remover evento no Google Agenda: ${err}`);
  }
}

export async function listUpcomingGoogleEvents(daysAhead = 60): Promise<GoogleCalendarEvent[]> {
  const timeMin = new Date().toISOString();
  const timeMax = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000).toISOString();
  const params = new URLSearchParams({
    timeMin,
    timeMax,
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: '250'
  });

  const res = await calendarFetch(`/calendars/primary/events?${params.toString()}`);
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Falha ao listar eventos do Google Agenda: ${err}`);
  }

  const data = await res.json();
  return (data.items || []) as GoogleCalendarEvent[];
}

/** Extrai data/hora locais de um evento Google (quando for dateTime). */
export function parseGoogleEventSchedule(event: GoogleCalendarEvent): { date: string; startTime: string; endTime: string } | null {
  if (!event.start?.dateTime || !event.end?.dateTime) return null;
  const start = toLocalDateTimeParts(event.start.dateTime);
  const end = toLocalDateTimeParts(event.end.dateTime);
  return { date: start.date, startTime: start.time, endTime: end.time };
}
