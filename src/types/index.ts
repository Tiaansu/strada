import { Sections, Tasks } from '@prisma/client';

export interface ExtendedSection extends Sections {
    Tasks: Tasks[];
}
