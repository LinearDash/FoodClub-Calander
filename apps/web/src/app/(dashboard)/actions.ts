'use server'

import { createClient } from '@/utils/supabase/server'
import { Event, Task } from '@foodclub/types'
import { revalidatePath } from 'next/cache'

export async function getEvents() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('events')
    .select('*, tasks(*)')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching events:', error)
    return []
  }

  return data as Event[]
}

export async function createEvent(event: Partial<Event>) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('events')
    .insert([{
      name: event.name,
      date: event.date,
      location: event.location,
      contact_name: event.contactName,
      contact_details: event.contactDetails,
      priority: event.priority || 'medium',
      status: event.status || 'not_applied',
      follow_up_date: event.followUpDate,
      application_form_release_date: event.applicationFormReleaseDate,
      application_form_release_date_end: event.applicationFormReleaseDateEnd,
      application_form_release_date_type: event.applicationFormReleaseDateType,
      notes: event.notes,
      is_tba: event.isTBA ?? true,
      created_by: user.id
    }])
    .select()
    .single()

  if (error) {
    console.error('Error creating event:', error)
    throw error
  }

  revalidatePath('/(dashboard)', 'layout')
  return data
}

export async function updateEvent(id: string, updates: Partial<Event>) {
  const supabase = await createClient()

  // Map camelCase to snake_case for DB
  const mappedUpdates: any = {}
  if (updates.name !== undefined) mappedUpdates.name = updates.name
  if (updates.date !== undefined) mappedUpdates.date = updates.date
  if (updates.location !== undefined) mappedUpdates.location = updates.location
  if (updates.contactName !== undefined) mappedUpdates.contact_name = updates.contactName
  if (updates.contactDetails !== undefined) mappedUpdates.contact_details = updates.contactDetails
  if (updates.priority !== undefined) mappedUpdates.priority = updates.priority
  if (updates.status !== undefined) mappedUpdates.status = updates.status
  if (updates.followUpDate !== undefined) mappedUpdates.follow_up_date = updates.followUpDate
  if (updates.applicationFormReleaseDate !== undefined) mappedUpdates.application_form_release_date = updates.applicationFormReleaseDate
  if (updates.applicationFormReleaseDateEnd !== undefined) mappedUpdates.application_form_release_date_end = updates.applicationFormReleaseDateEnd
  if (updates.applicationFormReleaseDateType !== undefined) mappedUpdates.application_form_release_date_type = updates.applicationFormReleaseDateType
  if (updates.notes !== undefined) mappedUpdates.notes = updates.notes
  if (updates.isTBA !== undefined) mappedUpdates.is_tba = updates.isTBA

  const { error } = await supabase
    .from('events')
    .update(mappedUpdates)
    .eq('id', id)

  if (error) {
    console.error('Error updating event:', error)
    throw error
  }

  revalidatePath('/(dashboard)', 'layout')
}

export async function deleteEvent(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('events').delete().eq('id', id)

  if (error) {
    console.error('Error deleting event:', error)
    throw error
  }

  revalidatePath('/(dashboard)', 'layout')
}

export async function getProfiles() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, email')

  if (error) {
    console.error('Error fetching profiles:', error)
    return []
  }

  return data
}

export async function createTask(task: Partial<Task>) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('tasks')
    .insert([{
      event_id: task.eventId,
      name: task.name,
      type: task.type,
      assigned_to: task.assignedTo,
      due_date: task.dueDate,
      completed: task.completed ?? false
    }])

  if (error) {
    console.error('Error creating task:', error)
    throw error
  }

  revalidatePath('/(dashboard)', 'layout')
}

export async function updateTask(id: string, updates: Partial<Task>) {
  const supabase = await createClient()
  
  const mappedUpdates: any = {}
  if (updates.name !== undefined) mappedUpdates.name = updates.name
  if (updates.assignedTo !== undefined) mappedUpdates.assigned_to = updates.assignedTo
  if (updates.dueDate !== undefined) mappedUpdates.due_date = updates.dueDate
  if (updates.completed !== undefined) mappedUpdates.completed = updates.completed

  const { error } = await supabase
    .from('tasks')
    .update(mappedUpdates)
    .eq('id', id)

  if (error) {
    console.error('Error updating task:', error)
    throw error
  }

  revalidatePath('/(dashboard)', 'layout')
}
