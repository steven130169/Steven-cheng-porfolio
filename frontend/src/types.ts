/**
 * Represents a speaking engagement for an individual.
 *
 * This interface is intended to encapsulate details about a speaking event,
 * including its unique identifier, the event name, title of the talk, date, location,
 * and type of engagement.
 *
 * Properties:
 * - id: A unique identifier for the speaking engagement.
 * - event: The name of the event where the speaking engagement occurs.
 * - title: The title of the talk or presentation being given.
 * - date: The date of the speaking engagement, represented as an ISO 8601 string.
 * - location: The location where the speaking engagement will take place.
 * - type: The type of speaking engagement, which can be a Conference, Meetup, or Podcast.
 */
export interface SpeakingEngagement {
  id: string;
  event: string;
  title: string;
  date: string;
  location: string;
  type: 'Conference' | 'Meetup' | 'Podcast';
}

/**
 * Represents the role of a person in the context of an event.
 *
 * An `EventRole` can take one of the following predefined string values:
 * - `'Organizer'`: Indicates that the person is responsible for organizing the event.
 * - `'Host'`: Indicates that the person is hosting or facilitating the event.
 * - `'Instructor'`: Indicates that the person is responsible for teaching or instructing within the event.
 * - `'Speaker'`: Indicates that the person is delivering a speech or presentation at the event.
 */
export type EventRole = 'Organizer' | 'Host' | 'Instructor' | 'Speaker';

/**
 * Represents an event item with detailed information.
 *
 * @interface EventItem
 *
 * @property {string} id - A unique identifier for the event.
 * @property {string} title - The title or name of the event.
 * @property {EventRole} role - The role associated with the event.
 * @property {string} description - A brief description of the event.
 * @property {string} date - The date the event takes place, formatted as a string.
 * @property {string[]} tags - A list of tags associated with the event for categorization.
 * @property {'Upcoming' | 'Past'} status - The current status of the event, indicating whether it is upcoming or has already occurred.
 */
export interface EventItem {
  id: string;
  title: string;
  role: EventRole;
  description: string;
  date: string;
  tags: string[];
  status: 'Upcoming' | 'Past';
}

/**
 * Represents a blog post with metadata and content preview.
 *
 * @interface BlogPost
 * @property {string} id - A unique identifier for the blog post.
 * @property {string} title - The title of the blog post.
 * @property {string} excerpt - A short summary or excerpt of the blog post.
 * @property {string} date - The publication date of the blog post in ISO format.
 * @property {string} readTime - An estimated time to read the blog post (e.g., "5 min read").
 * @property {string[]} tags - A list of tags associated with the blog post for categorization.
 * @property {string} [imageUrl] - An optional URL pointing to the blog post's featured image.
 * @property {string} [category] - An optional category name for organizing the blog post.
 */
export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  tags: string[];
  imageUrl?: string;
  category?: string;
}
