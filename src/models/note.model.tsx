export class Note {
    title?: string;
    content?: string;
    color?: string;
    roomId?: string;
    userId?: string;
    id?: string;
    created?: Date;
    updated?: Date;
    isDeleted?: boolean;

    constructor(init?: Partial<Note>) {
        if (init) {
            Object.assign(this, init);
        }
    }
}