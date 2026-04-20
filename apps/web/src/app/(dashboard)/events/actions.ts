'use server'

import { createClient } from '@/utils/supabase/server'
import { Event, EventStatus, EventPriority, Task, TaskComment } from '@foodclub/types'
import { revalidatePath } from 'next/cache'

// Helper to map DB task to Frontend Task
function mapTaskFromDB(t: any): Task {
  return {
    id: t.id,
    eventId: t.event_id,
    title: t.title,
    description: t.description,
    assignedTo: t.assigned_to,
    dueDate: t.due_date,
    completed: t.completed,
  }
}

function mapTaskCommentFromDB(c: any): TaskComment {
  return {
    id: c.id,
    taskId: c.task_id,
    userId: c.user_id,
    content: c.content,
    createdAt: c.created_at,
  }
}

// Helper to map DB snake_case to Frontend camelCase
function mapEventFromDB(dbEvent: any): Event {
  return {
    id: dbEvent.id,
    name: dbEvent.name,
    date: dbEvent.date || '',
    location: dbEvent.location || '',
    contactName: dbEvent.contact_name || '',
    contactDetails: dbEvent.contact_details || '',
    priority: dbEvent.priority as EventPriority,
    status: dbEvent.status as EventStatus,
    endDate: dbEvent.end_date || '',
    followUpDate: dbEvent.follow_up_date || '',
    applicationFormReleaseDateType: dbEvent.application_form_release_date_type,
    applicationFormReleaseDate: dbEvent.application_form_release_date || '',
    applicationFormReleaseDateEnd: dbEvent.application_form_release_date_end || '',
    notes: dbEvent.notes || '',
    isTBA: dbEvent.is_tba ?? true,
    assignedTo: dbEvent.created_by || '',
    documents: dbEvent.event_documents?.map((doc: any) => doc.file_path) || [],
    tasks: dbEvent.tasks?.map(mapTaskFromDB) || [],
  }
}

// Helper to map Frontend camelCase to DB snake_case for updates/inserts
function normalizeDBDate(value: string | null | undefined) {
  if (!value) return value
  return /^\d{4}-\d{2}$/.test(value) ? `${value}-01` : value
}

function mapEventToDB(event: Partial<Event>) {
  const dbEvent: any = {}
  
  if (event.name !== undefined) dbEvent.name = event.name
  if (event.date !== undefined) dbEvent.date = event.date === '' ? null : normalizeDBDate(event.date)
  if (event.location !== undefined) dbEvent.location = event.location
  if (event.contactName !== undefined) dbEvent.contact_name = event.contactName
  if (event.contactDetails !== undefined) dbEvent.contact_details = event.contactDetails
  if (event.priority !== undefined) dbEvent.priority = event.priority
  if (event.status !== undefined) dbEvent.status = event.status
  if (event.endDate !== undefined) dbEvent.end_date = event.endDate === '' ? null : normalizeDBDate(event.endDate)
  if (event.followUpDate !== undefined) dbEvent.follow_up_date = event.followUpDate === '' ? null : normalizeDBDate(event.followUpDate)
  if (event.applicationFormReleaseDateType !== undefined) dbEvent.application_form_release_date_type = event.applicationFormReleaseDateType
  if (event.applicationFormReleaseDate !== undefined) dbEvent.application_form_release_date = event.applicationFormReleaseDate === '' ? null : normalizeDBDate(event.applicationFormReleaseDate)
  if (event.applicationFormReleaseDateEnd !== undefined) dbEvent.application_form_release_date_end = event.applicationFormReleaseDateEnd === '' ? null : normalizeDBDate(event.applicationFormReleaseDateEnd)
  if (event.notes !== undefined) dbEvent.notes = event.notes
  if (event.isTBA !== undefined) dbEvent.is_tba = event.isTBA

  return dbEvent
}


export async function getEvents() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('events')
    .select('*, event_documents(*), tasks(*)')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('❌ GET_EVENTS ERROR:', error.message, error.details, error.hint)
    return []
  }

  return data.map(mapEventFromDB)
}

export async function addEvent(event: Partial<Event>) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const dbEvent = { ...mapEventToDB(event), created_by: user.id }
  const { data, error } = await supabase
    .from('events')
    .insert(dbEvent)
    .select()
    .single()

  if (error) {
    console.error('❌ ADD_EVENT ERROR:', error.message, error.details, error.hint)
    return { error: error.message }
  }

  revalidatePath('/events')
  revalidatePath('/calendar')
  return { data: mapEventFromDB(data) }
}

export async function deleteEvent(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting event:', error)
    return { error: error.message }
  }

  revalidatePath('/events')
  revalidatePath('/calendar')
}

export async function updateEvent(id: string, event: Partial<Event>) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const dbEvent = mapEventToDB(event)
  const { data, error } = await supabase
    .from('events')
    .update(dbEvent)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('❌ UPDATE_EVENT ERROR:', error.message, error.details, error.hint)
    return { error: error.message }
  }

  revalidatePath('/events')
  revalidatePath('/calendar')
  return { data: mapEventFromDB(data) }
}

export async function saveDocumentRecord(eventId: string, filePath: string, fileName: string, fileType: string, fileSize?: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('event_documents')
    .insert({
      event_id: eventId || null,
      url: filePath,
      name: fileName,
      type: fileType,
      size: fileSize || 'Unknown'
    })
    .select()
    .single()

  if (error) {
    console.error('Error saving document record:', error)
    return { error: error.message }
  }

  revalidatePath('/documents')
  revalidatePath('/events')
  revalidatePath('/calendar')
  return { data }
}

export async function syncUserProfile() {
  const supabase = await createClient()
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: existingProfiles, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
      
      if (!checkError && existingProfiles && existingProfiles.length === 0) {
        const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Unknown User'
        await supabase.from('profiles').insert({
          id: user.id,
          full_name: fullName,
          email: user.email,
          role: 'Team Member'
        })
      }
    }
  } catch (err) {
    console.error('Profile sync error:', err)
  }
}

export async function getProfiles() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, role')
    .order('full_name')

  if (error) {
    console.error('Error fetching profiles:', error)
    return []
  }

  return data
}

export async function updateEventTasks(eventId: string, tasks: any[]) {
  const supabase = await createClient()

  // Simple sync: Delete existing tasks and re-insert
  // In a more complex app, we'd do a proper diff/upsert
  const { error: deleteError } = await supabase
    .from('tasks')
    .delete()
    .eq('event_id', eventId)

  if (deleteError) {
    console.error('Error deleting tasks for sync:', deleteError)
    return { error: deleteError.message }
  }

  if (tasks.length === 0) return { data: [] }

  const dbTasks = tasks.map(t => ({
    event_id: eventId,
    title: t.title,
    description: t.description,
    assigned_to: t.assignedTo,
    due_date: t.dueDate,
    completed: t.completed || false
  }))

  const { data, error: insertError } = await supabase
    .from('tasks')
    .insert(dbTasks)
    .select()

  if (insertError) {
    console.error('❌ UPDATE_TASKS_ERROR:', insertError.message, insertError.details, insertError.hint)
    return { error: insertError.message }
  }

  revalidatePath('/calendar')
  return { data }
}

export async function getGlobalTasks() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('❌ GET_GLOBAL_TASKS_ERROR:', error.message, error.details, error.hint)
    return []
  }

  return data.map(mapTaskFromDB)
}

export async function getGlobalDocuments() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('event_documents')
    .select('*, events(name)')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching global documents:', error)
    return []
  }

  return data.map(doc => ({
    id: doc.id,
    name: doc.name,
    type: doc.type?.split('/').pop()?.toUpperCase() || 'FILE',
    size: doc.size || 'Unknown',
    date: doc.created_at,
    url: doc.url,
    eventName: doc.events?.name
  }))
}

export async function updateTaskStatus(taskId: string, completed: boolean) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('tasks')
    .update({ completed })
    .eq('id', taskId)

  if (error) {
    console.error('Error updating task status:', error)
    return { error: error.message }
  }

  revalidatePath('/tasks')
  revalidatePath('/events')
  revalidatePath('/calendar')
}

export async function addStandaloneTask(task: Partial<Task>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      title: task.title,
      description: task.description,
      assigned_to: task.assignedTo || user.id,
      event_id: task.eventId || null,
      completed: false,
      due_date: task.dueDate
    })
    .select()
    .single()

  if (error) {
    console.error('Error adding standalone task:', error)
    return { error: error.message }
  }

  revalidatePath('/tasks')
  revalidatePath('/events')
  revalidatePath('/calendar')
  return { data: mapTaskFromDB(data) }
}

export async function deleteTask(taskId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId)

  if (error) {
    console.error('Error deleting task:', error)
    return { error: error.message }
  }

  revalidatePath('/tasks')
  revalidatePath('/events')
  revalidatePath('/calendar')
}

export async function getTaskComments(taskId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('task_comments')
    .select('*')
    .eq('task_id', taskId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching task comments:', error)
    return []
  }

  return data.map(mapTaskCommentFromDB)
}

export async function addTaskComment(taskId: string, content: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('task_comments')
    .insert({
      task_id: taskId,
      user_id: user.id,
      content
    })
    .select()
    .single()

  if (error) {
    console.error('Error adding task comment:', error)
    return { error: error.message }
  }

  return { data: mapTaskCommentFromDB(data) }
}
