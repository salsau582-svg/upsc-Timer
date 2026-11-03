/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ActivityCategory } from '../types';

export interface CategoryMeta {
  id: ActivityCategory;
  name: string;
  color: string; // Tailwind color class or hex
  bgSoft: string;
  textClass: string;
  borderClass: string;
  defaultProductive: boolean;
  subcategories: string[];
}

export const UPSC_SUBJECTS = [
  'Indian Polity',
  'History',
  'Ancient History',
  'Medieval History',
  'Modern History',
  'Art and Culture',
  'Geography',
  'Indian Economy',
  'Environment and Ecology',
  'Science and Technology',
  'International Relations',
  'Internal Security',
  'Ethics',
  'Governance',
  'Society',
  'Social Justice',
  'Disaster Management',
  'Current Affairs',
  'CSAT',
  'Optional Subject',
  'Newspaper Reading',
  'Revision',
  'Mock Tests',
  'Previous Year Questions',
] as const;

export const ANSWER_PAPERS = [
  'GS Paper 1',
  'GS Paper 2',
  'GS Paper 3',
  'GS Paper 4 (Ethics)',
  'Essay',
  'Optional Subject Answers',
  'Daily Answer Practice',
] as const;

export const FOOD_ITEMS = [
  'Wake-up water',
  'Breakfast',
  'Lunch',
  'Evening snacks',
  'Dinner',
  'Fruits',
  'Healthy eating',
  'Junk food',
  'Sugar consumption',
  'Tea and coffee',
  'Water intake',
] as const;

export const HYGIENE_ACTIVITIES = [
  'Morning bathroom routine',
  'Toilet/dump time',
  'Bathing',
  'Brushing teeth in the morning',
  'Brushing teeth at night',
  'Face washing',
  'Skincare',
  'Hair care',
  'Nail cleaning',
  'Laundry',
  'Room cleaning',
  'Personal grooming',
  'Other cleanliness activities',
] as const;

export const HEALTH_ACTIVITIES = [
  'Exercise',
  'Gym',
  'Running',
  'Push-ups',
  'Pull-ups',
  'Yoga',
  'Stretching',
  'Walking',
  'Cycling',
  'Sports',
  'Meditation',
  'Breathing exercises',
  'Sunlight exposure',
  'Walking in nature',
  'Touch grass/outdoor time',
] as const;

export const ENGLISH_SKILLS = [
  'English reading',
  'English speaking',
  'English listening',
  'English writing',
  'Vocabulary learning',
  'Grammar practice',
  'Pronunciation',
  'Newspaper reading in English',
  'Conversation practice',
] as const;

export const SLEEP_REST_TYPES = [
  'Night sleep',
  'Afternoon nap',
  'Power nap',
  'Rest',
  'Relaxation',
  'Breaks',
  'Screen-free relaxation',
] as const;

export const DISTRACTION_PLATFORMS = [
  'Instagram',
  'YouTube',
  'Facebook',
  'WhatsApp',
  'Telegram',
  'X/Twitter',
  'Web browsing',
  'Mobile gaming',
  'Entertainment',
  'Unnecessary phone usage',
  'Other social media',
] as const;

export const OTHER_ACTIVITIES = [
  'Family time',
  'Friends',
  'Travel',
  'Shopping',
  'Household chores',
  'Cooking',
  'Cleaning',
  'Bathroom breaks',
  'Personal work',
  'Errands',
  'Phone calls',
  'Unexpected work',
  'Free time',
  'Other custom activities',
] as const;

export const CATEGORIES_CONFIG: Record<ActivityCategory, CategoryMeta> = {
  upsc_study: {
    id: 'upsc_study',
    name: 'UPSC Study',
    color: '#3B82F6', // Blue
    bgSoft: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    textClass: 'text-blue-400',
    borderClass: 'border-blue-500/30',
    defaultProductive: true,
    subcategories: [...UPSC_SUBJECTS],
  },
  answer_writing: {
    id: 'answer_writing',
    name: 'Answer Writing',
    color: '#8B5CF6', // Purple
    bgSoft: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    textClass: 'text-purple-400',
    borderClass: 'border-purple-500/30',
    defaultProductive: true,
    subcategories: [...ANSWER_PAPERS],
  },
  food_eating: {
    id: 'food_eating',
    name: 'Food & Eating',
    color: '#F59E0B', // Amber
    bgSoft: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    textClass: 'text-amber-400',
    borderClass: 'border-amber-500/30',
    defaultProductive: true,
    subcategories: [...FOOD_ITEMS],
  },
  hygiene: {
    id: 'hygiene',
    name: 'Hygiene & Cleanliness',
    color: '#06B6D4', // Cyan
    bgSoft: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    textClass: 'text-cyan-400',
    borderClass: 'border-cyan-500/30',
    defaultProductive: true,
    subcategories: [...HYGIENE_ACTIVITIES],
  },
  physical_health: {
    id: 'physical_health',
    name: 'Physical Health',
    color: '#10B981', // Emerald
    bgSoft: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    textClass: 'text-emerald-400',
    borderClass: 'border-emerald-500/30',
    defaultProductive: true,
    subcategories: [...HEALTH_ACTIVITIES],
  },
  english_skills: {
    id: 'english_skills',
    name: 'English Skills',
    color: '#EC4899', // Pink
    bgSoft: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
    textClass: 'text-pink-400',
    borderClass: 'border-pink-500/30',
    defaultProductive: true,
    subcategories: [...ENGLISH_SKILLS],
  },
  sleep_rest: {
    id: 'sleep_rest',
    name: 'Sleep & Rest',
    color: '#6366F1', // Indigo
    bgSoft: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    textClass: 'text-indigo-400',
    borderClass: 'border-indigo-500/30',
    defaultProductive: true,
    subcategories: [...SLEEP_REST_TYPES],
  },
  digital_distraction: {
    id: 'digital_distraction',
    name: 'Digital Distraction',
    color: '#EF4444', // Red
    bgSoft: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    textClass: 'text-rose-400',
    borderClass: 'border-rose-500/30',
    defaultProductive: false,
    subcategories: [...DISTRACTION_PLATFORMS],
  },
  other_daily: {
    id: 'other_daily',
    name: 'Other Daily Activities',
    color: '#64748B', // Slate
    bgSoft: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    textClass: 'text-slate-400',
    borderClass: 'border-slate-500/30',
    defaultProductive: true,
    subcategories: [...OTHER_ACTIVITIES],
  },
};
