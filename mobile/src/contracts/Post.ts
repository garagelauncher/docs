/* eslint-disable @typescript-eslint/no-explicit-any */
import { Owner } from './Owner';

export type PostCount = {
  comments: number;
  likes: number;
};

export type Post = {
  id: string;
  title: string;
  content: string;
  images: any[];
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  owner: Owner;
  _count: PostCount;
};

export interface PostForm {
  title: string;
  content: string;
  ownerId: string;
  categoryId: string;
  subcategoryId: string;
  image?: string;
  imageDescription?: string;
}
