import { Types } from 'mongoose';

export interface Timestamps {
    createdAt: Date;
    updatedAt: Date;
}

export interface DocumentId {
    _id: Types.ObjectId;
}