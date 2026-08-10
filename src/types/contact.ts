export type ContactStatus = 'NEW' | 'READ' | 'IN_PROGRESS' | 'RESOLVED' | 'ARCHIVED';

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: ContactStatus;
  adminNote?: string;
  createdAt: string;
  updatedAt: string;
};

export type ContactMessageInput = Pick<ContactMessage, 'name' | 'email' | 'subject' | 'message'>;
