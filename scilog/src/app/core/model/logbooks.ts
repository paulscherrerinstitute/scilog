import { Basesnippets } from "./basesnippets";

export interface Logbooks extends Basesnippets {
    name?: string;
    description?: string;
    thumbnail?: string;
    location?: string;
    readACL?: string[];
    updateACL?: string[];
    deleteACL?: string[];
    adminACL?: string[];
    expiresAt?: string;
}
