export function validateProfileName(name) {
  if (!name || typeof name !== 'string') {
    throw new Error('Profile name is required and must be a string');
  }
  const trimmed = name.trim();
  if (trimmed.length < 1 || trimmed.length > 50) {
    throw new Error('Profile name must be between 1 and 50 characters');
  }
  return trimmed;
}

export function validateCourseData(data) {
  if (!data.course_id) {
    throw new Error('Course ID is required');
  }
  if (data.total_lectures !== undefined) {
    const total = parseInt(data.total_lectures);
    if (isNaN(total) || total < 0) {
      throw new Error('Total lectures must be a non-negative number');
    }
  }
  if (data.completed_lectures !== undefined) {
    const completed = parseInt(data.completed_lectures);
    if (isNaN(completed) || completed < 0) {
      throw new Error('Completed lectures must be a non-negative number');
    }
  }
  return data;
}

export function validateLectureData(data) {
  if (!data.profile_course_id) {
    throw new Error('Profile course ID is required');
  }
  if (data.title && typeof data.title !== 'string') {
    throw new Error('Lecture title must be a string');
  }
  if (data.priority && !['low', 'medium', 'high'].includes(data.priority)) {
    throw new Error('Invalid priority value');
  }
  return data;
}

export function validateTopicData(data) {
  if (!data.profile_course_id) {
    throw new Error('Profile course ID is required');
  }
  if (!data.title || typeof data.title !== 'string' || data.title.trim().length === 0) {
    throw new Error('Topic title is required');
  }
  if (data.priority && !['low', 'medium', 'high'].includes(data.priority)) {
    throw new Error('Invalid priority value');
  }
  return data;
}

export function validateNoteData(data) {
  if (!data.profile_course_id) {
    throw new Error('Profile course ID is required');
  }
  if (!data.title || typeof data.title !== 'string' || data.title.trim().length === 0) {
    throw new Error('Note title is required');
  }
  return data;
}

export function validateTaskData(data) {
  if (!data.profile_id) {
    throw new Error('Profile ID is required');
  }
  if (!data.title || typeof data.title !== 'string' || data.title.trim().length === 0) {
    throw new Error('Task title is required');
  }
  if (data.priority && !['low', 'medium', 'high'].includes(data.priority)) {
    throw new Error('Invalid priority value');
  }
  return data;
}

export function validateDate(dateString) {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    throw new Error('Invalid date format');
  }
  return dateString;
}
